import { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { razorpayInstance } from '../config/razorpay';
import { Registration } from '../models/Registration';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // 1. Verify registrations are open
    if (!env.REGISTRATION_OPEN) {
      res.status(400).json({
        success: false,
        message: 'Registrations are currently closed for AmongU event',
      });
      return;
    }

    const { name, collegeId, year, branch, section, phone, email } = req.body;

    // 2. Prevent duplicate successful registrations
    const existingPaid = await Registration.findOne({
      $or: [
        { collegeId, paymentStatus: 'success' },
        { email: email.toLowerCase(), paymentStatus: 'success' },
        { firebaseUid: req.user.uid, paymentStatus: 'success' },
      ],
    });

    if (existingPaid) {
      res.status(400).json({
        success: false,
        message: 'A successful registration already exists for this Student ID, Email, or Account.',
      });
      return;
    }

    // 3. Create Razorpay order
    const options = {
      amount: env.REGISTRATION_FEE_PAISE,
      currency: 'INR',
      receipt: `rcpt_${collegeId}_${Date.now()}`.slice(0, 40),
      notes: {
        firebaseUid: req.user.uid,
        collegeId,
        email: email.toLowerCase(),
        name,
        branch,
        year,
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // 4. Save or update registration record with pending status
    const registration = await Registration.findOneAndUpdate(
      { firebaseUid: req.user.uid, paymentStatus: 'pending' },
      {
        userId: req.user.dbUser._id,
        firebaseUid: req.user.uid,
        name,
        collegeId,
        year,
        branch,
        section,
        phone,
        email: email.toLowerCase(),
        amount: env.REGISTRATION_FEE_INR,
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.RAZORPAY_KEY_ID,
      },
      registrationId: registration._id,
    });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create payment order',
    });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find the pending registration
    const registration = await Registration.findOne({
      razorpayOrderId: razorpay_order_id,
      firebaseUid: req.user.uid,
    });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'No registration found matching this Razorpay order ID',
      });
      return;
    }

    if (registration.paymentStatus === 'success') {
      res.status(200).json({
        success: true,
        message: 'Payment already verified successfully',
        registration,
      });
      return;
    }

    // Cryptographic HMAC SHA256 verification
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      registration.paymentStatus = 'failed';
      await registration.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature',
      });
      return;
    }

    // Mark registration as success
    registration.paymentStatus = 'success';
    registration.razorpayPaymentId = razorpay_payment_id;
    registration.razorpaySignature = razorpay_signature;
    registration.verifiedAt = new Date();
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and registration confirmed for AmongU event!',
      registration,
    });
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Error occurred while verifying payment',
    });
  }
};

export const getMyStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const registration = await Registration.findOne({
      firebaseUid: req.user.uid,
    }).sort({ createdAt: -1 });

    if (!registration) {
      res.status(200).json({
        success: true,
        isRegistered: false,
        registration: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      isRegistered: registration.paymentStatus === 'success',
      registration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error fetching registration status',
    });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;

    if (!webhookSignature) {
      res.status(400).json({ success: false, message: 'Missing Razorpay signature header' });
      return;
    }

    // Verify webhook signature with raw payload
    const bodyStr = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(bodyStr)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
      const paymentId = payload.payment?.entity?.id;

      if (orderId) {
        await Registration.findOneAndUpdate(
          { razorpayOrderId: orderId, paymentStatus: { $ne: 'success' } },
          {
            paymentStatus: 'success',
            razorpayPaymentId: paymentId,
            verifiedAt: new Date(),
          }
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};
