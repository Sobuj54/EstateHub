import { Router } from 'express';
import { getDashobardSummary, userStatus } from './user.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { refreshTokenZodSchema } from './user.validation';
import { verifyJWT } from '../auth/auth.middleware';
import { verifyAuthorization } from '../../middlewares/verifyAuthorization';
import { USER_ROLE } from '../../enums/user';

const router = Router();

router
  .route('/status')
  .get(validateZodRequest(refreshTokenZodSchema, 'cookies'), userStatus);
// router
//   .route('/upload-avatar')
//   .post(verifyJWT, upload.single('avatar'), uploadAvatar);

router
  .route('/dashboard-summary')
  .get(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    getDashobardSummary
  );

export const userRoutes = router;
