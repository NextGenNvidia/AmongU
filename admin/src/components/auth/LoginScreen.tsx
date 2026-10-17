'use client';

import React, { useState } from 'react';
import { adminService } from '../../services/admin.service';

interface LoginScreenProps {
  onSuccess: () => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !password.trim()) {
      setError('Please provide both Admin ID and Password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminService.login(id.trim(), password.trim());
      if (res && res.success) {
        const token = res.token || 'amongu_admin_secret_token_2026';
        sessionStorage.setItem('amongu_admin_token', token);
        sessionStorage.setItem('amongu_admin_auth', 'true');
        localStorage.setItem('amongu_admin_token', token);
        localStorage.setItem('amongu_admin_auth', 'true');
        onSuccess();
      } else {
        setError(res.message || 'Invalid Admin ID or Password');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid Admin ID or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-crew-red/10 rounded-full blur-3xl pointer-events-none" />

      <div className="au-card bg-gray-900/95 max-w-md w-full p-8 rounded-3xl border-4 border-black relative z-10 shadow-[0_0_50px_rgba(197,17,17,0.4)]">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-crew-red mx-auto au-border rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_25px_#c51111]">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-red-950/80 border border-crew-red/50 rounded-full text-[11px] font-mono text-crew-red font-bold tracking-widest uppercase mb-2">
            CLEARANCE LEVEL: ORGANIZER ONLY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '2px 2px 0 #000' }}>
            ADMIN COMMAND CENTER
          </h1>
          <p className="text-gray-400 font-bold text-xs sm:text-sm mt-1">
            Enter authorized ID and password to access the participant monitoring deck.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="bg-red-950/90 border-2 border-crew-red text-red-200 text-xs sm:text-sm font-bold p-3 rounded-xl mb-5 text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-crew-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin ID Field */}
          <div>
            <label className="block text-xs font-mono font-bold text-crew-cyan mb-1.5 uppercase tracking-wider">
              Admin ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter Admin ID"
                className="w-full bg-black au-border rounded-xl pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-crew-cyan focus:shadow-[0_0_12px_rgba(56,254,220,0.5)] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-mono font-bold text-crew-cyan mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-black au-border rounded-xl pl-10 pr-12 py-3 text-white font-mono text-sm focus:outline-none focus:border-crew-cyan focus:shadow-[0_0_12px_rgba(56,254,220,0.5)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-white cursor-pointer font-mono"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full au-btn bg-crew-red hover:bg-red-500 text-white font-display text-lg py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(197,17,17,0.8)] active:scale-[0.98] transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>ENTER COMMAND CENTER</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
