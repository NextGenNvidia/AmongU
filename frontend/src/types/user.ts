export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  hasRegistered?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  hasRegistered?: boolean;
  registration?: any;
}

export interface UserTicket {
  name: string;
  collegeId: string;
  year: string;
  branch: string;
  section: string;
  phone: string;
  email: string;
  track: string;
  paymentId: string;
  amount: number;
  registeredAt: string;
  isEmailVerified: boolean;
  avatarColor?: string;
  avatarHat?: string;
  avatarMuffler?: string;
  withdrawalStatus?: 'none' | 'pending' | 'approved';
  withdrawalReason?: string;
  withdrawalDate?: string;
  withdrawalRequestedAt?: string;
  assignedRole?: 'crewmate' | 'impostor' | 'unassigned';
  assignedTeamId?: string;
  assignedTeamName?: string;
  isPresent?: boolean;
}
