import { apiClient } from './api';
import { AdminLoginResponse, LoggedInUserRecord } from '../types';

export const adminService = {
  // Login with Admin ID and Password
  login: async (id: string, password: string): Promise<AdminLoginResponse> => {
    const res = await apiClient.post<AdminLoginResponse>('/admin/login', { id, password });
    return res.data;
  },

  // Get all users who have logged in from MongoDB User collection
  getUsers: async (): Promise<{ success: boolean; total: number; users: LoggedInUserRecord[] }> => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  // Toggle block/unblock cadet user
  toggleBlockUser: async (id: string): Promise<{ success: boolean; isBlocked: boolean; message: string }> => {
    const res = await apiClient.patch(`/admin/users/${id}/block`);
    return res.data;
  },

  // Completely delete cadet account from MongoDB and Firebase Auth
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },
};

