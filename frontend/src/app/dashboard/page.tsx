'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<UserTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read saved registration ticket from localStorage
    const saved = localStorage.getItem('amongu_user_ticket');
    if (saved) {
      try {
        setTicket(JSON.parse(saved));
      } catch (e) {
        console.error('Error reading ticket:', e);
      }
    } else {
      // Default demo participant if accessed directly
      setTicket({
        name: 'Cadet Explorer',
        collegeId: '210029012000001',
        year: '1',
        branch: 'CSE',
        section: 'A',
        phone: '9876543210',
        email: 'cadet.explorer@kiet.edu',
        track: 'Web Development',
        paymentId: 'pay_demo_test123',
        amount: 55,
        registeredAt: new Date().toLocaleString(),
        isEmailVerified: true,
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <p className="font-display text-2xl text-crew-cyan animate-pulse">CONNECTING TO DROP-SHIP DASHBOARD...</p>
      </div>
    );
  }

  const trackColors: Record<string, string> = {
    'Web Development': '#132ed1',
    'Game Development': '#6b2fbb',
    'Open Innovation': '#f07d0d',
  };

  const crewmateColor = ticket?.track && trackColors[ticket.track] ? trackColors[ticket.track] : '#c51111';

  return (
    <div className="min-h-screen bg-space font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black">
      {/* Background Starfield */}
      <div className="stars pointer-events-none"></div>
      <div className="twinkling pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="border-b-4 border-black bg-gray-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
            <span className="hidden sm:inline-block bg-black au-border text-crew-cyan text-xs font-display px-3 py-1 rounded-full ml-2">
              CREWMATE DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-crew-lime font-mono font-bold bg-black/60 au-border px-3 py-1 rounded-full">
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        {/* Welcome Banner */}
        <div className="au-card bg-gray-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border-4 border-black">
          <div className="flex items-center gap-6">
            {/* Crewmate Avatar */}
            <div className="w-24 h-28 shrink-0 float-slow">
              <svg width="90" height="110" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="30" width="25" height="50" rx="8" fill={crewmateColor} stroke="#000" strokeWidth="6" />
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill={crewmateColor}
                  stroke="#000"
                  strokeWidth="6"
                />
                <path
                  d="M30,30 h45 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-45 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                  fill="#9cdbfa"
                  stroke="#000"
                  strokeWidth="6"
                />
                <path
                  d="M35,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
                  fill="#ffffff"
                  opacity="0.8"
                />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl sm:text-4xl text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  WELCOME ABOARD, {ticket?.name.toUpperCase()}!
                </h1>
                <span className="bg-crew-lime text-black font-display text-xs px-2.5 py-0.5 rounded-full border-2 border-black">
                  VERIFIED CREWMATE
                </span>
              </div>
              <p className="text-gray-300 font-bold text-sm sm:text-base mt-2">
                Your drop-ship seat is confirmed for <span className="text-crew-cyan">AmongU</span> at KIET Deemed to be University.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 text-right">
            <span className="text-xs text-gray-400 font-bold uppercase">Registration Status</span>
            <span className="font-display text-xl text-crew-lime bg-black au-border px-4 py-1.5 rounded-xl">
              PAID (₹{ticket?.amount}) • VERIFIED ✅
            </span>
          </div>
        </div>

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
    </div>
  );
}
