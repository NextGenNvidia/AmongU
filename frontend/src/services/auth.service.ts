import { apiClient } from './api';
import { AuthResponse } from '../types/user';

export const authService = {
  // Sync regular student sign-in
  syncUser: async (): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/user/signin');
    return res.data;
  },

  // Sync admin portal sign-in
  syncAdmin: async (): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/admin/signin');
    return res.data;
  },

  // Get current authenticated user profile
  getMe: async (): Promise<AuthResponse> => {
    const res = await apiClient.get<AuthResponse>('/auth/me');
    return res.data;
  },
};
