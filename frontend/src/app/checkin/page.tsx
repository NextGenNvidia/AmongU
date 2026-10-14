'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';
import { RegistrationRecord } from '../../types/registration';

export default function CheckInPage() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();

  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkedInUser, setCheckedInUser] = useState<RegistrationRecord | null>(null);
  const [alreadyPresent, setAlreadyPresent] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Check if current user already has a local ticket marked present
  useEffect(() => {
    try {
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw) {
        const ticket = JSON.parse(ticketRaw);
        if (ticket.collegeId && ticket.isPresent) {
          setCheckedInUser(ticket);
          setAlreadyPresent(true);
          setStatusMessage(`Welcome back! You are already checked in at the venue.`);
        } else if (ticket.collegeId && !studentIdInput) {
          setStudentIdInput(ticket.collegeId);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePerformCheckIn = async (lookupData: { collegeId?: string; email?: string; uid?: string }) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await registrationService.venueCheckIn(lookupData);

      if (res.success && res.registration) {
        setCheckedInUser(res.registration);
        setAlreadyPresent(Boolean(res.alreadyCheckedIn));
        setStatusMessage(res.message);

        // Sync with user's local ticket storage for their dashboard
        try {
          const ticketRaw = localStorage.getItem('amongu_user_ticket');
          const ticket = ticketRaw ? JSON.parse(ticketRaw) : {};
          ticket.isPresent = true;
          ticket.name = res.registration.name;
          ticket.collegeId = res.registration.collegeId;
          ticket.branch = res.registration.branch;
          ticket.year = res.registration.year;
          ticket.section = res.registration.section;
          ticket.verifiedAt = res.registration.verifiedAt || new Date().toISOString();
          localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
        } catch {
          // ignore
        }
      } else {
        setErrorMsg(res.message || 'Check-in failed. Please verify your details.');
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.message || 'Check-in failed. Please visit the help desk.';
      setErrorMsg(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) {
      setErrorMsg('Please enter your College ID or KIET Email');
      return;
    }

    const inputVal = studentIdInput.trim();
    if (inputVal.includes('@')) {
      handlePerformCheckIn({ email: inputVal });
    } else {
      handlePerformCheckIn({ collegeId: inputVal });
    }
  };

  const handleAutoCheckInWithAuth = () => {
    if (firebaseUser?.uid) {
      handlePerformCheckIn({
        uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-crew-lime selection:text-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-950/20 via-black to-black pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-crew-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-crew-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crew-lime/10 border border-crew-lime/30 text-crew-lime text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-crew-lime animate-ping" />
            VENUE MISSION ACCESS • KIET UNIVERSITY
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
            AMONG<span className="text-crew-red">U</span> VENUE CHECK-IN
          </h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm mt-1">
            Confirm your presence at the event arena for squad allocation
          </p>
        </div>

        {/* Success Card */}
        {checkedInUser ? (
          <div className="bg-gray-950 border-2 border-crew-lime rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(50,205,50,0.25)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-crew-lime text-black font-mono font-extrabold text-[10px] uppercase px-4 py-1 rounded-bl-xl tracking-wider">
              {alreadyPresent ? 'ALREADY PRESENT' : 'VERIFIED PRESENT'}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-crew-lime/20 border-2 border-crew-lime flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(50,205,50,0.3)]">
                ✅
              </div>
              <div>
                <span className="text-xs font-mono text-crew-lime font-bold uppercase tracking-wider block">
                  ATTENDANCE CONFIRMED
                </span>
                <h2 className="font-display text-2xl text-white font-bold tracking-tight">
                  {checkedInUser.name}
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  ID: {checkedInUser.collegeId}
                </span>
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-gray-900/80 border border-gray-800 rounded-2xl p-4 mb-6 text-xs font-mono">
              <div>
                <span className="text-gray-500 uppercase block text-[10px]">Department</span>
                <span className="text-white font-bold text-sm">{checkedInUser.branch}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase block text-[10px]">Academic Year</span>
                <span className="text-white font-bold text-sm">Year {checkedInUser.year}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase block text-[10px]">Section</span>
                <span className="text-white font-bold text-sm">Section {checkedInUser.section}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase block text-[10px]">Fee Status</span>
                <span className="text-crew-lime font-bold text-sm uppercase">PAID (₹55)</span>
              </div>
            </div>

            {/* Mission Protocol Alert */}
            <div className="bg-green-950/40 border border-crew-lime/30 rounded-2xl p-4 mb-6 text-xs font-mono text-gray-300">
              <p className="text-crew-lime font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>🚀 SQUAD FORMATION STATUS:</span>
              </p>
              <p className="text-gray-400 leading-relaxed">
                You are registered as present in the central Monitoring Console! When Round 1 starts, you will be assigned to a 4-member random crew.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 rounded-xl bg-crew-lime hover:bg-lime-400 text-black font-display font-bold text-center text-sm shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
              >
                GO TO MY DASHBOARD →
              </Link>
              <Link
                href="/"
                className="py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-mono text-xs font-bold text-center transition-all"
              >
                EVENT HOME
              </Link>
            </div>
          </div>
        ) : (
          /* Check-In Form Card */
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            {/* Logged in shortcut */}
            {firebaseUser && (
              <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-crew-cyan/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-crew-cyan font-bold uppercase tracking-wider">
                    LOGGED-IN GOOGLE ACCOUNT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-crew-cyan animate-pulse" />
                </div>
                <p className="text-white text-sm font-bold truncate">
                  {profile?.name || firebaseUser.displayName || 'Participant'}
                </p>
                <p className="text-xs font-mono text-gray-400 truncate mb-3">
                  {firebaseUser.email}
                </p>
                <button
                  onClick={handleAutoCheckInWithAuth}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-crew-cyan/20 hover:bg-crew-cyan text-crew-cyan hover:text-black border border-crew-cyan text-xs font-mono font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'VERIFYING...' : '⚡ INSTANT CHECK-IN WITH THIS ACCOUNT'}
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Enter College ID / University Roll No. or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. 220029012001001 or name@kiet.edu"
                  value={studentIdInput}
                  onChange={(e) => {
                    setStudentIdInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full bg-gray-900 border-2 border-gray-800 focus:border-crew-lime rounded-2xl px-4 py-3.5 text-white font-mono text-sm placeholder-gray-600 outline-none transition-colors"
                  disabled={loading}
                  autoFocus
                />
                <span className="text-[11px] font-mono text-gray-500 mt-1.5 block">
                  Found on your KIET Student ID card or registration confirmation email.
                </span>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-xl text-red-400 text-xs font-mono leading-relaxed">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !studentIdInput.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-crew-lime hover:bg-lime-400 text-black font-display font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(50,205,50,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>VERIFYING ATTENDANCE...</span>
                  </>
                ) : (
                  <span>CONFIRM VENUE ATTENDANCE →</span>
                )}
              </button>
            </form>

            {/* Assistance Footer */}
            <div className="mt-6 pt-5 border-t border-gray-900 text-center text-xs font-mono text-gray-500 flex flex-col gap-2">
              <p>Having trouble checking in? Visit the Chief Organizer Desk at the entrance.</p>
              <div className="flex justify-center gap-4 text-gray-400">
                <Link href="/" className="hover:text-crew-lime underline">
                  Back to Home
                </Link>
                <span>•</span>
                <Link href="/dashboard" className="hover:text-crew-cyan underline">
                  Candidate Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
