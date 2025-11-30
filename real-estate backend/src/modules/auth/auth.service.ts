import ApiError from '../../utils/ApiError';
import { IUser, UserDocument } from '../user/user.interface';
import { User } from '../user/user.model';
import jwt, { Secret } from 'jsonwebtoken';
import {
  accessTokenType,
  refreshTokenType,
  resetPasswordPayload,
} from './auth.interface';
import { mailTransporter } from '../../config/mail.config';

const login = async (
  data: Pick<IUser, 'email' | 'password'>
): Promise<UserDocument> => {
  const { email, password } = data;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(404, 'Invalid User.');

  const result = await user.isPasswordCorrect(password);
  if (!result) throw new ApiError(403, 'Invalid user');

  return user;
};

const register = async (userData: IUser) => {
  const user = await User.create(userData);
  if (!user) throw new ApiError(400, 'User creation failed.');
};

const logout = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'Logout failed.');
};

const refreshAccessToken = async (
  token: string
): Promise<{ user: IUser; accessToken: string }> => {
  if (!token) throw new ApiError(400, 'Token requried.');
  const decodedToken: refreshTokenType = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string
  ) as refreshTokenType;

  const user = await User.findById(decodedToken._id).select(
    '-password -refreshToken'
  );
  if (!user) throw new ApiError(401, 'Invalid user');

  const accessToken = user.generateAccessToken('15m');

  return { user, accessToken };
};

const forgotPasswordMailService = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'Invalid User.');

  const accessToken = user.generateAccessToken('5m');
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${accessToken}`;

  const html = `
      <p>Hello,</p>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="color: blue; font-weight: bold;">
        Reset Password
      </a>
      <br/><br/>
      <p>This link will expire in 5 minutes.</p>
    `;

  const mailOptons = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Reset Password',
    html,
  };

  try {
    await mailTransporter.sendMail(mailOptons);
  } catch (error) {
    throw new ApiError(400, (error as Error).message);
  }
};

const resetUserPassword = async (
  payload: resetPasswordPayload
): Promise<void> => {
  const { token, password } = payload;
  const decoded: accessTokenType = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret
  ) as accessTokenType;

  const user = await User.findById(decoded._id);
  if (!user) throw new ApiError(404, 'Invalid user');

  user.password = password;
  user.save();
};

export {
  register,
  login,
  logout,
  refreshAccessToken,
  resetUserPassword,
  forgotPasswordMailService,
};
