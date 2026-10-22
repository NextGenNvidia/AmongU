'use client';

import React, { useState, useEffect } from 'react';
import LoginScreen from '../components/auth/LoginScreen';
import Sidebar from '../components/layout/Sidebar';
import UsersRoster from '../components/users/UsersRoster';
import EventSettings from '../components/settings/EventSettings';
import TeamsManager from '../components/teams/TeamsManager';
import VenueQRPass from '../components/venue/VenueQRPass';
import AnnouncementsManager from '../components/announcements/AnnouncementsManager';
import { adminService } from '../services/admin.service';
import { LoggedInUserRecord } from '../types';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'users' | 'settings' | 'teams' | 'venue-qr' | 'announcements'>('users');

  // Users State
  const [users, setUsers] = useState<LoggedInUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in session
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('amongu_admin_token') || localStorage.getItem('amongu_admin_token');
      const isAuth = sessionStorage.getItem('amongu_admin_auth') || localStorage.getItem('amongu_admin_auth');

      // Instantly reject legacy/hardcoded tokens
      if (token === 'amongu_admin_secret_token_2026' || token?.startsWith('amongu_admin_')) {
        sessionStorage.removeItem('amongu_admin_token');
        sessionStorage.removeItem('amongu_admin_auth');
        localStorage.removeItem('amongu_admin_token');
        localStorage.removeItem('amongu_admin_auth');
        setIsAuthenticated(false);
      } else if (token && isAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
    setIsCheckingAuth(false);
  }, []);

  // Listen for force-logout events from API interceptor
  useEffect(() => {
    const onForceLogout = () => {
      setIsAuthenticated(false);
      setUsers([]);
      setUsersError(null);
    };
    window.addEventListener('amongu_admin_force_logout', onForceLogout);
    return () => window.removeEventListener('amongu_admin_force_logout', onForceLogout);
  }, []);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await adminService.getUsers();
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err: any) {
      console.error('Error fetching users in admin:', err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleLogout();
        return;
      }
      setUsersError(err?.response?.data?.message || err?.message || 'Failed to fetch users from database');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('amongu_admin_token');
      sessionStorage.removeItem('amongu_admin_auth');
      localStorage.removeItem('amongu_admin_token');
      localStorage.removeItem('amongu_admin_auth');
    }
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-crew-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. If not authenticated: Show Login Screen with ID and Password
  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  // 2. If authenticated: Show Admin Console with Sidebar & Users View
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onLogout={handleLogout}
          totalUsersCount={users.length}
        />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-crew-red flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-display text-lg text-crew-red">AMONGU ADMIN</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-800 text-white font-mono text-xs cursor-pointer"
          >
            {mobileMenuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-950 border-b-2 border-gray-800 p-4 space-y-2">
            <button
              onClick={() => {
                setCurrentTab('users');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-display text-sm ${
                currentTab === 'users' ? 'bg-crew-red text-white' : 'bg-gray-900 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Users</span>
              </div>
              <span className="text-xs font-mono">{users.length} Cadets</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('teams');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-display text-sm ${
                currentTab === 'teams' ? 'bg-crew-cyan text-black font-bold' : 'bg-gray-900 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Teams & Impostors</span>
              </div>
              <span className="text-xs font-mono text-crew-cyan">Squads</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('venue-qr');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-display text-sm ${
                currentTab === 'venue-qr' ? 'bg-crew-lime text-black font-bold' : 'bg-gray-900 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Venue QR Pass</span>
              </div>
              <span className="text-xs font-mono text-crew-lime">Live QR</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('announcements');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-display text-sm ${
                currentTab === 'announcements' ? 'bg-purple-600 text-white font-bold' : 'bg-gray-900 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span>Announcements</span>
              </div>
              <span className="text-xs font-mono text-purple-300">Broadcast</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-display text-sm ${
                currentTab === 'settings' ? 'bg-amber-400 text-black font-bold' : 'bg-gray-900 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Event Schedule</span>
              </div>
              <span className="text-xs font-mono text-amber-400">Timers</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-950 text-red-200 p-2.5 rounded-xl font-mono text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'users' ? (
            <UsersRoster
              users={users}
              loading={usersLoading}
              error={usersError}
              onRefresh={loadUsers}
            />
          ) : currentTab === 'teams' ? (
            <TeamsManager />
          ) : currentTab === 'venue-qr' ? (
            <VenueQRPass onCheckInUpdate={loadUsers} />
          ) : currentTab === 'announcements' ? (
            <AnnouncementsManager />
          ) : (
            <EventSettings />
          )}
        </main>
      </div>
    </div>
  );
}
