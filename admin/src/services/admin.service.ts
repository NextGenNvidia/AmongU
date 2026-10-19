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

  // Get current event schedule & configuration
  getEventConfig: async (): Promise<{ success: boolean; config: any }> => {
    const res = await apiClient.get('/admin/event/config');
    return res.data;
  },

  // Update event schedule & configuration
  updateEventConfig: async (data: any): Promise<{ success: boolean; message: string; config: any }> => {
    const res = await apiClient.put('/admin/event/config', data);
    return res.data;
  },

  // Interactive Squads & Impostor Management
  getTeamsOverview: async (): Promise<{
    success: boolean;
    totalRegistered: number;
    assignedCount: number;
    unassignedCount: number;
    teams: any[];
    unassignedMembers: any[];
  }> => {
    const res = await apiClient.get('/teams/admin/overview');
    return res.data;
  },

  saveAllTeams: async (teams: any[]): Promise<{
    success: boolean;
    message: string;
    teams: any[];
  }> => {
    const res = await apiClient.post('/teams/admin/save-all', { teams });
    return res.data;
  },

  appointImpostor: async (teamId: string, collegeId: string): Promise<{
    success: boolean;
    message: string;
    team: any;
  }> => {
    const res = await apiClient.put(`/teams/admin/${teamId}/impostor`, { collegeId });
    return res.data;
  },

  // Generate or Regenerate Venue Check-in QR Token
  generateCheckInToken: async (): Promise<{
    success: boolean;
    token: string;
    updatedAt: string;
    message: string;
  }> => {
    const res = await apiClient.post('/admin/event/qr-token');
    return res.data;
  },

  // Periodic 24-Hour Registration Reminders Status & Manual Dispatch
  getReminderStatus: async (): Promise<{
    success: boolean;
    data: {
      lastReminderSentAt: string | null;
      lastReminderSentCount: number;
      totalUnpaidCadets: number;
      totalRegisteredCadets: number;
      totalCadets: number;
    };
  }> => {
    const res = await apiClient.get('/admin/reminders/status');
    return res.data;
  },

  triggerManualReminders: async (): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const res = await apiClient.post('/admin/reminders/send');
    return res.data;
  },

  // Official Organizer Announcements Management
  getAnnouncements: async (): Promise<{
    success: boolean;
    data: any[];
    count: number;
  }> => {
    const res = await apiClient.get('/admin/announcements');
    return res.data;
  },

  createAnnouncement: async (announcement: {
    title: string;
    content: string;
    category: string;
    authorName?: string;
    isPinned?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const res = await apiClient.post('/admin/announcements', announcement);
    return res.data;
  },

  deleteAnnouncement: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const res = await apiClient.delete(`/admin/announcements/${id}`);
    return res.data;
  },
};
