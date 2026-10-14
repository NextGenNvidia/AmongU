import { apiClient } from './api';
import { AdminStats, PaginatedRegistrationsResponse, RegistrationsQuery } from '../types/admin';
import { RegistrationRecord } from '../types/registration';

export const adminService = {
  // Fetch event analytics & overview
  getStats: async (): Promise<{ success: boolean; stats: AdminStats }> => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  // Fetch paginated, filtered registrations
  getRegistrations: async (params: RegistrationsQuery): Promise<PaginatedRegistrationsResponse> => {
    const res = await apiClient.get('/admin/registrations', { params });
    return res.data;
  },

  // Update status manually
  updateStatus: async (
    id: string,
    paymentStatus: string,
    notes?: string
  ): Promise<{ success: boolean; registration: RegistrationRecord }> => {
    const res = await apiClient.patch(`/admin/registrations/${id}/status`, { paymentStatus, notes });
    return res.data;
  },

  // Update participant attendance, role, and details
  updateParticipant: async (
    id: string,
    data: {
      paymentStatus?: string;
      isPresent?: boolean;
      assignedRole?: string;
      assignedTeamName?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; registration: RegistrationRecord }> => {
    const res = await apiClient.patch(`/admin/registrations/${id}/status`, data);
    return res.data;
  },

  // Manual cash desk registration
  manualRegister: async (data: any): Promise<{ success: boolean; registration: RegistrationRecord }> => {
    const res = await apiClient.post('/admin/registrations/manual', data);
    return res.data;
  },

  // Download registrations CSV
  downloadCsv: async (): Promise<Blob> => {
    const res = await apiClient.get('/admin/export/csv', {
      responseType: 'blob',
    });
    return res.data;
  },
};
