'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';

interface VenueQRPassProps {
  onCheckInUpdate?: () => void;
}

export default function VenueQRPass({ onCheckInUpdate }: VenueQRPassProps) {
  const [token, setToken] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [stats, setStats] = useState<{ total: number; present: number }>({ total: 0, present: 0 });

  const loadConfigAndToken = async () => {
    try {
      setLoading(true);
      const res = await adminService.getEventConfig();
      if (res && res.config) {
        setToken(res.config.activeCheckInToken || 'venue_pass_init');
        setUpdatedAt(res.config.checkInTokenUpdatedAt || res.config.updatedAt || new Date().toISOString());
      }

      // Also get present count from teams overview
      const teamsRes = await adminService.getTeamsOverview();
      if (teamsRes && teamsRes.success) {
        const unassigned = (teamsRes.unassignedMembers || (teamsRes as any).unassignedCandidates) || [];
        let presentCount = 0;
        let totalCount = 0;

        // Count in squads
        (teamsRes.teams || []).forEach((t: any) => {
          (t.members || []).forEach((m: any) => {
            totalCount++;
            if (m.isPresent) presentCount++;
          });
        });

        // Count on bench
        unassigned.forEach((u: any) => {
          totalCount++;
          if (u.isPresent) presentCount++;
        });

        setStats({ total: totalCount, present: presentCount });
      }
    } catch (err) {
      console.error('Failed to load venue QR config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigAndToken();
  }, []);

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating will invalidate all previously printed/shared QR codes. Students scanning old codes will be asked to scan the new one. Proceed?')) {
      return;
    }

    try {
      setRegenerating(true);
      const res = await adminService.generateCheckInToken();
      if (res && res.token) {
        setToken(res.token);
        setUpdatedAt(res.updatedAt || new Date().toISOString());
        onCheckInUpdate?.();
      }
    } catch (err: any) {
      alert('Failed to regenerate token: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setRegenerating(false);
    }
  };

  const domain = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://amongu.vercel.app'
    : 'https://amongu.vercel.app';

  const checkInUrl = `${domain}/checkin?token=${token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(checkInUrl)}&margin=15&color=000000&bgcolor=ffffff`;

  const copyUrl = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070b14] flex flex-col items-center justify-center p-6 text-white select-none">
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-6 right-6 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs px-4 py-2 rounded-xl border border-gray-600 cursor-pointer"
        >
          ✕ EXIT FULLSCREEN
        </button>

        <div className="text-center max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 bg-crew-lime/10 border border-crew-lime/40 px-4 py-1.5 rounded-full text-crew-lime font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping" />
            LIVE VENUE CHECK-IN PASS
          </div>

          <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-white">
            SCAN TO MARK <span className="text-crew-lime">PRESENT</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-mono">
            Open camera on your phone • Sign in with your KIET email • Seat confirmed instantly
          </p>

          <div className="bg-white p-5 rounded-3xl shadow-[0_0_50px_rgba(80,239,57,0.5)] border-4 border-black mx-auto w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt="AmongU Venue Check-in QR"
              className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto"
            />
          </div>

          <div className="font-mono text-xs text-gray-500">
            Active Token: <span className="text-crew-cyan font-bold">{token}</span> • Updated: {new Date(updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-2 border-crew-lime/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-crew-lime animate-pulse" />
              <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-white">
                VENUE ATTENDANCE <span className="text-crew-lime">QR PASS</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
              Project this QR code at the registration desk or auditorium screen. Cadets scan to mark their attendance in real-time.
            </p>
          </div>

          {/* Present Count Metric */}
          <div className="flex items-center gap-3 bg-black/60 border border-crew-lime/30 rounded-2xl p-3 font-mono">
            <div className="w-10 h-10 rounded-xl bg-crew-lime/20 border border-crew-lime flex items-center justify-center text-crew-lime font-bold text-lg">
              ✓
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Checked-In Attendees</span>
              <span className="text-lg font-bold text-crew-lime">{stats.present} / {stats.total} Present</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Presentation Box */}
      <div className="bg-gray-950/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        {/* QR Display */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_0_40px_rgba(80,239,57,0.3)] border-4 border-black shrink-0 relative group">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-crew-lime border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="Venue Check-In QR"
                className="w-64 h-64 object-contain"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setFullscreen(true)}
                  className="bg-black text-crew-lime border border-crew-lime font-mono text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  EXPAND FULLSCREEN ↗
                </button>
              </div>
            </>
          )}
        </div>

        {/* Controls & Instructions */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-crew-lime/30 px-3 py-1 rounded-full text-[11px] font-mono text-crew-lime mb-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-crew-lime animate-ping" />
              DYNAMIC SECURE TOKEN ACTIVE
            </div>
            <h2 className="font-display text-xl text-white tracking-wide">
              ROTATING ATTENDANCE GATEWAY
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1 leading-relaxed">
              When a student scans this code with their phone camera, they land on <span className="text-crew-cyan">/checkin</span>. If logged in with their KIET email, they are instantly verified as <span className="text-crew-lime font-bold">PRESENT</span>. If not, they sign in with 1 tap.
            </p>
          </div>

          {/* Active URL & Copy */}
          <div className="bg-black/60 border border-gray-800 rounded-xl p-3 space-y-1.5 font-mono">
            <span className="text-[10px] text-gray-500 uppercase block">Check-in Scan Destination:</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-crew-cyan truncate select-all">{checkInUrl}</span>
              <button
                type="button"
                onClick={copyUrl}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] px-2.5 py-1 rounded-lg border border-gray-700 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-crew-red hover:bg-red-600 text-white font-display text-xs px-4 py-2.5 rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(197,17,17,0.3)]"
            >
              {regenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>REGENERATING...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>REGENERATE QR (INVALIDATE PREVIOUS)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="bg-crew-lime hover:bg-lime-400 text-black font-display text-xs px-4 py-2.5 rounded-xl tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(80,239,57,0.3)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>PROJECTOR FULLSCREEN</span>
            </button>
          </div>

          <p className="text-[10px] font-mono text-gray-500">
            Last rotated: {updatedAt ? new Date(updatedAt).toLocaleString() : 'Initial'}
          </p>
        </div>
      </div>
    </div>
  );
}
