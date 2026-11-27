import { Request, Response } from 'express';
import { RefundRequest } from '../models/RefundRequest';
import { Registration } from '../models/Registration';

export const submitRefundRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Cadet login required' });
      return;
    }

    const email = req.user.email.toLowerCase().trim();
    const uid = req.user.uid;

    // 1. Verify that user actually has a paid registration
    const registration = await Registration.findOne({
      $or: [{ firebaseUid: uid }, { email }],
      paymentStatus: 'success',
    });

    if (!registration) {
      res.status(403).json({
        success: false,
        message: 'Refund requests are only permitted for cadets with a confirmed, paid (₹55) registration.',
      });
      return;
    }

    const { upiId, reason, phone, screenshotUrl } = req.body;

    if (!upiId || typeof upiId !== 'string' || upiId.trim().length < 3) {
      res.status(400).json({ success: false, message: 'A valid UPI ID / VPA is required for refund processing.' });
      return;
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Please provide a clear reason for your refund request.' });
      return;
    }

    // 2. Check for existing refund request
    const existing = await RefundRequest.findOne({
      $or: [{ firebaseUid: uid }, { email }],
    }).sort({ createdAt: -1 });

    if (existing && existing.status === 'pending') {
      res.status(400).json({
        success: false,
        message: 'You already have a pending refund request under review by the organizers.',
        refund: existing,
      });
      return;
    }

    if (existing && existing.status === 'approved') {
      res.status(400).json({
        success: false,
        message: 'Your refund request has already been approved and processed.',
        refund: existing,
      });
      return;
    }

    // 3. Create or re-open refund request
    const newRefund = await RefundRequest.create({
      userId: req.user.dbUser?._id,
      firebaseUid: uid,
      registrationId: registration._id,
      name: registration.name || req.user.name,
      email,
      phone: phone?.trim() || registration.phone || '',
      collegeId: registration.collegeId || '',
      amount: registration.amount || 55,
      paymentId: registration.razorpayPaymentId || '',
      upiId: upiId.trim(),
      reason: reason.trim(),
      screenshotUrl: screenshotUrl || '',
      status: 'pending',
      rejectionReason: '',
      adminNotes: '',
    });

    console.log(`\n======================================================`);
    console.log(`💸 [REFUND REQUEST SUBMITTED]`);
    console.log(`👤 Name: ${newRefund.name}`);
    console.log(`📧 Email: ${newRefund.email}`);
    console.log(`📱 Phone: ${newRefund.phone}`);
    console.log(`💳 UPI ID: ${newRefund.upiId}`);
    console.log(`📝 Reason: ${newRefund.reason}`);
    console.log(`🆔 Payment ID: ${newRefund.paymentId}`);
    console.log(`======================================================\n`);

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully! It has been routed to the admin team for review.',
      refund: newRefund,
    });
  } catch (error: any) {
    console.error('Submit Refund Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error submitting refund request' });
  }
};

export const getMyRefundRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Cadet login required' });
      return;
    }

    const email = req.user.email.toLowerCase().trim();
    const uid = req.user.uid;

    // Check if cadet is paid
    const registration = await Registration.findOne({
      $or: [{ firebaseUid: uid }, { email }],
      paymentStatus: 'success',
    });

    const refund = await RefundRequest.findOne({
      $or: [{ firebaseUid: uid }, { email }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      isPaidUser: Boolean(registration),
      registration: registration
        ? {
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
            collegeId: registration.collegeId,
            branch: registration.branch,
            year: registration.year,
            amount: registration.amount,
            paymentId: registration.razorpayPaymentId,
          }
        : null,
      hasRequest: Boolean(refund),
      refund,
    });
  } catch (error: any) {
    console.error('Get My Refund Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error retrieving refund status' });
  }
};

// Admin Endpoints
export const getAllRefundRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { collegeId: regex },
        { phone: regex },
        { upiId: regex },
        { paymentId: regex },
      ];
    }

    const refunds = await RefundRequest.find(filter).sort({ createdAt: -1 });

    // Aggregate counts
    const [totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      RefundRequest.countDocuments(),
      RefundRequest.countDocuments({ status: 'pending' }),
      RefundRequest.countDocuments({ status: 'approved' }),
      RefundRequest.countDocuments({ status: 'rejected' }),
    ]);

    res.status(200).json({
      success: true,
      count: refunds.length,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      refunds,
    });
  } catch (error: any) {
    console.error('Admin Get Refunds Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error fetching refunds' });
  }
};

export const updateRefundStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status. Must be pending, approved, or rejected.' });
      return;
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user?.email || req.user?.name || 'Organizer Admin',
    };

    if (status === 'rejected') {
      if (!rejectionReason || !rejectionReason.trim()) {
        res.status(400).json({ success: false, message: 'A rejection reason is required when rejecting a refund.' });
        return;
      }
      updateData.rejectionReason = rejectionReason.trim();
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes.trim();
    }

    const updated = await RefundRequest.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Refund request not found' });
      return;
    }

    console.log(`🔔 [REFUND STATUS UPDATED] Request ${id} -> ${status.toUpperCase()} by ${updateData.reviewedBy}`);

    res.status(200).json({
      success: true,
      message: `Refund request successfully marked as ${status.toUpperCase()}`,
      refund: updated,
    });
  } catch (error: any) {
    console.error('Admin Update Refund Status Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error updating refund status' });
  }
};
