import { Router } from 'express';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import {
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  loginZodSchema,
  refreshTokenZodSchema,
  registerZodSchema,
  resetPasswordZodSchema,
} from './auth.validation';
import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  resetPassword,
} from './auth.controller';
import { verifyJWT } from './auth.middleware';

const router = Router();

router
  .route('/register')
  .post(validateZodRequest(registerZodSchema), registerUser);

router.route('/login').post(validateZodRequest(loginZodSchema), loginUser);
router.route('/logout').post(logoutUser);
router
  .route('/refresh-token')
  .get(validateZodRequest(refreshTokenZodSchema, 'cookies'), refreshToken);
router
  .route('/forgot-password')
  .post(validateZodRequest(forgotPasswordZodSchema), forgotPassword);
router
  .route('/reset-password')
  .post(validateZodRequest(resetPasswordZodSchema), resetPassword);
router
  .route('/change-password')
  .patch(
    validateZodRequest(changePasswordZodSchema),
    verifyJWT,
    changePassword
  );

export const authRoutes = router;
