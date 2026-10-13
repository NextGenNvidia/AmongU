'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { adminService } from '../../services/admin.service';
import { ALLOWED_BRANCHES } from '../../constants/branches';

interface CandidateRecord {
  id: string;
  name: string;
  collegeId: string;
  year: '1' | '2';
  branch: string;
  section: string;
  phone: string;
  email: string;
  track: string;
  suitColor: string;
  paymentStatus: 'success' | 'pending' | 'failed' | 'withdrawal_requested';
  amount: number;
  paymentId: string;
  registeredAt: string;
  withdrawalReason?: string;
  notes?: string;
}

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
    paymentId: 'CASH_DESK_REC_014',
    registeredAt: '2026-10-13 19:10:05',
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
  },
];

export default function AdminMonitoringPage() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>(DEFAULT_SEED_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Round Management Console State
  const [activeRound, setActiveRound] = useState<'round1' | 'round2' | 'round3'>('round1');
  const [roundState, setRoundState] = useState<'live' | 'paused' | 'concluded'>('live');
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [activeBroadcast, setActiveBroadcast] = useState<string>('Round 1 Architecture & Pitch Submission Live');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Sync real candidate registration from localStorage if present
  useEffect(() => {
    try {
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw !== null && ticketRaw !== undefined && ticketRaw.length > 0) {
        const ticket = JSON.parse(ticketRaw);
        if (ticket.name !== undefined && ticket.collegeId !== undefined) {
          const registeredStatus: 'success' | 'pending' | 'failed' | 'withdrawal_requested' =
            ticket.withdrawalRequested === true ? 'withdrawal_requested' : 'success';

          const localCandidate: CandidateRecord = {
            id: ticket.ticketId !== undefined ? ticket.ticketId : 'AU-LIVE-USER',
            name: ticket.name,
            collegeId: ticket.collegeId,
            year: ticket.year === '2' ? '2' : '1',
            branch: ticket.branch !== undefined ? ticket.branch : 'CSE',
            section: ticket.section !== undefined ? ticket.section : 'A',
            phone: ticket.phone !== undefined ? ticket.phone : '9876543210',
            email: ticket.email !== undefined ? ticket.email : 'candidate@kiet.edu',
            track: ticket.track !== undefined ? ticket.track : 'Web Development',
            suitColor: ticket.suitColor !== undefined ? ticket.suitColor : '#EF4444',
            paymentStatus: registeredStatus,
            amount: 55,
            paymentId: ticket.razorpayPaymentId !== undefined ? ticket.razorpayPaymentId : 'pay_live_verified',
            registeredAt: ticket.createdAt !== undefined ? ticket.createdAt : 'Just Now',
            withdrawalReason: ticket.withdrawalReason !== undefined ? ticket.withdrawalReason : undefined,
          };

          setCandidates((prev) => {
            const exists = prev.some((c) => c.collegeId === localCandidate.collegeId);
            if (exists) {
              return prev.map((c) => (c.collegeId === localCandidate.collegeId ? localCandidate : c));
            }
            return [localCandidate, ...prev];
          });
        }
      }

      // Check saved round state
      const savedRound = localStorage.getItem('amongu_active_round_key');
      if (savedRound === 'round1' || savedRound === 'round2' || savedRound === 'round3') {
        setActiveRound(savedRound);
      }
      const savedBroadcast = localStorage.getItem('amongu_admin_broadcast');
      if (savedBroadcast !== null && savedBroadcast !== undefined && savedBroadcast.length > 0) {
        setActiveBroadcast(savedBroadcast);
      }
    } catch (e) {
      console.warn('Local storage candidate sync error:', e);
    }
  }, []);

  // Fetch backend data if server is connected
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await adminService.getRegistrations({ limit: 100 });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const serverCandidates: CandidateRecord[] = res.data.map((r) => {
            let pStatus: 'success' | 'pending' | 'failed' | 'withdrawal_requested' = 'pending';
            if (r.paymentStatus === 'success') {
              pStatus = 'success';
            } else if (r.paymentStatus === 'failed') {
              pStatus = 'failed';
            }
            return {
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
              paymentStatus: pStatus,
              amount: r.amount !== undefined ? r.amount : 55,
              paymentId: r.razorpayPaymentId !== undefined ? r.razorpayPaymentId : 'N/A',
              registeredAt: r.createdAt !== undefined ? new Date(r.createdAt).toLocaleString() : 'Recent',
              notes: r.notes,
            };
          });

          setCandidates((prev) => {
            // merge avoiding duplicates
            const map = new Map<string, CandidateRecord>();
            serverCandidates.forEach((c) => map.set(c.collegeId, c));
            prev.forEach((c) => {
              if (!map.has(c.collegeId)) {
                map.set(c.collegeId, c);
              }
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // Backend not reachable or in standalone mode; continue with seed data
      }
    };
    fetchBackendData();
  }, []);

  // Round Management Actions
  const handleRoundChange = (round: 'round1' | 'round2' | 'round3') => {
    setActiveRound(round);
    let roundLabel = 'Round 1: Infiltration & Architecture';
    if (round === 'round2') {
      roundLabel = 'Round 2: Rapid Prototyping & Sabotage';
    } else if (round === 'round3') {
      roundLabel = 'Round 3: Final Reveal & Judging';
    }
    try {
      localStorage.setItem('amongu_active_round_key', round);
      localStorage.setItem('amongu_active_round_name', roundLabel);
    } catch {
      // ignore
    }
    showToast(`Hackathon status set to: ${roundLabel}`);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastText.trim().length === 0) return;
    setActiveBroadcast(broadcastText.trim());
    try {
      localStorage.setItem('amongu_admin_broadcast', broadcastText.trim());
    } catch {
      // ignore
    }
    setBroadcastText('');
    showToast('Emergency broadcast transmitted to all participant screens!');
  };

  // Status Modifiers
  const handleUpdateStatus = (candidateId: string, newStatus: 'success' | 'pending' | 'withdrawal_requested') => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId || c.collegeId === candidateId) {
          return { ...c, paymentStatus: newStatus };
        }
        return c;
      })
    );
    showToast(`Candidate status changed to: ${newStatus.toUpperCase()}`);
    if (selectedCandidate !== null && (selectedCandidate.id === candidateId || selectedCandidate.collegeId === candidateId)) {
      setSelectedCandidate((prev) => (prev !== null ? { ...prev, paymentStatus: newStatus } : null));
    }
  };

  const handleApproveWithdrawal = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId || c.collegeId === candidateId);
    if (!candidate) return;
    const confirmDecommission = window.confirm(
      `Approve seat withdrawal for ${candidate.name} (${candidate.collegeId})? This decommissions the registration seat.`
    );
    if (!confirmDecommission) return;

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId || c.collegeId === candidateId) {
          return { ...c, paymentStatus: 'failed', notes: 'Seat withdrawal approved & refunded by admin.' };
        }
        return c;
      })
    );
    try {
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw !== null) {
        const ticket = JSON.parse(ticketRaw);
        if (ticket.collegeId === candidate.collegeId) {
          ticket.withdrawalRequested = false;
          ticket.isDecommissioned = true;
          localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
        }
      }
    } catch {
      // ignore
    }
    showToast(`Withdrawal approved. Seat decommissioned for ${candidate.name}.`);
    if (selectedCandidate !== null) {
      setSelectedCandidate(null);
    }
  };

  // CSV Export Generation
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Candidate ID',
        'Full Name',
        'College ID',
        'KIET Email',
        'Phone Number',
        'Academic Year',
        'Branch',
        'Section',
        'Selected Track',
        'Fee Status',
        'Fee Amount (INR)',
        'Payment Reference ID',
        'Registration Timestamp',
        'Withdrawal Notes',
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
        `"${c.paymentStatus.toUpperCase()}"`,
        `"${c.amount}"`,
        `"${c.paymentId}"`,
        `"${c.registeredAt}"`,
        `"${c.withdrawalReason !== undefined ? c.withdrawalReason : ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `AmongU_Registered_Candidates_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Master candidate roster downloaded successfully.');
    } catch (e) {
      alert('Error creating CSV download');
    } finally {
      setIsExporting(false);
    }
  };

  // Metrics Calculations (Executive KPIs requested)
  const totalRegistrations = candidates.length;
  const paidCandidates = useMemo(() => candidates.filter((c) => c.paymentStatus === 'success'), [candidates]);
  const paidCount = paidCandidates.length;
  const pendingCount = useMemo(() => candidates.filter((c) => c.paymentStatus === 'pending').length, [candidates]);
  const withdrawalCount = useMemo(
    () => candidates.filter((c) => c.paymentStatus === 'withdrawal_requested').length,
    [candidates]
  );
  const totalRevenue = paidCount * 55;
  const maxCapacity = 100;
  const capacityPercent = Math.min(100, Math.round((paidCount / maxCapacity) * 100));

  // Distribution breakdowns
  const trackCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Web Development': 0,
      'AI/ML Autonomous Agents': 0,
      'Cybersecurity & System Defense': 0,
    };
    candidates.forEach((c) => {
      if (counts[c.track] !== undefined) {
        counts[c.track] = counts[c.track] + 1;
      } else {
        counts['Web Development'] = counts['Web Development'] + 1;
      }
    });
    return counts;
  }, [candidates]);

  const yearCounts = useMemo(() => {
    let y1 = 0;
    let y2 = 0;
    candidates.forEach((c) => {
      if (c.year === '1') y1++;
      if (c.year === '2') y2++;
    });
    return { y1, y2 };
  }, [candidates]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q.length > 0) {
        const matchName = c.name.toLowerCase().includes(q);
        const matchId = c.collegeId.includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchPayId = c.paymentId.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchEmail && !matchPhone && !matchPayId) {
          return false;
        }
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'paid' && c.paymentStatus !== 'success') return false;
        if (filterStatus === 'pending' && c.paymentStatus !== 'pending') return false;
        if (filterStatus === 'withdrawal' && c.paymentStatus !== 'withdrawal_requested') return false;
      }

      // Track filter
      if (filterTrack !== 'all' && c.track !== filterTrack) {
        return false;
      }

      // Branch filter
      if (filterBranch !== 'all' && c.branch !== filterBranch) {
        return false;
      }

      // Year filter
      if (filterYear !== 'all' && c.year !== filterYear) {
        return false;
      }

      return true;
    });
  }, [candidates, searchQuery, filterStatus, filterTrack, filterBranch, filterYear]);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage !== null && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/90 border-2 border-crew-cyan text-crew-cyan px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">📡</span>
          <span className="text-sm font-mono font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-cyan bg-cyan-950/60 border border-crew-cyan/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crew-cyan animate-pulse" />
              SECTION 1: MISSION MONITORING MATRIX
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">HACKATHON CANDIDATE MONITORING</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">
            Real-time candidate registrations, ₹55 fee tracking, participant rosters, and event round orchestration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(50,205,50,0.25)]"
          >
            <span>📥</span>
            <span>{isExporting ? 'GENERATING CSV...' : 'EXPORT MASTER CSV'}</span>
          </button>

          <Link
            href="/admin/manual-entry"
            className="au-btn bg-gray-800 hover:bg-gray-700 text-white font-display text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-gray-700 flex items-center gap-1.5"
          >
            <span>+</span>
            <span>ON-SPOT CASH ENTRY</span>
          </Link>
        </div>
      </div>

      {/* HACKATHON ROUNDS & EVENT CONTROL CONSOLE (Admin Privileges) */}
      <div className="au-card bg-gray-900/90 border-2 border-crew-cyan/40 p-5 sm:p-6 rounded-2xl space-y-4 shadow-[0_0_25px_rgba(0,255,255,0.08)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🕹️</span>
            <div>
              <h2 className="font-display text-lg text-white">EVENT ROUND ORCHESTRATION</h2>
              <p className="text-xs text-gray-400 font-mono">Lead organizer controls for active round timing and emergency broadcasts</p>
            </div>
          </div>

          {/* Round State Status */}
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-gray-800">
            <span className="text-xs font-mono text-gray-400">STATE:</span>
            <span
              className={`text-xs font-display uppercase ${
                roundState === 'live' ? 'text-crew-lime' : roundState === 'paused' ? 'text-crew-yellow' : 'text-gray-400'
              }`}
            >
              {roundState === 'live' ? '🔴 LIVE IN PROGRESS' : roundState === 'paused' ? '⏸️ PAUSED' : '🏁 CONCLUDED'}
            </span>
          </div>
        </div>

        {/* Round Selector Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleRoundChange('round1')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeRound === 'round1'
                ? 'bg-crew-cyan/15 border-crew-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                : 'bg-black/40 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-crew-cyan">ROUND 1 (1 Hr 15 Min)</span>
              {activeRound === 'round1' && (
                <span className="text-[10px] bg-crew-cyan text-black font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
              )}
            </div>
            <p className="font-display text-sm text-white">The Infiltration &amp; Architecture</p>
            <p className="text-[11px] text-gray-400 mt-1">Crew assignment, problem selection, and architecture defense.</p>
          </button>

          <button
            onClick={() => handleRoundChange('round2')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeRound === 'round2'
                ? 'bg-crew-red/15 border-crew-red shadow-[0_0_15px_rgba(255,59,48,0.2)]'
                : 'bg-black/40 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-crew-red">ROUND 2 (1 Hr 45 Min)</span>
              {activeRound === 'round2' && (
                <span className="text-[10px] bg-crew-red text-white font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
              )}
            </div>
            <p className="font-display text-sm text-white">Rapid Prototyping &amp; Sabotage</p>
            <p className="text-[11px] text-gray-400 mt-1">Full code sprint while Impostors execute stealth sabotage tasks.</p>
          </button>

          <button
            onClick={() => handleRoundChange('round3')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeRound === 'round3'
                ? 'bg-crew-yellow/15 border-crew-yellow shadow-[0_0_15px_rgba(255,204,0,0.2)]'
                : 'bg-black/40 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-crew-yellow">ROUND 3 (45 Min)</span>
              {activeRound === 'round3' && (
                <span className="text-[10px] bg-crew-yellow text-black font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
              )}
            </div>
            <p className="font-display text-sm text-white">The Final Reveal &amp; Judging</p>
            <p className="text-[11px] text-gray-400 mt-1">Emergency meeting, accusations, live demo defense, and awards.</p>
          </button>
        </div>

        {/* Emergency Broadcast Dispatcher */}
        <form onSubmit={handleBroadcastSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">📢</span>
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Send event broadcast to participant dashboards (e.g. 15 min left for Round 1 architecture review!)..."
              className="w-full bg-black/60 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan font-mono"
            />
          </div>
          <button
            type="submit"
            className="au-btn bg-crew-cyan hover:bg-cyan-400 text-black font-display text-xs py-2 px-4 rounded-xl shrink-0"
          >
            BROADCAST ALERT
          </button>
        </form>

        {activeBroadcast.length > 0 && (
          <div className="bg-black/50 border border-gray-800/80 px-3.5 py-2 rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="text-crew-cyan font-bold">CURRENT LIVE BROADCAST:</span>
              <span className="text-gray-300 truncate">{activeBroadcast}</span>
            </div>
            <button
              onClick={() => {
                setActiveBroadcast('');
                try {
                  localStorage.removeItem('amongu_admin_broadcast');
                } catch {
                  // ignore
                }
                showToast('Broadcast cleared');
              }}
              className="text-gray-500 hover:text-white shrink-0 text-[10px] underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* EXECUTIVE KPI DASHBOARD (Requested: how many registered, how many paid fee, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Registrations */}
        <div className="au-card bg-gray-900 border-2 border-gray-800 p-5 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div>
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase">Total Registrations</span>
              <span className="text-xl">📋</span>
            </div>
            <p className="font-display text-4xl text-white tracking-tight">{totalRegistrations}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">Student submissions</span>
            <span className="text-crew-cyan font-bold">{capacityPercent}% full</span>
          </div>
        </div>

        {/* Confirmed & Paid */}
        <div className="au-card bg-gray-900 border-2 border-crew-lime/50 p-5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(50,205,50,0.1)]">
          <div>
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase text-crew-lime">Confirmed &amp; Paid</span>
              <span className="text-xl">✅</span>
            </div>
            <p className="font-display text-4xl text-crew-lime tracking-tight">{paidCount}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">₹55 Fee Verified</span>
            <span className="text-crew-lime font-bold">Seats Secured</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="au-card bg-gray-900 border-2 border-crew-yellow/50 p-5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(255,204,0,0.1)]">
          <div>
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase text-crew-yellow">Total Revenue</span>
              <span className="text-xl">💰</span>
            </div>
            <p className="font-display text-4xl text-crew-yellow tracking-tight">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">Rate: ₹55 / seat</span>
            <span className="text-crew-yellow font-bold">100% Retained</span>
          </div>
        </div>

        {/* Pending & Withdrawals */}
        <div className="au-card bg-gray-900 border-2 border-crew-red/40 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-mono font-bold uppercase text-crew-red">Pending / Withdrawals</span>
              <span className="text-xl">⚠️</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-4xl text-crew-red tracking-tight">{pendingCount}</p>
              <span className="text-gray-400 font-mono text-sm">/ {withdrawalCount} reqs</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">Payment pending</span>
            {withdrawalCount > 0 ? (
              <button
                onClick={() => setFilterStatus('withdrawal')}
                className="text-crew-red font-bold underline hover:text-red-400"
              >
                Review {withdrawalCount} Req
              </button>
            ) : (
              <span className="text-gray-500">0 Withdrawals</span>
            )}
          </div>
        </div>
      </div>

      {/* TRACK & ACADEMIC DISTRIBUTION GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Distribution */}
        <div className="au-card bg-gray-900/90 border-2 border-gray-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base text-white">TRACK ALLOCATION</h3>
            <span className="text-xs font-mono text-crew-cyan">3 TRACKS</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-gray-300">Web Development</span>
                <span className="text-crew-cyan font-mono">{trackCounts['Web Development']} candidates</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-gray-800">
                <div
                  className="bg-crew-cyan h-full rounded-full transition-all"
                  style={{ width: `${totalRegistrations > 0 ? (trackCounts['Web Development'] / totalRegistrations) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-gray-300">AI/ML Autonomous Agents</span>
                <span className="text-crew-lime font-mono">{trackCounts['AI/ML Autonomous Agents']} candidates</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-gray-800">
                <div
                  className="bg-crew-lime h-full rounded-full transition-all"
                  style={{ width: `${totalRegistrations > 0 ? (trackCounts['AI/ML Autonomous Agents'] / totalRegistrations) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-gray-300">Cybersecurity &amp; System Defense</span>
                <span className="text-crew-yellow font-mono">{trackCounts['Cybersecurity & System Defense']} candidates</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-gray-800">
                <div
                  className="bg-crew-yellow h-full rounded-full transition-all"
                  style={{ width: `${totalRegistrations > 0 ? (trackCounts['Cybersecurity & System Defense'] / totalRegistrations) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Year Distribution */}
        <div className="au-card bg-gray-900/90 border-2 border-gray-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base text-white">YEAR BREAKDOWN</h3>
            <span className="text-xs font-mono text-crew-yellow">1ST &amp; 2ND YR ONLY</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-black/60 border border-gray-800 p-3 rounded-xl text-center">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">FIRST YEAR (B.Tech)</span>
              <span className="font-display text-3xl text-crew-cyan">{yearCounts.y1}</span>
              <span className="text-[10px] text-gray-500 block mt-1">
                {totalRegistrations > 0 ? Math.round((yearCounts.y1 / totalRegistrations) * 100) : 0}% of roster
              </span>
            </div>

            <div className="bg-black/60 border border-gray-800 p-3 rounded-xl text-center">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">SECOND YEAR (B.Tech)</span>
              <span className="font-display text-3xl text-crew-lime">{yearCounts.y2}</span>
              <span className="text-[10px] text-gray-500 block mt-1">
                {totalRegistrations > 0 ? Math.round((yearCounts.y2 / totalRegistrations) * 100) : 0}% of roster
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Meter */}
        <div className="au-card bg-gray-900/90 border-2 border-gray-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-base text-white">CAPACITY OCCUPANCY</h3>
              <span className="text-xs font-mono text-crew-lime font-bold">{paidCount} / {maxCapacity} SEATS</span>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-tight">
              Venue capacity limit capped at 100 participants (25 randomized 4-person crewmate squads).
            </p>
          </div>

          <div>
            <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-gray-800 mb-2">
              <div
                className="bg-gradient-to-r from-crew-cyan via-crew-lime to-crew-yellow h-full rounded-full transition-all"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>0 Seats</span>
              <span>50% Midpoint</span>
              <span>100 Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER CANDIDATE REGISTRATION ROSTER & SEARCH / FILTER TOOLBAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-white flex items-center gap-2">
              <span>👥</span> REGISTERED CANDIDATE ROSTER
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              Showing {filteredCandidates.length} of {candidates.length} recorded candidates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterTrack('all');
                setFilterBranch('all');
                setFilterYear('all');
              }}
              className="text-xs text-gray-400 hover:text-white underline font-mono"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="au-card bg-gray-900/95 border-2 border-gray-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <input
              type="text"
              placeholder="Search name, ID, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/70 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan font-mono"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-black/70 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-cyan"
            >
              <option value="all">All Fee Statuses</option>
              <option value="paid">✅ Paid (₹55)</option>
              <option value="pending">⏳ Pending Payment</option>
              <option value="withdrawal">🚨 Withdrawal Requested</option>
            </select>
          </div>

          {/* Track Filter */}
          <div>
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="w-full bg-black/70 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-cyan"
            >
              <option value="all">All Tracks</option>
              <option value="Web Development">Web Development</option>
              <option value="AI/ML Autonomous Agents">AI/ML Autonomous Agents</option>
              <option value="Cybersecurity & System Defense">Cybersecurity</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full bg-black/70 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-cyan"
            >
              <option value="all">All Branches</option>
              {ALLOWED_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-black/70 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-cyan"
            >
              <option value="all">All Academic Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
            </select>
          </div>
        </div>

        {/* Master Candidate Table */}
        <div className="au-card bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/80 text-gray-400 font-mono border-b border-gray-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">College ID (15 Digits)</th>
                  <th className="py-3.5 px-4">Branch &amp; Year</th>
                  <th className="py-3.5 px-4">Track</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4">Payment Ref</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80 font-medium">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500 font-mono text-sm">
                      No registered candidates match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.collegeId}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      {/* Candidate Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow"
                            style={{ backgroundColor: candidate.suitColor }}
                            title={`Crewmate Color: ${candidate.suitColor}`}
                          >
                            <span className="text-[10px]">🚀</span>
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-crew-cyan transition-colors">
                              {candidate.name}
                            </p>
                            <span className="text-[10px] text-gray-500 font-mono">{candidate.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* 15-Digit College ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-crew-cyan tracking-wider">
                        {candidate.collegeId}
                      </td>

                      {/* Branch & Year */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-black/50 border border-gray-800 font-bold text-white">
                          Yr {candidate.year} • {candidate.branch}
                        </span>
                        <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">
                          Sec {candidate.section}
                        </span>
                      </td>

                      {/* Track */}
                      <td className="py-3.5 px-4">
                        <span className="text-gray-300 font-bold text-xs">{candidate.track}</span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <p className="text-gray-300">{candidate.phone}</p>
                        <p className="text-gray-500 truncate max-w-[160px]">{candidate.email}</p>
                      </td>

                      {/* Fee Status Badge */}
                      <td className="py-3.5 px-4">
                        {candidate.paymentStatus === 'success' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-crew-lime/15 text-crew-lime border border-crew-lime/40">
                            <span>●</span> PAID (₹55)
                          </span>
                        )}
                        {candidate.paymentStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-crew-yellow/15 text-crew-yellow border border-crew-yellow/40">
                            <span>⏳</span> PENDING
                          </span>
                        )}
                        {candidate.paymentStatus === 'withdrawal_requested' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-crew-red/20 text-crew-red border border-crew-red animate-pulse">
                            <span>🚨</span> WITHDRAW REQ
                          </span>
                        )}
                        {candidate.paymentStatus === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
                            CANCELLED
                          </span>
                        )}
                      </td>

                      {/* Payment Ref */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                        {candidate.paymentId}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="px-2 py-1 bg-black/60 hover:bg-gray-800 text-crew-cyan border border-gray-800 rounded font-mono text-[11px] transition-colors"
                            title="View Full Candidate Dossier"
                          >
                            Dossier
                          </button>

                          {candidate.paymentStatus === 'withdrawal_requested' ? (
                            <button
                              onClick={() => handleApproveWithdrawal(candidate.id)}
                              className="px-2 py-1 bg-red-950 hover:bg-crew-red text-white border border-crew-red rounded font-mono text-[11px] font-bold transition-colors"
                              title="Approve Withdrawal & Refund"
                            >
                              Approve
                            </button>
                          ) : (
                            <select
                              value={candidate.paymentStatus}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  candidate.id,
                                  e.target.value as 'success' | 'pending' | 'withdrawal_requested'
                                )
                              }
                              className="bg-black text-[11px] font-mono border border-gray-800 rounded px-1.5 py-1 text-gray-300 focus:outline-none"
                            >
                              <option value="success">Paid</option>
                              <option value="pending">Pending</option>
                              <option value="withdrawal_requested">Withdrawal</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CANDIDATE SECURITY DOSSIER MODAL */}
      {selectedCandidate !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="au-card bg-gray-900 border-2 border-crew-cyan max-w-lg w-full p-6 rounded-3xl shadow-[0_0_50px_rgba(0,255,255,0.2)] space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl border-2 border-white/20 flex items-center justify-center text-xl shrink-0 shadow-lg"
                  style={{ backgroundColor: selectedCandidate.suitColor }}
                >
                  🚀
                </div>
                <div>
                  <h3 className="font-display text-xl text-white">{selectedCandidate.name}</h3>
                  <p className="text-xs font-mono text-crew-cyan">ID: {selectedCandidate.collegeId}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Dossier Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-black/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-0.5">ACADEMIC YEAR &amp; BRANCH</span>
                <span className="text-white font-bold">
                  Year {selectedCandidate.year} • {selectedCandidate.branch} (Sec {selectedCandidate.section})
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-0.5">SELECTED TRACK</span>
                <span className="text-crew-lime font-bold">{selectedCandidate.track}</span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-0.5">OFFICIAL KIET EMAIL</span>
                <span className="text-white truncate block">{selectedCandidate.email}</span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-0.5">WHATSAPP / PHONE</span>
                <span className="text-white font-bold">{selectedCandidate.phone}</span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-0.5">FEE AMOUNT</span>
                <span className="text-crew-yellow font-bold">₹{selectedCandidate.amount} (Standard Seat)</span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-0.5">PAYMENT ID</span>
                <span className="text-gray-300 truncate block">{selectedCandidate.paymentId}</span>
              </div>
            </div>

            {/* Registration Timestamp */}
            <div className="bg-black/40 p-3 rounded-xl border border-gray-800 text-[11px] font-mono flex items-center justify-between text-gray-400">
              <span>Timestamp: {selectedCandidate.registeredAt}</span>
              <span className="text-crew-cyan">Verified KIET Student</span>
            </div>

            {/* Withdrawal Reason if Present */}
            {selectedCandidate.withdrawalReason !== undefined && (
              <div className="bg-red-950/60 border border-crew-red/60 p-3.5 rounded-xl text-xs space-y-1">
                <span className="text-crew-red font-display block">🚨 CANDIDATE WITHDRAWAL ADVISORY</span>
                <p className="text-gray-300 font-mono">{selectedCandidate.withdrawalReason}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {selectedCandidate.paymentStatus === 'withdrawal_requested' ? (
                <button
                  onClick={() => handleApproveWithdrawal(selectedCandidate.id)}
                  className="au-btn bg-crew-red hover:bg-red-500 text-white font-display text-xs py-2.5 px-4 rounded-xl flex-1"
                >
                  APPROVE WITHDRAWAL &amp; REFUND SEAT
                </button>
              ) : selectedCandidate.paymentStatus === 'pending' ? (
                <button
                  onClick={() => handleUpdateStatus(selectedCandidate.id, 'success')}
                  className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2.5 px-4 rounded-xl flex-1"
                >
                  MARK AS PAID (₹55)
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus(selectedCandidate.id, 'pending')}
                  className="au-btn bg-gray-800 hover:bg-gray-700 text-white font-display text-xs py-2.5 px-4 rounded-xl flex-1 border border-gray-700"
                >
                  RESET TO PENDING
                </button>
              )}

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2.5 bg-black border border-gray-800 hover:border-gray-700 rounded-xl text-xs font-mono text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
