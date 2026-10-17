import { Request, Response } from 'express';
import { env } from '../config/env';
import { User } from '../models/User';
import { Registration } from '../models/Registration';

export const userSignIn = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { uid, email, name } = req.user;

    // Strict validation: Only @kiet.edu emails or authorized admin emails
    const isKietDomain = email.toLowerCase().endsWith('@kiet.edu');
    const isAdminEmail = env.ADMIN_EMAILS.includes(email.toLowerCase());

    if (!isKietDomain && !isAdminEmail) {
      console.warn(`⛔ [Auth] Blocked non-KIET email login attempt: ${email} (${uid})`);
      res.status(403).json({
        success: false,
        message: 'Access restricted: Only official @kiet.edu email addresses are permitted to log in.',
      });
      return;
    }

    // Atomic upsert: ensures race conditions don't throw E11000 duplicate key error
    let user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          role: 'user',
          isBlocked: false,
        },
        $set: {
          email: email.toLowerCase(),
          name,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (user && user.isBlocked) {
      console.warn(`⛔ [Auth] Blocked cadet attempted login: ${email} (${uid})`);
      res.status(403).json({
        success: false,
        message: 'Your cadet account has been suspended by an administrator. Please contact event coordinators.',
      });
      return;
    }

    // Check existing registration strictly by firebaseUid OR email
    const existingRegistration = await Registration.findOne({
      $or: [
        { firebaseUid: uid, paymentStatus: 'success' },
        { email: email.toLowerCase(), paymentStatus: 'success' },
      ],
    });

    console.log(`\n======================================================`);
    console.log(`👤 [BACKEND AUTH] GOOGLE SIGN-IN VERIFIED`);
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🆔 Firebase UID: ${uid}`);
    console.log(`🎟️ Status: ${existingRegistration ? 'ALREADY REGISTERED' : 'NEW / FIRST-TIME USER'}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      hasRegistered: !!existingRegistration,
      registration: existingRegistration,
    });
  } catch (error: any) {
    console.error('❌ [Auth Error] userSignIn failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Error during user sign-in' });
  }
};

export const adminSignIn = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { uid, email, name } = req.user;

    // Strict validation against env.ADMIN_EMAILS
    const isAuthorizedAdmin = env.ADMIN_EMAILS.includes(email.toLowerCase());

    if (!isAuthorizedAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access forbidden: This email address is not authorized for Admin access',
      });
      return;
    }

    // Update or create user with 'admin' role
    let user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        email,
        name,
        role: 'admin',
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error during admin sign-in' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const registration = await Registration.findOne({
      firebaseUid: req.user.uid,
      paymentStatus: 'success',
    });

    res.status(200).json({
      success: true,
      user: {
        id: req.user.dbUser._id,
        firebaseUid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
      hasRegistered: !!registration,
      registration,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching user profile' });
  }
};
