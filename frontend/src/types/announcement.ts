export type AnnouncementCategory = 'general' | 'round_alert' | 'emergency_meeting' | 'result';

export interface Announcement {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  message?: string;
  category: AnnouncementCategory;
  authorName?: string;
  publishedBy?: string;
  isPinned?: boolean;
  isEmergencyAlert?: boolean;
  createdAt: string;
}
