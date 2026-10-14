export interface TeamMember {
  id: string;
  name: string;
  collegeId: string;
  email: string;
  phone: string;
  branch: string;
  year: '1' | '2';
  section: string;
  suitColor: string;
  role: 'crewmate' | 'impostor' | 'unassigned';
  isPresent: boolean;
}

export interface Team {
  id: string;
  name: string;
  track: string;
  members: TeamMember[];
  impostorId?: string; // Secretly assigned member ID
  impostorRevealed: boolean;
  tableNumber?: number;
  round1Submission?: {
    pptUrl: string;
    projectTitle: string;
    problemStatement: string;
    architectureSummary: string;
    submittedAt: string;
    score?: number;
    juryFeedback?: string;
  };
  round2Submission?: {
    repoUrl: string;
    liveDemoUrl?: string;
    commitsCount?: number;
    techStack: string[];
    submittedAt: string;
    score?: number;
    sabotageDetected?: boolean;
    juryFeedback?: string;
    implementationStatus?: string;
    technicalComplexity?: string;
  };
  createdAt: string;
}
