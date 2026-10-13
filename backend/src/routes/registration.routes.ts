import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyStatus,
  handleWebhook,
} from '../controllers/registration.controller';
import { verifyAuth } from '../middlewares/auth';
import { validateRequest, studentRegistrationSchema, paymentVerificationSchema } from '../middlewares/validate';

const router = Router();

// Student status check
router.get('/my-status', verifyAuth, getMyStatus);

// Create ₹55 Razorpay order for valid student form
router.post('/create-order', verifyAuth, validateRequest(studentRegistrationSchema), createOrder);

// Verify payment cryptographic HMAC SHA256 signature
router.post('/verify-payment', verifyAuth, validateRequest(paymentVerificationSchema), verifyPayment);

// Razorpay asynchronous webhook listener
router.post('/webhook', handleWebhook);

export default router;
