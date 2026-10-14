export type AnnouncementCategory = 'general' | 'round_alert' | 'emergency_meeting' | 'result';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: AnnouncementCategory;
  round: 'all' | 'round1' | 'round2' | 'round3';
  isEmergencyAlert: boolean;
  publishedBy: string;
  createdAt: string;
}
