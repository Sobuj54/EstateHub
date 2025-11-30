import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { cookieOptions } from './auth.constants';
import {
  forgotPasswordMailService,
  login,
  logout,
  refreshAccessToken,
  register,
  resetUserPassword,
} from './auth.service';

const loginUser = asyncHandler(async (req, res) => {
  const { remember, ...data } = req.body;
  const user = await login(data);

  let refreshToken;
  remember
    ? (refreshToken = user.generateRefreshToken('30d'))
    : (refreshToken = user.generateRefreshToken('7d'));
  const accessToken = user.generateAccessToken('15m');

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.refreshToken;
  delete userObj.password;

  res
    .status(200)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: userObj, accessToken }, 'Login successfull.')
    );
});

const registerUser = asyncHandler(async (req, res) => {
  const { ...userData } = req.body;
  await register(userData);

  res
    .status(201)
    .json(new ApiResponse(201, null, 'User created successfully.'));
});

const logoutUser = asyncHandler(async (req, res) => {
  await logout(req.user?._id as string);
  res
    .status(200)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out.'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await refreshAccessToken(refreshToken);
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Token refreshed successfully.'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await forgotPasswordMailService(email);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Reset link sent to your email'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { ...payload } = req.body;
  await resetUserPassword(payload);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successfull.'));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
  forgotPassword,
};
