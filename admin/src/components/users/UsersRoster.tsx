'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { LoggedInUserRecord } from '../../types';
import { adminService } from '../../services/admin.service';

interface UsersRosterProps {
  users: LoggedInUserRecord[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function UsersRoster({
  users,
  loading,
  error,
  onRefresh,
}: UsersRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'registered' | 'pending' | 'blocked'>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 24-Hour Reminder Transmission State
  const [reminderStatus, setReminderStatus] = useState<{
    lastReminderSentAt: string | null;
    lastReminderSentCount: number;
    totalUnpaidCadets?: number;
    remindersEnabled?: boolean;
  } | null>(null);
  const [dispatchingReminders, setDispatchingReminders] = useState<boolean>(false);
  const [togglingReminders, setTogglingReminders] = useState<boolean>(false);

  // User currently selected for deletion modal
  const [userToDelete, setUserToDelete] = useState<LoggedInUserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // User currently having their block status toggled
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Stats calculation
  const totalCount = users.length;
  const registeredCount = useMemo(() => users.filter((u) => u.hasRegistered).length, [users]);
  const pendingCount = totalCount - registeredCount;
  const blockedCount = useMemo(() => users.filter((u) => u.isBlocked).length, [users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Tab filter
      if (filterTab === 'registered' && !user.hasRegistered) return false;
      if (filterTab === 'pending' && user.hasRegistered) return false;
      if (filterTab === 'blocked' && !user.isBlocked) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = user.name?.toLowerCase().includes(q);
      const matchEmail = user.email?.toLowerCase().includes(q);
      const matchCollegeId = user.registration?.collegeId?.toLowerCase().includes(q);
      const matchPhone = user.registration?.phone?.includes(q);
      const matchTrack = user.registration?.track?.toLowerCase().includes(q);

      return Boolean(matchName || matchEmail || matchCollegeId || matchPhone || matchTrack);
    });
  }, [users, filterTab, searchQuery]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadReminderStatus = async () => {
    try {
      const res = await adminService.getReminderStatus();
      if (res && res.data) {
        setReminderStatus(res.data);
      }
    } catch (err: any) {
      console.warn('Could not load reminder status:', err.message);
    }
  };

  useEffect(() => {
    loadReminderStatus();
  }, [users]);

  const handleManualTriggerReminders = async () => {
    if (dispatchingReminders) return;
    try {
      setDispatchingReminders(true);
      const res = await adminService.triggerManualReminders();
      showToast(res.message || '24-hour reminder transmission complete!', 'success');
      await Promise.all([loadReminderStatus(), onRefresh()]);
    } catch (err: any) {
      console.error('Manual reminder dispatch error:', err);
      showToast(err?.response?.data?.message || 'Failed to dispatch reminders', 'error');
    } finally {
      setDispatchingReminders(false);
    }
  };

  const handleToggleReminders = async () => {
    if (togglingReminders) return;
    const nextState = !reminderStatus?.remindersEnabled;
    try {
      setTogglingReminders(true);
      const res = await adminService.toggleReminders(nextState);
      showToast(res.message || (nextState ? '24-Hour reminders enabled!' : '24-Hour reminders stopped!'), 'success');
      await loadReminderStatus();
    } catch (err: any) {
      console.error('Toggle reminder error:', err);
      showToast(err?.response?.data?.message || 'Failed to update reminder engine state', 'error');
    } finally {
      setTogglingReminders(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied ${label} to clipboard`);
    }
  };

  const handleToggleBlock = async (user: LoggedInUserRecord) => {
    try {
      setActionLoadingId(user.id);
      const res = await adminService.toggleBlockUser(user.id);
      showToast(res.message || (res.isBlocked ? 'User blocked successfully' : 'User unblocked successfully'));
      onRefresh();
    } catch (err: any) {
      console.error('Error toggling block status:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update block status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await adminService.deleteUser(userToDelete.id);
      showToast(res.message || 'Cadet account completely purged from MongoDB and Firebase Auth.');
      setUserToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setDeleteError(err?.response?.data?.message || err?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimestamp = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 ${
            feedback.type === 'error'
              ? 'bg-red-950/95 border-red-500 text-red-200'
              : 'bg-black/95 border-crew-cyan text-crew-cyan'
          }`}
        >
          {feedback.type === 'error' ? (
            <svg className="w-5 h-5 text-crew-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-crew-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-xs font-mono font-bold">{feedback.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-cyan bg-cyan-950/60 border border-crew-cyan/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crew-cyan animate-pulse" />
              USER DIRECTORY
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">LOGGED-IN USERS</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">
            Real-time roster of all students who have authenticated with their official KIET Google Account.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="au-btn bg-gray-800 hover:bg-gray-700 text-crew-cyan hover:text-white font-display text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-gray-700 flex items-center gap-2 transition-all cursor-pointer"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'SYNCING...' : 'REFRESH ROSTER'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logged-in */}
        <div className="au-card bg-gray-900/80 border-2 border-gray-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Total Logged-in</p>
              <p className="font-display text-4xl text-white mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-crew-cyan/10 border border-crew-cyan/30 flex items-center justify-center text-crew-cyan">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 font-mono">
            Authenticated via Google OAuth (@kiet.edu)
          </p>
        </div>

        {/* Confirmed Registered */}
        <div className="au-card bg-gray-900/80 border-2 border-green-900/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">Confirmed (INR 55 Paid)</p>
              <p className="font-display text-4xl text-crew-lime mt-1">{registeredCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-crew-lime/10 border border-crew-lime/30 flex items-center justify-center text-crew-lime">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 font-mono">
            Fully registered cadets with secured seats
          </p>
        </div>

        {/* Pending Registration */}
        <div className="au-card bg-gray-900/80 border-2 border-yellow-900/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">Registration Pending</p>
              <p className="font-display text-4xl text-crew-yellow mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-crew-yellow/10 border border-crew-yellow/30 flex items-center justify-center text-crew-yellow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 font-mono">
            Signed in but haven&apos;t finished registration
          </p>
        </div>

        {/* Blocked Accounts */}
        <div className="au-card bg-gray-900/80 border-2 border-red-900/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">Blocked / Suspended</p>
              <p className="font-display text-4xl text-crew-red mt-1">{blockedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-crew-red">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 font-mono">
            Accounts banned from logging in
          </p>
        </div>
      </div>

      {/* 24-Hour Automated Reminder Command Deck */}
      <div className="bg-gradient-to-r from-red-950/40 via-gray-900 to-black border-2 border-red-900/60 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${reminderStatus?.remindersEnabled ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-crew-red">
                24-HOUR AUTOMATED REMINDER ENGINE
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                reminderStatus?.remindersEnabled
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                  : 'bg-red-950/80 text-red-300 border-red-500/50'
              }`}>
                {reminderStatus?.remindersEnabled ? '● ACTIVE / RUNNING' : '■ STOPPED / PAUSED'}
              </span>
            </div>
            <h3 className="font-display text-xl text-white">
              UNPAID CADET RETENTION PROTOCOL
            </h3>
            <p className="text-xs text-gray-300 font-sans max-w-2xl leading-relaxed">
              Every cadet who authenticates is automatically tracked. If their ₹55 clearance is unpaid after 24 hours, an emergency reminder is dispatched.
              {reminderStatus?.remindersEnabled ? (
                <span className="text-emerald-400 block mt-1 font-mono text-[11px]">
                  ✓ Automated hourly scanner is active and checking for 24-hour milestones.
                </span>
              ) : (
                <span className="text-amber-400 block mt-1 font-mono text-[11px]">
                  ⏸️ Automated 24-hour reminder engine is currently STOPPED. No reminder emails will be dispatched.
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 pt-1">
              <span>
                ⏰ Last Broadcast:{' '}
                <strong className="text-crew-cyan">
                  {reminderStatus?.lastReminderSentAt
                    ? `${formatTimestamp(reminderStatus.lastReminderSentAt)} (${reminderStatus.lastReminderSentCount || 0} sent)`
                    : 'Scheduled on startup / Pending run'}
                </strong>
              </span>
              <span>•</span>
              <span>
                👥 Pending Unpaid Cadets:{' '}
                <strong className="text-crew-yellow">{pendingCount}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
            {/* STOP / RESUME OPTION */}
            <button
              type="button"
              onClick={handleToggleReminders}
              disabled={togglingReminders}
              className={`au-btn font-display text-xs sm:text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-bold ${
                reminderStatus?.remindersEnabled
                  ? 'bg-red-950/90 hover:bg-red-900 text-red-200 border-2 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border-2 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              <span>
                {togglingReminders
                  ? 'UPDATING...'
                  : reminderStatus?.remindersEnabled
                  ? '🛑 STOP 24-HR REMINDERS'
                  : '▶️ RESUME 24-HR REMINDERS'}
              </span>
            </button>

            {/* MANUAL DISPATCH */}
            <button
              type="button"
              onClick={handleManualTriggerReminders}
              disabled={dispatchingReminders || pendingCount === 0 || !reminderStatus?.remindersEnabled}
              className="au-btn bg-crew-red hover:bg-red-600 disabled:opacity-40 text-white font-display text-xs sm:text-sm py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(197,17,17,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer font-bold"
              title={!reminderStatus?.remindersEnabled ? '24-hour reminder engine is stopped' : ''}
            >
              <svg className={`w-4 h-4 ${dispatchingReminders ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{dispatchingReminders ? 'DISPATCHING TRANSMISSIONS...' : 'SEND 24-HR REMINDERS NOW 🚀'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-900/90 border border-gray-800 p-3 rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by cadet name, email, college ID, track, phone..."
            className="w-full bg-black/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan font-mono"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-gray-800 flex-wrap">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-crew-cyan text-black font-mono font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterTab('registered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'registered'
                ? 'bg-crew-lime text-black font-mono font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Registered ({registeredCount})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-crew-yellow text-black font-mono font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab('blocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'blocked'
                ? 'bg-crew-red text-white font-mono font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Blocked ({blockedCount})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-sm font-bold p-4 rounded-xl text-center flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-crew-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Roster Table */}
      <div className="au-card bg-gray-900/90 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-display text-lg text-crew-cyan">FETCHING LOGGED-IN USERS...</p>
            <p className="text-gray-400 text-xs font-mono mt-1">Reading records from MongoDB Atlas cluster</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="font-display text-xl text-white">NO USERS FOUND</p>
            <p className="text-xs font-mono mt-1">
              {searchQuery ? `No results matching "${searchQuery}"` : 'No users match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/70 text-xs font-mono uppercase text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Cadet Info</th>
                  <th className="py-3.5 px-4 font-bold">Registration Status</th>
                  <th className="py-3.5 px-4 font-bold">College &amp; Branch</th>
                  <th className="py-3.5 px-4 font-bold">Track &amp; Payment</th>
                  <th className="py-3.5 px-4 font-bold">First Logged In</th>
                  <th className="py-3.5 px-4 font-bold">24h Reminder</th>
                  <th className="py-3.5 px-4 font-bold text-right">Moderation &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80 font-sans">
                {filteredUsers.map((user) => {
                  const isBusy = actionLoadingId === user.id;

                  return (
                    <tr
                      key={user.id || user.firebaseUid}
                      className={`hover:bg-gray-800/40 transition-colors ${
                        user.isBlocked ? 'bg-red-950/20 border-l-4 border-l-crew-red' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-display text-base shrink-0 ${
                              user.isBlocked
                                ? 'bg-red-950/80 border-crew-red text-red-200'
                                : 'bg-gray-800 border-gray-700 text-crew-cyan'
                            }`}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-sm truncate">{user.name || 'Anonymous Cadet'}</p>
                              {user.isBlocked && (
                                <span className="bg-red-950 text-red-300 border border-crew-red text-[10px] font-mono font-bold px-2 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                                  BLOCKED
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-crew-cyan truncate">{user.email}</p>
                            <span className="text-[10px] text-gray-500 font-mono truncate block">
                              UID: {user.firebaseUid ? user.firebaseUid.slice(0, 12) + '...' : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.hasRegistered ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-green-950/80 border border-crew-lime text-crew-lime">
                              <span className="w-1.5 h-1.5 rounded-full bg-crew-lime animate-ping" />
                              REGISTERED
                            </span>
                            <p className="text-[11px] font-mono text-gray-400">
                              Fee: <span className="text-crew-lime font-bold">INR 55 Cleared</span>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-yellow-950/70 border border-yellow-500/70 text-crew-yellow">
                              LOGGED IN ONLY
                            </span>
                            <p className="text-[11px] font-mono text-gray-500">Registration incomplete</p>
                          </div>
                        )}
                      </td>

                      {/* Academic Details */}
                      <td className="py-3.5 px-4">
                        {user.registration ? (
                          <div className="text-xs space-y-0.5 font-mono">
                            <p className="text-white font-bold">{user.registration.collegeId}</p>
                            <p className="text-gray-400">
                              {user.registration.branch} • Year {user.registration.year} (Sec {user.registration.section})
                            </p>
                            {user.registration.phone && (
                              <p className="text-gray-400">Phone: {user.registration.phone}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-mono italic">Not submitted yet</span>
                        )}
                      </td>

                      {/* Track & Payment */}
                      <td className="py-3.5 px-4">
                        {user.registration ? (
                          <div className="text-xs space-y-1 font-mono">
                            <span className="inline-block bg-black/60 px-2 py-0.5 rounded text-crew-yellow font-bold border border-gray-800">
                              {user.registration.track || 'Web Development'}
                            </span>
                            {user.registration.paymentId && (
                              <p className="text-[11px] text-gray-400 truncate max-w-[140px]" title={user.registration.paymentId}>
                                ID: {user.registration.paymentId}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-mono italic">—</span>
                        )}
                      </td>

                      {/* First Logged In Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                        {formatTimestamp(user.createdAt)}
                      </td>

                      {/* 24h Reminder Status */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        {user.hasRegistered ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-950/70 text-green-400 border border-green-500/40">
                            Paid • Excluded ✓
                          </span>
                        ) : user.lastReminderSentAt ? (
                          <div className="space-y-0.5">
                            <span className="text-crew-cyan font-bold block text-[11px]">
                              Sent: {formatTimestamp(user.lastReminderSentAt)}
                            </span>
                            <span className="text-[10px] text-gray-500 block">Next in ~24h</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-950/70 text-yellow-400 border border-yellow-500/40">
                            Queued for Dispatch
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Copy Email */}
                          <button
                            onClick={() => handleCopy(user.email, 'Email')}
                            className="p-2 rounded-lg bg-black/50 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 text-xs transition-colors cursor-pointer"
                            title="Copy Email Address"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* Copy Phone */}
                          {user.registration?.phone && (
                            <button
                              onClick={() => handleCopy(user.registration!.phone, 'Phone')}
                              className="p-2 rounded-lg bg-black/50 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 text-xs transition-colors cursor-pointer"
                              title="Copy Phone Number"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </button>
                          )}

                          {/* Block / Unblock Button */}
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={isBusy}
                            className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              user.isBlocked
                                ? 'bg-green-950/80 hover:bg-green-900 border-crew-lime text-crew-lime'
                                : 'bg-yellow-950/60 hover:bg-yellow-900/80 border-crew-yellow/50 text-crew-yellow'
                            }`}
                            title={user.isBlocked ? 'Click to unblock cadet' : 'Click to block cadet from logging in'}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-crew-lime' : 'bg-crew-yellow'}`} />
                            <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                          </button>

                          {/* Delete Account (Triggers Confirmation Modal) */}
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setUserToDelete(user);
                            }}
                            className="px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold bg-red-950/80 hover:bg-crew-red text-red-200 hover:text-white border border-crew-red/60 transition-all cursor-pointer flex items-center gap-1.5"
                            title="Purge account completely from MongoDB & Firebase Auth"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL FOR PERMANENT ACCOUNT DELETION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-gray-950 border-2 border-crew-red rounded-2xl p-6 shadow-[0_0_50px_rgba(197,17,17,0.5)] animate-in fade-in zoom-in-95 font-sans">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-crew-red/20 border-2 border-crew-red flex items-center justify-center text-crew-red shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl text-white tracking-wide">
                  CONFIRM COMPLETE DELETION
                </h2>
                <p className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                  Purge from MongoDB &amp; Firebase Auth
                </p>
              </div>
            </div>

            {/* Warning Text */}
            <div className="bg-red-950/40 border border-crew-red/40 rounded-xl p-3.5 mb-4 text-xs font-mono text-red-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-crew-red">
                <span className="w-2 h-2 rounded-full bg-crew-red" />
                CRITICAL WARNING: THIS ACTION CANNOT BE UNDONE.
              </p>
              <p className="leading-relaxed">
                You are about to delete <strong className="text-white">{userToDelete.name}</strong> completely:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 pl-1">
                <li>Permanently deleted from <strong className="text-crew-cyan">MongoDB User</strong> collection</li>
                <li>All associated <strong className="text-crew-cyan">Registrations &amp; Payment IDs</strong> wiped</li>
                <li>Completely deleted from <strong className="text-crew-yellow">Firebase Authentication</strong></li>
              </ul>
              <p className="text-[11px] text-gray-400 pt-1">
                Note: After deletion, everything will be clean and fresh for this student. They can log in again with their Google account as a completely new user.
              </p>
            </div>

            {/* Target Cadet Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 mb-5 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Cadet Name:</span>
                <span className="text-white font-bold">{userToDelete.name || 'Anonymous'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email Address:</span>
                <span className="text-crew-cyan font-bold">{userToDelete.email}</span>
              </div>
              {userToDelete.registration?.collegeId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">College ID:</span>
                  <span className="text-white">{userToDelete.registration.collegeId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Current Status:</span>
                <span className={userToDelete.hasRegistered ? 'text-crew-lime font-bold' : 'text-crew-yellow'}>
                  {userToDelete.hasRegistered ? 'Confirmed Registration (INR 55 Paid)' : 'Logged-in Only'}
                </span>
              </div>
            </div>

            {/* Error in modal if any */}
            {deleteError && (
              <div className="mb-4 bg-red-950 border border-red-500 text-red-200 text-xs font-mono p-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{deleteError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                CANCEL / KEEP ACCOUNT
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="au-btn px-5 py-2.5 rounded-xl bg-crew-red hover:bg-red-600 text-white font-display text-xs tracking-wider border-2 border-red-400 shadow-[0_0_20px_rgba(197,17,17,0.6)] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>PURGING MONGODB &amp; FIREBASE...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>YES, PURGE ACCOUNT COMPLETELY</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
