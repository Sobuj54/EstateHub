import jwt, { Secret } from 'jsonwebtoken';
import { refreshTokenType } from '../auth/auth.interface';
import { User } from './user.model';
import ApiError from '../../utils/ApiError';
import { IUser } from './user.interface';

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

export { checkStatus };
