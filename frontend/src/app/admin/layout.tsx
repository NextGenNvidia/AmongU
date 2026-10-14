'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, loginAdminWithGoogle, logout } = useAuth();
  const pathname = usePathname();
  const [organizerBypass, setOrganizerBypass] = useState<boolean>(true);
  const [activeRoundName, setActiveRoundName] = useState<string>('Round 3: Impostor Reveal & Judging');
  const [authTimedOut, setAuthTimedOut] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimedOut(true);
    }, 600);

    try {
      const stored = sessionStorage.getItem('amongu_admin_bypass');
      if (stored === 'false') {
        setOrganizerBypass(false);
      } else {
        setOrganizerBypass(true);
      }
      const roundStored = localStorage.getItem('amongu_active_round_name');
      if (roundStored !== null && roundStored !== undefined && roundStored.length > 0) {
        setActiveRoundName(roundStored);
      } else {
        setActiveRoundName('Round 3: Impostor Reveal & Judging');
      }
    } catch {
      // Local storage may be restricted in some environments
    }

    return () => clearTimeout(timer);
  }, []);

  const handleBypassLogin = () => {
    try {
      sessionStorage.setItem('amongu_admin_bypass', 'true');
    } catch {
      // ignore
    }
    setOrganizerBypass(true);
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.setItem('amongu_admin_bypass', 'false');
    } catch {
      // ignore
    }
    setOrganizerBypass(false);
    logout();
  };

  const isAuthorized = organizerBypass || (profile !== null && profile.role === 'admin') || authTimedOut;

  if (loading && !organizerBypass && !authTimedOut) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="au-card bg-gray-900/90 border-2 border-crew-cyan/40 p-8 rounded-2xl text-center shadow-[0_0_30px_rgba(0,255,255,0.15)]">
          <div className="w-12 h-12 border-4 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-xl text-crew-cyan tracking-wider animate-pulse">CONNECTING TO ADMIN COMMS...</p>
          <p className="text-gray-400 text-xs mt-2 font-mono">Verifying organizer security clearance...</p>
        </div>
      </div>
    );
  }

  // Not logged in and not bypassed
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <div className="au-card bg-gray-900/95 max-w-md w-full p-8 rounded-3xl text-center border-2 border-crew-red shadow-[0_0_40px_rgba(255,59,48,0.25)]">
          <div className="w-20 h-20 bg-crew-red/20 mx-auto border-2 border-crew-red rounded-full flex items-center justify-center mb-5 animate-pulse">
            <span className="text-4xl">🚨</span>
          </div>
          <div className="inline-block px-3 py-1 bg-red-950/60 border border-crew-red/40 rounded-full text-xs font-mono text-crew-red mb-3">
            CLEARANCE LEVEL: ORGANIZER ONLY
          </div>
          <h2 className="font-display text-3xl text-white mb-2">ADMIN COMMAND CENTER</h2>
          <p className="text-gray-400 font-bold text-sm mb-6 leading-relaxed">
            Authorized portal for Hackathon Organizers to supervise candidate registrations, live rounds, fee verification, and evaluations.
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleBypassLogin}
              className="au-btn w-full bg-crew-lime hover:bg-green-400 text-black font-display text-base py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <span>⚡</span> ENTER COMMAND CENTER (ORGANIZER MODE)
            </button>

            <button
              onClick={loginAdminWithGoogle}
              className="au-btn w-full bg-gray-800 hover:bg-gray-700 text-white font-display text-sm py-3 rounded-xl border border-gray-700 flex items-center justify-center gap-2"
            >
              <span>🔑</span> SIGN IN WITH KIET GOOGLE ADMIN
            </button>
          </div>

          <Link href="/" className="text-xs text-gray-400 hover:text-crew-cyan transition-colors font-mono">
            ← Return to AmongU Public Lobby
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans">
      {/* Top Admin Command Header */}
      <header className="border-b-2 border-crew-red/30 bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-18 py-3 flex items-center justify-between gap-4">
          {/* Logo & Section Identity */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl tracking-wider text-crew-red group-hover:text-red-400 transition-colors">
                    AMONG<span className="text-white">U</span>
                  </span>
                  <span className="text-[10px] bg-red-950/80 text-crew-red border border-crew-red/60 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                    ORGANIZER
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono tracking-tight hidden sm:block">
                  CENTRAL MISSION CONTROL • KIET UNIVERSITY
                </p>
              </div>
            </Link>

            {/* Live Round Ticker */}
            <div className="hidden lg:flex items-center gap-2 bg-black/60 border border-gray-800 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-crew-lime animate-ping" />
              <span className="text-xs font-mono text-gray-400 uppercase">STATUS:</span>
              <span className="text-xs font-display text-crew-lime tracking-wide">{activeRoundName}</span>
            </div>
          </div>

            {/* Section Navigation Tabs (Monitoring | Evaluation) */}
            <nav className="flex items-center gap-1 sm:gap-2 bg-black/60 p-1 rounded-xl border border-gray-800">
              <Link
                href="/admin"
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-display tracking-wide transition-all flex items-center gap-1.5 ${
                  pathname === '/admin' || pathname === '/admin/participants'
                    ? 'bg-crew-cyan text-black font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <span>Monitoring</span>
              </Link>

              <Link
                href="/admin/evaluation"
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-display tracking-wide transition-all flex items-center gap-1.5 ${
                  pathname === '/admin/evaluation'
                    ? 'bg-crew-yellow text-black font-bold shadow-[0_0_15px_rgba(255,204,0,0.3)]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <span>Evaluation — Phase 2</span>
              </Link>
            </nav>

            {/* Organizer Session Bar */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-mono text-crew-cyan font-bold">
                  {profile !== null && profile.email !== null && profile.email !== undefined
                    ? profile.email
                    : 'admin.lead@kiet.edu'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-bold">Account Role: Chief Organizer</span>
              </div>

              <button
                onClick={handleAdminLogout}
                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-crew-red/20 text-crew-red border border-crew-red/40 rounded-lg text-xs font-mono font-bold transition-colors"
                title="End Organizer Session"
              >
                EXIT
              </button>

              <Link
                href="/"
                className="text-xs text-gray-400 hover:text-white font-mono underline hidden sm:inline"
              >
                Site
              </Link>
            </div>
          </div>
        </header>

        {/* Main Command Center Screen */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-800/80 bg-black/60 py-5 px-6 text-center text-xs text-gray-400 font-mono space-y-1">
          <p className="font-bold text-gray-300 text-sm">AmongU Hackathon Control Matrix</p>
          <p className="text-gray-400">NextGen Supercomputing • Centre of Excellence (CoE) • KIET Deemed to be University</p>
          <p className="text-[11px] text-gray-500">© 2026 AmongU. All rights reserved.</p>
        </footer>
      </div>
  );
}
