'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registration.service';
import { ConfirmedTicket, RegistrationData } from '../../types/registration';

function ClearanceConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [ticket, setTicket] = useState<ConfirmedTicket | null>(null);
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Extract payment reference from Razorpay URL parameters
    const payId =
      searchParams.get('razorpay_payment_id') ||
      searchParams.get('payment_id') ||
      searchParams.get('razorpay_payment_link_id') ||
      searchParams.get('ref') ||
      `pay_${Date.now().toString(36)}`;

    setPaymentId(payId);

    // 2. Check if ticket is already saved in localStorage
    try {
      const existingTicketStr = localStorage.getItem('amongu_user_ticket');
      if (existingTicketStr) {
        const parsed = JSON.parse(existingTicketStr);
        if (parsed && parsed.email) {
          setTicket(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading ticket from localStorage:', e);
    }

    // 3. Retrieve draft details
    let draftData: RegistrationData | null = null;
    try {
      const draftStr = localStorage.getItem('amongu_registration_draft');
      if (draftStr) {
        draftData = JSON.parse(draftStr);
      }
    } catch (e) {
      console.warn('Error reading draft from localStorage:', e);
    }

    // 4. Resolve cadet details
    const email =
      draftData?.email ||
      (firebaseUser?.email as string) ||
      searchParams.get('email') ||
      '';

    const name =
      draftData?.name ||
      (firebaseUser?.displayName as string) ||
      'Cadet';

    const collegeId =
      draftData?.collegeId ||
      `2026${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    const confirmedRecord: ConfirmedTicket = {
      name,
      collegeId,
      branch: draftData?.branch || 'CSE',
      year: draftData?.year || '1st',
      section: draftData?.section || 'A',
      track: draftData?.track || 'Open Track',
      phone: draftData?.phone || '9999999999',
      email: email.toLowerCase().trim(),
      amount: 55,
      paymentId: payId,
      registeredAt: new Date().toLocaleString(),
      isEmailVerified: true,
      avatarColor: '#c51111',
      avatarHat: 'none',
      avatarMuffler: 'none',
      withdrawalStatus: 'none',
      assignedRole: 'unassigned',
    };

    // 5. Commit to backend MongoDB and store in localStorage
    const persistRegistration = async () => {
      try {
        console.log('🚀 [Clearance Confirmation] Syncing confirmed ticket with MongoDB...', confirmedRecord);
        await registrationService.confirmRegistration(confirmedRecord);
      } catch (err) {
        console.warn('Backend confirmation sync warning (client cache active):', err);
      }

      try {
        localStorage.setItem('amongu_user_ticket', JSON.stringify(confirmedRecord));
        localStorage.removeItem('amongu_registration_draft');
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }

      setTicket(confirmedRecord);
      setLoading(false);
    };

    persistRegistration();
  }, [searchParams, firebaseUser]);

  return (
    <div className="relative min-h-screen bg-space font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black flex flex-col justify-between">
      {/* Background stars */}
      <div className="stars"></div>
      <div className="twinkling"></div>

      {/* Top Navbar */}
      <header className="relative z-50 border-b-4 border-black bg-space/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
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

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-crew-lime hover:bg-lime-400 text-black px-4 py-2 rounded-xl font-display text-sm tracking-wider font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(80,239,57,0.5)]"
            >
              MISSION DASHBOARD →
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-xl">
          {loading ? (
            <div className="au-card bg-gray-900 rounded-3xl p-10 text-center border-4 border-black">
              <div className="w-16 h-16 border-4 border-crew-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="font-display text-2xl text-crew-lime tracking-wide">VERIFYING MISSION CLEARANCE...</h2>
              <p className="text-gray-400 font-mono text-xs mt-2">Connecting with KIET Security Deck & Atlas Database</p>
            </div>
          ) : (
            <div className="au-card bg-gray-900/95 rounded-3xl p-6 sm:p-8 border-4 border-black shadow-[0_0_50px_rgba(80,239,57,0.3)] relative overflow-hidden">
              {/* Top Glowing Pill */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-950/80 border-2 border-crew-lime px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(80,239,57,0.4)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping" />
                  <span className="font-mono text-xs font-bold text-crew-lime uppercase tracking-wider">
                    PAYMENT VERIFIED • MISSION CLEARANCE GRANTED
                  </span>
                </div>
              </div>

              {/* Big Celebration Icon */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-crew-lime/20 border-4 border-crew-lime mx-auto rounded-3xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(80,239,57,0.6)]">
                  <span className="text-5xl">🚀</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '2px 2px 0 #000' }}>
                  WELCOME ABOARD, <span className="text-crew-lime">{ticket?.name.split(' ')[0].toUpperCase()}</span>!
                </h1>
                <p className="text-gray-400 font-mono text-xs sm:text-sm mt-1">
                  Your registration fee of ₹55 is confirmed. Your clearance pass is now officially active.
                </p>
              </div>

              {/* Sci-Fi Boarding Pass Box */}
              <div className="bg-black/60 border-2 border-gray-800 rounded-2xl p-5 mb-6 space-y-3 font-mono">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/80 text-xs sm:text-sm">
                  <span className="text-gray-400">Cadet Full Name:</span>
                  <span className="text-white font-bold">{ticket?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/80 text-xs sm:text-sm">
                  <span className="text-gray-400">Official KIET Email:</span>
                  <span className="text-crew-cyan font-bold truncate max-w-[200px]">{ticket?.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/80 text-xs sm:text-sm">
                  <span className="text-gray-400">College ID:</span>
                  <span className="text-amber-400 font-bold">{ticket?.collegeId}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/80 text-xs sm:text-sm">
                  <span className="text-gray-400">Department / Sec:</span>
                  <span className="text-white">
                    {ticket?.branch} (Year {ticket?.year}, Sec {ticket?.section})
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/80 text-xs sm:text-sm">
                  <span className="text-gray-400">Payment Reference:</span>
                  <span className="text-crew-lime font-bold text-[11px] truncate max-w-[200px]">
                    {paymentId || ticket?.paymentId}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-xs sm:text-sm">
                  <span className="text-gray-400">Event Date:</span>
                  <span className="text-crew-yellow font-bold">OCTOBER 28, 2026 • 09:00 AM IST</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full au-btn bg-crew-lime hover:bg-lime-400 text-black font-display text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(80,239,57,0.8)] active:scale-[0.98] transition-all cursor-pointer font-bold"
                >
                  <span>ENTER MISSION DASHBOARD →</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-xs font-mono">
                  <Link href="/squad" className="text-crew-cyan hover:underline flex items-center gap-1">
                    <span>View Squad Terminal</span>
                    <span>→</span>
                  </Link>
                  <span className="text-gray-600">•</span>
                  <Link href="/profile" className="text-gray-400 hover:text-white underline">
                    Customize Avatar
                  </Link>
                </div>
              </div>

              {/* Info Note */}
              <p className="text-[11px] font-mono text-gray-500 text-center mt-6">
                🔒 You will never have to re-enter registration details. Access your dashboard anytime with your Google KIET email.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-black bg-space/90 p-4 text-center text-xs text-gray-500">
        AmongU Hackathon • Organized by NextGen Supercomputing Club • KIET Deemed to be University
      </footer>
    </div>
  );
}

export default function ClearanceConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-space flex items-center justify-center text-crew-lime font-display text-xl">
          Loading Mission Clearance...
        </div>
      }
    >
      <ClearanceConfirmedContent />
    </Suspense>
  );
}
