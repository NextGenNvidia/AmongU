import { Schema, model, Document } from 'mongoose';

export interface IEventConfig extends Document {
  key: string;
  eventTitle: string;
  eventStartDate: string; // ISO string e.g. '2026-10-28T09:00:00+05:30'
  venue: string;
  registrationOpen: boolean;
  registrationFeeINR: number;
  prizePool: string;
  updatedAt: Date;
  createdAt: Date;
}

const eventConfigSchema = new Schema<IEventConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main_event',
      trim: true,
    },
    eventTitle: {
      type: String,
      default: 'AmongU Hackathon',
      trim: true,
    },
    eventStartDate: {
      type: String,
      default: '2026-10-28T09:00:00+05:30',
      trim: true,
    },
    venue: {
      type: String,
      default: 'KIET Deemed to be University',
      trim: true,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    registrationFeeINR: {
      type: Number,
      default: 55,
    },
    prizePool: {
      type: String,
      default: '₹10,000',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EventConfig = model<IEventConfig>('EventConfig', eventConfigSchema);
