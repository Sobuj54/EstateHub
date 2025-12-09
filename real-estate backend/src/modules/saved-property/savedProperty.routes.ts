import { Router } from 'express';
import {
  addSavedProperty,
  deleteASavedProperty,
  getSavedProperties,
} from './savedProperty.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { savedPropertyZodSchema } from './savedProperty.validation';
import { verifyJWT } from '../auth/auth.middleware';

const router = Router();

router
  .route('/')
  .post(
    validateZodRequest(savedPropertyZodSchema),
    verifyJWT,
    addSavedProperty
  );

router.route('/').get(verifyJWT, getSavedProperties);
router.route('/:id').delete(verifyJWT, deleteASavedProperty);

export const savedPropertyRoutes = router;
