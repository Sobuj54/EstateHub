import { Router } from 'express';
import { resetPasswordMail } from './mail.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { mailZodSchema } from './mail.validation';

const router = Router();

router
  .route('/reset-password/')
  .post(validateZodRequest(mailZodSchema), resetPasswordMail);

export const mailRoutes = router;
