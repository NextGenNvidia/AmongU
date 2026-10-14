import { apiClient } from './api';
import { Team } from '../types/team';

export interface MyTeamResponse {
  success: boolean;
  team: Team;
  myRole: 'crewmate' | 'impostor' | 'unassigned';
  isImpostor: boolean;
}

export const teamService = {
  // Fetch all squads
  getTeams: async (): Promise<{ success: boolean; count: number; teams: Team[] }> => {
    const res = await apiClient.get('/teams');
    return res.data;
  },

  // Fetch single squad
  getTeamById: async (id: string): Promise<{ success: boolean; team: Team }> => {
    const res = await apiClient.get(`/teams/${id}`);
    return res.data;
  },

  // Admin: Generate 4-member squads from present candidates
  generateTeams: async (): Promise<{ success: boolean; message: string; teams: Team[] }> => {
    const res = await apiClient.post('/teams/generate');
    return res.data;
  },

  // Admin: Save Round 1 PPT & Architecture evaluation
  updateRound1Submission: async (
    teamId: string,
    data: {
      pptUrl?: string;
      projectTitle?: string;
      problemStatement?: string;
      proposedSolution?: string;
      score?: number;
      juryFeedback?: string;
    }
  ): Promise<{ success: boolean; message: string; team: Team }> => {
    const res = await apiClient.patch(`/teams/${teamId}/round1`, data);
    return res.data;
  },

  // Admin: Save Round 2 Development evaluation
  updateRound2Submission: async (
    teamId: string,
    data: {
      repoUrl?: string;
      liveDemoUrl?: string;
      techStack?: string[];
      implementationStatus?: string;
      technicalComplexity?: string;
      score?: number;
      juryFeedback?: string;
    }
  ): Promise<{ success: boolean; message: string; team: Team }> => {
    const res = await apiClient.patch(`/teams/${teamId}/round2`, data);
    return res.data;
  },

  // Admin: Secret Impostor Infiltration Engine (Assigns 1 Impostor per eligible team)
  assignImpostors: async (): Promise<{
    success: boolean;
    message: string;
    impostorCount: number;
    teams: Team[];
  }> => {
    const res = await apiClient.post('/teams/assign-impostors');
    return res.data;
  },

  // Candidate: Get assigned team and secret role
  getMyTeam: async (): Promise<MyTeamResponse> => {
    const res = await apiClient.get('/teams/my-team');
    return res.data;
  },
};
