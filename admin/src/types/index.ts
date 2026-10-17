export interface LoggedInUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked?: boolean;
  firebaseUid: string;
  createdAt: string;
  updatedAt: string;
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

