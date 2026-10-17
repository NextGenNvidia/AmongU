import { Router } from 'express';
import {
  getRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  manualRegister,
  getStats,
  exportRegistrationsCsv,
  adminLoginWithCredentials,
  getAllUsers,
  toggleBlockUser,
  deleteUserCompletely,
  getEventConfig,
  updateEventConfig,
  generateCheckInToken,
} from '../controllers/admin.controller';
import { verifyAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin';
import {
  validateRequest,
  adminManualRegistrationSchema,
  adminUpdateStatusSchema,
} from '../middlewares/validate';

const router = Router();

// Public: Admin ID and Password Login
router.post('/login', adminLoginWithCredentials);

// Protect ALL admin routes with token verification + Admin role guard
router.use(verifyAuth, requireAdmin);

// Analytics & metrics overview
router.get('/stats', getStats);

// All logged in users from MongoDB (joined with registration data)
router.get('/users', getAllUsers);

// Block/Unblock a user
router.patch('/users/:id/block', toggleBlockUser);

// Permanently delete a user from MongoDB and Firebase Auth
router.delete('/users/:id', deleteUserCompletely);

// CSV Export
router.get('/export/csv', exportRegistrationsCsv);

// Registrations list (pagination, filters, search)
router.get('/registrations', getRegistrations);

// Single registration details
router.get('/registrations/:id', getRegistrationById);

// Manual status update
router.patch('/registrations/:id/status', validateRequest(adminUpdateStatusSchema), updateRegistrationStatus);

// Manual offline/cash registration entry by admin
router.post('/registrations/manual', validateRequest(adminManualRegistrationSchema), manualRegister);

// Event Schedule & Config
router.get('/event/config', getEventConfig);
router.put('/event/config', updateEventConfig);
router.post('/event/qr-token', generateCheckInToken);

export default router;
