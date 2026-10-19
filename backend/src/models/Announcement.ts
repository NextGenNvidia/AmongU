import { Schema, model, Document } from 'mongoose';

export type AnnouncementCategory = 'general' | 'round_alert' | 'emergency_meeting' | 'result';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: AnnouncementCategory;
  authorName: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'round_alert', 'emergency_meeting', 'result'],
      default: 'general',
      required: true,
    },
    authorName: {
      type: String,
      default: 'Mission HQ Admin',
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch pinned first, then newest
announcementSchema.index({ isPinned: -1, createdAt: -1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
