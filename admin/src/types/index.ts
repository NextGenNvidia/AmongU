export interface LoggedInUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked?: boolean;
  firebaseUid: string;
  createdAt: string;
  updatedAt: string;
  lastReminderSentAt?: string | null;
  hasRegistered: boolean;
  registration?: {
    collegeId: string;
    branch: string;
    year: string;
    section: string;
    phone: string;
    track: string;
    paymentStatus: string;
    amount: number;
    paymentId?: string;
    registeredAt?: string;
    isPresent?: boolean;
  } | null;
}

export interface ReminderStatus {
  lastReminderSentAt: string | null;
  lastReminderSentCount: number;
  totalUnpaidCadets: number;
  totalRegisteredCadets: number;
  totalCadets: number;
}

export interface AnnouncementRecord {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'round_alert' | 'emergency_meeting' | 'result';
  authorName: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
}

export interface TeamMember {
  collegeId: string;
  name: string;
  email: string;
  branch: string;
  year: string;
  section: string;
  role: 'crewmate' | 'impostor';
  suitColor: string;
  isPresent?: boolean;
}

export interface TeamRecord {
  _id?: string;
  teamId: string;
  name: string;
  tableNumber: number;
  members: TeamMember[];
  impostorId?: string;
  round1Score?: number;
  round2Score?: number;
  totalScore?: number;
}

