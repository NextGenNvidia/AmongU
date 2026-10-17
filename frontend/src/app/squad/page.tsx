'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';
import { teamService } from '../../services/team.service';
import TeamChatInterface from '../../components/dashboard/TeamChatInterface';
import { UserTicket } from '../../types/user';

export default function SquadPage() {
  const router = useRouter();
  const { firebaseUser, profile, isRegistered, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<UserTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedRole, setAssignedRole] = useState<'crewmate' | 'impostor' | 'unassigned'>('unassigned');
  const [assignedTeam, setAssignedTeam] = useState<{
    id: string;
    name: string;
    track?: string;
    tableNumber?: number;
    members: any[];
  } | null>(null);

  // Submissions State
  const [round1PptUrl, setRound1PptUrl] = useState('');
  const [round1ProjectTitle, setRound1ProjectTitle] = useState('');
  const [round1Submitted, setRound1Submitted] = useState(false);
  const [round2RepoUrl, setRound2RepoUrl] = useState('');
  const [round2Submitted, setRound2Submitted] = useState(false);

  // Target Event Countdown
  const [eventCountdown, setEventCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    let target = new Date('2026-10-28T09:00:00+05:30').getTime();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiUrl}/api/event/config`)
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

  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser) {
      router.replace('/');
      return;
    }

    if (!profile?.hasRegistered && !isRegistered) {
      router.replace('/portal/cadet-clearance-7b92');
      return;
    }

    const loadData = async () => {
      try {
        const res = await registrationService.getMyStatus();
        if (res.success && res.registration) {
          const reg = res.registration;
          const userTicket: UserTicket = {
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
            assignedRole: (reg.assignedRole as any) || 'unassigned',
            assignedTeamId: reg.assignedTeamId,
          };
          setTicket(userTicket);
        } else {
          router.replace('/portal/cadet-clearance-7b92');
          return;
        }
      } catch (err) {
        console.warn('Error loading registration status:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Load saved submissions from localStorage
    try {
      const savedPpt = localStorage.getItem('amongu_user_round1_ppt');
      const savedTitle = localStorage.getItem('amongu_user_round1_title');
      const savedRepo = localStorage.getItem('amongu_user_round2_repo');
      if (savedPpt) {
        setRound1PptUrl(savedPpt);
        setRound1Submitted(true);
      }
      if (savedTitle) setRound1ProjectTitle(savedTitle);
      if (savedRepo) {
        setRound2RepoUrl(savedRepo);
        setRound2Submitted(true);
      }
    } catch {}

    // Sync team data from localStorage or backend
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
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Squad sync error:', e);
      }
    };

    syncTeamData();

    // Backend squad sync
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
        // Not assigned yet
      }
    };
    syncBackendSquad();

    const interval = setInterval(syncTeamData, 2500);
    window.addEventListener('storage', syncTeamData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncTeamData);
    };
  }, [firebaseUser, profile, isRegistered, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <p className="font-display text-2xl text-crew-cyan animate-pulse">CONNECTING TO SQUAD COMMS DECK...</p>
      </div>
    );
  }

  const isImpostor = assignedRole === 'impostor';
  const isCrewmate = assignedRole === 'crewmate';

  return (
    <div className={`min-h-screen font-body text-gray-100 antialiased relative overflow-hidden ${
      isImpostor
        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/70 via-[#0b0101] to-black'
        : 'bg-space'
    }`}>
      {/* Background Starfield */}
      <div className="stars pointer-events-none"></div>
      <div className="twinkling pointer-events-none"></div>

      {/* Top Navbar */}
      <header className={`border-b-4 backdrop-blur sticky top-0 z-40 ${
        isImpostor
          ? 'border-red-700/80 bg-red-950/90'
          : 'border-black bg-gray-900/90'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
              <svg width="28" height="34" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill={isImpostor ? '#ef4444' : '#06b6d4'}
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

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ml-2 bg-black au-border text-crew-cyan">
              <span className="w-2 h-2 rounded-full bg-crew-cyan animate-ping" />
              SQUAD COMMS &amp; OPS DECK
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/dashboard"
              className="au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 font-bold shadow"
            >
              <span>DASHBOARD 🚀</span>
            </Link>
            <Link
              href="/profile"
              className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 font-bold shadow"
            >
              <span>PROFILE 👤</span>
            </Link>
            <Link
              href="/"
              className="au-btn bg-crew-white hover:bg-gray-200 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full"
            >
              HOME
            </Link>
          </div>
        </div>
      </header>

      {/* Main Squad Deck Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 relative z-10">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">👥</span>
              <h1 className="font-display text-3xl sm:text-4xl text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                SQUAD COMMAND CENTER
              </h1>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-bold mt-1">
              4-Cadet Multi-Disciplinary Crews • Comms Channel • Hackathon Submissions
            </p>
          </div>

          <div className="bg-black/80 au-border px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-crew-lime animate-pulse" />
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Squad Status</span>
              <span className="font-mono font-bold text-xs text-crew-cyan">
                {assignedTeam ? `${assignedTeam.name} (${assignedTeam.id})` : 'AWAITING ALLOCATION'}
              </span>
            </div>
          </div>
        </div>

        {/* CONDITION 1: SQUAD IS ALLOCATED */}
        {assignedTeam ? (
          <div className="space-y-7">
            {/* Squad Matrix Card */}
            <div className={`au-card rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden ${
              isImpostor
                ? 'bg-red-950/40 border-2 border-red-600/80 shadow-[0_0_40px_rgba(239,68,68,0.3)]'
                : 'bg-gray-950/95 border-2 border-crew-cyan/60 shadow-[0_0_35px_rgba(0,255,255,0.15)]'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow ${
                    isImpostor ? 'bg-red-950/80 border border-red-500' : 'bg-cyan-950/70 border border-crew-cyan'
                  }`}>
                    {isImpostor ? '🔪' : '🚀'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-black tracking-wider ${
                        isImpostor ? 'bg-red-600 text-white' : 'bg-crew-cyan text-black'
                      }`}>
                        {assignedTeam.id}
                      </span>
                      <span className="text-[11px] font-mono text-crew-lime font-bold bg-green-950/50 border border-crew-lime/30 px-2 py-0.5 rounded">
                        OFFICIAL CREW
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
                    <span className="text-crew-yellow font-bold">
                      Table #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
                    <span className="font-bold text-crew-cyan">
                      {assignedTeam.members?.length || 4} MEMBERS
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Members Grid */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>👥</span> SQUAD OPERATIVES (TEAM MATES)
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
                                ? 'bg-red-950/70 border-red-500 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                : 'bg-cyan-950/70 border-crew-cyan ring-2 ring-crew-cyan shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                              : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
                          }`}
                        >
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
                              <span className="text-[10px] font-mono block font-bold text-crew-cyan truncate">
                                {teammate.collegeId}
                              </span>
                            </div>
                          </div>

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

                          <div className="flex items-center justify-between text-[10px] font-mono border-t border-gray-800/70 pt-1.5">
                            <span className="inline-flex items-center gap-1 font-bold text-crew-lime">
                              <span className="w-1.5 h-1.5 rounded-full bg-crew-lime animate-pulse" />
                              {teammate.isPresent !== false ? 'Venue Present' : 'Awaiting Arrival'}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400">
                              {isCurrentUser
                                ? isImpostor
                                  ? '🔪 YOU (IMPOSTOR)'
                                  : '🛡️ YOU (CREWMATE)'
                                : '🔍 SQUAD MATE'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Copy Team Details Button */}
              <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📍</span>
                  <span>
                    Report to <span className="text-white font-bold">Table #{assignedTeam.tableNumber || assignedTeam.id.slice(-2)}</span> in the main arena to set up your workstations.
                  </span>
                </div>
                <button
                  onClick={() => {
                    const info = `AmongU 2026 Squad: ${assignedTeam.name} (${assignedTeam.id}) | Table #${assignedTeam.tableNumber || assignedTeam.id.slice(-2)} | Members: ${assignedTeam.members?.map((m: any) => m.name).join(', ')}`;
                    navigator.clipboard.writeText(info);
                    alert('Squad information copied to clipboard!');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 hover:border-crew-cyan text-xs font-mono font-bold transition-all shrink-0"
                >
                  📋 COPY TEAM INFO
                </button>
              </div>
            </div>

            {/* Team Chat Section */}
            <div className="space-y-2">
              <h3 className="font-display text-xl text-white flex items-center gap-2">
                <span>💬</span> ENCRYPTED SQUAD COMMS CHANNEL
              </h3>
              <TeamChatInterface
                assignedTeam={assignedTeam}
                currentTicket={ticket}
                isImpostor={isImpostor}
                isCrewmate={isCrewmate}
              />
            </div>

            {/* SQUAD SUBMISSION TERMINAL */}
            <div className="au-card bg-gray-900/90 rounded-3xl p-6 sm:p-8 space-y-5 border-2 border-crew-yellow/50 shadow-xl">
              <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📤</span>
                  <div>
                    <h3 className="font-display text-2xl text-white">SQUAD SUBMISSION TERMINAL</h3>
                    <p className="text-gray-400 text-xs font-bold">
                      Central repository for Round 1 PPT decks and Round 2 GitHub source code
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-black/70 px-3 py-1 rounded-full border border-crew-yellow/60 text-crew-yellow font-bold">
                  OFFICIAL EVALUATION
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Round 1 PPT Submission Box */}
                <div className="bg-black/70 au-border p-5 rounded-2xl space-y-3 border-crew-yellow/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-crew-yellow flex items-center gap-1.5">
                      <span>📊</span> ROUND 1: PPT DECK SUBMISSION
                    </span>
                    {round1Submitted && (
                      <span className="text-[10px] font-mono text-crew-lime font-bold bg-green-950/60 px-2 py-0.5 rounded border border-crew-lime/40">
                        ✓ SUBMITTED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    Submit your team&apos;s project architecture and solution slides for Round 1 jury review.
                  </p>
                  <input
                    type="text"
                    placeholder="Project Title (e.g., Autonomous Impostor Radar)..."
                    value={round1ProjectTitle}
                    onChange={(e) => setRound1ProjectTitle(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow"
                  />
                  <input
                    type="url"
                    placeholder="Paste Google Slides / PPT URL link..."
                    value={round1PptUrl}
                    onChange={(e) => setRound1PptUrl(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow font-mono"
                  />
                  <button
                    onClick={() => {
                      if (!round1PptUrl.trim()) return;
                      setRound1Submitted(true);
                      try {
                        localStorage.setItem('amongu_user_round1_ppt', round1PptUrl);
                        localStorage.setItem('amongu_user_round1_title', round1ProjectTitle);
                        alert('Round 1 PPT submission saved successfully!');
                      } catch {}
                    }}
                    className="au-btn w-full bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2.5 rounded-xl font-bold shadow"
                  >
                    {round1Submitted ? 'UPDATE PPT SUBMISSION' : 'SUBMIT ROUND 1 DECK'}
                  </button>
                </div>

                {/* Round 2 GitHub Repo Submission Box */}
                <div className="bg-black/70 au-border p-5 rounded-2xl space-y-3 border-crew-lime/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-crew-lime flex items-center gap-1.5">
                      <span>💻</span> ROUND 2: GITHUB CODE REPOSITORY
                    </span>
                    {round2Submitted && (
                      <span className="text-[10px] font-mono text-crew-lime font-bold bg-green-950/60 px-2 py-0.5 rounded border border-crew-lime/40">
                        ✓ REPO LINKED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    Link your public GitHub repository containing all feature commits and sabotage diffs.
                  </p>
                  <input
                    type="url"
                    placeholder="https://github.com/team-name/amongu-project..."
                    value={round2RepoUrl}
                    onChange={(e) => setRound2RepoUrl(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-crew-lime font-mono"
                  />
                  <button
                    onClick={() => {
                      if (!round2RepoUrl.trim()) return;
                      setRound2Submitted(true);
                      try {
                        localStorage.setItem('amongu_user_round2_repo', round2RepoUrl);
                        alert('GitHub repository successfully linked!');
                      } catch {}
                    }}
                    className="au-btn w-full bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2.5 rounded-xl font-bold shadow"
                  >
                    {round2Submitted ? 'UPDATE GITHUB REPOSITORY' : 'LINK GITHUB REPO'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CONDITION 2: SQUAD ALLOCATION IN PROGRESS */
          <div className="space-y-8">
            <div className="au-card bg-gradient-to-b from-gray-900/95 via-black to-gray-900/95 border-2 border-crew-cyan/60 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
              {/* Radar Pulse Effect */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-crew-cyan/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-crew-cyan/50 animate-pulse" />
                <div className="w-20 h-20 bg-crew-cyan/20 border-2 border-crew-cyan rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                  🚀
                </div>
              </div>

              <div className="max-w-2xl mx-auto space-y-3">
                <span className="inline-block px-3 py-1 bg-cyan-950/80 border border-crew-cyan/60 rounded-full text-xs font-mono text-crew-cyan font-bold tracking-wider">
                  MISSION CONTROL ALGORITHM ACTIVE
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
                  SQUAD ALLOCATION IN PROGRESS
                </h2>
                <p className="text-gray-300 text-sm sm:text-base font-mono leading-relaxed">
                  The Organizing Command Deck is balancing multi-disciplinary squads across 1st to 4th year cadets. Your 4 assigned teammates, arena table assignment, and encrypted Round 3 role will unlock here as soon as Round 1 begins.
                </p>
              </div>

              {/* Liftoff Countdown */}
              <div className="bg-black/80 au-border rounded-2xl p-5 max-w-md mx-auto border-crew-yellow/50">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Squad Allocation Reveal Chrono
                </span>
                <span className="font-mono font-black text-2xl sm:text-3xl text-crew-yellow">
                  {!eventCountdown.isPast
                    ? `${eventCountdown.days}d ${eventCountdown.hours.toString().padStart(2, '0')}h ${eventCountdown.minutes.toString().padStart(2, '0')}m ${eventCountdown.seconds.toString().padStart(2, '0')}s`
                    : 'EVENT LIFTOFF IN PROGRESS'}
                </span>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Target: October 28, 2026 • 09:00 AM IST
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-gray-700 rounded-full text-xs font-mono text-crew-lime font-bold">
                  ✓ Seat Confirmed (₹55 Paid)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-gray-700 rounded-full text-xs font-mono text-crew-cyan font-bold">
                  ✓ Automatic Team Balancing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-gray-700 rounded-full text-xs font-mono text-crew-yellow font-bold">
                  ✓ Instant Comms Access on Liftoff
                </span>
              </div>
            </div>

            {/* Explanatory Protocols */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="au-card bg-gray-900 rounded-2xl p-5 border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-xl">
                  <span>⚖️</span>
                  <h4 className="font-display text-white text-base">Balanced Teams</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed font-bold">
                  Each squad contains 4 participants matched across skill sets (Frontend, Backend, Design, Ideation) to ensure fair competition.
                </p>
              </div>

              <div className="au-card bg-gray-900 rounded-2xl p-5 border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-xl">
                  <span>📍</span>
                  <h4 className="font-display text-white text-base">Table Assignment</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed font-bold">
                  Every squad will be allocated a designated workstation table inside the KIET campus venue with high-speed network access.
                </p>
              </div>

              <div className="au-card bg-gray-900 rounded-2xl p-5 border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-xl">
                  <span>🕵️</span>
                  <h4 className="font-display text-white text-base">Secret Role Reveal</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed font-bold">
                  One cadet in each squad will covertly be selected as the Impostor for Round 3 sabotage directives.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
