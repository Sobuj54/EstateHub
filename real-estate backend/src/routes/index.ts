import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { propertyRoutes } from '../modules/property/property.routes';
import { savedPropertyRoutes } from '../modules/saved-property/savedProperty.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/saved-properties', savedPropertyRoutes);

export default router;
