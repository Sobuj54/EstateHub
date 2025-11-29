import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { cookieOptions } from './auth.constants';
import { login, logout, register } from './auth.service';

const loginUser = asyncHandler(async (req, res) => {
  const { ...data } = req.body;
  const user = await login(data);

  const accessToken = user.generateAccessToken('15m');
  const refreshToken = user.generateRefreshToken('7d');
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user, accessToken }, 'Login successfull.'));
});

const registerUser = asyncHandler(async (req, res) => {
  const { ...userData } = req.body;
  const result = await register(userData);
  res
    .status(201)
    .json(new ApiResponse(201, result, 'User created successfully.'));
});

const logoutUser = asyncHandler(async (req, res) => {
  await logout(req.user?._id as string);
  res
    .status(200)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out.'));
});

export { registerUser, loginUser, logoutUser };
