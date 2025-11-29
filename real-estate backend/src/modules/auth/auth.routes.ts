import { Router } from 'express';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import {
  loginZodSchema,
  refreshTokenZodSchema,
  registerZodSchema,
} from './auth.validation';
import {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from './auth.controller';
import { verifyJWT } from './auth.middleware';

const router = Router();

router
  .route('/register')
  .post(validateZodRequest(registerZodSchema), registerUser);

router.route('/login').post(validateZodRequest(loginZodSchema), loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router
  .route('/refresh-token')
  .get(validateZodRequest(refreshTokenZodSchema, 'cookies'), refreshToken);

export const authRoutes = router;
