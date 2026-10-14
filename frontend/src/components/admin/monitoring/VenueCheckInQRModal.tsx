'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { registrationService } from '../../../services/registration.service';

interface VenueCheckInQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentCount: number;
  totalRegistered: number;
  onCandidateCheckInSuccess?: () => void;
}

export default function VenueCheckInQRModal({
  isOpen,
  onClose,
  presentCount,
  totalRegistered,
  onCandidateCheckInSuccess,
}: VenueCheckInQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [checkInUrl, setCheckInUrl] = useState<string>('');
  const [manualIdInput, setManualIdInput] = useState<string>('');
  const [manualSubmitting, setManualSubmitting] = useState<boolean>(false);
  const [manualMessage, setManualMessage] = useState<{ text: string; error: boolean } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/checkin`;
      setCheckInUrl(url);

      QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: '#05070f',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((urlData) => {
          setQrDataUrl(urlData);
        })
        .catch((err) => {
          console.error('Failed to generate check-in QR code:', err);
        });
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'amongu-venue-checkin-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleManualDeskCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;

    setManualSubmitting(true);
    setManualMessage(null);

    const inputVal = manualIdInput.trim();
    const payload = inputVal.includes('@') ? { email: inputVal } : { collegeId: inputVal };

    try {
      const res = await registrationService.venueCheckIn(payload);

      if (res.success) {
        setManualMessage({
          text: res.alreadyCheckedIn
            ? `⚠️ ${res.registration?.name || inputVal} is already marked present!`
            : `✅ Marked present: ${res.registration?.name || inputVal}!`,
          error: false,
        });
        setManualIdInput('');
        if (onCandidateCheckInSuccess) onCandidateCheckInSuccess();
      } else {
        setManualMessage({
          text: res.message || 'Check-in failed. Please verify student ID.',
          error: true,
        });
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setManualMessage({
          text: err.response.data.message,
          error: true,
        });
      } else {
        // Fallback for standalone / local dev mode
        let attMap: Record<string, boolean> = {};
        try {
          const mapRaw = localStorage.getItem('amongu_attendance_map');
          if (mapRaw) attMap = JSON.parse(mapRaw);
        } catch {}

        const wasPresent = Boolean(attMap[inputVal]);
        attMap[inputVal] = true;
        localStorage.setItem('amongu_attendance_map', JSON.stringify(attMap));

        // Sync with local user ticket if matching
        try {
          const ticketRaw = localStorage.getItem('amongu_user_ticket');
          if (ticketRaw) {
            const ticket = JSON.parse(ticketRaw);
            if (ticket.collegeId === inputVal || ticket.email === inputVal) {
              ticket.isPresent = true;
              localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
            }
          }
        } catch {}

        setManualMessage({
          text: wasPresent
            ? `⚠️ ID ${inputVal} is already marked present!`
            : `✅ Marked present: Student ID ${inputVal}!`,
          error: false,
        });
        setManualIdInput('');
        if (onCandidateCheckInSuccess) onCandidateCheckInSuccess();
      }
    } finally {
      setManualSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto ${
        isFullscreen ? 'p-0' : ''
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFullscreen) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`bg-gray-950 border-2 border-crew-lime/60 rounded-3xl shadow-[0_0_60px_rgba(50,205,50,0.25)] flex flex-col transition-all overflow-hidden ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-none p-6 sm:p-12 justify-center items-center'
            : 'w-full max-w-2xl max-h-[92vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-gray-900/60 w-full">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-crew-lime animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-lime bg-crew-lime/10 px-2 py-0.5 rounded border border-crew-lime/30">
                  VENUE GATE SYSTEM
                </span>
                <span className="text-xs font-mono text-gray-400">AMONGU 2026</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-white font-bold tracking-tight mt-0.5">
                Venue Attendance Check-In QR
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono font-bold transition-all border border-gray-700 flex items-center gap-1.5"
              title="Toggle Projector Mode"
            >
              <span>{isFullscreen ? '🗗 EXIT FULLSCREEN' : '🖥️ PROJECTOR MODE'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 flex items-center justify-center font-bold text-lg transition-colors border border-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 w-full flex flex-col items-center ${isFullscreen ? 'justify-center max-w-4xl' : ''}`}>
          {/* Quick HUD Count */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Registered</span>
              <span className="font-display text-2xl text-white font-bold">{totalRegistered}</span>
            </div>
            <div className="bg-gray-900/80 border border-crew-lime/40 rounded-2xl p-3 text-center shadow-[0_0_15px_rgba(50,205,50,0.15)]">
              <span className="text-[10px] font-mono text-crew-lime uppercase tracking-wider block">Checked In (Present)</span>
              <span className="font-display text-2xl text-crew-lime font-bold">{presentCount}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-gray-900/80 border border-crew-cyan/40 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-mono text-crew-cyan uppercase tracking-wider block">Attendance Turnout</span>
              <span className="font-display text-2xl text-crew-cyan font-bold">
                {totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative p-5 bg-white rounded-3xl shadow-[0_0_50px_rgba(50,205,50,0.3)] border-4 border-crew-lime flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="AmongU Venue Attendance QR Code"
                className={`${isFullscreen ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-64 h-64 sm:w-72 sm:h-72'} rounded-xl object-contain`}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-gray-400 font-mono text-sm">
                Generating QR...
              </div>
            )}
            <div className="mt-2 text-center">
              <p className="text-black font-mono font-extrabold text-sm sm:text-base tracking-wider uppercase">
                SCAN TO MARK ATTENDANCE
              </p>
              <p className="text-gray-600 font-mono text-[11px]">
                KIET University Venue Entrance
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            <button
              onClick={handleDownloadQr}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 hover:border-crew-lime/50"
            >
              <span>📥 DOWNLOAD POSTER PNG</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 hover:border-crew-cyan/50"
            >
              <span>{copied ? '✅ COPIED URL!' : '🔗 COPY PORTAL LINK'}</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-5 w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-300">
            <div className="text-crew-lime font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>💡 HOW APPLICANTS CHECK IN:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
              <li>Applicants scan this QR code with their phone camera or Google Lens.</li>
              <li>Redirects directly to <span className="text-crew-cyan underline">{checkInUrl || '/checkin'}</span>.</li>
              <li>Participant inputs their College ID / KIET Email (or auto-detects their logged-in account).</li>
              <li>System validates payment status and marks presence instantly in this Monitoring Panel.</li>
              <li>Present participants become immediately eligible for 4-member random team formation.</li>
            </ol>
          </div>

          {/* Quick Manual Desk Check-in */}
          {!isFullscreen && (
            <div className="mt-4 w-full bg-gray-900/40 border border-gray-800/80 rounded-2xl p-3.5">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2 font-bold">
                ⚡ DESK BACKUP: MANUAL CANDIDATE CHECK-IN
              </span>
              <form onSubmit={handleManualDeskCheckIn} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Student College ID / KIET Email"
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-800 focus:border-crew-lime rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={manualSubmitting || !manualIdInput.trim()}
                  className="px-4 py-2 bg-crew-lime/20 hover:bg-crew-lime border border-crew-lime text-crew-lime hover:text-black rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
                >
                  {manualSubmitting ? 'VERIFYING...' : 'CHECK IN'}
                </button>
              </form>
              {manualMessage && (
                <p className={`mt-2 text-xs font-mono ${manualMessage.error ? 'text-red-400' : 'text-crew-lime'}`}>
                  {manualMessage.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
