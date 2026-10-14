import { Request, Response } from 'express';
import { Registration } from '../models/Registration';
import { env } from '../config/env';
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
    const registration = await Registration.findById(id).populate('userId', 'email name role');

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

    const registration = await Registration.findByIdAndUpdate(id, updateFields, { new: true });

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
