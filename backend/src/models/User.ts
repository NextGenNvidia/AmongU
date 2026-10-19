import { Schema, model, Document } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  isBlocked?: boolean;
  lastReminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastReminderSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
