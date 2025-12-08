import ApiError from '../../utils/ApiError';
import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserDocument } from './user.interface';
import {
  checkStatus,
  dashboardSummary,
  deleteUser,
  getAgents,
  getMembers,
  updateRole,
  uploadUserAvatar,
  verifiedAgents,
  verifyAUser,
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
  res
    .status(200)
    .json(
      new ApiResponse(200, result, 'Dashboard summary fetched successfully.')
    );
});

const getAllAgents = asyncHandler(async (req, res) => {
  const { limit = 3, pageNo = 1, query } = req.query;
  const result = await getAgents(
    Number(limit),
    Number(pageNo),
    query as string
  );
  res.status(200).json(new ApiResponse(200, result, 'Retrieved all agents.'));
});

const getVerifiedAgents = asyncHandler(async (req, res) => {
  const { limit = 3, pageNo = 1 } = req.query;
  const result = await verifiedAgents(Number(limit), Number(pageNo));
  res.status(200).json(new ApiResponse(200, result, 'Retrieved all agents.'));
});

const getAllMembers = asyncHandler(async (req, res) => {
  const { limit = 10, pageNo = 1, query } = req.query;
  const result = await getMembers(
    Number(limit),
    Number(pageNo),
    query as string
  );
  res.status(200).json(new ApiResponse(200, result, 'Retrieved all members.'));
});

const changeRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await updateRole(id, role as string);
  res.status(200).json(new ApiResponse(200, result, 'Retrieved all members.'));
});

const verifyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  const result = await verifyAUser(id, isVerified as boolean);
  res.status(200).json(new ApiResponse(200, result, 'Retrieved all members.'));
});

const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteUser(id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Deleted User Successfully.'));
});

export {
  userStatus,
  uploadAvatar,
  getDashobardSummary,
  getAllAgents,
  getVerifiedAgents,
  getAllMembers,
  changeRole,
  verifyUser,
  deleteAUser,
};
