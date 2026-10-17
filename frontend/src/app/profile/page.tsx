'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';
import { UserTicket } from '../../types/user';
import {
  CrewmateAvatarView,
  AVATAR_COLORS,
  AVATAR_HATS,
  AVATAR_MUFFLERS,
} from '../../components/common/CrewmateAvatarView';

export default function CadetProfilePage() {
  const router = useRouter();
  const { firebaseUser, profile, isRegistered, loading: authLoading, logout } = useAuth();
  const [ticket, setTicket] = useState<UserTicket | null>(null);
  const [loading, setLoading] = useState(true);

  // Avatar Customizer State
  const [selectedColor, setSelectedColor] = useState('#c51111');
  const [selectedHat, setSelectedHat] = useState('none');
  const [selectedMuffler, setSelectedMuffler] = useState('none');
  const [avatarSaveFeedback, setAvatarSaveFeedback] = useState<string | null>(null);

  // Withdrawal State
  const [withdrawReason, setWithdrawReason] = useState('Schedule Conflict');
  const [customWithdrawReason, setCustomWithdrawReason] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawFeedback, setWithdrawFeedback] = useState<string | null>(null);

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

    const loadTicket = async () => {
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

          // Check if user has saved custom avatar preferences in localStorage
          const localStored = localStorage.getItem('amongu_user_ticket');
          if (localStored) {
            try {
              const parsed = JSON.parse(localStored);
              if (parsed.avatarColor) realTicket.avatarColor = parsed.avatarColor;
              if (parsed.avatarHat) realTicket.avatarHat = parsed.avatarHat;
              if (parsed.avatarMuffler) realTicket.avatarMuffler = parsed.avatarMuffler;
              if (parsed.withdrawalStatus) realTicket.withdrawalStatus = parsed.withdrawalStatus;
            } catch {
              // ignore
            }
          }

          setTicket(realTicket);
          setSelectedColor(realTicket.avatarColor || '#c51111');
          setSelectedHat(realTicket.avatarHat || 'none');
          setSelectedMuffler(realTicket.avatarMuffler || 'none');
        } else {
          router.replace('/portal/cadet-clearance-7b92');
        }
      } catch (err) {
        console.warn('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
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
      setAvatarSaveFeedback('🎉 Avatar customization saved successfully!');
      setTimeout(() => setAvatarSaveFeedback(null), 4000);
    } catch (e) {
      console.error('Failed to save avatar', e);
    }
  };

  const handleConfirmWithdrawal = () => {
    if (!ticket) return;
    setIsSubmittingWithdraw(true);

    const fullReason =
      withdrawReason === 'Other' && customWithdrawReason
        ? `Other: ${customWithdrawReason}`
        : withdrawReason;

    setTimeout(() => {
      const updatedTicket: UserTicket = {
        ...ticket,
        withdrawalStatus: 'pending',
        withdrawalReason: fullReason,
        withdrawalRequestedAt: new Date().toISOString(),
      };
      setTicket(updatedTicket);
      try {
        localStorage.setItem('amongu_user_ticket', JSON.stringify(updatedTicket));
      } catch (e) {
        console.error(e);
      }
      setIsSubmittingWithdraw(false);
      setWithdrawFeedback('Withdrawal request submitted to event administration.');
    }, 800);
  };

  const handleCancelWithdrawalRequest = () => {
    if (!ticket) return;
    const updatedTicket: UserTicket = {
      ...ticket,
      withdrawalStatus: 'none',
      withdrawalReason: undefined,
      withdrawalRequestedAt: undefined,
    };
    setTicket(updatedTicket);
    try {
      localStorage.setItem('amongu_user_ticket', JSON.stringify(updatedTicket));
    } catch (e) {
      console.error(e);
    }
    setWithdrawFeedback('Withdrawal request cancelled. Your cadet seat is confirmed!');
    setTimeout(() => setWithdrawFeedback(null), 4000);
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('amongu_user_ticket');
      }
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display text-xl text-white">ACCESSING CADET DOSSIER...</p>
        </div>
      </div>
    );
  }

  const isWithdrawalPending = ticket?.withdrawalStatus === 'pending';

  return (
    <div className="min-h-screen bg-space text-white font-sans antialiased relative selection:bg-crew-cyan selection:text-black">
      {/* Moving Stars and Twinkling Starfield */}
      <div className="stars"></div>
      <div className="twinkling"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b-4 border-black px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
              <svg width="28" height="34" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill="#c51111"
                  stroke="#000"
                  strokeWidth="6"
                />
                <path
                  d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                  fill="#9cdbfa"
                  stroke="#000"
                  strokeWidth="6"
                />
              </svg>
              <span className="text-crew-red font-black" style={{ textShadow: '2px 2px 0 #000' }}>
                AMONG
              </span>
              U
            </Link>
            <span className="hidden sm:inline-block text-xs font-mono font-bold bg-gray-900 border border-gray-700 px-2.5 py-1 rounded-full text-crew-cyan">
              CADET PROFILE &amp; CUSTOMIZATION
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs sm:text-sm py-2 px-4 rounded-full flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(80,239,57,0.6)]"
            >
              <span>← MISSION DASHBOARD</span>
            </Link>
            <Link
              href="/"
              className="hidden sm:inline-block text-xs text-gray-400 hover:text-white font-mono underline"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Profile Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧑‍🚀</span>
              <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
                CADET PROFILE DOSSIER
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
              Manage your personal spaceship avatar, verify institutional credentials, or modify registration status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-green-950/80 border border-crew-lime text-crew-lime px-3 py-1.5 rounded-full">
              ✓ Identity Verified • @kiet.edu
            </span>
          </div>
        </div>

        {/* 1. CADET CREDENTIALS & ACADEMIC DOSSIER */}
        <div className="au-card bg-gray-950/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-crew-cyan/20 border border-crew-cyan flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-white">ACADEMIC &amp; CLEARANCE DETAILS</h2>
                <p className="text-xs text-gray-400 font-mono">Linked to your authenticated institutional account</p>
              </div>
            </div>
            <span className="text-xs font-mono text-crew-lime font-bold bg-black/60 px-3 py-1 rounded-full border border-gray-700">
              ₹55 Paid
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Cadet Name</span>
              <span className="text-white font-bold text-sm sm:text-base">{ticket?.name}</span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Institutional Email</span>
              <span className="text-crew-cyan font-bold text-xs truncate block">{ticket?.email}</span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">College ID / Roll No</span>
              <span className="text-crew-lime font-bold text-sm">{ticket?.collegeId}</span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Department / Branch</span>
              <span className="text-white font-bold text-sm">{ticket?.branch}</span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Academic Year &amp; Section</span>
              <span className="text-white font-bold text-sm">
                Year {ticket?.year} • Section {ticket?.section}
              </span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Selected Track</span>
              <span className="text-crew-yellow font-bold text-sm">{ticket?.track}</span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">WhatsApp Phone</span>
              <span className="text-white font-bold text-sm">{ticket?.phone}</span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Payment Verification</span>
              <span className="text-crew-lime font-bold text-xs truncate block">
                {ticket?.paymentId || 'VERIFIED'}
              </span>
            </div>

            <div className="bg-black/60 border border-gray-800/80 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 uppercase tracking-wider block text-[10px]">Registration Timestamp</span>
              <span className="text-gray-300 font-bold text-xs">{ticket?.registeredAt}</span>
            </div>
          </div>
        </div>

        {/* 2. AVATAR CUSTOMIZATION STUDIO */}
        <div className="au-card bg-gray-950/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-crew-lime/20 border border-crew-lime flex items-center justify-center text-xl">
                🎨
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-white">SPACESHIP AVATAR STUDIO</h2>
                <p className="text-xs text-gray-400 font-mono">
                  Personalize your spacesuit color, headwear, and neck accessories visible on the mission deck.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAvatar}
              className="self-start sm:self-auto au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs sm:text-sm py-2.5 px-6 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(80,239,57,0.5)] active:scale-95 transition-all cursor-pointer font-bold"
            >
              <span>SAVE AVATAR LOOK 💾</span>
            </button>
          </div>

          {avatarSaveFeedback && (
            <div className="p-3.5 bg-green-950/80 border-2 border-crew-lime text-green-200 text-xs sm:text-sm font-bold rounded-2xl text-center animate-bounce">
              {avatarSaveFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Live Interactive Preview Box */}
            <div className="lg:col-span-5 bg-black/70 au-border rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-inner">
              <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                LIVE PREVIEW
              </div>
              <div className="float-slow my-4">
                <CrewmateAvatarView
                  color={selectedColor}
                  hat={selectedHat}
                  muffler={selectedMuffler}
                  width={150}
                  height={190}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="font-display text-lg text-white">{ticket?.name}</p>
                <p className="text-xs font-mono text-crew-cyan">
                  {AVATAR_COLORS.find((c) => c.hex === selectedColor)?.name} Suit •{' '}
                  {AVATAR_HATS.find((h) => h.id === selectedHat)?.label} •{' '}
                  {AVATAR_MUFFLERS.find((m) => m.id === selectedMuffler)?.label}
                </p>
              </div>
            </div>

            {/* Customizer Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Color Palette */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                  1. Choose Spacesuit Color:
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      className={`h-11 rounded-xl border-2 transition-transform cursor-pointer relative flex items-center justify-center ${
                        selectedColor === c.hex
                          ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.7)] z-10'
                          : 'border-black hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.hex && (
                        <span className="text-white text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hats Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                  2. Choose Headwear / Hat:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {AVATAR_HATS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedHat(h.id)}
                      className={`p-2 rounded-xl border-2 font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedHat === h.id
                          ? 'bg-crew-cyan/20 border-crew-cyan text-white shadow-[0_0_12px_rgba(56,254,220,0.4)]'
                          : 'bg-black/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <span className="text-lg">{h.emoji}</span>
                      <span className="text-[10px] truncate max-w-full font-bold">{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mufflers Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                  3. Choose Muffler / Accessory:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {AVATAR_MUFFLERS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMuffler(m.id)}
                      className={`p-2 rounded-xl border-2 font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedMuffler === m.id
                          ? 'bg-crew-yellow/20 border-crew-yellow text-white shadow-[0_0_12px_rgba(245,245,87,0.4)]'
                          : 'bg-black/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-[10px] truncate max-w-full font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-base py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(80,239,57,0.4)] cursor-pointer font-bold"
                >
                  <span>CONFIRM &amp; SAVE AVATAR LOOK →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. REGISTRATION WITHDRAWAL SECTION */}
        <div className="au-card bg-gray-950/90 border-2 border-red-950/80 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center text-xl">
              🚫
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-crew-red">REGISTRATION WITHDRAWAL</h2>
              <p className="text-xs text-gray-400 font-mono">
                Unable to attend the hackathon? Request ticket cancellation and seat release.
              </p>
            </div>
          </div>

          {withdrawFeedback && (
            <div className="p-4 bg-gray-900 border-2 border-crew-lime text-crew-lime text-xs sm:text-sm font-bold rounded-2xl text-center">
              {withdrawFeedback}
            </div>
          )}

          {isWithdrawalPending ? (
            <div className="bg-amber-950/70 border-2 border-amber-500 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-display text-lg">
                  <span>⏳</span> WITHDRAWAL PENDING REVIEW
                </div>
                <p className="text-xs font-mono text-amber-200">
                  Reason: {ticket?.withdrawalReason || 'Schedule Conflict'}
                </p>
                <p className="text-[11px] font-mono text-gray-400">
                  Your seat will be released once processed. You can cancel this request anytime before approval.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelWithdrawalRequest}
                className="au-btn bg-black hover:bg-gray-900 text-crew-cyan font-display text-xs py-2.5 px-5 rounded-xl border-2 border-crew-cyan shrink-0 cursor-pointer font-bold"
              >
                CANCEL WITHDRAWAL REQUEST
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Select Primary Reason:
                  </label>
                  <select
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white text-xs font-mono focus:border-red-500 outline-none"
                  >
                    <option value="Schedule Conflict">Schedule Conflict</option>
                    <option value="Illness / Medical Emergency">Illness / Medical Emergency</option>
                    <option value="Academic Exams / Commitments">Academic Exams / Commitments</option>
                    <option value="Travel / Transportation Issue">Travel / Transportation Issue</option>
                    <option value="Other">Other (Specify Below)</option>
                  </select>
                </div>

                {withdrawReason === 'Other' && (
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Specify Reason:
                    </label>
                    <input
                      type="text"
                      value={customWithdrawReason}
                      onChange={(e) => setCustomWithdrawReason(e.target.value)}
                      placeholder="Please explain why..."
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white text-xs font-mono focus:border-red-500 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[11px] font-mono text-gray-400 text-center sm:text-left">
                  ⚠️ Note: Withdrawals are subject to event rules as outlined in our Refund Policy.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  disabled={isSubmittingWithdraw}
                  className="w-full sm:w-auto au-btn bg-red-950 hover:bg-red-900 text-red-200 border-2 border-red-600 font-display text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-transparent rounded-full animate-spin" />
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <span>SUBMIT WITHDRAWAL REQUEST</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. CADET ACCOUNT SECURITY & LOGOUT */}
        <div className="au-card bg-gray-950/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display text-xl text-white">CADET SESSION &amp; SECURITY</h3>
            <p className="text-xs text-gray-400 font-mono">
              Signed in as <strong className="text-crew-cyan">{ticket?.email}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto au-btn bg-red-950/80 hover:bg-crew-red text-red-200 hover:text-white border-2 border-crew-red font-display text-xs sm:text-sm py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(197,17,17,0.4)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>LOGOUT FROM CADET ACCOUNT</span>
          </button>
        </div>
      </main>
    </div>
  );
}
