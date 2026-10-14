'use client';

import React, { useState, useEffect } from 'react';
import { Announcement } from '../../../types/announcement';

interface AnnouncementSectionProps {
  onPublishAnnouncement?: (announcement: Announcement) => void;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-01',
    title: 'Round 1 — Random Ideas, Real Solutions',
    message: 'Prepare your problem statement and presentation. Teams must submit their proposed problem and solution within the allotted time.',
    category: 'round_alert',
    round: 'round1',
    isEmergencyAlert: false,
    publishedBy: 'Chief Organizer',
    createdAt: '10:00 AM',
  },
  {
    id: 'ANN-02',
    title: 'Round 3 — Impostor Challenge',
    message: 'Continue developing and refining your prototype. Stay alert, collaborate with your teammates, and be prepared to identify the Impostor during the final reveal.',
    category: 'emergency_meeting',
    round: 'round3',
    isEmergencyAlert: true,
    publishedBy: 'Chief Organizer',
    createdAt: '12:30 PM',
  },
];

export default function AnnouncementSection({ onPublishAnnouncement }: AnnouncementSectionProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('General Information');
  const [message, setMessage] = useState('');
  const [targetRound, setTargetRound] = useState<string>('All Rounds');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('amongu_all_announcements');
      if (stored !== null && stored !== undefined && stored.length > 0) {
        setAnnouncements(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length === 0 || message.trim().length === 0) return;

    let catKey: any = 'general';
    if (category === 'Round Instructions') catKey = 'round_alert';
    if (category === 'Important Update') catKey = 'general';
    if (category === 'Emergency Alert') catKey = 'emergency_meeting';
    if (category === 'Results Announcement') catKey = 'result';

    let rKey: any = 'all';
    if (targetRound.includes('Round 1')) rKey = 'round1';
    if (targetRound.includes('Round 2')) rKey = 'round2';
    if (targetRound.includes('Round 3')) rKey = 'round3';

    const newAnnouncement: Announcement = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      message: message.trim(),
      category: catKey,
      round: rKey,
      isEmergencyAlert: isHighPriority,
      publishedBy: 'Chief Organizer',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);

    try {
      localStorage.setItem('amongu_all_announcements', JSON.stringify(updated));
      localStorage.setItem('amongu_admin_broadcast', `${newAnnouncement.title}: ${newAnnouncement.message}`);
    } catch {
      // ignore
    }

    if (onPublishAnnouncement) {
      onPublishAnnouncement(newAnnouncement);
    }

    setTitle('');
    setMessage('');
    setIsHighPriority(false);
    setSuccessNote('Announcement sent to all participants successfully!');
    setTimeout(() => setSuccessNote(null), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    try {
      localStorage.setItem('amongu_all_announcements', JSON.stringify(updated));
      if (updated.length > 0) {
        localStorage.setItem('amongu_admin_broadcast', `${updated[0].title}: ${updated[0].message}`);
      } else {
        localStorage.removeItem('amongu_admin_broadcast');
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="au-card bg-gray-900/90 border-2 border-crew-yellow/40 p-5 sm:p-6 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(255,204,0,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div>
          <h2 className="font-display text-xl text-white flex items-center gap-2">
            <span>📢</span> ANNOUNCEMENT DISPATCHER
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Share round instructions, important updates, emergency alerts, and results with all participants.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-black/70 border border-gray-800 text-crew-yellow font-bold">
          Active Announcements: {announcements.length}
        </span>
      </div>

      {successNote !== null && (
        <div className="bg-green-950/70 border border-crew-lime text-crew-lime text-xs font-mono font-bold p-3 rounded-xl text-center">
          ✅ {successNote}
        </div>
      )}

      {/* Dispatcher Form */}
      <form onSubmit={handleSend} className="space-y-4 bg-black/50 p-4 rounded-xl border border-gray-800/80">
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              Field 1 — Announcement Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Round 1 Begins — Submit Your Problem Statement"
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-crew-yellow font-sans font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              Field 2 — Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow font-mono"
            >
              <option value="General Information">General Information</option>
              <option value="Round Instructions">Round Instructions</option>
              <option value="Important Update">Important Update</option>
              <option value="Emergency Alert">Emergency Alert</option>
              <option value="Results Announcement">Results Announcement</option>
            </select>
          </div>
        </div>

        {/* Row 2: Message Details */}
        <div>
          <label className="block text-[11px] font-mono text-gray-400 mb-1">
            Field 3 — Message / Details
          </label>
          <textarea
            required
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter the announcement, round guidelines, submission instructions, or result details to share with participants..."
            className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-crew-yellow font-sans"
          />
        </div>

        {/* Row 3: Target Round, High Priority Checkbox, Send Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-gray-800/80">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[11px] font-mono text-gray-400 mr-2">Field 4 — Target Round:</label>
              <select
                value={targetRound}
                onChange={(e) => setTargetRound(e.target.value)}
                className="bg-black border border-gray-800 rounded px-2.5 py-1 text-xs font-mono text-crew-cyan focus:outline-none focus:border-crew-cyan"
              >
                <option value="All Rounds">All Rounds</option>
                <option value="Round 1 — Random Ideas, Real Solutions">Round 1 — Random Ideas, Real Solutions</option>
                <option value="Round 2 — Development Round I">Round 2 — Development Round I</option>
                <option value="Round 3 — Development Round II: Impostor Challenge">Round 3 — Development Round II: Impostor Challenge</option>
                <option value="Final Reveal & Judging">Final Reveal &amp; Judging</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-crew-red font-bold">
              <input
                type="checkbox"
                checked={isHighPriority}
                onChange={(e) => setIsHighPriority(e.target.checked)}
                className="accent-crew-red"
              />
              <span>Mark as High-Priority Announcement</span>
            </label>
          </div>

          <button
            type="submit"
            className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2 px-5 rounded-xl shadow-md flex items-center gap-1.5 font-bold"
          >
            <span>🚀</span> SEND ANNOUNCEMENT
          </button>
        </div>
      </form>

      {/* Recent Announcements */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
          Recent Announcements
        </span>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                item.isEmergencyAlert
                  ? 'bg-red-950/40 border-crew-red/60 text-red-200'
                  : 'bg-black/60 border-gray-800 text-gray-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.isEmergencyAlert && (
                    <span className="text-[10px] bg-crew-red text-white font-bold px-1.5 py-0.2 rounded animate-pulse">
                      HIGH-PRIORITY
                    </span>
                  )}
                  <h4 className="font-display text-sm text-white">{item.title}</h4>
                  <span className="text-[10px] font-mono text-gray-500">[{item.createdAt}]</span>
                </div>
                <p className="text-xs text-gray-300 font-mono leading-relaxed">{item.message}</p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-500 hover:text-crew-red font-mono text-xs px-2 py-1"
                title="Remove Broadcast"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
