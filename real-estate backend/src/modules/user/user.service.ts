import jwt, { Secret } from 'jsonwebtoken';
import { refreshTokenType } from '../auth/auth.interface';
import { User } from './user.model';
import ApiError from '../../utils/ApiError';
import { IUser, UploadedFile, UserDocument } from './user.interface';
import { uploadOnCloudinary } from '../../utils/uploadOnCloudinary';
import { deleteFromCloudinary } from '../../helper/deleteFromCloudinary';

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

export { checkStatus, uploadUserAvatar };
