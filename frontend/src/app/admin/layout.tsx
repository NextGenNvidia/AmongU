'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, loginAdminWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="au-card bg-gray-900 p-8 rounded-2xl text-center">
          <p className="font-display text-2xl text-crew-cyan animate-pulse">CONNECTING TO ADMIN COMMS...</p>
        </div>
      </div>
    );
  }

  // Not logged in or not admin
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center p-4">
        <div className="au-card bg-gray-900 max-w-md w-full p-8 rounded-3xl text-center border-crew-red">
          <div className="w-20 h-20 bg-crew-red mx-auto au-border rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="font-display text-3xl text-white mb-2">ADMIN ACCESS ONLY</h2>
          <p className="text-gray-400 font-bold text-sm mb-6">
            Only authorized organizers listed in the system can access the command center.
          </p>
          <button
            onClick={loginAdminWithGoogle}
            className="au-btn w-full bg-crew-red hover:bg-red-500 text-white font-display text-lg py-3 rounded-xl mb-4"
          >
            SIGN IN AS ADMIN
          </button>
          <Link href="/" className="text-sm text-gray-500 hover:text-white underline">
            ← Return to Event Site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space text-white">
      {/* Admin Navigation Bar */}
      <header className="border-b-4 border-black bg-gray-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-2xl text-crew-red flex items-center gap-2">
              <span>🚨</span>
              <span>AMONG</span>U <span className="text-white text-sm bg-black px-2 py-0.5 rounded au-border">ADMIN</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-black/40"
              >
                Overview
              </Link>
              <Link
                href="/admin/participants"
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-black/40"
              >
                Participants
              </Link>
              <Link
                href="/admin/manual-entry"
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-black/40"
              >
                Desk Cash Entry
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-crew-cyan font-bold bg-black px-3 py-1 rounded-full border border-gray-700">
              {profile.email}
            </span>
            <button onClick={logout} className="text-xs text-crew-red hover:underline font-bold">
              Logout
            </button>
            <Link href="/" className="text-xs text-gray-400 hover:text-white underline">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
