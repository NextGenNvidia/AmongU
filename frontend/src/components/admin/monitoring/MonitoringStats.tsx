'use client';

import React from 'react';

interface MonitoringStatsProps {
  totalRegistered: number;
  presentCount: number;
  activeRoundCount: number;
  activeRoundName: string;
  totalPaymentINR: number;
  firstYearCount: number;
  secondYearCount: number;
  onOpenQR?: () => void;
}

export default function MonitoringStats({
  totalRegistered,
  presentCount,
  activeRoundCount,
  activeRoundName,
  totalPaymentINR,
  firstYearCount,
  secondYearCount,
  onOpenQR,
}: MonitoringStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. REGISTERED PARTICIPANTS */}
      <div className="au-card bg-gray-900 border-2 border-gray-800 p-4 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition-colors">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              1. REGISTERED PARTICIPANTS
            </span>
            <span className="text-lg">📋</span>
          </div>
          <p className="font-display text-3xl sm:text-4xl text-white tracking-tight mt-1">
            {totalRegistered}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
          <span>Status: All registrations recorded in the system</span>
        </div>
      </div>

      {/* 2. PRESENT PARTICIPANTS */}
      <div className="au-card bg-gray-900 border-2 border-crew-lime/50 p-4 rounded-2xl flex flex-col justify-between shadow-[0_0_15px_rgba(50,205,50,0.1)]">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-crew-lime tracking-wider">
              2. PRESENT PARTICIPANTS
            </span>
            <span className="text-lg">📍</span>
          </div>
          <p className="font-display text-3xl sm:text-4xl text-crew-lime tracking-tight mt-1">
            {presentCount}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-400 flex flex-col gap-2">
          <span>Status: Venue attendance check-ins</span>
          {onOpenQR && (
            <button
              onClick={onOpenQR}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-crew-lime/15 hover:bg-crew-lime text-crew-lime hover:text-black border border-crew-lime/40 text-[11px] font-mono font-bold transition-all shadow-[0_0_10px_rgba(50,205,50,0.15)]"
            >
              <span>📱 VENUE QR CODE</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. ACTIVE ROUND */}
      <div className="au-card bg-gray-900 border-2 border-crew-cyan/50 p-4 rounded-2xl flex flex-col justify-between shadow-[0_0_15px_rgba(0,255,255,0.1)]">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-crew-cyan tracking-wider">
              3. ACTIVE ROUND
            </span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="font-display text-xl sm:text-2xl text-crew-cyan tracking-tight mt-1 truncate" title={activeRoundName}>
            {activeRoundName}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
          <span>Status: Participants currently assigned to the active round ({activeRoundCount})</span>
        </div>
      </div>

      {/* 4. FEE COLLECTION */}
      <div className="au-card bg-gray-900 border-2 border-crew-yellow/50 p-4 rounded-2xl flex flex-col justify-between shadow-[0_0_15px_rgba(255,204,0,0.1)]">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-crew-yellow tracking-wider">
              4. FEE COLLECTION
            </span>
            <span className="text-lg">💰</span>
          </div>
          <p className="font-display text-3xl sm:text-4xl text-crew-yellow tracking-tight mt-1">
            ₹{totalPaymentINR.toLocaleString()}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-400 flex flex-col gap-0.5">
          <span>Fee: ₹55 per participant</span>
          <span className="text-crew-yellow font-bold">Status: Payment verification</span>
        </div>
      </div>

      {/* 5. ACADEMIC YEAR DISTRIBUTION */}
      <div className="au-card bg-gray-900 border-2 border-purple-500/50 p-4 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-purple-400 tracking-wider">
              5. ACADEMIC YEAR
            </span>
            <span className="text-lg">🎓</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-mono">1st:</span>
              <span className="font-display text-2xl text-white font-bold">{firstYearCount}</span>
            </div>
            <span className="text-gray-600 font-bold">/</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-mono">2nd:</span>
              <span className="font-display text-2xl text-crew-lime font-bold">{secondYearCount}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
          <span>Status: Academic-year split</span>
        </div>
      </div>
    </div>
  );
}
