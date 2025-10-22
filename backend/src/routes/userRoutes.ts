import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken, requireEmailVerification } from '../middleware/authMiddleware';
import {
  validateUpdateProfile,
  validateChangePassword,
} from '../middleware/validationMiddleware';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validateUpdateProfile, userController.updateProfile);
router.patch('/profile', validateUpdateProfile, userController.updateProfile);

// Password management
router.put('/change-password', validateChangePassword, userController.changePassword);

// Account management
router.delete('/account', userController.deleteAccount);
router.post('/deactivate', userController.deactivateAccount);

// User preferences
router.put('/preferences', userController.updatePreferences);
router.patch('/preferences', userController.updatePreferences);

// User activity and statistics
router.get('/activity', userController.getUserActivity);
router.get('/stats', userController.getUserStats);

export default router;
