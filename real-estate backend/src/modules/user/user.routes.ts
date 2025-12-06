import { Router } from 'express';
import {
  changeRole,
  deleteAUser,
  getAllAgents,
  getAllMembers,
  getDashobardSummary,
  getVerifiedAgents,
  userStatus,
  verifyUser,
} from './user.controller';
import { validateZodRequest } from '../../middlewares/zodValidationMiddleware';
import { deleteUserZodSchema, refreshTokenZodSchema } from './user.validation';
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
  .route('/:id')
  .delete(
    validateZodRequest(deleteUserZodSchema, 'params'),
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    deleteAUser
  );

router
  .route('/dashboard-summary')
  .get(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    getDashobardSummary
  );

router
  .route('/agents')
  .get(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    getAllAgents
  );
router
  .route('/members')
  .get(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    getAllMembers
  );
router
  .route('/change-role/:id')
  .patch(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    changeRole
  );

router.route('/agents/verified').get(getVerifiedAgents);
router
  .route('/verify/:id')
  .patch(
    verifyJWT,
    verifyAuthorization([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
    verifyUser
  );

export const userRoutes = router;
