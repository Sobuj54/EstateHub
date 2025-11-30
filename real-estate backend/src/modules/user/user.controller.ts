import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { checkStatus } from './user.service';

const userStatus = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await checkStatus(refreshToken);
  res.status(200).json(new ApiResponse(200, result, 'User status Ok.'));
});

export { userStatus };
