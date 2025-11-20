/* eslint-disable no-unused-vars */
import ApiError from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { accessTokenType } from './auth.interface';

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new ApiError(401, 'Unauthorized request.');
  }

  const decodedToken: accessTokenType = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  ) as accessTokenType;

  const user = await User.findById(decodedToken?._id).select(
    '-password -refreshToken'
  );
  if (!user) throw new ApiError(401, 'Unauthorized user');

  req.user = user;
  next();
});
