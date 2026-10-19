'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api';
import { Announcement, AnnouncementCategory } from '../../types/announcement';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';

export default function AnnouncementsPage() {
  const { firebaseUser, isRegistered, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/announcements');
      if (res.data && res.data.data) {
        setAnnouncements(res.data.data);
      }
    } catch (err: any) {
      console.warn('Failed to fetch announcements from backend:', err.message);
      // Fallback to localStorage broadcast if offline
      const broadcastStored = typeof window !== 'undefined' ? localStorage.getItem('amongu_admin_broadcast') : null;
      if (broadcastStored) {
        setAnnouncements([
          {
            _id: 'local_broadcast',
            title: 'MISSION TRANSMISSION BROADCAST',
            content: broadcastStored,
            category: 'emergency_meeting',
            authorName: 'Mission Control HQ',
            isPinned: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((ann) => {
    if (filterCategory !== 'all' && ann.category !== filterCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = ann.title?.toLowerCase().includes(q);
    const contentMatch = (ann.content || ann.message || '')?.toLowerCase().includes(q);
    return titleMatch || contentMatch;
  });

  const getCategoryBadge = (cat: AnnouncementCategory | string) => {
    switch (cat) {
      case 'emergency_meeting':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/90 text-crew-red border border-crew-red/60 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2 h-2 rounded-full bg-crew-red animate-ping" />
            EMERGENCY MEETING
          </span>
        );
      case 'round_alert':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-yellow-950/90 text-crew-yellow border border-crew-yellow/60 flex items-center gap-1.5">
            ⚡ ROUND ALERT
          </span>
        );
      case 'result':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-green-950/90 text-crew-lime border border-crew-lime/60 flex items-center gap-1.5">
            🏆 RESULTS &amp; STANDINGS
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/90 text-crew-cyan border border-crew-cyan/60 flex items-center gap-1.5">
            📢 MISSION BRIEFING
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-100 font-sans selection:bg-crew-cyan selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b-2 border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
            <span className="text-crew-red font-black">AMONG</span>
            <span>U</span>
            <span className="text-[10px] bg-cyan-950/90 text-crew-cyan border border-crew-cyan/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-widest hidden sm:inline-block">
              TRANSMISSIONS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-mono text-crew-cyan hover:text-white transition-colors bg-gray-900 border border-gray-700 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <span>← Command Deck</span>
            </Link>
            <Link
              href="/squad"
              className="text-xs sm:text-sm font-mono text-gray-300 hover:text-white transition-colors bg-gray-900 border border-gray-800 hover:border-gray-700 px-3.5 py-1.5 rounded-xl hidden sm:inline-block"
            >
              View Squad 👥
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-red-950/50 via-gray-900 to-black border-2 border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-crew-cyan animate-pulse"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-crew-cyan font-bold">
                CADET TRANSMISSION FEED
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-white tracking-wider">
              OFFICIAL ANNOUNCEMENTS
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Live broadcast feed from Mission Control &amp; NextGen Supercomputing Club coordinators. Keep this tab open during the hackathon for emergency meeting protocols, room allocation updates, and round alerts.
            </p>
          </div>
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-crew-cyan text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Transmissions ({announcements.length})
            </button>
            <button
              onClick={() => setFilterCategory('emergency_meeting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                filterCategory === 'emergency_meeting'
                  ? 'bg-crew-red text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🚨 Emergency
            </button>
            <button
              onClick={() => setFilterCategory('round_alert')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                filterCategory === 'round_alert'
                  ? 'bg-crew-yellow text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚡ Round Alerts
            </button>
            <button
              onClick={() => setFilterCategory('result')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                filterCategory === 'result'
                  ? 'bg-crew-lime text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🏆 Results
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="bg-gray-950/80 border border-gray-800 rounded-2xl px-4 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan w-full sm:w-64"
            />
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-display text-lg text-crew-cyan tracking-wide">CONNECTING TO MISSION BROADCAST...</p>
            <p className="text-xs font-mono text-gray-500">Retrieving transmissions from central database</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-gray-900/60 border-2 border-gray-800 rounded-3xl p-16 text-center space-y-4">
            <div className="text-5xl">📡</div>
            <h3 className="font-display text-xl text-white">ALL RADIO CHANNELS CLEAR</h3>
            <p className="text-xs font-mono text-gray-400 max-w-md mx-auto">
              No transmissions match your criteria at this moment. Coordinates and updates will be broadcasted by coordinators before each round begins.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAnnouncements.map((ann) => {
              const isPinned = Boolean(ann.isPinned);
              return (
                <div
                  key={ann._id || ann.id}
                  className={`au-card bg-gray-900/90 border-2 rounded-3xl p-6 sm:p-8 space-y-4 transition-all shadow-xl relative overflow-hidden ${
                    isPinned
                      ? 'border-crew-cyan/70 shadow-[0_0_35px_rgba(6,182,212,0.18)] bg-gradient-to-b from-cyan-950/20 via-gray-900 to-black'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Top Details */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(ann.category)}
                      {isPinned && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-crew-cyan border border-crew-cyan/50">
                          📌 PINNED PROTOCOL
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      {new Date(ann.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl text-white tracking-wide">
                      {ann.title}
                    </h2>
                    <p className="text-xs font-mono text-crew-cyan/90 mt-1">
                      Author: <span className="text-gray-300 font-bold">{ann.authorName || ann.publishedBy || 'Mission HQ'}</span>
                    </p>
                  </div>

                  {/* Content */}
                  <div className="border-t border-gray-800/80 pt-4">
                    <MarkdownRenderer content={ann.content || ann.message || ''} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
