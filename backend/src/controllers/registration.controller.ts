import { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { razorpayInstance } from '../config/razorpay';
import { Registration } from '../models/Registration';
import { User } from '../models/User';
import { EventConfig } from '../models/EventConfig';
import { mailService } from '../services/mail.service';

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
    const cleanCollegeId = collegeId ? collegeId.trim() : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const existingPaid = await Registration.findOne({
      $or: [
        { collegeId: new RegExp(`^${cleanCollegeId}$`, 'i'), paymentStatus: 'success' },
        { email: cleanEmail, paymentStatus: 'success' },
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
      $or: [
        { firebaseUid: req.user.uid },
        { email: req.user.email?.toLowerCase() },
      ],
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

export const venueCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collegeId, email, uid, token } = req.body;
    const targetUid = req.user?.uid || uid;
    const targetEmail = (req.user?.email || email || '').toLowerCase().trim();

    // 1. If a security token is provided, validate it against active QR session token
    if (token) {
      const config = await EventConfig.findOne({ key: 'main_event' });
      if (config && config.activeCheckInToken && config.activeCheckInToken !== token) {
        res.status(400).json({
          success: false,
          isExpiredToken: true,
          message: 'This Venue Check-in QR pass has expired. Please scan the current QR code on the organizer screen.',
        });
        return;
      }
    }

    const queries: any[] = [];
    if (collegeId && typeof collegeId === 'string' && collegeId.trim()) {
      queries.push({ collegeId: new RegExp(`^${collegeId.trim()}$`, 'i') });
    }
    if (targetEmail) {
      queries.push({ email: targetEmail });
    }
    if (targetUid && typeof targetUid === 'string' && targetUid.trim()) {
      queries.push({ firebaseUid: targetUid.trim() });
    }

    if (queries.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please sign in or provide your College ID / registered Email address to check in.',
      });
      return;
    }

    // Prioritize paid registration first, otherwise fall back to latest record
    let registration = await Registration.findOne({ $or: queries, paymentStatus: 'success' });
    if (!registration) {
      registration = await Registration.findOne({ $or: queries }).sort({ createdAt: -1 });
    }

    if (!registration) {
      res.status(404).json({
        success: false,
        message: targetEmail
          ? `No registration found for Google account ${targetEmail}. Please register for AmongU first.`
          : 'No registration record found. Please sign in with your registered Google account.',
      });
      return;
    }

    if (registration.paymentStatus !== 'success') {
      res.status(400).json({
        success: false,
        message: `Registration found for ${registration.name}, but payment is incomplete (${registration.paymentStatus}). Please complete fee payment to check in.`,
        registration,
      });
      return;
    }

    const wasAlreadyPresent = Boolean(registration.isPresent);

    if (!wasAlreadyPresent) {
      registration.isPresent = true;
      registration.verifiedAt = registration.verifiedAt || new Date();
      await registration.save();
    }

    res.status(200).json({
      success: true,
      alreadyCheckedIn: wasAlreadyPresent,
      message: wasAlreadyPresent
        ? `Participant ${registration.name} is already checked in.`
        : `Check-in verified! Welcome to AmongU venue, ${registration.name}.`,
      registration,
    });
  } catch (error: any) {
    console.error('Venue Check-in Error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Server error occurred during venue check-in',
    });
  }
};

export const initiateRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, collegeId, branch, year, section, track, phone } = req.body;
    
    // Generate a secure 6-digit transmission clearance code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`\n======================================================`);
    console.log(`🔐 [REGISTRATION INITIATED - OTP TRANSMISSION]`);
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🎓 College ID: ${collegeId} (${branch} Year ${year} Sec ${section})`);
    console.log(`📱 Phone: ${phone}`);
    console.log(`🎯 Track: ${track}`);
    console.log(`📨 [OTP Dispatched] Code: ${otpCode} transmitted to ${email}`);
    console.log(`======================================================\n`);

    // Dispatch email via Nodemailer
    await mailService.sendOtpEmail(email, otpCode, name);

    res.status(200).json({
      success: true,
      message: 'Registration initiated and OTP passcode dispatched',
      otp: otpCode,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, collegeId, branch, year, section, track, phone, paymentId } = req.body;

    let finalUserId = req.user?.dbUser?._id;
    let finalUid = req.user?.uid;

    if (!finalUserId && email) {
      let existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (!existingUser) {
        existingUser = await User.findOneAndUpdate(
          { email: email.toLowerCase().trim() },
          {
            $setOnInsert: {
              firebaseUid: finalUid || `cadet_${collegeId}`,
              email: email.toLowerCase().trim(),
              name,
              role: 'user',
              isBlocked: false,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      finalUserId = existingUser?._id;
      finalUid = existingUser?.firebaseUid || finalUid || `cadet_${collegeId}`;
    }

    console.log(`\n======================================================`);
    console.log(`🎉 [REGISTRATION & PAYMENT CONFIRMED]`);
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🎓 College ID: ${collegeId} (${branch} Year ${year} Sec ${section})`);
    console.log(`💳 Payment ID: ${paymentId} (₹55 CONFIRMED)`);
    console.log(`🎯 Track: ${track}`);
    console.log(`💾 Saving participant record to MongoDB...`);

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert registration in MongoDB strictly by email (so one cadet's typoed roll number never hijacks another cadet's record)
    const registration = await Registration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        userId: finalUserId || undefined,
        firebaseUid: finalUid || 'direct_user',
        name,
        collegeId,
        year: year as any,
        branch,
        section,
        phone,
        email: email.toLowerCase().trim(),
        amount: 55,
        paymentStatus: 'success',
        paymentMethod: 'razorpay',
        razorpayPaymentId: paymentId,
        isPresent: false,
        assignedRole: 'unassigned',
        verifiedAt: new Date(),
        notes: `Registered via AmongU portal - Track: ${track}`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ [MongoDB Saved] Participant ID: ${registration._id}`);
    console.log(`======================================================\n`);

    // Send official boarding pass email
    await mailService.sendTicketEmail(email, {
      name,
      collegeId,
      branch,
      year,
      section,
      track,
      paymentId,
    });

    res.status(200).json({
      success: true,
      message: 'Registration confirmed and recorded in database',
      registration,
    });
  } catch (error: any) {
    console.error('❌ [Registration Error] confirmRegistration failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
