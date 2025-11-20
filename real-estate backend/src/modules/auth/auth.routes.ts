import { Router } from 'express';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { loginZodSchema, registerZodSchema } from './auth.validation';
import { loginUser, logoutUser, registerUser } from './auth.controller';
import { verifyJWT } from './auth.middleware';

const router = Router();

router
  .route('/register')
  .post(validateZodRequest(registerZodSchema), registerUser);

router.route('/login').post(validateZodRequest(loginZodSchema), loginUser);
router.route('/logout').post(verifyJWT, logoutUser);

export const authRoutes = router;
