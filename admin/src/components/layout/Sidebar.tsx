'use client';

import React from 'react';

interface SidebarProps {
  currentTab?: 'users' | 'settings' | 'teams' | 'venue-qr' | 'announcements';
  onSelectTab?: (tab: 'users' | 'settings' | 'teams' | 'venue-qr' | 'announcements') => void;
  onLogout: () => void;
  totalUsersCount: number;
}

export default function Sidebar({
  currentTab = 'users',
  onSelectTab,
  onLogout,
  totalUsersCount,
}: SidebarProps) {
  return (
    <aside className="w-64 lg:w-72 bg-gray-950/95 border-r-2 border-gray-800/80 flex flex-col h-screen sticky top-0 shrink-0 font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crew-red border-2 border-black flex items-center justify-center text-white shadow-[0_0_15px_#c51111]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl tracking-wider text-crew-red">
                AMONG<span className="text-white">U</span>
              </span>
              <span className="text-[9px] bg-red-950/90 text-crew-red border border-crew-red/60 px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-tight">
              ORGANIZER COMMAND DECK
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
          CONTROL MODULES
        </p>

        {/* 1. USERS TAB */}
        <button
          type="button"
          onClick={() => onSelectTab?.('users')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-display tracking-wide transition-all text-left cursor-pointer ${
            currentTab === 'users'
              ? 'bg-crew-red text-white shadow-[0_0_15px_rgba(197,17,17,0.4)] border border-red-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Users</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-black/60 text-white">
            {totalUsersCount} Cadets
          </span>
        </button>

        {/* 2. TEAMS & IMPOSTORS TAB */}
        <button
          type="button"
          onClick={() => onSelectTab?.('teams')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-display tracking-wide transition-all text-left cursor-pointer ${
            currentTab === 'teams'
              ? 'bg-crew-cyan text-black shadow-[0_0_15px_rgba(56,254,220,0.4)] border border-crew-cyan font-bold'
              : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Teams & Impostors</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-black/60 text-crew-cyan">
            Squads
          </span>
        </button>

        {/* 3. VENUE ATTENDANCE QR TAB */}
        <button
          type="button"
          onClick={() => onSelectTab?.('venue-qr')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-display tracking-wide transition-all text-left cursor-pointer ${
            currentTab === 'venue-qr'
              ? 'bg-crew-lime text-black shadow-[0_0_15px_rgba(80,239,57,0.4)] border border-crew-lime font-bold'
              : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Venue QR Pass</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-black/60 text-crew-lime">
            Live QR
          </span>
        </button>

        {/* 4. ANNOUNCEMENTS TAB */}
        <button
          type="button"
          onClick={() => onSelectTab?.('announcements')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-display tracking-wide transition-all text-left cursor-pointer ${
            currentTab === 'announcements'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-500 font-bold'
              : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>Announcements</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-black/60 text-purple-300">
            Broadcast
          </span>
        </button>

        {/* 5. EVENT SCHEDULE & SETTINGS TAB */}
        <button
          type="button"
          onClick={() => onSelectTab?.('settings')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-display tracking-wide transition-all text-left cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)] border border-amber-400 font-bold'
              : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Event Schedule</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-black/60 text-amber-400">
            Timers
          </span>
        </button>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-gray-800/80 bg-black/40">
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-crew-lime/20 border border-crew-lime flex items-center justify-center text-xs font-bold text-crew-lime">
              <svg className="w-4 h-4 text-crew-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono font-bold text-white truncate">Chief Organizer</p>
              <p className="text-[10px] font-mono text-crew-lime flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-crew-lime animate-pulse" />
                ACTIVE • ATLAS CONNECTED
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full au-btn bg-red-950/60 hover:bg-crew-red text-red-200 hover:text-white border border-crew-red/40 py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>LOGOUT FROM ADMIN</span>
        </button>
      </div>
    </aside>
  );
}
