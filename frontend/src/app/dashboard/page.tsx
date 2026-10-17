'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { teamService } from '../../services/team.service';
import TeamChatInterface from '../../components/dashboard/TeamChatInterface';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';

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

// 12 Authentic Among Us Colors
const AVATAR_COLORS = [
  { name: 'Red', hex: '#c51111' },
  { name: 'Blue', hex: '#132ed1' },
  { name: 'Green', hex: '#117f2d' },
  { name: 'Pink', hex: '#ed54ba' },
  { name: 'Orange', hex: '#ef7d0d' },
  { name: 'Yellow', hex: '#f5f557' },
  { name: 'Black', hex: '#3f474e' },
  { name: 'White', hex: '#d6e0f0' },
  { name: 'Purple', hex: '#6b2fbb' },
  { name: 'Cyan', hex: '#38fedc' },
  { name: 'Lime', hex: '#50ef39' },
  { name: 'Brown', hex: '#71491e' },
];

// Hats Selection
const AVATAR_HATS = [
  { id: 'none', label: 'None', emoji: '🚫' },
  { id: 'top-hat', label: 'Top Hat', emoji: '🎩' },
  { id: 'sprout', label: 'Sprout', emoji: '🌱' },
  { id: 'party-hat', label: 'Party Hat', emoji: '🎉' },
  { id: 'mini-crewmate', label: 'Mini Mate', emoji: '👨‍🚀' },
  { id: 'viking', label: 'Viking', emoji: '⚔️' },
  { id: 'detective', label: 'Detective', emoji: '🕵️' },
  { id: 'bandana', label: 'Bandana', emoji: '🔴' },
];

// Mufflers & Neckwear
const AVATAR_MUFFLERS = [
  { id: 'none', label: 'None', emoji: '🚫' },
  { id: 'winter-scarf', label: 'Red Scarf', emoji: '🧣' },
  { id: 'cyan-muffler', label: 'Cyan Muffler', emoji: '🧣' },
  { id: 'gold-chain', label: 'Gold Chain', emoji: '🪙' },
  { id: 'bowtie', label: 'Bowtie', emoji: '🎀' },
  { id: 'necktie', label: 'Necktie', emoji: '👔' },
  { id: 'stethoscope', label: 'Stethoscope', emoji: '🩺' },
];

// Dynamic Crewmate SVG with Hats & Mufflers
const CrewmateAvatarView: React.FC<{
  color: string;
  hat: string;
  muffler: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ color, hat, muffler, width = 110, height = 135, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 -28 100 148"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Backpack */}
      <rect x="2" y="30" width="25" height="50" rx="8" fill={color} stroke="#000" strokeWidth="5" />

      {/* Main Body & Legs */}
      <path
        d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
        fill={color}
        stroke="#000"
        strokeWidth="5"
      />

      {/* Visor */}
      <path
        d="M30,30 h45 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-45 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
        fill="#9cdbfa"
        stroke="#000"
        strokeWidth="5"
      />
      {/* Visor Reflection Gloss */}
      <path
        d="M36,36 h24 a4,4 0 0,1 4,4 v0 a4,4 0 0,1 -4,4 h-24 a4,4 0 0,1 -4,-4 v0 a4,4 0 0,1 4,-4 Z"
        fill="#ffffff"
        opacity="0.8"
      />

      {/* HATS LAYER */}
      {hat === 'top-hat' && (
        <g id="hat-top-hat">
          <ellipse cx="48" cy="16" rx="27" ry="6" fill="#18181b" stroke="#000" strokeWidth="3.5" />
          <path d="M33,16 L35,-10 L61,-10 L63,16 Z" fill="#18181b" stroke="#000" strokeWidth="3.5" />
          <path d="M34,10 L34.5,16 L61.5,16 L62,10 Z" fill="#c51111" stroke="#000" strokeWidth="2" />
        </g>
      )}

      {hat === 'sprout' && (
        <g id="hat-sprout">
          <path d="M48,15 Q50,0 44,-12" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
          <path d="M44,-12 Q30,-20 35,-6 Q42,-4 44,-12 Z" fill="#22c55e" stroke="#000" strokeWidth="2.5" />
          <path d="M44,-12 Q58,-18 53,-4 Q47,-3 44,-12 Z" fill="#22c55e" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {hat === 'party-hat' && (
        <g id="hat-party-hat">
          <polygon points="48,-18 32,16 64,16" fill="#facc15" stroke="#000" strokeWidth="3" />
          <line x1="36" y1="6" x2="60" y2="6" stroke="#ef4444" strokeWidth="3.5" />
          <line x1="41" y1="-5" x2="55" y2="-5" stroke="#3b82f6" strokeWidth="3.5" />
          <circle cx="48" cy="-21" r="5" fill="#06b6d4" stroke="#000" strokeWidth="2" />
        </g>
      )}

      {hat === 'mini-crewmate' && (
        <g id="hat-mini-crewmate">
          <rect x="36" y="-6" width="22" height="22" rx="7" fill={color} stroke="#000" strokeWidth="3" />
          <rect x="44" y="-3" width="16" height="9" rx="4" fill="#9cdbfa" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {hat === 'viking' && (
        <g id="hat-viking">
          <path d="M26,17 Q48,-2 70,17 Z" fill="#78350f" stroke="#000" strokeWidth="3.5" />
          <path d="M26,14 Q14,8 18,-8 Q25,4 28,12 Z" fill="#fef3c7" stroke="#000" strokeWidth="2.5" />
          <path d="M70,14 Q82,8 78,-8 Q71,4 68,12 Z" fill="#fef3c7" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {hat === 'detective' && (
        <g id="hat-detective">
          <ellipse cx="48" cy="16" rx="27" ry="6" fill="#92400e" stroke="#000" strokeWidth="3.5" />
          <path d="M34,14 Q48,-5 62,14 Z" fill="#92400e" stroke="#000" strokeWidth="3" />
          <path d="M34,13 Q48,7 62,13 L62,16 Q48,10 34,16 Z" fill="#451a03" />
        </g>
      )}

      {hat === 'bandana' && (
        <g id="hat-bandana">
          <path d="M22,23 Q48,13 74,23 L74,30 Q48,20 22,30 Z" fill="#c51111" stroke="#000" strokeWidth="3" />
          <circle cx="23" cy="27" r="4.5" fill="#c51111" stroke="#000" strokeWidth="2" />
          <polygon points="23,29 14,37 19,41 25,31" fill="#c51111" stroke="#000" strokeWidth="2" />
        </g>
      )}

      {/* MUFFLERS & NECKWEAR LAYER */}
      {muffler === 'winter-scarf' && (
        <g id="muffler-winter-scarf">
          <path
            d="M26,58 Q48,66 70,58 Q73,69 68,73 Q48,79 26,71 Z"
            fill="#c51111"
            stroke="#000"
            strokeWidth="3.5"
          />
          <line x1="36" y1="61" x2="38" y2="72" stroke="#ffffff" strokeWidth="3" />
          <line x1="56" y1="61" x2="54" y2="72" stroke="#ffffff" strokeWidth="3" />
          <path d="M60,67 L69,96 L55,98 L53,72 Z" fill="#c51111" stroke="#000" strokeWidth="3.5" />
          <line x1="56" y1="98" x2="68" y2="96" stroke="#ffffff" strokeWidth="3" strokeDasharray="2,2" />
        </g>
      )}

      {muffler === 'cyan-muffler' && (
        <g id="muffler-cyan-muffler">
          <path
            d="M26,58 Q48,66 70,58 Q73,69 68,73 Q48,79 26,71 Z"
            fill="#06b6d4"
            stroke="#000"
            strokeWidth="3.5"
          />
          <path d="M33,67 L25,96 L39,98 L41,72 Z" fill="#06b6d4" stroke="#000" strokeWidth="3.5" />
        </g>
      )}

      {muffler === 'gold-chain' && (
        <g id="muffler-gold-chain">
          <path d="M28,60 Q48,82 68,60" fill="none" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="48" cy="74" r="6.5" fill="#f59e0b" stroke="#000" strokeWidth="2" />
          <circle cx="48" cy="74" r="3" fill="#c51111" />
        </g>
      )}

      {muffler === 'bowtie' && (
        <g id="muffler-bowtie">
          <polygon points="48,66 34,58 34,74" fill="#c51111" stroke="#000" strokeWidth="2.5" />
          <polygon points="48,66 62,58 62,74" fill="#c51111" stroke="#000" strokeWidth="2.5" />
          <circle cx="48" cy="66" r="4" fill="#18181b" stroke="#000" strokeWidth="2" />
        </g>
      )}

      {muffler === 'necktie' && (
        <g id="muffler-necktie">
          <polygon points="45,60 51,60 50,66 46,66" fill="#2563eb" stroke="#000" strokeWidth="2" />
          <polygon points="46,66 50,66 53,92 48,99 43,92" fill="#2563eb" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {muffler === 'stethoscope' && (
        <g id="muffler-stethoscope">
          <path d="M32,58 Q48,78 64,58" fill="none" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M48,70 Q55,83 51,92" fill="none" stroke="#64748b" strokeWidth="3.5" />
          <circle cx="51" cy="94" r="5.5" fill="#e2e8f0" stroke="#000" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<UserTicket | null>(null);
  const [loading, setLoading] = useState(true);

  // Avatar Customizer Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#c51111');
  const [selectedHat, setSelectedHat] = useState('none');
  const [selectedMuffler, setSelectedMuffler] = useState('none');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('Schedule Conflict');
  const [customWithdrawReason, setCustomWithdrawReason] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawFeedback, setWithdrawFeedback] = useState<string | null>(null);

  // Admin Broadcast & Squad Assignment State
  const [adminBroadcast, setAdminBroadcast] = useState<string | null>(null);
  const [assignedRole, setAssignedRole] = useState<'crewmate' | 'impostor' | 'unassigned'>('unassigned');
  const [assignedTeam, setAssignedTeam] = useState<{ id: string; name: string; track?: string; tableNumber?: number; members: any[] } | null>(null);
  const [round1PptUrl, setRound1PptUrl] = useState('');
  const [round1ProjectTitle, setRound1ProjectTitle] = useState('');
  const [round1Submitted, setRound1Submitted] = useState(false);
  const [round2RepoUrl, setRound2RepoUrl] = useState('');
  const [round2Submitted, setRound2Submitted] = useState(false);
  const [liveTimerSeconds, setLiveTimerSeconds] = useState<number>(4472);

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
            avatarColor: '#c51111',
            avatarHat: 'none',
            avatarMuffler: 'none',
            withdrawalStatus: 'none',
            assignedRole: (reg.assignedRole as any) || 'unassigned',
            assignedTeamId: reg.assignedTeamId,
          };
          setTicket(realTicket);
          setSelectedColor(realTicket.avatarColor as string);
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

    // 4. Sync admin broadcast announcement
    const broadcastStored = localStorage.getItem('amongu_admin_broadcast');
    if (broadcastStored && broadcastStored.length > 0) {
      setAdminBroadcast(broadcastStored);
    }

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

  const handleSaveAvatar = () => {
    if (!ticket) return;
    const updatedTicket: UserTicket = {
      ...ticket,
      avatarColor: selectedColor,
      avatarHat: selectedHat,
      avatarMuffler: selectedMuffler,
    };
    setTicket(updatedTicket);
    try {
      localStorage.setItem('amongu_user_ticket', JSON.stringify(updatedTicket));
    } catch (e) {
      console.error('Failed to save avatar preferences', e);
    }
    setIsAvatarModalOpen(false);
  };

  const handleConfirmWithdrawal = () => {
    if (!ticket) return;
    setIsSubmittingWithdraw(true);

    const fullReason =
      withdrawReason === 'Other' && customWithdrawReason.trim()
        ? customWithdrawReason.trim()
        : withdrawReason;

    setTimeout(() => {
      const updatedTicket: UserTicket = {
        ...ticket,
        withdrawalStatus: 'pending',
        withdrawalReason: fullReason,
        withdrawalDate: new Date().toLocaleString(),
      };
      setTicket(updatedTicket);
      try {
        localStorage.setItem('amongu_user_ticket', JSON.stringify(updatedTicket));
      } catch (e) {
        console.error('Failed to store withdrawal status', e);
      }
      setIsSubmittingWithdraw(false);
      setIsWithdrawModalOpen(false);
      setWithdrawFeedback(
        'Withdrawal dispatch logged! Notification sent to admin@kiet.edu for review and seat release.'
      );
    }, 700);
  };

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

          <div className="flex items-center gap-4">
            <span className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full ${theme.userBadge}`}>
              {ticket?.email}
            </span>
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
          <div className={`border-2 rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-pulse ${
            isImpostor
              ? 'bg-gradient-to-r from-red-950/90 via-black to-red-950/80 border-red-500'
              : 'bg-gradient-to-r from-red-950/80 via-black to-yellow-950/80 border-crew-yellow'
          }`}>
            <span className="text-2xl">{isImpostor ? '🚨' : '📢'}</span>
            <div className="flex-1">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                isImpostor ? 'text-red-400' : 'text-crew-yellow'
              }`}>
                ORGANIZER TRANSMISSION / EVENT ANNOUNCEMENT
              </span>
              <p className="text-white text-xs sm:text-sm font-mono font-bold">{adminBroadcast}</p>
            </div>
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

        {/* SQUAD / TEAM ASSIGNMENT MATRIX */}
        {assignedTeam ? (
          <div className={`au-card rounded-3xl p-5 sm:p-6 space-y-5 relative overflow-hidden transition-all duration-500 ${theme.squadCard}`}>
            {/* Ambient Corner Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              isImpostor ? 'bg-red-600/10' : 'bg-crew-cyan/10'
            }`} />

            {/* Squad Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow transition-colors ${
                  isImpostor
                    ? 'bg-red-950/70 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-cyan-950/60 border border-crew-cyan/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                }`}>
                  {isImpostor ? '🔪' : '🚀'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-black tracking-wider shadow ${theme.squadHeaderChip}`}>
                      {assignedTeam.id}
                    </span>
                    <span className="text-[11px] font-mono text-crew-lime font-bold bg-green-950/50 border border-crew-lime/30 px-2 py-0.5 rounded">
                      OFFICIAL SQUAD
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-tight mt-0.5">
                    {assignedTeam.name}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 flex items-center gap-1.5">
                  <span className="text-gray-500">ASSIGNED VENUE TABLE:</span>
                  <span className={isImpostor ? 'text-red-400 font-bold' : 'text-crew-yellow font-bold'}>
                    Table #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
                  <span className={`font-bold ${theme.squadTitleText}`}>
                    {assignedTeam.members?.length || 4} MEMBERS
                  </span>
                </div>
              </div>
            </div>

            {/* Teammates Cluster (4-Members Grid) */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <span>👥</span> YOUR SQUAD MATES (TEAM MEMBERS)
                </span>
                <span className="text-gray-500 text-[11px]">
                  Assigned by Central Mission Control
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {assignedTeam.members &&
                  assignedTeam.members.map((teammate: any, idx: number) => {
                    const isCurrentUser =
                      (ticket && teammate.collegeId === ticket.collegeId) ||
                      (ticket && teammate.email?.toLowerCase() === ticket.email?.toLowerCase());

                    return (
                      <div
                        key={teammate.collegeId || idx}
                        className={`rounded-2xl p-3.5 border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                          isCurrentUser
                            ? isImpostor
                              ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                              : isCrewmate
                              ? 'bg-cyan-950/60 border-crew-cyan ring-2 ring-crew-cyan shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                              : 'bg-cyan-950/40 border-crew-cyan ring-1 ring-crew-cyan'
                            : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {/* Top: Avatar & Name */}
                        <div className="flex items-start gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl border border-black flex items-center justify-center text-sm shrink-0 shadow mt-0.5"
                            style={{ backgroundColor: teammate.suitColor || '#EF4444' }}
                          >
                            {isCurrentUser && isImpostor ? '🔪' : '🚀'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-bold text-xs sm:text-sm truncate">
                                {teammate.name}
                              </span>
                              {isCurrentUser && (
                                <span className={`px-1.5 py-0.2 rounded font-mono font-extrabold text-[9px] shrink-0 ${
                                  isImpostor ? 'bg-red-600 text-white animate-pulse' : 'bg-crew-cyan text-black'
                                }`}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-mono block font-bold truncate ${
                              isCurrentUser && isImpostor ? 'text-red-400' : 'text-crew-cyan'
                            }`}>
                              {teammate.collegeId}
                            </span>
                          </div>
                        </div>

                        {/* Middle: Department & Academic Year */}
                        <div className="bg-black/50 border border-gray-800/80 rounded-xl p-2 text-[10px] font-mono text-gray-400 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dept:</span>
                            <span className="text-gray-200 font-bold">{teammate.branch}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Year / Section:</span>
                            <span className="text-gray-200">
                              Year {teammate.year} - Sec {teammate.section}
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Presence Status */}
                        <div className="flex items-center justify-between text-[10px] font-mono border-t border-gray-800/70 pt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              teammate.isPresent !== false ? 'text-crew-lime' : 'text-gray-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                teammate.isPresent !== false ? 'bg-crew-lime animate-pulse' : 'bg-gray-600'
                              }`}
                            />
                            {teammate.isPresent !== false ? 'Venue Present' : 'Awaiting Arrival'}
                          </span>

                          <span className={`text-[9px] font-bold ${
                            isCurrentUser && isImpostor
                              ? 'text-red-400 font-black'
                              : isCurrentUser && isCrewmate
                              ? 'text-crew-cyan font-black'
                              : 'text-gray-500'
                          }`}>
                            {isCurrentUser
                              ? isImpostor
                                ? '🔪 YOU (IMPOSTOR)'
                                : '🛡️ YOU (CREWMATE)'
                              : isImpostor
                              ? '🎯 TARGET CREW'
                              : '🔍 SQUAD MATE'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Squad Directives Footer */}
            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-400">
                <span>📍</span>
                <span>
                  Please locate <span className="text-white font-bold">Table #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)}</span> in the arena and meet your squad.
                </span>
              </div>
              <button
                onClick={() => {
                  const info = `AmongU 2026 Squad: ${assignedTeam.name} (${assignedTeam.id}) | Table #${assignedTeam.tableNumber || assignedTeam.id.slice(-2)} | Members: ${assignedTeam.members?.map((m: any) => m.name).join(', ')}`;
                  navigator.clipboard.writeText(info);
                  alert('Squad details copied to clipboard!');
                }}
                className={`px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border text-xs font-mono font-bold transition-all shrink-0 ${
                  isImpostor ? 'border-red-800 hover:border-red-500 text-red-200' : 'border-gray-700 hover:border-crew-cyan'
                }`}
              >
                📋 COPY TEAM INFO
              </button>
            </div>
          </div>
        ) : (
          <div className="au-card bg-gray-900/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-crew-cyan/20 border-2 border-crew-cyan rounded-full flex items-center justify-center mx-auto text-3xl">
              🚀
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="font-display text-2xl text-white">SQUAD ALLOCATION IN PROGRESS</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed">
                The Organizing Command Deck is balancing multi-disciplinary squads. Your assigned teammates, venue table number, and secret role will appear here as soon as Round 1 begins.
              </p>
            </div>
            <span className="inline-block px-3 py-1 bg-black/60 border border-gray-700 rounded-full text-xs font-mono text-crew-lime font-bold">
              ✓ Registration Confirmed • Stand by for team release
            </span>
          </div>
        )}

        {/* SQUAD TEAM CHAT SECTION (POPS UP WHEN RANDOM FOUR-MEMBER SQUAD IS FORMED) */}
        {assignedTeam && (
          <TeamChatInterface
            assignedTeam={assignedTeam}
            currentTicket={ticket}
            isImpostor={isImpostor}
            isCrewmate={isCrewmate}
          />
        )}

        {/* Welcome Banner + Live Avatar Preview */}
        <div className={`au-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500 ${theme.welcomeCard}`}>
          <div className="flex items-center gap-6">
            {/* Dynamic Avatar with Hat & Muffler */}
            <div className="shrink-0 float-slow relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <CrewmateAvatarView
                color={isImpostor ? '#ef4444' : currentAvatarColor}
                hat={currentAvatarHat}
                muffler={currentAvatarMuffler}
                width={95}
                height={125}
              />
              <span className={`absolute -bottom-2 -right-2 text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black shadow ${
                isImpostor ? 'bg-red-400' : 'bg-crew-cyan'
              }`}>
                EDIT ✏️
              </span>
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
              </div>
              <p className="text-gray-300 font-bold text-sm sm:text-base mt-2">
                Your drop-ship seat is confirmed for <span className={isImpostor ? 'text-red-400 font-bold' : 'text-crew-cyan font-bold'}>AmongU</span> at KIET Deemed to be University.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className={`au-btn font-display text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 cursor-pointer ${
                    isImpostor
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-crew-cyan hover:bg-cyan-300 text-black'
                  }`}
                >
                  <span>CUSTOMIZE AVATAR</span>
                  <span>🎨</span>
                </button>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={isWithdrawalPending}
                  className={`au-btn text-xs py-1.5 px-3 rounded-full font-display flex items-center gap-1 cursor-pointer ${
                    isWithdrawalPending
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
                      : 'bg-red-950/80 hover:bg-red-900 text-red-200 border-crew-red'
                  }`}
                >
                  <span>WITHDRAW</span>
                  <span>🚫</span>
                </button>
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
                ? `PAID (₹${ticket?.amount}) • INFILTRATOR ACTIVE 🔪`
                : `PAID (₹${ticket?.amount}) • CREW VERIFIED 🛡️`}
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
                ROUND 1 IN PROGRESS
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
                  ACTIVE ROUND
                </span>
                <span className="text-gray-400 font-mono text-xs">Duration: 1h 15m</span>
              </div>
              <h3 className="font-display text-2xl text-white">ROUND 1: THE INFILTRATION &amp; ARCHITECTURE</h3>
              <p className="text-gray-300 text-sm font-bold max-w-2xl">
                Teams unlock their problem statement within the track, spin up shared repositories, and establish system architecture. Stay alert: one crewmate is secretly designated the Impostor.
              </p>
            </div>

            <div className={`au-border p-4 rounded-xl text-center shrink-0 ${
              isImpostor ? 'bg-red-950/50 border-red-800' : 'bg-gray-900'
            }`}>
              <span className="text-[11px] text-gray-400 font-bold uppercase block">Chrono Remaining</span>
              <span className={`font-mono font-bold text-2xl ${theme.roundTimerText}`}>
                {Math.floor(liveTimerSeconds / 3600) > 0
                  ? `${Math.floor(liveTimerSeconds / 3600).toString().padStart(2, '0')}:${Math.floor((liveTimerSeconds % 3600) / 60).toString().padStart(2, '0')}:${(liveTimerSeconds % 60).toString().padStart(2, '0')}`
                  : `${Math.floor((liveTimerSeconds % 3600) / 60).toString().padStart(2, '0')}:${(liveTimerSeconds % 60).toString().padStart(2, '0')}`}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Admin Central Time Sync</span>
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

          {/* SQUAD SUBMISSIONS PORTAL (PPT & CODE REPO) */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="font-display text-lg text-white flex items-center gap-2">
              <span>📤</span> SQUAD SUBMISSION TERMINAL
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Round 1 PPT Submission Box */}
              <div className="bg-black/70 au-border p-4 rounded-xl space-y-3 border-crew-yellow/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-crew-yellow">ROUND 1: PPT SUBMISSION</span>
                  {round1Submitted && (
                    <span className="text-[10px] font-mono text-crew-lime font-bold">✓ SUBMITTED</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Project Architecture Title..."
                  value={round1ProjectTitle}
                  onChange={(e) => setRound1ProjectTitle(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-crew-yellow"
                />
                <input
                  type="url"
                  placeholder="Paste Google Slides / PPT link..."
                  value={round1PptUrl}
                  onChange={(e) => setRound1PptUrl(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-crew-yellow font-mono"
                />
                <button
                  onClick={() => {
                    if (round1PptUrl.length === 0) return;
                    setRound1Submitted(true);
                    try {
                      localStorage.setItem('amongu_user_round1_ppt', round1PptUrl);
                      localStorage.setItem('amongu_user_round1_title', round1ProjectTitle);
                    } catch {
                      // ignore
                    }
                  }}
                  className="au-btn w-full bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2 rounded-lg"
                >
                  {round1Submitted ? 'UPDATE PPT SUBMISSION' : 'SUBMIT ROUND 1 DECK'}
                </button>
              </div>

              {/* Round 2 GitHub Repo Submission Box */}
              <div className="bg-black/70 au-border p-4 rounded-xl space-y-3 border-crew-lime/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-crew-lime">ROUND 2: CODE REPO SUBMISSION</span>
                  {round2Submitted && (
                    <span className="text-[10px] font-mono text-crew-lime font-bold">✓ REPO LINKED</span>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://github.com/team/amongu-repo..."
                  value={round2RepoUrl}
                  onChange={(e) => setRound2RepoUrl(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-crew-lime font-mono"
                />
                <button
                  onClick={() => {
                    if (round2RepoUrl.length === 0) return;
                    setRound2Submitted(true);
                    try {
                      localStorage.setItem('amongu_user_round2_repo', round2RepoUrl);
                    } catch {
                      // ignore
                    }
                  }}
                  className="au-btn w-full bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2 rounded-lg"
                >
                  {round2Submitted ? 'UPDATE GITHUB REPOSITORY' : 'LINK GITHUB REPO'}
                </button>
              </div>
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
            {/* Team Allocation Card */}
            <div className="au-card bg-gray-900 rounded-3xl p-6 border-crew-yellow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👥</span>
                <h3 className="font-display text-xl text-crew-yellow">CREW ASSIGNMENT</h3>
              </div>
              <p className="text-gray-300 text-sm font-bold mb-4">
                Teams are formed randomly with <span className="text-white">4 participants per crew</span>.
              </p>
              <div className="bg-black/60 au-border rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase">Assignment Schedule</p>
                <p className="font-display text-crew-cyan text-sm mt-1">REVEALED ON EVENT DAY (ROUND 1)</p>
              </div>
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
                  <span className="text-white">November 2, 2026</span>
                </li>
                <li className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">3h 45m Competition</span>
                </li>
                <li className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Prize Pool:</span>
                  <span className="text-crew-lime font-display">₹10,000</span>
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

      {/* 🎨 MODAL 1: AMONG US AVATAR CUSTOMIZER */}
      {isAvatarModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAvatarModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="au-card bg-gray-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 relative my-8 animate-[float_0.3s_ease-out] border-4 border-black">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute -top-4 -right-4 w-11 h-11 bg-crew-red au-border rounded-full text-white font-display text-lg hover:bg-red-500 hover:scale-110 transition-transform flex items-center justify-center shadow-lg"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-3xl">🎨</span>
              <h3 className="font-display text-3xl text-crew-cyan mt-1">CREWMATE WARDROBE</h3>
              <p className="text-gray-400 text-xs font-bold">Customize your spacesuit color, headwear, and neck scarf.</p>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="bg-black/70 au-border rounded-2xl p-4 flex flex-col items-center justify-center mb-6 shadow-inner">
              <div className="float-slow">
                <CrewmateAvatarView
                  color={selectedColor}
                  hat={selectedHat}
                  muffler={selectedMuffler}
                  width={130}
                  height={160}
                />
              </div>
              <span className="text-xs font-mono font-bold text-gray-400 mt-2">
                Live Preview &bull; {AVATAR_COLORS.find((c) => c.hex === selectedColor)?.name} Suit
              </span>
            </div>

            {/* 1. Suit Colors Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-display text-gray-300 block">1. SPACESUIT COLOR</label>
              <div className="grid grid-cols-6 sm:grid-cols-6 gap-2.5">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer ${
                      selectedColor === c.hex
                        ? 'border-white scale-110 shadow-[0_0_10px_white]'
                        : 'border-black opacity-80 hover:opacity-100'
                    }`}
                    title={c.name}
                  >
                    {selectedColor === c.hex && <span className="text-xs font-black text-black">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Hat Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-display text-gray-300 block">2. HEADWEAR &amp; HATS</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_HATS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHat(h.id)}
                    className={`p-2 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedHat === h.id
                        ? 'bg-crew-cyan/20 border-crew-cyan text-white shadow-[0_0_10px_rgba(56,254,220,0.5)]'
                        : 'bg-black/60 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-lg">{h.emoji}</span>
                    <span className="text-[11px] truncate w-full text-center">{h.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Muffler / Neckwear Selector */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-display text-gray-300 block">3. MUFFLERS &amp; ACCESSORIES</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_MUFFLERS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMuffler(m.id)}
                    className={`p-2 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedMuffler === m.id
                        ? 'bg-crew-lime/20 border-crew-lime text-white shadow-[0_0_10px_rgba(80,239,57,0.5)]'
                        : 'bg-black/60 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-[11px] truncate w-full text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAvatar}
              className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-lg py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>EQUIP &amp; SAVE AVATAR</span>
              <span>💾</span>
            </button>
          </div>
        </div>
      )}

      {/* 🚫 MODAL 2: WITHDRAW REGISTRATION CONFIRMATION */}
      {isWithdrawModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWithdrawModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="au-card bg-gray-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative my-8 border-4 border-crew-red">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute -top-4 -right-4 w-11 h-11 bg-gray-800 au-border rounded-full text-white font-display text-lg hover:bg-gray-700 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-red-950/80 border-2 border-crew-red mx-auto rounded-full flex items-center justify-center mb-2 shadow-[0_0_15px_#c51111]">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="font-display text-2xl text-crew-red">WITHDRAW REGISTRATION</h3>
              <p className="text-gray-300 text-xs font-bold mt-1">
                Request seat withdrawal for cadet <span className="text-white">{ticket?.name}</span> ({ticket?.collegeId}).
              </p>
            </div>

            <div className="bg-black/70 au-border rounded-xl p-4 text-xs text-gray-300 space-y-2 mb-4">
              <p className="font-bold text-amber-300">Important Advisory:</p>
              <p>
                1. Clicking confirm will log a formal withdrawal dispatch from your KIET college email (<span className="text-crew-cyan font-mono">{ticket?.email}</span>) to the admin organizer mailbox.
              </p>
              <p>
                2. Once the administrators review and approve this withdrawal from the admin console, your registration entry and allocated ticket will be decommissioned.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-bold text-gray-400 block">Reason for Withdrawal:</label>
              <select
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="w-full bg-black au-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-crew-cyan"
              >
                <option>Schedule Conflict</option>
                <option>Health or Medical Emergency</option>
                <option>Academic Exam or Assignment Due</option>
                <option>Team Member Unavailable</option>
                <option>Other</option>
              </select>

              {withdrawReason === 'Other' && (
                <textarea
                  rows={2}
                  required
                  value={customWithdrawReason}
                  onChange={(e) => setCustomWithdrawReason(e.target.value)}
                  placeholder="Please specify your reason for withdrawal..."
                  className="w-full bg-black au-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-crew-cyan"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-1/2 au-btn bg-gray-800 hover:bg-gray-700 text-white font-display text-sm py-3 rounded-xl cursor-pointer"
              >
                KEEP REGISTRATION
              </button>
              <button
                type="button"
                disabled={isSubmittingWithdraw}
                onClick={handleConfirmWithdrawal}
                className="w-1/2 au-btn bg-crew-red hover:bg-red-500 text-white font-display text-sm py-3 rounded-xl transition-all cursor-pointer"
              >
                {isSubmittingWithdraw ? 'TRANSMITTING...' : 'CONFIRM WITHDRAW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

