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

    // Verify user exists and ensure role is 'user' (unless already admin via admin portal)
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        role: 'user',
      });
    }

    // Check existing registration
    const existingRegistration = await Registration.findOne({
      firebaseUid: uid,
      paymentStatus: 'success',
    });

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
