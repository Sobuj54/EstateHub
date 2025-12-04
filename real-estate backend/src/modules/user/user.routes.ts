import { Router } from 'express';
import { uploadAvatar, userStatus } from './user.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { refreshTokenZodSchema } from './user.validation';
import { upload } from '../../middlewares/multerMiddleware';
import { verifyJWT } from '../auth/auth.middleware';

const router = Router();

router
  .route('/status')
  .get(validateZodRequest(refreshTokenZodSchema, 'cookies'), userStatus);
router
  .route('/upload-avatar')
  .post(verifyJWT, upload.single('avatar'), uploadAvatar);

export const userRoutes = router;
