'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { teamService } from '../../services/team.service';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';
import { apiClient } from '../../services/api';

interface UserTicket {
  name: string;
  collegeId: string;
  year: string;
  branch: string;
  section: string;
  phone: string;
  email: string;
  track: string;
  paymentId: string;
  amount: number;
  registeredAt: string;
  isEmailVerified: boolean;
  avatarColor?: string;
  avatarHat?: string;
  avatarMuffler?: string;
  withdrawalStatus?: 'none' | 'pending' | 'approved';
  withdrawalReason?: string;
  withdrawalDate?: string;
  assignedRole?: 'crewmate' | 'impostor' | 'unassigned';
  assignedTeamId?: string;
  assignedTeamName?: string;
  isPresent?: boolean;
}

import { CrewmateAvatarView } from '../../components/common/CrewmateAvatarView';

export default function UserDashboardPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<UserTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const [withdrawFeedback, setWithdrawFeedback] = useState<string | null>(null);

  // Admin Broadcast & Squad Assignment State
  const [adminBroadcast, setAdminBroadcast] = useState<string | null>(null);
  const [assignedRole, setAssignedRole] = useState<'crewmate' | 'impostor' | 'unassigned'>('unassigned');
  const [assignedTeam, setAssignedTeam] = useState<{ id: string; name: string; track?: string; tableNumber?: number; members: any[] } | null>(null);
  const [liveTimerSeconds, setLiveTimerSeconds] = useState<number>(4472);

  // Target Event Countdown: October 28, 2026 (09:00 AM IST)
  const [eventCountdown, setEventCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    let target = new Date('2026-10-28T09:00:00+05:30').getTime();

    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const cleanApi = rawApiUrl.replace(/\/api\/?$/, '');
    fetch(`${cleanApi}/api/event/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.eventStartDate) {
          target = new Date(data.config.eventStartDate).getTime();
        }
      })
      .catch(() => {});

    const updateCountdown = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setEventCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        setEventCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isPast: false,
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const { firebaseUser, profile, isRegistered, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    // 1. Must be logged in with KIET Google account
    if (!firebaseUser) {
      router.replace('/');
      return;
    }

    // 2. Strict Registration Check: if user has NOT registered, send them to registration
    if (!profile?.hasRegistered && !isRegistered) {
      console.log('Cadet has not registered yet. Redirecting to clearance portal...');
      router.replace('/portal/cadet-clearance-7b92');
      return;
    }

    // 3. Load REAL user registration from backend
    const loadRealRegistration = async () => {
      try {
        const res = await registrationService.getMyStatus();
        if (res.success && res.registration) {
          const reg = res.registration;
          let storedAvatarColor = '#c51111';
          let storedAvatarHat = 'none';
          let storedAvatarMuffler = 'none';
          let storedWithdrawalStatus: 'none' | 'pending' | 'approved' = 'none';
          let storedWithdrawalReason: string | undefined = undefined;
          let storedWithdrawalDate: string | undefined = undefined;

          try {
            const rawStored = localStorage.getItem('amongu_user_ticket');
            if (rawStored) {
              const parsed = JSON.parse(rawStored);
              if (parsed.avatarColor) storedAvatarColor = parsed.avatarColor;
              if (parsed.avatarHat) storedAvatarHat = parsed.avatarHat;
              if (parsed.avatarMuffler) storedAvatarMuffler = parsed.avatarMuffler;
              if (parsed.withdrawalStatus) storedWithdrawalStatus = parsed.withdrawalStatus;
              if (parsed.withdrawalReason) storedWithdrawalReason = parsed.withdrawalReason;
              if (parsed.withdrawalDate) storedWithdrawalDate = parsed.withdrawalDate;
            }
          } catch {}
          const realTicket: UserTicket = {
            name: reg.name || firebaseUser.displayName || 'Cadet',
            collegeId: reg.collegeId,
            year: String(reg.year || '1'),
            branch: reg.branch,
            section: reg.section,
            phone: reg.phone,
            email: reg.email || (firebaseUser.email as string),
            track: reg.notes?.includes('Track: ') ? reg.notes.split('Track: ')[1] : 'Web Development',
            paymentId: reg.razorpayPaymentId || 'CONFIRMED',
            amount: reg.amount || 55,
            registeredAt: new Date(reg.createdAt).toLocaleString(),
            isEmailVerified: true,
            avatarColor: storedAvatarColor,
            avatarHat: storedAvatarHat,
            avatarMuffler: storedAvatarMuffler,
            withdrawalStatus: storedWithdrawalStatus,
            withdrawalReason: storedWithdrawalReason,
            withdrawalDate: storedWithdrawalDate,
            assignedRole: (reg.assignedRole as any) || 'unassigned',
            assignedTeamId: reg.assignedTeamId,
            assignedTeamName: reg.assignedTeamName,
            isPresent: !!reg.isPresent,
          };
          setTicket(realTicket);
          localStorage.setItem('amongu_user_ticket', JSON.stringify(realTicket));
        } else {
          // If no registration record in MongoDB, bounce to registration
          router.replace('/portal/cadet-clearance-7b92');
          return;
        }
      } catch (err) {
        console.warn('Error fetching registration status:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRealRegistration();

    // 4. Sync admin broadcast announcement from live backend
    apiClient
      .get('/announcements')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          const latest = res.data.data[0];
          setAdminBroadcast(`${latest.title} — ${latest.content || latest.message}`);
        } else {
          const broadcastStored = localStorage.getItem('amongu_admin_broadcast');
          if (broadcastStored && broadcastStored.length > 0) {
            setAdminBroadcast(broadcastStored);
          }
        }
      })
      .catch(() => {
        const broadcastStored = localStorage.getItem('amongu_admin_broadcast');
        if (broadcastStored && broadcastStored.length > 0) {
          setAdminBroadcast(broadcastStored);
        }
      });

    // 5. Sync countdown timer
    const timerStored = localStorage.getItem('amongu_timer_remaining_seconds');
    if (timerStored) {
      const parsedTimer = parseInt(timerStored, 10);
      if (!isNaN(parsedTimer) && parsedTimer > 0) {
        setLiveTimerSeconds(parsedTimer);
      }
    }

    // 6. Sync REAL team data only (no mock Red Saboteurs)
    const syncTeamData = () => {
      try {
        const teamsRaw = localStorage.getItem('amongu_teams_data');
        if (teamsRaw && firebaseUser?.email) {
          const parsedTeams = JSON.parse(teamsRaw);
          if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
            const userEmail = (firebaseUser.email || '').toLowerCase();
            const matchedTeam = parsedTeams.find((t: any) =>
              t.members?.some((m: any) => m.email?.toLowerCase() === userEmail)
            );
            if (matchedTeam) {
              setAssignedTeam(matchedTeam);
              const myMember = matchedTeam.members.find((m: any) => m.email?.toLowerCase() === userEmail);
              if (myMember?.role) {
                setAssignedRole(myMember.role);
              }
            } else {
              setAssignedTeam(null);
            }
          } else {
            setAssignedTeam(null);
          }
        } else {
          setAssignedTeam(null);
        }
      } catch (err) {
        console.warn('Dashboard sync warning:', err);
      }
    };

    syncTeamData();

    // Backend sync for squad & role
    const syncBackendSquad = async () => {
      try {
        const res = await teamService.getMyTeam();
        if (res.success && res.team) {
          setAssignedTeam(res.team as any);
          if (res.myRole) {
            setAssignedRole(res.myRole);
          }
        }
      } catch {
        // No squad assigned yet
      }
    };
    syncBackendSquad();

    const syncInterval = setInterval(syncTeamData, 2000);
    window.addEventListener('storage', syncTeamData);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', syncTeamData);
    };
  }, [firebaseUser, profile, isRegistered, authLoading, router]);


  const handleCancelWithdrawalRequest = () => {
    if (!ticket) return;
    const updatedTicket: UserTicket = {
      ...ticket,
      withdrawalStatus: 'none',
      withdrawalReason: undefined,
      withdrawalDate: undefined,
    };
    setTicket(updatedTicket);
    try {
      localStorage.setItem('amongu_user_ticket', JSON.stringify(updatedTicket));
    } catch (e) {
      console.error('Failed to cancel withdrawal', e);
    }
    setWithdrawFeedback(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <p className="font-display text-2xl text-crew-cyan animate-pulse">CONNECTING TO DROP-SHIP DASHBOARD...</p>
      </div>
    );
  }

  const currentAvatarColor = ticket?.avatarColor ? ticket.avatarColor : '#c51111';
  const currentAvatarHat = ticket?.avatarHat ? ticket.avatarHat : 'none';
  const currentAvatarMuffler = ticket?.avatarMuffler ? ticket.avatarMuffler : 'none';
  const isWithdrawalPending = ticket?.withdrawalStatus === 'pending';

  const isImpostor = assignedRole === 'impostor';
  const isCrewmate = assignedRole === 'crewmate';

  // Dynamic Theme Palette
  const theme = {
    wrapper: isImpostor
      ? 'min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/75 via-[#0b0101] to-black font-body text-gray-100 antialiased selection:bg-crew-red selection:text-white transition-colors duration-500 relative overflow-hidden'
      : isCrewmate
      ? 'min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/60 via-[#020912] to-black font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black transition-colors duration-500 relative overflow-hidden'
      : 'min-h-screen bg-space font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black transition-colors duration-500 relative overflow-hidden',
    header: isImpostor
      ? 'border-b-4 border-red-700/80 bg-red-950/90 shadow-[0_4px_35px_rgba(239,68,68,0.35)] backdrop-blur sticky top-0 z-40'
      : isCrewmate
      ? 'border-b-4 border-crew-cyan/70 bg-cyan-950/85 shadow-[0_4px_35px_rgba(6,182,212,0.25)] backdrop-blur sticky top-0 z-40'
      : 'border-b-4 border-black bg-gray-900/90 backdrop-blur sticky top-0 z-40',
    headerBadge: isImpostor
      ? 'bg-red-950/90 border-2 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
      : isCrewmate
      ? 'bg-cyan-950/90 border-2 border-crew-cyan text-crew-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)]'
      : 'bg-black au-border text-crew-cyan',
    userBadge: isImpostor
      ? 'bg-red-950/80 border border-red-500/80 text-red-200'
      : isCrewmate
      ? 'bg-cyan-950/80 border border-crew-cyan/80 text-crew-cyan'
      : 'bg-black/60 au-border text-crew-lime',
    welcomeCard: isImpostor
      ? 'bg-gradient-to-r from-red-950/95 via-[#150202] to-red-950/85 border-4 border-red-600 shadow-[0_0_60px_rgba(239,68,68,0.35)]'
      : isCrewmate
      ? 'bg-gradient-to-r from-cyan-950/90 via-[#011424] to-slate-950 border-4 border-crew-cyan/80 shadow-[0_0_50px_rgba(6,182,212,0.25)]'
      : 'bg-gray-900 border-4 border-black',
    roleTag: isImpostor
      ? 'bg-red-600 text-white font-mono font-black border-2 border-black animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]'
      : isCrewmate
      ? 'bg-crew-cyan text-black font-mono font-black border-2 border-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
      : 'bg-crew-lime text-black font-display border-2 border-black',
    statusCard: isImpostor
      ? 'bg-red-950 text-red-300 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
      : isCrewmate
      ? 'bg-cyan-950 text-crew-cyan border-2 border-crew-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)]'
      : 'bg-black text-crew-lime border-2 border-black',
    squadCard: isImpostor
      ? 'bg-red-950/20 border-2 border-red-600/70 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
      : isCrewmate
      ? 'bg-cyan-950/20 border-2 border-crew-cyan/70 shadow-[0_0_40px_rgba(6,182,212,0.2)]'
      : 'bg-gray-950/95 border-2 border-crew-cyan/60 shadow-[0_0_35px_rgba(0,255,255,0.15)]',
    squadHeaderChip: isImpostor
      ? 'bg-red-600 text-white font-mono font-black'
      : isCrewmate
      ? 'bg-crew-cyan text-black font-mono font-black'
      : 'bg-crew-cyan text-black font-mono font-black',
    squadTitleText: isImpostor ? 'text-red-400' : isCrewmate ? 'text-crew-cyan' : 'text-crew-lime',
    roundSectionCard: isImpostor
      ? 'bg-red-950/25 border-4 border-red-800/80 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
      : isCrewmate
      ? 'bg-cyan-950/25 border-4 border-crew-cyan/60 shadow-[0_0_35px_rgba(6,182,212,0.15)]'
      : 'bg-gray-900 border-4 border-black',
    roundTimerText: isImpostor ? 'text-red-400' : isCrewmate ? 'text-crew-cyan' : 'text-crew-yellow',
  };

  return (
    <div className={theme.wrapper}>
      {/* Dynamic Role Ambient Atmospheric Glows */}
      {isImpostor && (
        <>
          <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-rose-900/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-[36rem] h-64 bg-red-950/40 rounded-full blur-3xl pointer-events-none" />
        </>
      )}
      {isCrewmate && (
        <>
          <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-crew-cyan/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-[36rem] h-64 bg-cyan-950/30 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Background Starfield */}
      <div className="stars pointer-events-none"></div>
      <div className="twinkling pointer-events-none"></div>

      {/* Top Navigation */}
      <header className={theme.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
              <svg width="28" height="34" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill={isImpostor ? '#ef4444' : isCrewmate ? '#06b6d4' : '#c51111'}
                  stroke="#000"
                  strokeWidth="6"
                />
                <path
                  d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                  fill={isImpostor ? '#fda4af' : '#9cdbfa'}
                  stroke="#000"
                  strokeWidth="6"
                />
              </svg>
              <span className={isImpostor ? 'text-red-500 font-black' : 'text-crew-red font-black'} style={{ textShadow: '2px 2px 0 #000' }}>
                AMONG
              </span>
              U
            </Link>

            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ml-2 ${theme.headerBadge}`}>
              <span className={`w-2 h-2 rounded-full ${isImpostor ? 'bg-red-400 animate-ping' : isCrewmate ? 'bg-crew-cyan animate-ping' : 'bg-gray-400'}`} />
              {isImpostor
                ? '🚨 IMPOSTOR DASHBOARD • SABOTAGE PROTOCOL'
                : isCrewmate
                ? '🛡️ CREWMATE DASHBOARD • DEFENSE PROTOCOL'
                : 'CREWMATE DASHBOARD'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full ${theme.userBadge}`}>
              {ticket?.email}
            </span>
            <Link
              href="/announcements"
              className="au-btn bg-purple-600 hover:bg-purple-500 text-white font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 font-bold shadow"
            >
              <span>ALERTS 📢</span>
            </Link>
            <Link
              href="/squad"
              className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 font-bold shadow"
            >
              <span>SQUAD 👥</span>
            </Link>
            <Link
              href="/profile"
              className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 font-bold shadow"
            >
              <span>PROFILE 👤</span>
            </Link>
            <Link
              href="/"
              className="au-btn bg-crew-white hover:bg-gray-200 text-black font-display text-xs sm:text-sm py-2 px-4 rounded-full"
            >
              EXIT TO HOME
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 relative z-10">
        {/* OFFICIAL ROUND 3 ROLE NOTIFICATION (AUTOMATICALLY DICTATED BY EVENT ADMIN) */}
        {isImpostor && (
          <div className="rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border bg-red-950/85 border-red-700/80 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🚨</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider font-bold">
                    OFFICIAL ROUND 3 ROLE DIRECTIVE:
                  </span>
                  <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                    YOU ARE THE IMPOSTOR
                  </span>
                </div>
                <p className="text-xs font-mono text-red-200 mt-1">
                  Confidential role assigned by Event Administration. Your dashboard has shifted to Blood Red Saboteur HUD. Execute stealth sabotage without detection.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-red-300 bg-black/70 px-3 py-1.5 rounded-xl border border-red-800/80 shrink-0">
              CLASSIFIED SABOTEUR HUD
            </span>
          </div>
        )}

        {isCrewmate && (
          <div className="rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border bg-cyan-950/85 border-cyan-700/80 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    OFFICIAL ROUND 3 ROLE DIRECTIVE:
                  </span>
                  <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded bg-crew-cyan text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    YOU ARE CREWMATE
                  </span>
                </div>
                <p className="text-xs font-mono text-cyan-200 mt-1">
                  Assigned by Event Administration. Your dashboard is in Neon Cyan Defense Mode. Complete sprints, verify code diffs, and expose the infiltrator.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-crew-cyan bg-black/70 px-3 py-1.5 rounded-xl border border-cyan-800/80 shrink-0">
              INTEGRITY DEFENDER HUD
            </span>
          </div>
        )}

        {/* WITHDRAWAL PENDING WARNING BANNER */}
        {isWithdrawalPending && (
          <div className="au-card bg-amber-950/90 border-4 border-amber-500 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl animate-bounce">⚠️</span>
              <div>
                <h3 className="font-display text-lg text-amber-300">REGISTRATION WITHDRAWAL REQUEST PENDING</h3>
                <p className="text-xs sm:text-sm text-amber-100 font-bold">
                  Requested on {ticket?.withdrawalDate}. Reason: &ldquo;{ticket?.withdrawalReason}&rdquo;. Notification logged for admin@kiet.edu.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelWithdrawalRequest}
              className="au-btn bg-black hover:bg-gray-800 text-crew-cyan font-display text-xs py-2 px-4 rounded-xl border-2 border-crew-cyan shrink-0 cursor-pointer"
            >
              CANCEL REQUEST
            </button>
          </div>
        )}

        {withdrawFeedback && !isWithdrawalPending && (
          <div className="bg-green-950/90 border-2 border-crew-lime text-green-200 p-4 rounded-2xl font-bold text-sm text-center">
            {withdrawFeedback}
          </div>
        )}

        {/* LIVE ADMIN ANNOUNCEMENT BROADCAST */}
        {adminBroadcast && (
          <div className={`border-2 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
            isImpostor
              ? 'bg-gradient-to-r from-red-950/90 via-black to-red-950/80 border-red-500'
              : 'bg-gradient-to-r from-red-950/80 via-black to-yellow-950/80 border-crew-yellow'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isImpostor ? '🚨' : '📢'}</span>
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                  isImpostor ? 'text-red-400' : 'text-crew-yellow'
                }`}>
                  ORGANIZER TRANSMISSION / EVENT ANNOUNCEMENT
                </span>
                <p className="text-white text-xs sm:text-sm font-mono font-bold">{adminBroadcast}</p>
              </div>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-mono font-bold text-crew-cyan hover:underline underline-offset-4 shrink-0 bg-black/60 px-3 py-1.5 rounded-xl border border-gray-700"
            >
              View All Transmissions →
            </Link>
          </div>
        )}

        {/* ROUND 3: HIGH-TECH CLASSIFIED DIRECTIVE CARD */}
        {isImpostor && (
          <div className="au-card bg-red-950/95 border-4 border-crew-red rounded-3xl p-6 sm:p-7 shadow-[0_0_55px_rgba(255,59,48,0.4)] space-y-4 relative overflow-hidden animate-[pulse_4s_ease-in-out_infinite]">
            <div className="absolute top-0 right-0 bg-crew-red text-white font-mono font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl tracking-widest shadow">
              TOP SECRET • SABOTEUR INFILTRATOR
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-4xl animate-bounce">🚨</span>
              <div>
                <span className="bg-crew-red text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded tracking-widest inline-block mb-1">
                  ROUND 3 CLASSIFIED DIRECTIVE
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
                  YOU ARE THE IMPOSTOR!
                </h2>
              </div>
            </div>
            <p className="text-red-100 text-xs sm:text-sm font-mono font-bold leading-relaxed">
              You have been covertly chosen as your team&rsquo;s Impostor. Your secret objective is to subtly sabotage project velocity, introduce edge-case code anomalies, and survive the Round 3 Emergency Meeting vote without getting detected.
            </p>

            {/* Sabotage Task HUD Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-black/60 p-3 rounded-xl border border-crew-red/50 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-red text-base">🗡️</span>
                  <span>Inject edge-case bug / memory latency</span>
                </span>
                <span className="text-[10px] font-black text-crew-red bg-red-950/80 px-2 py-0.5 rounded">SABOTAGE</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-crew-red/50 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-red text-base">🎭</span>
                  <span>Present convincingly in jury rounds</span>
                </span>
                <span className="text-[10px] font-black text-crew-red bg-red-950/80 px-2 py-0.5 rounded">DECEIVE</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-crew-red/50 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-red text-base">🤫</span>
                  <span>Divert blame when defects are found</span>
                </span>
                <span className="text-[10px] font-black text-crew-red bg-red-950/80 px-2 py-0.5 rounded">STEALTH</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-crew-red/50 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-red text-base">🗳️</span>
                  <span>Survive the Emergency Deduction Vote</span>
                </span>
                <span className="text-[10px] font-black text-crew-red bg-red-950/80 px-2 py-0.5 rounded">WINNER</span>
              </div>
            </div>
          </div>
        )}

        {isCrewmate && (
          <div className="au-card bg-cyan-950/90 border-4 border-crew-cyan rounded-3xl p-6 sm:p-7 shadow-[0_0_45px_rgba(0,255,255,0.25)] space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-crew-cyan text-black font-mono font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl tracking-widest shadow">
              SHIP SECURITY PROTOCOL • DEFENDER ACTIVE
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-4xl">🛡️</span>
              <div>
                <span className="bg-crew-cyan text-black text-[10px] font-mono font-black px-2.5 py-0.5 rounded tracking-widest inline-block mb-1">
                  ROUND 3 CREWMATE DIRECTIVE
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
                  PROTECT THE SHIP &amp; DEDUCE THE THREAT!
                </h2>
              </div>
            </div>
            <p className="text-cyan-100 text-xs sm:text-sm font-mono font-bold leading-relaxed">
              One member of your 4-person crew is secretly an Impostor! Complete your feature sprint, audit code pull requests, and deduce the hidden threat before the final jury reveal.
            </p>

            {/* Defense Task HUD Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-black/60 p-3 rounded-xl border border-crew-cyan/40 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-cyan text-base">🔍</span>
                  <span>Review git commits and PR diffs</span>
                </span>
                <span className="text-[10px] font-black text-crew-cyan bg-cyan-950/80 px-2 py-0.5 rounded">AUDIT</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-crew-cyan/40 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-cyan text-base">🚀</span>
                  <span>Ship working features for Round 2</span>
                </span>
                <span className="text-[10px] font-black text-crew-cyan bg-cyan-950/80 px-2 py-0.5 rounded">DEVELOP</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-crew-cyan/40 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-cyan text-base">👀</span>
                  <span>Note unexplained delays or logic bugs</span>
                </span>
                <span className="text-[10px] font-black text-crew-cyan bg-cyan-950/80 px-2 py-0.5 rounded">WATCH</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-crew-cyan/40 text-xs font-mono text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-crew-cyan text-base">🗳️</span>
                  <span>Deduce the Impostor in Emergency Meeting</span>
                </span>
                <span className="text-[10px] font-black text-crew-cyan bg-cyan-950/80 px-2 py-0.5 rounded">VOTE</span>
              </div>
            </div>
          </div>
        )}

        {/* VENUE ATTENDANCE & ONBOARDING HERO CARD */}
        {ticket?.isPresent ? (
          <div className="rounded-3xl p-5 sm:p-7 border-2 border-crew-lime bg-gradient-to-r from-[#031c0c] via-black to-[#052b14] shadow-[0_0_40px_rgba(34,197,94,0.25)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-green-900/60 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-green-950/80 border border-crew-lime flex items-center justify-center text-2xl shadow">
                  📍
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping" />
                    <span className="text-xs font-mono font-black text-crew-lime uppercase tracking-wider">
                      VENUE ATTENDANCE CONFIRMED • ARENA PASS ACTIVE
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                    WELCOME ONBOARD, {ticket?.name?.toUpperCase()}!
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-green-950 border border-crew-lime text-crew-lime font-mono font-bold text-xs flex items-center gap-2 shadow">
                  <span className="text-sm">✓</span> PRESENT AT VENUE
                </span>
              </div>
            </div>

            <p className="text-green-100/90 text-xs sm:text-sm font-mono font-semibold">
              Your physical presence at the KIET Deemed to be University arena has been logged by Mission Control. You are in the active squad draft pool for live squad formation and round challenges.
            </p>

            {/* Live Squad / Teammate Pairing Status */}
            {assignedTeam ? (
              <div className="bg-black/70 rounded-2xl p-4 border border-crew-lime/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    <span className="font-display text-white text-base">
                      PAIRED IN: <span className="text-crew-yellow font-black">{assignedTeam.name}</span> ({assignedTeam.id})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-crew-lime bg-green-950/80 px-3 py-1 rounded-lg border border-crew-lime/40">
                    VENUE TABLE #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)}
                  </span>
                </div>

                {assignedTeam.members && assignedTeam.members.length > 0 && (
                  <div>
                    <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                      Your Assigned Teammates:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {assignedTeam.members.map((m: any, idx: number) => {
                        const isMe = (ticket && m.collegeId === ticket.collegeId) || (ticket && m.email?.toLowerCase() === ticket.email?.toLowerCase());
                        return (
                          <div
                            key={m.collegeId || idx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-mono ${
                              isMe ? 'bg-cyan-950/70 border-crew-cyan text-crew-cyan font-bold' : 'bg-gray-900 border-gray-800 text-gray-200'
                            }`}
                          >
                            <span className="text-base">{isMe ? '⭐' : '👤'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold">{m.name} {isMe ? '(You)' : ''}</p>
                              <p className="text-[10px] text-gray-400 truncate">{m.collegeId}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-end">
                  <Link
                    href="/squad"
                    className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow"
                  >
                    <span>OPEN FULL SQUAD TERMINAL &amp; COMMS 👥 →</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-black/60 rounded-2xl p-4 border border-yellow-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-spin">⚙️</span>
                  <div>
                    <span className="text-xs font-mono font-bold text-crew-yellow uppercase tracking-wider">
                      SQUAD ALLOCATION IN PROGRESS
                    </span>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">
                      Mission Control is drafting 4-cadet crews from verified present attendees. Your squad and table assignment will appear here and in the Squad tab shortly.
                    </p>
                  </div>
                </div>
                <Link
                  href="/squad"
                  className="au-btn bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs py-2 px-3.5 rounded-xl shrink-0 font-bold border border-gray-600"
                >
                  VIEW SQUAD DECK
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {/* Welcome Banner + Live Avatar Preview */}
        <div className={`au-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500 ${theme.welcomeCard}`}>
          <div className="flex items-center gap-6">
            {/* Dynamic Avatar with Hat & Muffler */}
            <div className="shrink-0 float-slow relative">
              <CrewmateAvatarView
                color={isImpostor ? '#ef4444' : currentAvatarColor}
                hat={currentAvatarHat}
                muffler={currentAvatarMuffler}
                width={95}
                height={125}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl sm:text-4xl text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  WELCOME ABOARD, {ticket?.name.toUpperCase()}!
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${theme.roleTag}`}>
                  {isImpostor
                    ? '🚨 CLASSIFIED: IMPOSTOR'
                    : isCrewmate
                    ? '🛡️ VERIFIED CREWMATE'
                    : 'VERIFIED CREWMATE'}
                </span>
                {ticket?.isPresent && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-crew-lime text-black font-mono font-black border border-black shadow">
                    ✓ PRESENT AT VENUE
                  </span>
                )}
              </div>
              <p className="text-gray-300 font-bold text-sm sm:text-base mt-2">
                Your drop-ship seat is confirmed for <span className={isImpostor ? 'text-red-400 font-bold' : 'text-crew-cyan font-bold'}>AmongU</span> at KIET Deemed to be University.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href="/squad"
                  className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-1.5 px-4 rounded-full flex items-center gap-1.5 cursor-pointer font-bold shadow"
                >
                  <span>SQUAD ROOM 👥</span>
                </Link>
                <Link
                  href="/profile"
                  className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-1.5 px-4 rounded-full flex items-center gap-1.5 cursor-pointer font-bold shadow"
                >
                  <span>PROFILE &amp; AVATAR 👤⚙️</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 text-right">
            <span className="text-xs text-gray-400 font-bold uppercase">Registration Status</span>
            <span className={`font-display text-xl au-border px-4 py-1.5 rounded-xl ${
              isWithdrawalPending
                ? 'bg-amber-950 text-amber-300 border-amber-500'
                : theme.statusCard
            }`}>
              {isWithdrawalPending
                ? 'WITHDRAWAL PENDING ⚠️'
                : isImpostor
                ? 'VERIFIED • INFILTRATOR ACTIVE 🔪'
                : 'VERIFIED 🛡️'}
            </span>
          </div>
        </div>

        {/* 🛸 SECTION 1: COMPETITION ROUND STATUS */}
        <section aria-label="Competition Rounds" className={`au-card rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-500 ${theme.roundSectionCard}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">{isImpostor ? '🚨' : '🛰️'}</span>
                <h2 className={`font-display text-2xl ${isImpostor ? 'text-red-400' : 'text-crew-cyan'}`}>
                  {isImpostor ? 'SABOTAGE TOURNAMENT ROUND STATUS' : 'HACKATHON ROUND STATUS'}
                </h2>
              </div>
              <p className="text-gray-400 font-bold text-xs mt-0.5">
                Live Tournament Progression &bull; Synchronized with Admin Console
              </p>
            </div>
            <div className={`flex items-center gap-2 au-border px-3.5 py-1.5 rounded-full ${
              isImpostor ? 'bg-red-950/80 border-red-500' : 'bg-black/70'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isImpostor ? 'bg-red-500' : 'bg-crew-lime'} animate-ping`}></span>
              <span className={`font-display text-xs ${isImpostor ? 'text-red-400' : 'text-crew-lime'}`}>
                {!eventCountdown.isPast ? 'COUNTDOWN TO OCT 28' : 'ROUND 1 IN PROGRESS'}
              </span>
            </div>
          </div>

          {/* Active Round Showcase Card */}
          <div className={`bg-black/70 au-border rounded-2xl p-5 border-l-8 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
            isImpostor ? 'border-l-red-600' : 'border-l-crew-lime'
          }`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-display ${
                  isImpostor ? 'bg-red-600 text-white' : 'bg-crew-lime text-black'
                }`}>
                  {!eventCountdown.isPast ? 'MISSION COUNTDOWN' : 'ACTIVE ROUND'}
                </span>
                <span className="text-gray-400 font-mono text-xs">
                  {!eventCountdown.isPast ? 'Liftoff: October 28, 2026 (09:00 AM IST)' : 'Duration: 1h 15m'}
                </span>
              </div>
              <h3 className="font-display text-2xl text-white">
                {!eventCountdown.isPast ? 'COUNTDOWN TO EVENT LIFTOFF (OCTOBER 28, 2026)' : 'ROUND 1: THE INFILTRATION & ARCHITECTURE'}
              </h3>
              <p className="text-gray-300 text-sm font-bold max-w-2xl">
                {!eventCountdown.isPast
                  ? 'All cadet systems calibrated. Squad allocations, problem statements, and live challenges unlock on October 28, 2026. Keep your transmission channels open.'
                  : 'Teams unlock their problem statement within the track, spin up shared repositories, and establish system architecture. Stay alert: one crewmate is secretly designated the Impostor.'}
              </p>
            </div>

            <div className={`au-border p-4 rounded-xl text-center shrink-0 ${
              isImpostor ? 'bg-red-950/50 border-red-800' : 'bg-gray-900'
            }`}>
              <span className="text-[11px] text-gray-400 font-bold uppercase block">
                {!eventCountdown.isPast ? 'Liftoff Chrono' : 'Chrono Remaining'}
              </span>
              <span className={`font-mono font-bold text-2xl ${theme.roundTimerText}`}>
                {!eventCountdown.isPast
                  ? `${eventCountdown.days}d ${eventCountdown.hours.toString().padStart(2, '0')}h ${eventCountdown.minutes.toString().padStart(2, '0')}m ${eventCountdown.seconds.toString().padStart(2, '0')}s`
                  : Math.floor(liveTimerSeconds / 3600) > 0
                    ? `${Math.floor(liveTimerSeconds / 3600).toString().padStart(2, '0')}:${Math.floor((liveTimerSeconds % 3600) / 60).toString().padStart(2, '0')}:${(liveTimerSeconds % 60).toString().padStart(2, '0')}`
                    : `${Math.floor((liveTimerSeconds % 3600) / 60).toString().padStart(2, '0')}:${(liveTimerSeconds % 60).toString().padStart(2, '0')}`}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {!eventCountdown.isPast ? 'Synced to October 28, 2026' : 'Admin Central Time Sync'}
              </span>
            </div>
          </div>

          {/* 3-Round Progress Track */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Round 1 Card */}
            <div className="bg-black/50 au-border rounded-xl p-4 border-2 border-crew-lime relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-crew-lime text-sm">ROUND 1 (LIVE)</span>
                <span className="bg-crew-lime/20 text-crew-lime text-[10px] font-bold px-2 py-0.5 rounded-full border border-crew-lime">
                  NOW ACTIVE
                </span>
              </div>
              <h4 className="font-display text-white text-base">Ideation &amp; Architecture</h4>
              <p className="text-gray-400 text-xs mt-1.5 font-bold">
                Formation of 4-member crew, problem selection, and PPT deck submission.
              </p>
            </div>

            {/* Round 2 Card */}
            <div className="bg-black/50 au-border rounded-xl p-4 border-2 border-crew-yellow/50 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-crew-yellow text-sm">ROUND 2</span>
                <span className="bg-crew-yellow/20 text-crew-yellow text-[10px] font-bold px-2 py-0.5 rounded-full border border-crew-yellow">
                  DEV SPRINT
                </span>
              </div>
              <h4 className="font-display text-gray-200 text-base">Core Development &amp; Sabotage</h4>
              <p className="text-gray-400 text-xs mt-1.5 font-bold">
                GitHub code sprint. Impostors execute subtle sabotage.
              </p>
            </div>

            {/* Round 3 Card */}
            <div className="bg-black/50 au-border rounded-xl p-4 border-2 border-crew-red/50 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-crew-red text-sm">ROUND 3 (FINALE)</span>
                <span className="bg-crew-red/20 text-crew-red text-[10px] font-bold px-2 py-0.5 rounded-full border border-crew-red">
                  IMPOSTOR REVEAL
                </span>
              </div>
              <h4 className="font-display text-gray-200 text-base">Emergency Meeting &amp; Demo</h4>
              <p className="text-gray-400 text-xs mt-1.5 font-bold">
                Live demo to jury, voting deduction, and final prize awards.
              </p>
            </div>
          </div>
          </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Official Boarding Pass / Ticket */}
          <div className="lg:col-span-2 au-card bg-gray-900 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
              <div>
                <h2 className="font-display text-2xl text-crew-cyan">MISSION BOARDING PASS</h2>
                <p className="text-gray-400 font-bold text-xs">Official Registration Summary</p>
              </div>
              <span className="text-3xl">🎟️</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-black/60 au-border rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-bold block">Participant Name</span>
                <span className="font-bold text-white text-base">{ticket?.name}</span>
              </div>

              <div className="bg-black/60 au-border rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-bold block">College ID</span>
                <span className="font-mono font-bold text-crew-cyan text-base">{ticket?.collegeId}</span>
              </div>

              <div className="bg-black/60 au-border rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-bold block">Department &amp; Year</span>
                <span className="font-bold text-white text-base">
                  {ticket?.branch} (Year {ticket?.year})
                </span>
              </div>

              <div className="bg-black/60 au-border rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-bold block">Section</span>
                <span className="font-bold text-white text-base">Section {ticket?.section}</span>
              </div>

              <div className="bg-black/60 au-border rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-bold block">Assigned Track</span>
                <span className="font-bold text-crew-yellow text-base">{ticket?.track}</span>
              </div>

              <div className="bg-black/60 au-border rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-bold block">Contact WhatsApp</span>
                <span className="font-mono font-bold text-gray-300 text-base">{ticket?.phone}</span>
              </div>
            </div>

            <div className="bg-black au-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 font-bold block">Razorpay Transaction ID</span>
                <span className="font-mono text-crew-lime font-bold text-sm">{ticket?.paymentId}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 font-bold block">Email Verification</span>
                <span className="text-crew-lime font-bold text-xs bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                  OTP VERIFIED (KIET EDU)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Mission Schedule & Team Status */}
          <div className="space-y-6">
            {/* Squad Command Center Link Card */}
            <div className="au-card bg-gray-900 rounded-3xl p-6 border-2 border-crew-yellow/60 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <h3 className="font-display text-xl text-crew-yellow">SQUAD COMMAND CENTER</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-black au-border text-crew-lime">
                  {assignedTeam ? 'ASSIGNED' : 'STANDBY'}
                </span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm font-bold">
                {assignedTeam
                  ? `Active Squad: ${assignedTeam.name} (${assignedTeam.id}) at Table #${assignedTeam.tableNumber || assignedTeam.id.slice(-2)}.`
                  : 'Multi-disciplinary 4-cadet crews, arena workstation table assignments, and submission terminals.'}
              </p>
              <Link
                href="/squad"
                className="au-btn w-full bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow cursor-pointer"
              >
                <span>OPEN SQUAD ROOM &amp; COMMS 🚀</span>
              </Link>
            </div>

            {/* Event Day Quick Details */}
            <div className="au-card bg-gray-900 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🚨</span>
                <h3 className="font-display text-xl text-crew-red">MISSION DETAILS</h3>
              </div>
              <ul className="text-sm font-bold text-gray-300 space-y-2.5">
                <li className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">October 28, 2026</span>
                </li>
                <li className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Prize Pool:</span>
                  <span className="text-crew-lime font-display">₹25,000</span>
                </li>
                <li className="flex items-center justify-between pt-1">
                  <span className="text-gray-400">Venue:</span>
                  <span className="text-crew-cyan text-xs">KIET Deemed to be University</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
