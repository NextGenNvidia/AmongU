import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Registration } from '../models/Registration';
import { User } from '../models/User';
import { EventConfig } from '../models/EventConfig';
import { env } from '../config/env';
import { firebaseAuth } from '../config/firebase';
import { convertRegistrationsToCsv } from '../utils/csvExporter';

export const getRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const { search, paymentStatus, branch, year } = req.query;

    const filter: any = {};

    if (paymentStatus && ['pending', 'success', 'failed'].includes(paymentStatus as string)) {
      filter.paymentStatus = paymentStatus;
    }

    if (branch) {
      filter.branch = new RegExp(`^${branch}$`, 'i');
    }

    if (year) {
      filter.year = year;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { collegeId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { razorpayPaymentId: searchRegex },
      ];
    }

    const [total, registrations] = await Promise.all([
      Registration.countDocuments(filter),
      Registration.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email name role'),
    ]);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin Get Registrations Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error fetching registrations' });
  }
};

export const getRegistrationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { collegeId: id }] }
      : { collegeId: id };
    const registration = await Registration.findOne(filter).populate('userId', 'email name role');

    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    res.status(200).json({ success: true, registration });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching registration' });
  }
};

export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus, notes, isPresent, assignedRole, assignedTeamName } = req.body;

    const updateFields: any = {};
    if (paymentStatus !== undefined) {
      updateFields.paymentStatus = paymentStatus;
      if (paymentStatus === 'success') {
        updateFields.verifiedAt = new Date();
      }
    }
    if (notes !== undefined) {
      updateFields.notes = notes;
    }
    if (isPresent !== undefined) {
      updateFields.isPresent = isPresent;
    }
    if (assignedRole !== undefined) {
      updateFields.assignedRole = assignedRole;
    }
    if (assignedTeamName !== undefined) {
      updateFields.assignedTeamName = assignedTeamName;
    }

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { collegeId: id }] }
      : { collegeId: id };
    const registration = await Registration.findOneAndUpdate(filter, updateFields, { new: true });

    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Registration status updated successfully',
      registration,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating registration' });
  }
};

export const manualRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      name,
      collegeId,
      year,
      branch,
      section,
      phone,
      email,
      paymentStatus = 'success',
      paymentMethod = 'manual_cash',
      notes = 'Manually registered by admin',
    } = req.body;

    // Check duplicate
    const existing = await Registration.findOne({
      $or: [{ collegeId, paymentStatus: 'success' }, { email, paymentStatus: 'success' }],
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'A successful registration already exists for this College ID or Email',
      });
      return;
    }

    const registration = await Registration.create({
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
      paymentStatus,
      paymentMethod,
      verifiedAt: paymentStatus === 'success' ? new Date() : undefined,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Manual registration created successfully by admin',
      registration,
    });
  } catch (error: any) {
    console.error('Admin Manual Register Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error creating manual registration' });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, paid, pending, failed, present, branchStats, yearStats] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ paymentStatus: 'success' }),
      Registration.countDocuments({ paymentStatus: 'pending' }),
      Registration.countDocuments({ paymentStatus: 'failed' }),
      Registration.countDocuments({ isPresent: true }),
      Registration.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: '$branch', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Registration.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalRevenue = paid * env.REGISTRATION_FEE_INR;

    res.status(200).json({
      success: true,
      stats: {
        totalRegistrations: total,
        presentCount: present,
        paidCount: paid,
        pendingCount: pending,
        failedCount: failed,
        totalRevenueINR: totalRevenue,
        feePerUserINR: env.REGISTRATION_FEE_INR,
        isRegistrationOpen: env.REGISTRATION_OPEN,
        byBranch: branchStats.map((item) => ({ branch: item._id, count: item.count })),
        byYear: yearStats.map((item) => ({ year: item._id, count: item.count })),
      },
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error fetching stats' });
  }
};

export const exportRegistrationsCsv = async (_req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    const csvData = convertRegistrationsToCsv(registrations);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="amongu-registrations.csv"');
    res.status(200).send(csvData);
  } catch (error: any) {
    console.error('Admin CSV Export Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error exporting registrations' });
  }
};

export const adminLoginWithCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, password } = req.body;
    const adminUser = env.ADMIN_USERNAME;
    const adminPass = env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      res.status(500).json({ success: false, message: 'Admin credentials not configured in server environment' });
      return;
    }

    if (!id || !password) {
      res.status(400).json({ success: false, message: 'Please provide both Admin ID and Password' });
      return;
    }

    if (id.trim() !== adminUser || password.trim() !== adminPass) {
      console.warn(`🚨 [Admin Auth Failed] Invalid credentials attempt for ID: "${id}"`);
      res.status(401).json({ success: false, message: 'Invalid Admin ID or Password' });
      return;
    }

    console.log(`\n======================================================`);
    console.log(`🛡️ [ADMIN AUTH GRANTED] Organizer logged in with ID: ${id}`);
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      token: 'amongu_admin_secret_token_2026',
      admin: {
        id: 'admin_master_super',
        username: id,
        name: 'Chief Organizer',
        role: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const registrations = await Registration.find().lean();

    const regByUid = new Map<string, any>();
    const regByEmail = new Map<string, any>();
    registrations.forEach((r) => {
      if (r.firebaseUid) regByUid.set(r.firebaseUid, r);
      if (r.email) regByEmail.set(r.email.toLowerCase(), r);
    });

    const enrichedUsers = users.map((u) => {
      const reg = regByUid.get(u.firebaseUid) || regByEmail.get(u.email.toLowerCase()) || null;
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isBlocked: Boolean(u.isBlocked),
        firebaseUid: u.firebaseUid,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        hasRegistered: Boolean(reg && reg.paymentStatus === 'success'),
        registration: reg
          ? {
              collegeId: reg.collegeId,
              branch: reg.branch,
              year: reg.year,
              section: reg.section,
              phone: reg.phone,
              track: reg.notes?.includes('Track:') ? reg.notes.split('Track:')[1]?.trim() : (reg as any).track || 'Web Development',
              paymentStatus: reg.paymentStatus,
              amount: reg.amount,
              paymentId: reg.razorpayPaymentId,
              registeredAt: reg.createdAt,
              isPresent: reg.isPresent,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      total: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error: any) {
    console.error('Admin Get All Users Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBlockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Cadet user not found' });
      return;
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    console.log(`\n======================================================`);
    console.log(`🛡️ [ADMIN ACTION] USER BLOCK STATUS UPDATED`);
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🚫 Is Blocked: ${user.isBlocked ? 'YES (BLOCKED)' : 'NO (ACTIVE)'}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? `Cadet ${user.name} has been suspended/blocked from accessing AmongU.`
        : `Cadet ${user.name} has been unblocked.`,
      isBlocked: user.isBlocked,
    });
  } catch (error: any) {
    console.error('Toggle Block User Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserCompletely = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Cadet user not found' });
      return;
    }

    const { firebaseUid, email, name } = user;

    // 1. Delete user from Firebase Auth
    if (firebaseUid && !firebaseUid.startsWith('otp_') && !firebaseUid.startsWith('direct_')) {
      try {
        await firebaseAuth.deleteUser(firebaseUid);
        console.log(`🔥 [Firebase Admin] Successfully deleted user from Firebase Auth: ${firebaseUid}`);
      } catch (fbErr: any) {
        console.warn(`Firebase Auth delete warning (account may already be removed or offline): ${fbErr?.message}`);
      }
    }

    // 2. Delete all related registrations from MongoDB
    const regDeleteResult = await Registration.deleteMany({
      $or: [
        { firebaseUid },
        { email: email.toLowerCase() },
        { userId: user._id },
      ],
    });

    // 3. Delete user document from MongoDB
    await User.findByIdAndDelete(user._id);

    console.log(`\n======================================================`);
    console.log(`🗑️ [USER ACCOUNT COMPLETELY PURGED BY ADMIN]`);
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 Firebase UID: ${firebaseUid}`);
    console.log(`🎟️ Deleted Registrations: ${regDeleteResult.deletedCount}`);
    console.log(`✅ Fully purged from MongoDB and Firebase Auth - ready for fresh start.`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: `Cadet ${name} (${email}) has been completely deleted from MongoDB and Firebase Auth. Everything is fresh for them.`,
    });
  } catch (error: any) {
    console.error('Delete User Completely Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await EventConfig.findOne({ key: 'main_event' });
    if (!config) {
      config = await EventConfig.create({
        key: 'main_event',
        eventTitle: 'AmongU Hackathon',
        eventStartDate: '2026-10-28T09:00:00+05:30',
        venue: 'KIET Deemed to be University',
        registrationOpen: true,
        registrationFeeINR: 55,
        prizePool: '₹10,000',
      });
    }
    res.status(200).json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('Get Event Config Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEventConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventStartDate, eventTitle, venue, registrationOpen, registrationFeeINR, prizePool } = req.body;

    const updateFields: any = {};
    if (eventStartDate !== undefined) updateFields.eventStartDate = eventStartDate;
    if (eventTitle !== undefined) updateFields.eventTitle = eventTitle;
    if (venue !== undefined) updateFields.venue = venue;
    if (registrationOpen !== undefined) updateFields.registrationOpen = registrationOpen;
    if (registrationFeeINR !== undefined) updateFields.registrationFeeINR = registrationFeeINR;
    if (prizePool !== undefined) updateFields.prizePool = prizePool;

    const config = await EventConfig.findOneAndUpdate(
      { key: 'main_event' },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log(`\n======================================================`);
    console.log(`⚙️ [EVENT SCHEDULE & CONFIG UPDATED BY ADMIN]`);
    console.log(`📅 Start Date & Time: ${config.eventStartDate}`);
    console.log(`📍 Venue: ${config.venue}`);
    console.log(`⚡ Registration Open: ${config.registrationOpen}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: 'Event settings successfully updated',
      config,
    });
  } catch (error: any) {
    console.error('Update Event Config Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



