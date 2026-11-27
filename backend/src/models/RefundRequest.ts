import { Schema, model, Document, Types } from 'mongoose';

export type RefundStatus = 'pending' | 'approved' | 'rejected';

export interface IRefundRequest extends Document {
  userId?: Types.ObjectId;
  firebaseUid: string;
  registrationId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  collegeId: string;
  amount: number;
  paymentId?: string;
  upiId: string;
  reason: string;
  screenshotUrl?: string;
  status: RefundStatus;
  rejectionReason?: string;
  adminNotes?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refundRequestSchema = new Schema<IRefundRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    collegeId: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 55,
    },
    paymentId: {
      type: String,
      trim: true,
      default: '',
    },
    upiId: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RefundRequest = model<IRefundRequest>('RefundRequest', refundRequestSchema);
