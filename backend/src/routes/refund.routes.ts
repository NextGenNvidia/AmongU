import { Router } from 'express';
import { submitRefundRequest, getMyRefundRequest } from '../controllers/refund.controller';
import { verifyAuth } from '../middlewares/auth';

const router = Router();

// Protect refund routes with cadet authentication
router.use(verifyAuth);

// Submit refund request (only paid cadets eligible)
router.post('/request', submitRefundRequest);

// Check current user's refund status and details
router.get('/my-request', getMyRefundRequest);

export default router;
