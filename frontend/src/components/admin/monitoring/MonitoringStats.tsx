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
  ongoingRoundKey: string;
}

export default function MonitoringStats({
  totalRegistered,
  presentCount,
  activeRoundCount,
  activeRoundName,
  totalPaymentINR,
  firstYearCount,
  secondYearCount,
  ongoingRoundKey,
}: MonitoringStatsProps) {
  const attendanceRate = totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Registered Users */}
      <div className="au-card bg-gray-900 border-2 border-gray-800 p-4 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition-colors">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Registered Users</span>
            <span className="text-lg">📋</span>
          </div>
          <p className="font-display text-3xl text-white tracking-tight">{totalRegistered}</p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Total Database</span>
          <span className="text-crew-cyan font-bold">100% In System</span>
        </div>
      </div>

      {/* 2. Present Users (Attendance Check-In) */}
      <div className="au-card bg-gray-900 border-2 border-crew-lime/50 p-4 rounded-2xl flex flex-col justify-between shadow-[0_0_15px_rgba(50,205,50,0.1)]">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-crew-lime">Present Users</span>
            <span className="text-lg">📍</span>
          </div>
          <p className="font-display text-3xl text-crew-lime tracking-tight">{presentCount}</p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-gray-400">Checked In at Venue</span>
          <span className="text-crew-lime font-bold">{attendanceRate}% Attendance</span>
        </div>
      </div>

      {/* 3. Users in Specific Round */}
      <div className="au-card bg-gray-900 border-2 border-crew-cyan/50 p-4 rounded-2xl flex flex-col justify-between shadow-[0_0_15px_rgba(0,255,255,0.1)]">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-crew-cyan">Active in Round</span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="font-display text-3xl text-crew-cyan tracking-tight">{activeRoundCount}</p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] font-mono">
          <span className="text-gray-400 truncate max-w-[120px]">{activeRoundName}</span>
          <span className="text-crew-cyan uppercase font-bold">{ongoingRoundKey}</span>
        </div>
      </div>

      {/* 4. Payment Total */}
      <div className="au-card bg-gray-900 border-2 border-crew-yellow/50 p-4 rounded-2xl flex flex-col justify-between shadow-[0_0_15px_rgba(255,204,0,0.1)]">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-crew-yellow">Payment Total</span>
            <span className="text-lg">💰</span>
          </div>
          <p className="font-display text-3xl text-crew-yellow tracking-tight">₹{totalPaymentINR.toLocaleString()}</p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Fee per User</span>
          <span className="text-crew-yellow font-bold">₹55 Verified</span>
        </div>
      </div>

      {/* 5. Total 1st Year / 2nd Year */}
      <div className="au-card bg-gray-900 border-2 border-purple-500/50 p-4 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-purple-400">1st Yr / 2nd Yr</span>
            <span className="text-lg">🎓</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl text-white tracking-tight">{firstYearCount}</p>
            <span className="text-gray-500 font-mono text-xs">1st Yr</span>
            <span className="text-gray-600 font-bold">/</span>
            <p className="font-display text-3xl text-crew-lime tracking-tight">{secondYearCount}</p>
            <span className="text-gray-500 font-mono text-xs">2nd Yr</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Academic Split</span>
          <span className="text-purple-300 font-bold">
            {firstYearCount + secondYearCount > 0
              ? `${Math.round((firstYearCount / (firstYearCount + secondYearCount)) * 100)}% : ${Math.round((secondYearCount / (firstYearCount + secondYearCount)) * 100)}%`
              : '0% : 0%'}
          </span>
        </div>
      </div>
    </div>
  );
}
