import { RegistrationRecord } from './registration';

export interface AdminStats {
  totalRegistrations: number;
  presentCount: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  totalRevenueINR: number;
  feePerUserINR: number;
  isRegistrationOpen: boolean;
  byBranch: Array<{ branch: string; count: number }>;
  byYear: Array<{ year: string; count: number }>;
  activeRoundKey: 'round1' | 'round2' | 'round3';
}

export interface CandidateRecord {
  id: string;
  name: string;
  collegeId: string;
  year: '1' | '2';
  branch: string;
  section: string;
  phone: string;
  email: string;
  track: string;
  suitColor: string;
  paymentStatus: 'success' | 'pending' | 'failed' | 'withdrawal_requested';
  amount: number;
  paymentId: string;
  registeredAt: string;
  // Newly added fields according to handwritten design
  isPresent: boolean; // Attendance at venue
  assignedTeamId?: string; // e.g. TEAM-01
  assignedTeamName?: string;
  assignedRole: 'crewmate' | 'impostor' | 'unassigned'; // Role once assigned
  eligibleRound: 'round1' | 'round2' | 'round3' | 'eliminated';
  withdrawalReason?: string;
  notes?: string;
}

export interface RegistrationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: 'pending' | 'success' | 'failed' | '';
  branch?: string;
  year?: string;
  section?: string;
  isPresent?: boolean;
}

export interface PaginatedRegistrationsResponse {
  success: boolean;
  data: RegistrationRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
