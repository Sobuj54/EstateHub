import { Router } from 'express';
import { verifyJWT } from '../auth/auth.middleware';
import {
  createProperty,
  deleteAProperty,
  getAllProperties,
  getAProperty,
  verifyProperty,
} from './property.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import {
  PropertyZodSchema,
  verifyPropertyZodSchema,
} from './property.validation';
import { verifyAuthorization } from '../../middlewares/verifyAuthorization';
import { USER_ROLE } from '../../enums/user';

const router = Router();

router
  .route('/agent/create')
  .post(
    validateZodRequest(PropertyZodSchema),
    verifyJWT,
    verifyAuthorization([USER_ROLE.AGENT]),
    createProperty
  );

router.route('/').get(getAllProperties);
router.route('/:id').get(getAProperty);
router
  .route('/:id')
  .delete(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    deleteAProperty
  );
router
  .route('/verify/:id')
  .patch(
    validateZodRequest(verifyPropertyZodSchema, 'params'),
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    verifyProperty
  );

export const propertyRoutes = router;
