import { Router } from 'express';
import {
  getRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  manualRegister,
  getStats,
  exportRegistrationsCsv,
} from '../controllers/admin.controller';
import { verifyAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin';
import {
  validateRequest,
  adminManualRegistrationSchema,
  adminUpdateStatusSchema,
} from '../middlewares/validate';

const router = Router();

// Protect ALL admin routes with Firebase verification + Admin role guard
router.use(verifyAuth, requireAdmin);

// Analytics & metrics overview
router.get('/stats', getStats);

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

export default router;
