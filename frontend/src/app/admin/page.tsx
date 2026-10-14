'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CandidateRecord } from '../../types/admin';
import { adminService } from '../../services/admin.service';
import MonitoringStats from '../../components/admin/monitoring/MonitoringStats';
import AnnouncementSection from '../../components/admin/monitoring/AnnouncementSection';
import CandidateTable from '../../components/admin/monitoring/CandidateTable';
import CandidateDossierModal from '../../components/admin/monitoring/CandidateDossierModal';

const DEFAULT_SEED_CANDIDATES: CandidateRecord[] = [
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
    id: 'AU-2026-004',
    name: 'Ananya Srivastava',
    collegeId: '230029012004092',
    year: '1',
    branch: 'CSE',
    section: 'C',
    phone: '9988776655',
    email: 'ananya.230029012@kiet.edu',
    track: 'Web Development',
    suitColor: '#F59E0B',
    paymentStatus: 'pending',
    amount: 55,
    paymentId: 'PENDING_TRANSACTION',
    registeredAt: '2026-10-13 17:40:19',
    isPresent: false,
    assignedRole: 'unassigned',
    eligibleRound: 'round1',
  },
  {
    id: 'AU-2026-005',
    name: 'Vikramaditya Chauhan',
    collegeId: '220029015005012',
    year: '2',
    branch: 'CS',
    section: 'B',
    phone: '9765432109',
    email: 'vikram.220029015@kiet.edu',
    track: 'Cybersecurity & System Defense',
    suitColor: '#8B5CF6',
    paymentStatus: 'withdrawal_requested',
    amount: 55,
    paymentId: 'pay_NzR1kL4412z',
    registeredAt: '2026-10-13 18:25:31',
    isPresent: false,
    assignedRole: 'unassigned',
    eligibleRound: 'eliminated',
    withdrawalReason: 'Clash with external lab practical on event date.',
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

export default function AdminMonitoringPage() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>(DEFAULT_SEED_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [activeRoundKey, setActiveRoundKey] = useState<'round1' | 'round2' | 'round3'>('round1');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // Sync real candidate registration and teams from localStorage
  useEffect(() => {
    try {
      // 1. Check user ticket
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw) {
        const ticket = JSON.parse(ticketRaw);
        if (ticket.name && ticket.collegeId) {
          const registeredCandidate: CandidateRecord = {
            id: ticket.ticketId ? ticket.ticketId : 'AU-LIVE-USER',
            name: ticket.name,
            collegeId: ticket.collegeId,
            year: ticket.year === '2' ? '2' : '1',
            branch: ticket.branch ? ticket.branch : 'CSE',
            section: ticket.section ? ticket.section : 'A',
            phone: ticket.phone ? ticket.phone : '9876543210',
            email: ticket.email ? ticket.email : 'candidate@kiet.edu',
            track: ticket.track ? ticket.track : 'Web Development',
            suitColor: ticket.suitColor ? ticket.suitColor : '#EF4444',
            paymentStatus: ticket.withdrawalRequested ? 'withdrawal_requested' : 'success',
            amount: 55,
            paymentId: ticket.razorpayPaymentId ? ticket.razorpayPaymentId : 'pay_live_001',
            registeredAt: ticket.createdAt ? ticket.createdAt : 'Just Now',
            isPresent: ticket.isPresent === true,
            assignedTeamId: ticket.assignedTeamId,
            assignedTeamName: ticket.assignedTeamName,
            assignedRole: ticket.assignedRole ? ticket.assignedRole : 'unassigned',
            eligibleRound: 'round1',
          };

          setCandidates((prev) => {
            const exists = prev.some((c) => c.collegeId === registeredCandidate.collegeId);
            if (exists) {
              return prev.map((c) => (c.collegeId === registeredCandidate.collegeId ? registeredCandidate : c));
            }
            return [registeredCandidate, ...prev];
          });
        }
      }

      // 2. Check saved teams data to sync assigned teams & roles
      const teamsRaw = localStorage.getItem('amongu_teams_data');
      if (teamsRaw) {
        const teams = JSON.parse(teamsRaw);
        if (Array.isArray(teams)) {
          setCandidates((prev) =>
            prev.map((c) => {
              for (const team of teams) {
                const found = team.members.find((m: any) => m.collegeId === c.collegeId);
                if (found) {
                  return {
                    ...c,
                    assignedTeamId: team.id,
                    assignedTeamName: team.name,
                    assignedRole: found.role || c.assignedRole,
                  };
                }
              }
              return c;
            })
          );
        }
      }

      // 3. Check active round key
      const savedRound = localStorage.getItem('amongu_active_round_key');
      if (savedRound === 'round1' || savedRound === 'round2' || savedRound === 'round3') {
        setActiveRoundKey(savedRound);
      }
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, []);

  // Fetch backend data if connected
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await adminService.getRegistrations({ limit: 100 });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: CandidateRecord[] = res.data.map((r) => ({
            id: r._id,
            name: r.name,
            collegeId: r.collegeId,
            year: r.year,
            branch: r.branch,
            section: r.section,
            phone: r.phone,
            email: r.email,
            track: 'Web Development',
            suitColor: '#06B6D4',
            paymentStatus: r.paymentStatus === 'success' ? 'success' : r.paymentStatus === 'failed' ? 'failed' : 'pending',
            amount: r.amount || 55,
            paymentId: r.razorpayPaymentId || 'N/A',
            registeredAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Recent',
            isPresent: false,
            assignedRole: 'unassigned',
            eligibleRound: 'round1',
          }));

          setCandidates((prev) => {
            const map = new Map<string, CandidateRecord>();
            mapped.forEach((c) => map.set(c.collegeId, c));
            prev.forEach((c) => {
              if (!map.has(c.collegeId)) map.set(c.collegeId, c);
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // standalone mode
      }
    };
    fetchBackend();
  }, []);

  // Attendance Toggle
  const handleToggleAttendance = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId || c.collegeId === candidateId) {
          const nextState = !c.isPresent;
          showToast(`${c.name} marked as ${nextState ? 'PRESENT (Checked In)' : 'ABSENT'}`);
          // Sync with local user ticket if matching
          try {
            const ticketRaw = localStorage.getItem('amongu_user_ticket');
            if (ticketRaw) {
              const ticket = JSON.parse(ticketRaw);
              if (ticket.collegeId === c.collegeId) {
                ticket.isPresent = nextState;
                localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
              }
            }
          } catch {
            // ignore
          }
          return { ...c, isPresent: nextState };
        }
        return c;
      })
    );
  };

  // Role Override
  const handleUpdateRole = (candidateId: string, role: 'crewmate' | 'impostor' | 'unassigned') => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId || c.collegeId === candidateId) {
          showToast(`Role updated to ${role.toUpperCase()} for ${c.name}`);
          // Sync with local user ticket if matching
          try {
            const ticketRaw = localStorage.getItem('amongu_user_ticket');
            if (ticketRaw) {
              const ticket = JSON.parse(ticketRaw);
              if (ticket.collegeId === c.collegeId) {
                ticket.assignedRole = role;
                localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
              }
            }
          } catch {
            // ignore
          }
          return { ...c, assignedRole: role };
        }
        return c;
      })
    );

    if (selectedCandidate && (selectedCandidate.id === candidateId || selectedCandidate.collegeId === candidateId)) {
      setSelectedCandidate((prev) => (prev ? { ...prev, assignedRole: role } : null));
    }
  };

  // CSV / Excel Export
  const handleExportCsv = () => {
    try {
      const headers = [
        'Candidate ID',
        'Full Name',
        'College ID',
        'KIET Email',
        'Phone',
        'Academic Year',
        'Department / Branch',
        'Section',
        'Selected Track',
        'Venue Attendance (Present)',
        'Assigned Team',
        'Assigned Role',
        'Fee Status',
        'Payment ID',
        'Registration Date',
      ];

      const rows = candidates.map((c) => [
        `"${c.id}"`,
        `"${c.name}"`,
        `"${c.collegeId}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"Year ${c.year}"`,
        `"${c.branch}"`,
        `"${c.section}"`,
        `"${c.track}"`,
        `"${c.isPresent ? 'PRESENT' : 'ABSENT'}"`,
        `"${c.assignedTeamName || 'Unassigned'}"`,
        `"${c.assignedRole.toUpperCase()}"`,
        `"${c.paymentStatus.toUpperCase()}"`,
        `"${c.paymentId}"`,
        `"${c.registeredAt}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AmongU_Master_Roster_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Master Roster exported to CSV successfully.');
    } catch {
      alert('Failed to generate CSV');
    }
  };

  // Metrics Calculations
  const totalRegistered = candidates.length;
  const presentCount = useMemo(() => candidates.filter((c) => c.isPresent).length, [candidates]);
  const activeRoundCount = useMemo(() => candidates.filter((c) => c.eligibleRound !== 'eliminated').length, [candidates]);
  const paidCount = useMemo(() => candidates.filter((c) => c.paymentStatus === 'success').length, [candidates]);
  const totalPaymentINR = paidCount * 55;
  const firstYearCount = useMemo(() => candidates.filter((c) => c.year === '1').length, [candidates]);
  const secondYearCount = useMemo(() => candidates.filter((c) => c.year === '2').length, [candidates]);

  const ongoingRoundLabel =
    activeRoundKey === 'round1'
      ? 'Round 1: Architecture & Pitch'
      : activeRoundKey === 'round2'
      ? 'Round 2: Development Sprint'
      : 'Round 3: Impostor Reveal & Judging';

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/95 border-2 border-crew-cyan text-crew-cyan px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">📡</span>
          <span className="text-xs font-mono font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Page Title & Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-cyan bg-cyan-950/60 border border-crew-cyan/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crew-cyan animate-pulse" />
              SECTION 1: MONITORING PANEL
            </span>
            <span className="text-xs font-mono text-crew-lime bg-green-950/60 border border-crew-lime/40 px-2.5 py-0.5 rounded-full">
              ROUND ONGOING: {ongoingRoundLabel}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">LIVE MONITORING COMMAND MATRIX</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">
            Real-time candidate registrations, venue attendance check-ins, fee collections, announcements, and roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/evaluation"
            className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs sm:text-sm py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(255,204,0,0.25)]"
          >
            <span>⚖️</span> SWITCH TO EVALUATION PANEL →
          </Link>
        </div>
      </div>

      {/* A. ALL THE DATA DISPLAY (KPI CARDS) */}
      <MonitoringStats
        totalRegistered={totalRegistered}
        presentCount={presentCount}
        activeRoundCount={activeRoundCount}
        activeRoundName={ongoingRoundLabel}
        totalPaymentINR={totalPaymentINR}
        firstYearCount={firstYearCount}
        secondYearCount={secondYearCount}
        ongoingRoundKey={activeRoundKey.toUpperCase()}
      />

      {/* B. ANNOUNCEMENT SECTION (To convey relevant info & results) */}
      <AnnouncementSection
        onPublishAnnouncement={(a) => showToast(`Dispatched Announcement: ${a.title}`)}
      />

      {/* C. DISPLAY ALL REGISTERED USERS WITH INDIVIDUAL DETAILS & FILTERS */}
      <CandidateTable
        candidates={candidates}
        onToggleAttendance={handleToggleAttendance}
        onSelectCandidate={(c) => setSelectedCandidate(c)}
        onUpdateRole={handleUpdateRole}
        onExportCsv={handleExportCsv}
      />

      {/* Candidate Individual Dossier Modal */}
      <CandidateDossierModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onToggleAttendance={handleToggleAttendance}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
}
