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

  // Load candidates and saved teams from storage
  useEffect(() => {
    try {
      // 1. Sync teams
      const teamsRaw = localStorage.getItem('amongu_teams_data');
      if (teamsRaw) {
        setTeams(JSON.parse(teamsRaw));
      }

      // 2. Sync round
      const roundRaw = localStorage.getItem('amongu_active_round_key');
      if (roundRaw === 'round1' || roundRaw === 'round2' || roundRaw === 'round3') {
        setActiveRound(roundRaw);
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle Round Change
  const handleChangeRound = (round: 'round1' | 'round2' | 'round3') => {
    setActiveRound(round);
    let roundLabel = 'Round 1: Infiltration & Architecture';
    if (round === 'round2') roundLabel = 'Round 2: Rapid Prototyping & Sabotage';
    if (round === 'round3') roundLabel = 'Round 3: The Final Reveal & Judging';

    try {
      localStorage.setItem('amongu_active_round_key', round);
      localStorage.setItem('amongu_active_round_name', roundLabel);
    } catch {
      // ignore
    }
    showToast(`Active Event Phase set to: ${roundLabel}`);
  };

  // Handle Teams Generated (Before Round 1)
  const handleTeamsGenerated = (newTeams: Team[], updatedCandidates: CandidateRecord[]) => {
    setTeams(newTeams);
    setCandidates(updatedCandidates);
    try {
      localStorage.setItem('amongu_teams_data', JSON.stringify(newTeams));
    } catch {
      // ignore
    }
    showToast(`Created ${newTeams.length} randomized 4-person squads!`);
  };

  // Handle Round 1 or 2 Submission Update
  const handleUpdateTeamSubmission = (teamId: string, updatedTeamData: Team) => {
    const updated = teams.map((t) => (t.id === teamId ? updatedTeamData : t));
    setTeams(updated);
    try {
      localStorage.setItem('amongu_teams_data', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Handle Impostors Assigned (Round 3)
  const handleImpostorsAssigned = (updatedTeams: Team[], updatedCandidates: CandidateRecord[]) => {
    setTeams(updatedTeams);
    setCandidates(updatedCandidates);
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
          <p className="text-gray-400 text-sm font-bold mt-1">
            Round control, 4-member squad randomizer, PPT submissions, development phase scoring, and Round 3 secret Impostor infiltration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="au-btn bg-crew-cyan hover:bg-cyan-400 text-black font-display text-xs sm:text-sm py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.25)]"
          >
            <span>📡</span> RETURN TO MONITORING PANEL
          </Link>
        </div>
      </div>

      {/* 1. ROUND CONTROL & TIMER (Time / Start / Stop) */}
      <RoundControl
        activeRound={activeRound}
        onChangeRound={handleChangeRound}
        onBroadcastTimerState={(msg) => showToast(msg)}
      />

      {/* 2. BEFORE ROUND 1 (Make random team of 4 from present candidates) */}
      <TeamGenerator
        candidates={candidates}
        teams={teams}
        onTeamsGenerated={handleTeamsGenerated}
      />

      {/* 3. AFTER ROUND 1 (Take submission of PPT and other relevant info) */}
      <Round1Evaluation
        teams={teams}
        onUpdateTeamSubmission={handleUpdateTeamSubmission}
      />

      {/* 4. ROUND 2 (Development phase evaluation) */}
      <Round2Evaluation
        teams={teams}
        onUpdateTeamSubmission={handleUpdateTeamSubmission}
      />

      {/* 5. ROUND 3 (Make a random person from each team an Impostor and inform him on website) */}
      <ImpostorAssigner
        teams={teams}
        candidates={candidates}
        onImpostorsAssigned={handleImpostorsAssigned}
      />
    </div>
  );
}
