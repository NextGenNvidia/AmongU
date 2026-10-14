'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CandidateRecord } from '../../../types/admin';
import { Team } from '../../../types/team';
import RoundControl from '../../../components/admin/evaluation/RoundControl';
import TeamGenerator from '../../../components/admin/evaluation/TeamGenerator';
import Round1Evaluation from '../../../components/admin/evaluation/Round1Evaluation';
import Round2Evaluation from '../../../components/admin/evaluation/Round2Evaluation';
import ImpostorAssigner from '../../../components/admin/evaluation/ImpostorAssigner';
import { teamService } from '../../../services/team.service';

const DEFAULT_CANDIDATES: CandidateRecord[] = [
  {
    id: 'AU-2026-001',
    name: 'Aarav Sharma',
    collegeId: '220029012001001',
    year: '2',
    branch: 'CSE',
    section: 'A',
    phone: '9810123456',
    email: 'aarav.220029012@kiet.edu',
    track: 'Web Development',
    suitColor: '#EF4444',
    paymentStatus: 'success',
    amount: 55,
    paymentId: 'pay_NzO1kL9921a',
    registeredAt: '2026-10-13 14:22:10',
    isPresent: true,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
  {
    id: 'AU-2026-002',
    name: 'Priya Verma',
    collegeId: '230029013002014',
    year: '1',
    branch: 'AIML',
    section: 'B',
    phone: '9876543210',
    email: 'priya.230029013@kiet.edu',
    track: 'AI/ML Autonomous Agents',
    suitColor: '#06B6D4',
    paymentStatus: 'success',
    amount: 55,
    paymentId: 'pay_NzO4xP1198c',
    registeredAt: '2026-10-13 15:05:43',
    isPresent: true,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
  {
    id: 'AU-2026-003',
    name: 'Rohan Gupta',
    collegeId: '220029010003055',
    year: '2',
    branch: 'IT',
    section: 'A',
    phone: '9123456780',
    email: 'rohan.220029010@kiet.edu',
    track: 'Cybersecurity & System Defense',
    suitColor: '#84CC16',
    paymentStatus: 'success',
    amount: 55,
    paymentId: 'pay_NzP9aA8834q',
    registeredAt: '2026-10-13 16:12:00',
    isPresent: true,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
  {
    id: 'AU-2026-006',
    name: 'Sneha Patel',
    collegeId: '230029014006088',
    year: '1',
    branch: 'DS',
    section: 'A',
    phone: '9456789123',
    email: 'sneha.230029014@kiet.edu',
    track: 'AI/ML Autonomous Agents',
    suitColor: '#EC4899',
    paymentStatus: 'success',
    amount: 55,
    paymentId: 'REC_ONLINE_014',
    registeredAt: '2026-10-13 19:10:05',
    isPresent: true,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
  {
    id: 'AU-2026-007',
    name: 'Devansh Mishra',
    collegeId: '220029012007044',
    year: '2',
    branch: 'CSE',
    section: 'D',
    phone: '9345678901',
    email: 'devansh.220029012@kiet.edu',
    track: 'Web Development',
    suitColor: '#10B981',
    paymentStatus: 'success',
    amount: 55,
    paymentId: 'pay_NzT7uU3345m',
    registeredAt: '2026-10-13 20:30:14',
    isPresent: true,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
  {
    id: 'AU-2026-008',
    name: 'Kavya Nair',
    collegeId: '230029011008032',
    year: '1',
    branch: 'CSIT',
    section: 'A',
    phone: '9654321876',
    email: 'kavya.230029011@kiet.edu',
    track: 'AI/ML Autonomous Agents',
    suitColor: '#3B82F6',
    paymentStatus: 'success',
    amount: 55,
    paymentId: 'pay_NzW2pL7765k',
    registeredAt: '2026-10-13 21:15:50',
    isPresent: true,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
];

export default function AdminEvaluationPage() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>(DEFAULT_CANDIDATES);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeRound, setActiveRound] = useState<'round1' | 'round2' | 'round3'>('round1');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // Load candidates and saved teams from backend / storage
  useEffect(() => {
    // 1. Initial sync from local storage for fast render
    try {
      const teamsRaw = localStorage.getItem('amongu_teams_data');
      if (teamsRaw) {
        setTeams(JSON.parse(teamsRaw));
      }

      const roundRaw = localStorage.getItem('amongu_active_round_key');
      if (roundRaw === 'round1' || roundRaw === 'round2' || roundRaw === 'round3') {
        setActiveRound(roundRaw);
      }
    } catch {
      // ignore
    }

    // 2. Fetch fresh teams directly from MongoDB backend
    const loadTeamsFromBackend = async () => {
      try {
        const res = await teamService.getTeams();
        if (res.success && res.teams && res.teams.length > 0) {
          setTeams(res.teams);
          localStorage.setItem('amongu_teams_data', JSON.stringify(res.teams));
        }
      } catch {
        // Fallback gracefully to offline/local data
      }
    };

    loadTeamsFromBackend();
  }, []);

  // Handle Round Change
  const handleChangeRound = (round: 'round1' | 'round2' | 'round3') => {
    setActiveRound(round);
    let roundLabel = 'Round 1: Random Ideas, Real Solutions';
    if (round === 'round2') roundLabel = 'Round 2: Development Sprint';
    if (round === 'round3') roundLabel = 'Round 3: Impostor Challenge';

    try {
      localStorage.setItem('amongu_active_round_key', round);
      localStorage.setItem('amongu_active_round_name', roundLabel);
    } catch {
      // ignore
    }
    showToast(`Active Event Phase set to: ${roundLabel}`);
  };

  // Handle Teams Generated (Before Round 1)
  const handleTeamsGenerated = async (newTeams: Team[], updatedCandidates: CandidateRecord[]) => {
    setTeams(newTeams);
    setCandidates(updatedCandidates);
    try {
      localStorage.setItem('amongu_teams_data', JSON.stringify(newTeams));
    } catch {
      // ignore
    }

    // Persist to MongoDB backend
    try {
      const res = await teamService.generateTeams();
      if (res.success && res.teams && res.teams.length > 0) {
        setTeams(res.teams);
        localStorage.setItem('amongu_teams_data', JSON.stringify(res.teams));
      }
    } catch {
      // Fallback preserves generated client squads
    }

    showToast(`Created ${newTeams.length} randomized 4-person squads!`);
  };

  // Handle Round 1 or 2 Submission Update
  const handleUpdateTeamSubmission = async (teamId: string, updatedTeamData: Team) => {
    const updated = teams.map((t) => (t.id === teamId ? updatedTeamData : t));
    setTeams(updated);
    try {
      localStorage.setItem('amongu_teams_data', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to backend
    try {
      if (updatedTeamData.round1Submission) {
        await teamService.updateRound1Submission(teamId, {
          pptUrl: updatedTeamData.round1Submission.pptUrl,
          projectTitle: updatedTeamData.round1Submission.projectTitle,
          problemStatement: updatedTeamData.round1Submission.problemStatement,
          proposedSolution: updatedTeamData.round1Submission.architectureSummary,
          score: updatedTeamData.round1Submission.score,
          juryFeedback: updatedTeamData.round1Submission.juryFeedback,
        });
      }
      if (updatedTeamData.round2Submission) {
        await teamService.updateRound2Submission(teamId, {
          repoUrl: updatedTeamData.round2Submission.repoUrl,
          liveDemoUrl: updatedTeamData.round2Submission.liveDemoUrl,
          techStack: updatedTeamData.round2Submission.techStack,
          implementationStatus: updatedTeamData.round2Submission.implementationStatus,
          technicalComplexity: updatedTeamData.round2Submission.technicalComplexity,
          score: updatedTeamData.round2Submission.score,
          juryFeedback: updatedTeamData.round2Submission.juryFeedback,
        });
      }
    } catch {
      // UI already updated optimistically
    }
  };

  // Handle Impostors Assigned (Round 3)
  const handleImpostorsAssigned = async (updatedTeams: Team[], updatedCandidates: CandidateRecord[]) => {
    setTeams(updatedTeams);
    setCandidates(updatedCandidates);

    // Persist to MongoDB backend
    try {
      const res = await teamService.assignImpostors();
      if (res.success && res.teams) {
        setTeams(res.teams);
        localStorage.setItem('amongu_teams_data', JSON.stringify(res.teams));
      }
    } catch {
      // UI already updated optimistically
    }

    showToast('Round 3 Impostors assigned and transmission sent to website!');
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/95 border-2 border-crew-yellow text-crew-yellow px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce font-mono text-xs">
          <span className="text-xl">⚖️</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-yellow bg-yellow-950/60 border border-crew-yellow/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crew-yellow animate-pulse" />
              SECTION 2: EVALUATION PANEL
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">EVALUATION &amp; JUDGING MATRIX</h1>
          <p className="text-gray-400 text-sm font-bold mt-1 max-w-4xl">
            Manage round timers, randomly assign participants to four-member teams, review PPT submissions, evaluate development progress, and conduct the secret Impostor assignment for the final round.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="au-btn bg-crew-cyan hover:bg-cyan-400 text-black font-display text-xs sm:text-sm py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.25)]"
          >
            <span>RETURN TO MONITORING PANEL →</span>
          </Link>
        </div>
      </div>

      {/* 1. ROUND CONTROL & TIMER */}
      <RoundControl
        activeRound={activeRound}
        onChangeRound={handleChangeRound}
        onBroadcastTimerState={(msg) => showToast(msg)}
      />

      {/* 2. BEFORE ROUND 1 — SQUAD RANDOMIZER */}
      <TeamGenerator
        candidates={candidates}
        teams={teams}
        onTeamsGenerated={handleTeamsGenerated}
      />

      {/* 3. AFTER ROUND 1 — PPT & ARCHITECTURE SUBMISSION */}
      <Round1Evaluation
        teams={teams}
        onUpdateTeamSubmission={handleUpdateTeamSubmission}
      />

      {/* 4. ROUND 2 — DEVELOPMENT PHASE EVALUATION */}
      <Round2Evaluation
        teams={teams}
        onUpdateTeamSubmission={handleUpdateTeamSubmission}
      />

      {/* 5. ROUND 3 — SECRET IMPOSTOR INFILTRATION ENGINE */}
      <ImpostorAssigner
        teams={teams}
        candidates={candidates}
        onImpostorsAssigned={handleImpostorsAssigned}
      />

      {/* 6. FINAL REVEAL & JUDGING */}
      <div className="au-card bg-gray-900/90 border-2 border-crew-purple/40 p-5 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚖️</span>
            <div>
              <h3 className="font-display text-lg text-white">FINAL REVEAL &amp; JUDGING</h3>
              <p className="text-xs text-gray-400 font-mono">
                Evaluate the final prototypes, review the Impostor Challenge, and determine the winning teams and individual Impostors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-crew-purple font-bold px-3 py-1 rounded bg-black/60 border border-gray-800">
              Total Prize Pool: ₹10,000
            </span>
          </div>
        </div>

        {/* Judging Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-crew-yellow font-bold uppercase tracking-wider">CATEGORY 1</span>
              <span className="font-display text-sm text-crew-lime font-bold">₹4,000</span>
            </div>
            <h4 className="font-display text-sm text-white">Best Development Team</h4>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Evaluate the overall quality, functionality, creativity, and execution of the final prototype.
            </p>
          </div>

          <div className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-crew-red font-bold uppercase tracking-wider">CATEGORY 2</span>
              <span className="font-display text-sm text-crew-lime font-bold">₹3,000</span>
            </div>
            <h4 className="font-display text-sm text-white">Best Impostor</h4>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Evaluate the creativity and effectiveness of the permitted in-project sabotage.
            </p>
          </div>

          <div className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-crew-cyan font-bold uppercase tracking-wider">CATEGORY 3</span>
              <span className="font-display text-sm text-crew-lime font-bold">₹2,000</span>
            </div>
            <h4 className="font-display text-sm text-white">Second-Best Development Team</h4>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Recognize the second-highest-performing development team.
            </p>
          </div>

          <div className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-2 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-crew-orange font-bold uppercase tracking-wider">CATEGORY 4</span>
              <span className="font-display text-sm text-crew-lime font-bold">₹1,000</span>
            </div>
            <h4 className="font-display text-sm text-white">Second-Best Impostor</h4>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Recognize the second-best Impostor based on the challenge evaluation.
            </p>
          </div>
        </div>

        {/* Final Reveal Process Card */}
        <div className="bg-black/60 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-crew-yellow font-bold uppercase tracking-wider block">
              Final Reveal Process:
            </span>
            <p className="text-xs text-gray-300 font-mono leading-relaxed max-w-3xl">
              After the final development round, teams will be asked to identify the Impostor in their team. Teams that correctly identify their Impostor will receive points.
            </p>
          </div>
          <div className="text-right shrink-0 bg-yellow-950/40 border border-crew-yellow/40 px-3.5 py-2 rounded-xl">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">TOTAL PRIZE POOL</span>
            <span className="font-display text-lg text-crew-yellow font-bold">₹10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
