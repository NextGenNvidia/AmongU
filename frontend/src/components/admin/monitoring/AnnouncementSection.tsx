'use client';

import React, { useState, useEffect } from 'react';
import { Announcement, AnnouncementCategory } from '../../../types/announcement';

interface AnnouncementSectionProps {
  onPublishAnnouncement?: (announcement: Announcement) => void;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-01',
    title: 'Round 1 Infiltration & System Architecture Launched',
    message: 'All 4-person squads must submit their Problem Statement & PPT link before timer expiry.',
    category: 'round_alert',
    round: 'round1',
    isEmergencyAlert: false,
    publishedBy: 'Lead Organizer',
    createdAt: '10:00 AM',
  },
  {
    id: 'ANN-02',
    title: 'Attention: 15-Minute Architecture Defense Warning',
    message: 'Prepare your presentation decks. Mentors and jury members are entering project rooms.',
    category: 'emergency_meeting',
    round: 'round1',
    isEmergencyAlert: true,
    publishedBy: 'KIET Hackathon Team',
    createdAt: '11:00 AM',
  },
];

export default function AnnouncementSection({ onPublishAnnouncement }: AnnouncementSectionProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const [targetRound, setTargetRound] = useState<'all' | 'round1' | 'round2' | 'round3'>('all');
  const [isEmergency, setIsEmergency] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length === 0 || message.trim().length === 0) return;

    const newAnnouncement: Announcement = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      message: message.trim(),
      category,
      round: targetRound,
      isEmergencyAlert: isEmergency,
      publishedBy: 'Admin Command',
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
    setIsEmergency(false);
    setSuccessMsg('Announcement dispatched to all candidate dashboards!');
    setTimeout(() => setSuccessMsg(null), 3000);
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
    <div className="au-card bg-gray-900/90 border-2 border-crew-yellow/40 p-5 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(255,204,0,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="font-display text-lg text-white">ANNOUNCEMENT DISPATCHER</h3>
            <p className="text-xs text-gray-400 font-mono">Convey relevant round guidelines, emergency alerts, and results to participants</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/60 border border-gray-800 text-crew-yellow">
          {announcements.length} Active Broadcasts
        </span>
      </div>

      {successMsg !== null && (
        <div className="bg-green-950/70 border border-crew-lime text-crew-lime text-xs font-mono font-bold p-2.5 rounded-xl text-center">
          ✅ {successMsg}
        </div>
      )}

      {/* Broadcast Composer */}
      <form onSubmit={handlePublish} className="space-y-3 bg-black/40 p-4 rounded-xl border border-gray-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono text-gray-400 mb-1">ANNOUNCEMENT TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Round 1 Results Declared / Emergency Meeting Called"
              className="w-full bg-black/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-crew-yellow font-sans font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
              className="w-full bg-black/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow font-mono"
            >
              <option value="general">General Info</option>
              <option value="round_alert">Round Alert</option>
              <option value="emergency_meeting">🚨 Emergency Meeting</option>
              <option value="result">🏆 Hackathon Result</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-gray-400 mb-1">MESSAGE / RESULT DETAILS</label>
          <textarea
            required
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write transmission text to convey relevant info, judging criteria, or round outcomes to all squad terminals..."
            className="w-full bg-black/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-crew-yellow font-sans"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-gray-400">Target Round:</label>
              <select
                value={targetRound}
                onChange={(e) => setTargetRound(e.target.value as any)}
                className="bg-black border border-gray-800 rounded px-2 py-1 text-[11px] font-mono text-crew-cyan"
              >
                <option value="all">All Rounds</option>
                <option value="round1">Round 1</option>
                <option value="round2">Round 2</option>
                <option value="round3">Round 3</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-crew-red font-bold">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="accent-crew-red"
              />
              <span>High-Priority Emergency Banner</span>
            </label>
          </div>

          <button
            type="submit"
            className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2 px-5 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <span>🚀</span> TRANSMIT TO PARTICIPANTS
          </button>
        </div>
      </form>

      {/* Broadcast History Ticker */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
          Recent Event Broadcasts
        </span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                item.isEmergencyAlert
                  ? 'bg-red-950/40 border-crew-red/60 text-red-200'
                  : item.category === 'result'
                  ? 'bg-yellow-950/30 border-crew-yellow/50 text-yellow-200'
                  : 'bg-black/50 border-gray-800 text-gray-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.isEmergencyAlert && (
                    <span className="text-[10px] bg-crew-red text-white font-bold px-1.5 py-0.2 rounded animate-pulse">
                      EMERGENCY
                    </span>
                  )}
                  {item.category === 'result' && (
                    <span className="text-[10px] bg-crew-yellow text-black font-bold px-1.5 py-0.2 rounded">
                      RESULT
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
                title="Revoke Announcement"
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
