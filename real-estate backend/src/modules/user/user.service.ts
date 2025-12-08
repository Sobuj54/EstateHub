/* eslint-disable @typescript-eslint/no-explicit-any */
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
  UserReturnType,
} from './user.interface';
import { uploadOnCloudinary } from '../../utils/uploadOnCloudinary';
import { deleteFromCloudinary } from '../../helper/deleteFromCloudinary';
import { USER_ROLE } from '../../enums/user';
import { Property } from '../property/property.model';
import { currentMonth } from '../../helper/currentMonth';
import { IPropertyDocument } from '../property/property.interface';
import mongoose from 'mongoose';

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

const getAgents = async (
  limit: number,
  pageNo: number,
  query: string
): Promise<UserReturnType<IUser>> => {
  if (limit <= 0) limit = 10;
  if (pageNo < 1) pageNo = 1;
  const skip = (pageNo - 1) * limit;
  const filter: any = { role: USER_ROLE.AGENT };

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ];
  }

  const agents = await User.find(filter)
    .limit(limit)
    .skip(skip)
    .select('-refreshToken')
    .lean();

  if (!agents.length) throw new ApiError(404, 'NO agent found.');
  const totalAgents = await User.countDocuments(filter);

  const totalPages = Math.ceil(totalAgents / limit);
  return {
    users: agents,
    totalPages,
    currentPage: pageNo,
    totalCount: totalAgents,
  };
};

const verifiedAgents = async (
  limit: number,
  pageNo: number
): Promise<UserReturnType<IUser>> => {
  const skip = (pageNo - 1) * limit;
  const agents = await User.find({ role: USER_ROLE.AGENT, isVerified: true })
    .limit(limit)
    .skip(skip)
    .select('-refreshToken -isVerified')
    .lean();

  if (!agents.length) throw new ApiError(404, 'NO agent found.');

  const totalAgents = await User.countDocuments({
    role: USER_ROLE.AGENT,
    isVerified: true,
  });

  const totalPages = Math.ceil(totalAgents / limit);
  return {
    users: agents,
    totalPages,
    currentPage: pageNo,
    totalCount: totalAgents,
  };
};

const getMembers = async (
  limit: number,
  pageNo: number,
  query: string
): Promise<UserReturnType<IUser>> => {
  if (limit < 0) limit = 0;
  const skip = (pageNo - 1) * limit;

  const filter: any = { role: USER_ROLE.MEMBER };

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ];
  }

  const members = await User.find(filter)
    .limit(limit)
    .skip(skip)
    .select('-refreshToken')
    .lean();

  if (!members.length) throw new ApiError(404, 'NO agent found.');

  const totalMembers = await User.countDocuments(filter);

  const totalPages = Math.ceil(totalMembers / limit);
  return {
    users: members,
    totalPages,
    currentPage: pageNo,
    totalCount: totalMembers,
  };
};

const updateRole = async (id: string, role: string): Promise<IUser> => {
  const existingUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        role: role,
      },
    },
    { new: true }
  )
    .select('-refreshToken')
    .lean();
  if (!existingUser) throw new ApiError(404, 'No user exists.');

  return existingUser;
};

const verifyAUser = async (id: string, isVerified: boolean) => {
  const existingUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        isVerified: isVerified,
      },
    },
    { new: true }
  )
    .select('-refreshToken')
    .lean();
  if (!existingUser) throw new ApiError(404, 'No user exists.');

  return existingUser;
};

const deleteUser = async (id: string) => {
  const existingUser = await User.findById(id);
  if (!existingUser) throw new ApiError(404, 'No user exists.');

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await Property.deleteMany({ agent: id }, { session });

    const user = await User.findByIdAndDelete(id, { session });
    if (!user) throw new ApiError(500, 'User deletion failed.');

    await session.commitTransaction();
    await session.endSession();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new ApiError(500, 'Failed to delete user and properties.');
  }
};

export {
  checkStatus,
  uploadUserAvatar,
  dashboardSummary,
  getAgents,
  verifiedAgents,
  getMembers,
  updateRole,
  verifyAUser,
  deleteUser,
};
