'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';

export default function EventSettings() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [eventTitle, setEventTitle] = useState('AmongU Hackathon');
  const [eventStartDate, setEventStartDate] = useState('2026-10-28T09:00');
  const [venue, setVenue] = useState('KIET Deemed to be University');
  const [prizePool, setPrizePool] = useState('₹10,000');
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Live Countdown Preview State
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  // Fetch current config
  const fetchConfig = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await adminService.getEventConfig();
      if (res && res.config) {
        setEventTitle(res.config.eventTitle || 'AmongU Hackathon');
        // Convert to YYYY-MM-DDTHH:mm format for datetime-local input
        if (res.config.eventStartDate) {
          const raw = res.config.eventStartDate;
          // If includes time offset e.g. 2026-10-28T09:00:00+05:30 -> slice to 16 chars: 2026-10-28T09:00
          setEventStartDate(raw.slice(0, 16));
        }
        setVenue(res.config.venue || 'KIET Deemed to be University');
        setPrizePool(res.config.prizePool || '₹10,000');
        setRegistrationOpen(res.config.registrationOpen !== false);
      }
    } catch (err: any) {
      console.error('Error fetching event config in admin:', err);
      setErrorMsg('Failed to fetch event settings. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update live countdown preview whenever eventStartDate changes
  useEffect(() => {
    const calculateCountdown = () => {
      try {
        const target = new Date(`${eventStartDate}:00+05:30`).getTime();
        const diff = target - Date.now();
        if (diff <= 0) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        } else {
          setCountdown({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            isPast: false,
          });
        }
      } catch {
        // Ignore parsing errors
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventStartDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      // Store in ISO format with +05:30 IST timezone
      const formattedStartDate = `${eventStartDate}:00+05:30`;

      const res = await adminService.updateEventConfig({
        eventTitle,
        eventStartDate: formattedStartDate,
        venue,
        prizePool,
        registrationOpen,
      });

      if (res && res.success) {
        setSuccessMsg('✅ Event schedule and configuration successfully saved! Timers are updated across landing page and dashboard.');
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      console.error('Error saving event config:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update event configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-crew-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-white tracking-wide flex items-center gap-2">
            <span>⚙️</span> EVENT SCHEDULE &amp; TIMING
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
            Configure the launch date, start time, venue, and live countdown timer broadcasted to all cadets.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchConfig}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white hover:border-crew-cyan transition-all flex items-center gap-1.5"
        >
          <span>↻</span> Refresh Config
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-950/80 border-2 border-crew-lime text-green-200 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <span>🎉</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-crew-red text-red-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Countdown Preview Card */}
      <div className="bg-black/80 border-2 border-crew-cyan rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(56,254,220,0.2)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-crew-cyan font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping" />
            <span>LIVE CADET COUNTDOWN PREVIEW</span>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            Target: {eventStartDate.replace('T', ' ')} IST
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3">
            <div className="font-mono text-2xl sm:text-4xl font-black text-crew-lime">{countdown.days}</div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 uppercase mt-1">Days</div>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3">
            <div className="font-mono text-2xl sm:text-4xl font-black text-white">{countdown.hours.toString().padStart(2, '0')}</div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 uppercase mt-1">Hours</div>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3">
            <div className="font-mono text-2xl sm:text-4xl font-black text-crew-cyan">{countdown.minutes.toString().padStart(2, '0')}</div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 uppercase mt-1">Mins</div>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3">
            <div className="font-mono text-2xl sm:text-4xl font-black text-crew-yellow">{countdown.seconds.toString().padStart(2, '0')}</div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 uppercase mt-1">Secs</div>
          </div>
        </div>

        {countdown.isPast && (
          <div className="mt-3 text-center text-xs font-mono font-bold text-crew-lime bg-green-950/50 py-1.5 rounded-xl border border-crew-lime/30">
            🚀 The scheduled start time has passed. The event is live!
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Starting Date & Time */}
          <div className="md:col-span-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-crew-lime mb-2 flex items-center justify-between">
              <span>📅 Event Starting Date &amp; Time (IST)</span>
              <span className="text-[10px] text-gray-400">Controls All Live Timers</span>
            </label>
            <input
              type="datetime-local"
              required
              value={eventStartDate}
              onChange={(e) => setEventStartDate(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 focus:border-crew-lime rounded-2xl px-4 py-3 text-white font-mono text-sm sm:text-base outline-none transition-colors"
            />
            <p className="text-[11px] font-mono text-gray-400 mt-2">
              💡 The landing page Hero and Cadet Mission Dashboard will immediately count down to this exact date and time.
            </p>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Event Title
            </label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-black border border-gray-700 focus:border-crew-cyan rounded-2xl px-4 py-3 text-white font-mono text-sm outline-none transition-colors"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Official Venue
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-black border border-gray-700 focus:border-crew-cyan rounded-2xl px-4 py-3 text-white font-mono text-sm outline-none transition-colors"
            />
          </div>

          {/* Prize Pool */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Total Prize Pool
            </label>
            <input
              type="text"
              required
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              className="w-full bg-black border border-gray-700 focus:border-crew-cyan rounded-2xl px-4 py-3 text-white font-mono text-sm outline-none transition-colors"
            />
          </div>

          {/* Registration Status Toggle */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Cadet Registration Gate
            </label>
            <div className="flex items-center gap-3 pt-1.5">
              <button
                type="button"
                onClick={() => setRegistrationOpen(!registrationOpen)}
                className={`w-14 h-8 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                  registrationOpen ? 'bg-crew-lime justify-end' : 'bg-gray-800 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-black shadow-md" />
              </button>
              <span className="font-mono text-xs font-bold text-white">
                {registrationOpen ? 'OPEN (Accepting Cadets)' : 'CLOSED (Registration Locked)'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-crew-lime hover:bg-green-400 text-black font-display text-sm tracking-wider shadow-[0_0_20px_rgba(80,239,57,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>SAVING SETTINGS...</span>
              </>
            ) : (
              <span>SAVE EVENT SCHEDULE &amp; TIMING →</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
