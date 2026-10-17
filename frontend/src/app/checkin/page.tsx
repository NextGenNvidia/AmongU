'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';
import { RegistrationRecord } from '../../types/registration';

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { firebaseUser, loginWithGoogle, loading: authLoading } = useAuth();

  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpiredToken, setIsExpiredToken] = useState<boolean>(false);
  const [checkedInUser, setCheckedInUser] = useState<RegistrationRecord | null>(null);
  const [alreadyPresent, setAlreadyPresent] = useState<boolean>(false);

  // Check if current user already has a local ticket marked present
  useEffect(() => {
    try {
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw) {
        const ticket = JSON.parse(ticketRaw);
        if (ticket.collegeId && ticket.isPresent) {
          setCheckedInUser(ticket);
          setAlreadyPresent(true);
        } else if (ticket.collegeId && !studentIdInput) {
          setStudentIdInput(ticket.collegeId);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePerformCheckIn = async (lookupData: { collegeId?: string; email?: string; uid?: string; token?: string }) => {
    setLoading(true);
    setErrorMsg(null);
    setIsExpiredToken(false);

    try {
      const res = await registrationService.venueCheckIn({
        ...lookupData,
        token: token || lookupData.token || undefined,
      });

      if (res.success && res.registration) {
        setCheckedInUser(res.registration);
        setAlreadyPresent(Boolean(res.alreadyCheckedIn));

        // Sync with local user ticket
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
        if (res.isExpiredToken) {
          setIsExpiredToken(true);
        }
        setErrorMsg(res.message || 'Check-in failed. Please verify your details.');
      }
    } catch (err: any) {
      const respData = err?.response?.data;
      if (respData?.isExpiredToken) {
        setIsExpiredToken(true);
      }
      setErrorMsg(respData?.message || err?.message || 'Check-in failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-check in if user is already logged in with Google and token is present
  useEffect(() => {
    if (firebaseUser && !checkedInUser && !loading && !alreadyPresent) {
      handlePerformCheckIn({
        email: firebaseUser.email || undefined,
        uid: firebaseUser.uid,
        token,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, token]);

  const handleGoogleSignInAndCheckIn = async () => {
    try {
      setSigningIn(true);
      setErrorMsg(null);
      const user = await loginWithGoogle();
      if (user && user.email) {
        await handlePerformCheckIn({
          email: user.email,
          uid: user.firebaseUid,
          token,
        });
      }
    } catch (err: any) {
      console.error('Google Sign-in Check-in Error:', err);
      setErrorMsg(err?.message || 'Failed to sign in with Google. Please ensure you use your @kiet.edu account.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) {
      setErrorMsg('Please enter your College ID or KIET Email');
      return;
    }
    const val = studentIdInput.trim();
    if (val.includes('@')) {
      handlePerformCheckIn({ email: val, token });
    } else {
      handlePerformCheckIn({ collegeId: val, token });
    }
  };

  return (
    <div className="min-h-screen bg-space text-white selection:bg-crew-lime selection:text-black flex flex-col justify-between p-4 relative overflow-hidden font-body">
      {/* Background Ambience */}
      <div className="stars pointer-events-none" />
      <div className="twinkling pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-crew-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-crew-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-50 border-b-4 border-black bg-space/90 backdrop-blur-md max-w-6xl mx-auto w-full px-4 h-20 flex items-center justify-between rounded-2xl mb-4">
        <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
          <svg width="28" height="34" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
              fill="#50ef39"
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
          <span className="text-crew-lime font-black" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #fff' }}>
            AMONG
          </span>
          U
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs font-mono text-gray-300 hover:text-white underline">
            Dashboard
          </Link>
          <Link href="/" className="text-xs font-mono text-gray-300 hover:text-white underline">
            Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto relative z-10 my-auto">
        {/* State 1: Checked In Successfully */}
        {checkedInUser ? (
          <div className="au-card bg-gray-950/95 border-4 border-crew-lime rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(80,239,57,0.3)] relative overflow-hidden animate-fadeIn">
            {/* Top Pill */}
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-2 bg-emerald-950 border border-crew-lime px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(80,239,57,0.4)]">
                <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping" />
                <span className="font-mono text-xs font-bold text-crew-lime uppercase tracking-wider">
                  {alreadyPresent ? 'ALREADY MARKED PRESENT' : 'ATTENDANCE CONFIRMED • SEAT LOCKED'}
                </span>
              </div>
            </div>

            {/* Cadet Greeting */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-crew-lime/20 border-4 border-crew-lime mx-auto rounded-3xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(80,239,57,0.5)]">
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '2px 2px 0 #000' }}>
                YOU ARE <span className="text-crew-lime">PRESENT</span>!
              </h1>
              <p className="text-gray-300 font-mono text-xs sm:text-sm mt-1">
                Welcome onboard, <span className="text-white font-bold">{checkedInUser.name}</span>. Your attendance is recorded in the Organizer Deck.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 mb-6 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">Cadet Name:</span>
                <span className="text-white font-bold">{checkedInUser.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">College ID:</span>
                <span className="text-crew-cyan font-bold">{checkedInUser.collegeId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">Department / Sec:</span>
                <span className="text-white">{checkedInUser.branch} (Year {checkedInUser.year}, Sec {checkedInUser.section})</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-400">Squad Formation:</span>
                <span className="text-crew-lime font-bold">READY FOR ALLOCATION</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full au-btn bg-crew-lime hover:bg-lime-400 text-black font-display text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(80,239,57,0.8)] active:scale-[0.98] transition-all cursor-pointer font-bold"
              >
                <span>PROCEED TO DASHBOARD →</span>
              </button>

              <div className="text-center">
                <Link href="/squad" className="text-xs font-mono text-crew-cyan hover:underline inline-flex items-center gap-1">
                  <span>View Squad Command Deck</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* State 2: Verification In Progress */
          <div className="au-card bg-gray-950/95 border-4 border-black rounded-3xl p-10 text-center">
            <div className="w-16 h-16 border-4 border-crew-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="font-display text-2xl text-crew-lime tracking-wide">CONFIRMING ATTENDANCE...</h2>
            <p className="text-gray-400 font-mono text-xs mt-2">Authenticating credentials with Central Mission Deck</p>
          </div>
        ) : !firebaseUser ? (
          /* State 3: Not Logged in -> One-Tap Google Sign-In */
          <div className="au-card bg-gray-950/95 border-4 border-crew-lime/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-crew-lime/50 px-3.5 py-1.5 rounded-full text-crew-lime font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping" />
              VENUE ATTENDANCE GATEWAY
            </div>

            <div>
              <div className="w-20 h-20 bg-crew-lime/20 border-4 border-crew-lime mx-auto rounded-3xl flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(80,239,57,0.4)]">
                <span className="text-4xl">🎟️</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
                MARK YOUR <span className="text-crew-lime">PRESENCE</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1 leading-relaxed">
                Sign in with your official <span className="text-white font-bold">@kiet.edu</span> Google account to confirm your seat for squad formation.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-950/80 border border-crew-red text-red-200 rounded-xl text-xs font-mono text-left">
                {isExpiredToken ? (
                  <div className="space-y-1">
                    <p className="font-bold text-crew-red uppercase">⚠️ EXPIRED QR CODE</p>
                    <p>{errorMsg}</p>
                  </div>
                ) : (
                  errorMsg
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignInAndCheckIn}
              disabled={signingIn}
              className="w-full au-btn bg-white hover:bg-gray-100 text-black font-display text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              {signingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>SIGN IN WITH KIET GOOGLE ACCOUNT</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* State 4: Logged in but verification error or manual College ID fallback */
          <div className="au-card bg-gray-950/95 border-4 border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h1 className="font-display text-2xl text-white">MANUAL VENUE CHECK-IN</h1>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Enter your College ID or registered KIET email
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-950/80 border border-crew-red text-red-200 rounded-xl text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                  15-Digit College ID or @kiet.edu Email:
                </label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. 210029012000000"
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-600 outline-none focus:border-crew-lime"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full au-btn bg-crew-lime hover:bg-lime-400 text-black font-display font-bold py-3.5 rounded-xl cursor-pointer"
              >
                {loading ? 'CHECKING IN...' : 'CONFIRM ATTENDANCE →'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-black bg-space/90 p-4 text-center text-xs text-gray-500 max-w-6xl mx-auto w-full rounded-2xl mt-4">
        AmongU Hackathon • Organized by College Tech Society • KIET Deemed to be University
      </footer>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-space flex items-center justify-center text-crew-lime font-display text-xl">
          Loading Venue Check-In...
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
