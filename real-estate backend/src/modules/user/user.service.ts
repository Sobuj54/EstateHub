import jwt, { Secret } from 'jsonwebtoken';
import { refreshTokenType } from '../auth/auth.interface';
import { User } from './user.model';
import ApiError from '../../utils/ApiError';
import {
  DashboardSummary,
  ITopAgent,
  IUser,
  UploadedFile,
  UserDocument,
} from './user.interface';
import { uploadOnCloudinary } from '../../utils/uploadOnCloudinary';
import { deleteFromCloudinary } from '../../helper/deleteFromCloudinary';
import { USER_ROLE } from '../../enums/user';
import { Property } from '../property/property.model';
import { currentMonth } from '../../helper/currentMonth';
import { IPropertyDocument } from '../property/property.interface';

const checkStatus = async (
  refreshToken: string
): Promise<{ user: IUser; accessToken: string }> => {
  if (!refreshToken) throw new ApiError(400, 'token required.');

  const decoded: refreshTokenType = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as Secret
  ) as refreshTokenType;
  const user = await User.findById(decoded._id).select(
    '-password -refreshToken'
  );
  if (!user) throw new ApiError(400, 'Invalid User');

  const accessToken = user.generateAccessToken('15m');
  return { user, accessToken };
};

const uploadUserAvatar = async (
  file: UploadedFile,
  user: UserDocument
): Promise<IUser> => {
  if (!file?.path) throw new ApiError(400, 'File is Required.');

  const res = await uploadOnCloudinary(file.path);
  if (!res) throw new ApiError(400, 'Upload failed.');

  const prevPublicId = user.public_id as string;

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        avatar: res.secure_url,
        public_id: res.public_id,
      },
    },
    {
      new: true,
    }
  ).select('-refreshToken');

  if (user.public_id) await deleteFromCloudinary(prevPublicId);

  if (!updatedUser) throw new ApiError(400, 'Avatar update Failed.');

  return updatedUser;
};

const dashboardSummary = async (): Promise<DashboardSummary> => {
  const month = currentMonth();
  try {
    const queries = [
      User.countDocuments({ role: USER_ROLE.AGENT, isVerified: true }),
      User.countDocuments({ role: USER_ROLE.MEMBER }),
      Property.countDocuments(),

      User.countDocuments({ createdAt: { $gte: month } }),
      Property.find({ createdAt: { $gte: month } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .select('title agent createdAt')
        .populate({ path: 'agent', select: 'name email' }),

      User.aggregate([
        // Join Users with Properties
        {
          $lookup: {
            from: 'properties',
            localField: '_id',
            foreignField: 'agent',
            as: 'listings',
          },
        },
        {
          $addFields: {
            propertiesCount: { $size: '$listings' },
          },
        },
        // Filter users who are agents and have propertiesCount > 0
        {
          $match: {
            role: 'agent',
            propertiesCount: { $gte: 0 },
          },
        },
        // Sort by propertiesCount (descending)
        {
          $sort: { propertiesCount: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            avatar: 1,
            propertiesCount: 1,
          },
        },
      ]),
    ];

    const [
      totalActiveAgents,
      totalMembers,
      totalProperties,
      newMembersCount,
      recentProperties,
      topAgents,
    ] = (await Promise.all(queries)) as [
      number, // totalActiveAgents
      number, // totalMembers
      number, // totalProperties
      number, // newMembersCount
      IPropertyDocument[], // recentProperties (Array of Property Docs)
      ITopAgent[], // topAgents (Array of Aggregation Results)
    ];

    return {
      totalActiveAgents,
      totalMembers,
      totalProperties,
      newMembersCount,
      recentProperties,
      topAgents,
    };
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new ApiError(500, 'Failed to retrieve dashboard summary.');
  }
};

export { checkStatus, uploadUserAvatar, dashboardSummary };
