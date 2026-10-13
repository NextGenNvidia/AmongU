import { RegistrationRecord } from './registration';

export interface AdminStats {
  totalRegistrations: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  totalRevenueINR: number;
  feePerUserINR: number;
  isRegistrationOpen: boolean;
  byBranch: Array<{ branch: string; count: number }>;
  byYear: Array<{ year: string; count: number }>;
}

export interface RegistrationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: 'pending' | 'success' | 'failed' | '';
  branch?: string;
  year?: string;
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
