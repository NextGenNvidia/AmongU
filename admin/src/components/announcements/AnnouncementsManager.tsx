'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AnnouncementRecord } from '../../types';

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'round_alert' | 'emergency_meeting' | 'result'>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [authorName, setAuthorName] = useState('Mission HQ Admin');

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnnouncements();
      if (res && res.data) {
        setAnnouncements(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
      setFeedback({
        message: err?.response?.data?.message || 'Failed to fetch announcements',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ message: 'Title and announcement content are required', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await adminService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        authorName: authorName.trim() || 'Mission HQ Admin',
        isPinned,
      });

      setFeedback({ message: res.message || '🎉 Announcement broadcasted live!', type: 'success' });
      setTitle('');
      setContent('');
      setIsPinned(false);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Failed to broadcast announcement:', err);
      setFeedback({
        message: err?.response?.data?.message || 'Failed to publish announcement',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transmission permanently?')) return;

    try {
      setDeletingId(id);
      await adminService.deleteAnnouncement(id);
      setFeedback({ message: 'Announcement deleted successfully', type: 'success' });
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      console.error('Failed to delete announcement:', err);
      setFeedback({
        message: err?.response?.data?.message || 'Failed to delete announcement',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'emergency_meeting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/90 text-crew-red border border-crew-red/60 uppercase">
            🚨 EMERGENCY MEETING
          </span>
        );
      case 'round_alert':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-950/90 text-crew-yellow border border-crew-yellow/60 uppercase">
            ⚡ ROUND ALERT
          </span>
        );
      case 'result':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-green-950/90 text-crew-lime border border-crew-lime/60 uppercase">
            🏆 RESULTS & STANDINGS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/90 text-crew-cyan border border-crew-cyan/60 uppercase">
            📢 GENERAL TRANSMISSION
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-black border-2 border-gray-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-crew-cyan animate-pulse"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-crew-cyan font-bold">
                COMMUNICATION DISPATCH TERMINAL
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-white tracking-wider">
              OFFICIAL TRANSMISSIONS &amp; ANNOUNCEMENTS
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
              Broadcast high-priority communications directly to all registered cadets. Transmissions immediately appear on the Cadet Command Deck and Announcement Board.
            </p>
          </div>
          <button
            onClick={loadAnnouncements}
            disabled={loading}
            className="self-start sm:self-auto au-btn bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-gray-700"
          >
            <span>{loading ? 'Refreshing...' : 'Refresh Feed 🔄'}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl font-mono text-xs sm:text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
              : 'bg-red-950/80 border-red-500/60 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white ml-4 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Composer Form & Live Transmissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create Announcement (5 cols) */}
        <div className="lg:col-span-5 bg-gray-900/90 border-2 border-gray-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-gray-800 pb-3 flex items-center gap-2">
            <span className="text-lg">📡</span>
            <h2 className="font-display text-lg text-white tracking-wide">BROADCAST NEW TRANSMISSION</h2>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-crew-cyan font-mono text-xs font-bold mb-1.5 uppercase">
                Transmission Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Round 1 Sabotage Tasks Open!"
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-crew-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-crew-cyan font-mono text-xs font-bold mb-1.5 uppercase">
                Category / Protocol
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm cursor-pointer"
              >
                <option value="general">📢 General Transmission</option>
                <option value="emergency_meeting">🚨 Emergency Meeting (Urgent)</option>
                <option value="round_alert">⚡ Round Alert / Phase Shift</option>
                <option value="result">🏆 Results &amp; Leaderboard</option>
              </select>
            </div>

            <div>
              <label className="block text-crew-cyan font-mono text-xs font-bold mb-1.5 uppercase">
                Author Tag
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. NextGen CoE Leads"
                className="w-full bg-black au-border rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-crew-cyan text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-crew-cyan font-mono text-xs font-bold mb-1.5 uppercase">
                Transmission Message / Briefing *
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter detailed instructions, timings, room locations, or task updates..."
                className="w-full bg-black au-border rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-crew-cyan text-sm leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pin_checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded bg-black border-gray-700 text-crew-red focus:ring-crew-red cursor-pointer"
              />
              <label htmlFor="pin_checkbox" className="text-xs font-mono text-gray-300 cursor-pointer select-none">
                📌 Pin this transmission to the top of the feed
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full au-btn bg-crew-red hover:bg-red-600 text-white font-display py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,17,17,0.4)] transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              <span>{submitting ? 'Broadcasting...' : 'TRANSMIT BROADCAST 📡'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Announcements Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-display text-lg text-white flex items-center gap-2">
              <span>ACTIVE TRANSMISSIONS</span>
              <span className="text-xs bg-gray-800 text-crew-cyan px-2 py-0.5 rounded-full font-mono">
                {announcements.length}
              </span>
            </h2>
            <span className="text-xs font-mono text-gray-500">Newest first</span>
          </div>

          {loading ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-12 text-center text-gray-400 font-mono text-sm">
              <div className="w-8 h-8 border-2 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading live transmissions...
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-12 text-center space-y-3">
              <div className="text-4xl">📡</div>
              <p className="font-display text-lg text-gray-300">NO TRANSMISSIONS BROADCASTED YET</p>
              <p className="text-xs font-mono text-gray-500 max-w-sm mx-auto">
                Use the transmission console on the left to broadcast your first announcement to all registered cadets.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  className={`bg-gray-950/90 border-2 rounded-2xl p-5 sm:p-6 transition-all shadow-lg ${
                    ann.isPinned
                      ? 'border-crew-cyan/60 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-gradient-to-b from-cyan-950/20 to-gray-950'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Top Bar: Badges & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(ann.category)}
                      {ann.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-crew-cyan/20 text-crew-cyan border border-crew-cyan/40">
                          📌 PINNED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-gray-500">
                        {new Date(ann.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        disabled={deletingId === ann._id}
                        title="Delete transmission"
                        className="text-gray-500 hover:text-crew-red transition-colors text-xs font-mono p-1 rounded hover:bg-gray-900 cursor-pointer"
                      >
                        {deletingId === ann._id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-display text-lg text-white tracking-wide mb-1.5">{ann.title}</h3>
                  <p className="text-[11px] font-mono text-crew-cyan/80 mb-3">
                    Transmitted by: <span className="text-gray-300 font-bold">{ann.authorName}</span>
                  </p>

                  {/* Body Content */}
                  <p className="text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-line border-t border-gray-800/80 pt-3">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
