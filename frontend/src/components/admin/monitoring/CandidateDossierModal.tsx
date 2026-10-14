'use client';

import React from 'react';
import { CandidateRecord } from '../../../types/admin';

interface CandidateDossierModalProps {
  candidate: CandidateRecord | null;
  onClose: () => void;
  onToggleAttendance: (id: string) => void;
  onUpdateRole: (id: string, role: 'crewmate' | 'impostor' | 'unassigned') => void;
}

export default function CandidateDossierModal({
  candidate,
  onClose,
  onToggleAttendance,
  onUpdateRole,
}: CandidateDossierModalProps) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="au-card bg-gray-900 border-2 border-crew-cyan max-w-lg w-full p-6 rounded-3xl shadow-[0_0_50px_rgba(0,255,255,0.25)] space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl border-2 border-white/20 flex items-center justify-center text-2xl shadow-lg shrink-0"
              style={{ backgroundColor: candidate.suitColor }}
            >
              🚀
            </div>
            <div>
              <h3 className="font-display text-xl text-white">{candidate.name}</h3>
              <p className="text-xs font-mono text-crew-cyan">ID: {candidate.collegeId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onToggleAttendance(candidate.id)}
            className={`px-3 py-1 rounded-full font-bold border transition-colors ${
              candidate.isPresent
                ? 'bg-crew-lime/20 text-crew-lime border-crew-lime/60'
                : 'bg-black/60 text-gray-400 border-gray-700'
            }`}
          >
            {candidate.isPresent ? '📍 VENUE ATTENDANCE: PRESENT' : '⚪ VENUE ATTENDANCE: ABSENT'}
          </button>

          {candidate.assignedRole === 'impostor' ? (
            <span className="px-3 py-1 rounded-full bg-red-950 text-crew-red border border-crew-red font-bold animate-pulse">
              🚨 ROLE: IMPOSTOR
            </span>
          ) : candidate.assignedRole === 'crewmate' ? (
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-crew-cyan border border-crew-cyan font-bold">
              🛡️ ROLE: CREWMATE
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-black/60 text-gray-400 border border-gray-800">
              ROLE: UNASSIGNED
            </span>
          )}
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block mb-0.5">DEPARTMENT &amp; SECTION</span>
            <span className="text-white font-bold">{candidate.branch} • Section {candidate.section}</span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block mb-0.5">ACADEMIC YEAR</span>
            <span className="text-crew-lime font-bold">Year {candidate.year} (B.Tech)</span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block mb-0.5">OFFICIAL KIET EMAIL</span>
            <span className="text-white truncate block">{candidate.email}</span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block mb-0.5">WHATSAPP CONTACT</span>
            <span className="text-white font-bold">{candidate.phone}</span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block mb-0.5">ASSIGNED SQUAD / TEAM</span>
            <span className="text-crew-cyan font-bold">
              {candidate.assignedTeamName ? candidate.assignedTeamName : 'Not yet grouped'}
            </span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block mb-0.5">FEE &amp; PAYMENT ID</span>
            <span className="text-crew-yellow font-bold">₹{candidate.amount} • {candidate.paymentId}</span>
          </div>
        </div>

        {/* Role Assignment Controls */}
        <div className="bg-black/40 p-3.5 rounded-xl border border-gray-800/80 space-y-2">
          <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
            MANUAL ROLE OVERRIDE PRIVILEGE
          </label>
          <div className="flex gap-2 font-display text-xs">
            <button
              onClick={() => onUpdateRole(candidate.id, 'crewmate')}
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                candidate.assignedRole === 'crewmate'
                  ? 'bg-crew-cyan text-black font-bold border-crew-cyan'
                  : 'bg-black text-gray-300 border-gray-700 hover:border-crew-cyan'
              }`}
            >
              SET CREWMATE
            </button>
            <button
              onClick={() => onUpdateRole(candidate.id, 'impostor')}
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                candidate.assignedRole === 'impostor'
                  ? 'bg-crew-red text-white font-bold border-crew-red'
                  : 'bg-black text-gray-300 border-gray-700 hover:border-crew-red'
              }`}
            >
              SET IMPOSTOR
            </button>
            <button
              onClick={() => onUpdateRole(candidate.id, 'unassigned')}
              className="px-3 py-2 bg-black text-gray-400 border border-gray-800 hover:text-white rounded-lg"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Modal Close */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black border border-gray-700 hover:border-gray-500 text-white rounded-xl text-xs font-mono"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
