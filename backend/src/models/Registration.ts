import { Schema, model, Document, Types } from 'mongoose';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS, ALLOWED_YEARS } from '../constants/branches';

export type PaymentStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod = 'razorpay' | 'manual_cash';

export interface IRegistration extends Document {
  userId: Types.ObjectId;
  firebaseUid: string;
  name: string;
  collegeId: string;
  year: string;
  branch: string;
  section: string;
  phone: string;
  email: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  isPresent: boolean;
  assignedTeamName?: string;
  assignedRole: 'unassigned' | 'crewmate' | 'impostor';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    collegeId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    year: {
      type: String,
      enum: ALLOWED_YEARS,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      enum: ALLOWED_SECTIONS,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'manual_cash'],
      default: 'razorpay',
    },
    isPresent: {
      type: Boolean,
      default: false,
      index: true,
    },
    assignedTeamName: {
      type: String,
      default: '',
      trim: true,
    },
    assignedRole: {
      type: String,
      enum: ['unassigned', 'crewmate', 'impostor'],
      default: 'unassigned',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes for fast lookups
registrationSchema.index({ collegeId: 1, paymentStatus: 1 });
registrationSchema.index({ email: 1, paymentStatus: 1 });
registrationSchema.index({ firebaseUid: 1, paymentStatus: 1 });

export const Registration = model<IRegistration>('Registration', registrationSchema);
