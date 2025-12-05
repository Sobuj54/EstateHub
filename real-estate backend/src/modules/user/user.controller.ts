import ApiError from '../../utils/ApiError';
import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserDocument } from './user.interface';
import {
  checkStatus,
  dashboardSummary,
  uploadUserAvatar,
} from './user.service';

const userStatus = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await checkStatus(refreshToken);
  res.status(200).json(new ApiResponse(200, result, 'User status Ok.'));
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const file = req?.file;
  if (!file) throw new ApiError(400, 'Image file is required.');
  const result = await uploadUserAvatar(file, req.user as UserDocument);
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Avatar uploaded Successfully.'));
});

const getDashobardSummary = asyncHandler(async (req, res) => {
  const result = await dashboardSummary();
  res.status(200).json(new ApiResponse(200, result));
});

export { userStatus, uploadAvatar, getDashobardSummary };
