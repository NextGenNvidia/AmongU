export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  hasRegistered?: boolean;
  registration?: any;
}
