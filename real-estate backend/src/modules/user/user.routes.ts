import { Router } from 'express';
import { userStatus } from './user.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { refreshTokenZodSchema } from './user.validation';

const router = Router();

router
  .route('/status')
  .get(validateZodRequest(refreshTokenZodSchema, 'cookies'), userStatus);

export const userRoutes = router;
