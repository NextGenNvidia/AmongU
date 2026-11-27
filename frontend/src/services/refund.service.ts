import { apiClient } from './api';

export interface RefundRecord {
  _id: string;
  name: string;
  email: string;
  phone: string;
  collegeId: string;
  amount: number;
  paymentId?: string;
  upiId: string;
  reason: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyRefundResponse {
  success: boolean;
  isPaidUser: boolean;
  registration?: {
    name: string;
    email: string;
    phone: string;
    collegeId: string;
    branch: string;
    year: string;
    amount: number;
    paymentId?: string;
  } | null;
  hasRequest: boolean;
  refund?: RefundRecord | null;
}

export const refundService = {
  // Check my current refund request status and verify paid eligibility
  getMyRefundStatus: async (): Promise<MyRefundResponse> => {
    const res = await apiClient.get<MyRefundResponse>('/refunds/my-request');
    return res.data;
  },

  // Submit new refund claim
  submitRefundRequest: async (data: {
    upiId: string;
    reason: string;
    phone?: string;
    screenshotUrl?: string;
  }): Promise<{ success: boolean; message: string; refund: RefundRecord }> => {
    const res = await apiClient.post('/refunds/request', data);
    return res.data;
  },
};
