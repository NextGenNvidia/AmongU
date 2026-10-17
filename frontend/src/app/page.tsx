'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import ShhhIntroAnimation from '../components/animations/ShhhIntroAnimation';

export default function AmongUHomePage() {
  const router = useRouter();
  const { firebaseUser, profile, isRegistered, loginWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authErrorModal, setAuthErrorModal] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [modalAuthError, setModalAuthError] = useState<string | null>(null);

  // Countdown to October 28, 2026 (09:00 AM IST)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let target = new Date('2026-10-28T09:00:00+05:30').getTime();

    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const cleanApi = rawApiUrl.replace(/\/api\/?$/, '');
    fetch(`${cleanApi}/api/event/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.eventStartDate) {
          target = new Date(data.config.eventStartDate).getTime();
        }
      })
      .catch(() => {});

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterClick = () => {
    if (!firebaseUser) {
      setModalAuthError(null);
      setShowSignInModal(true);
      return;
    }

    if (isRegistered || profile?.hasRegistered) {
      router.push('/dashboard');
    } else {
      router.push('/portal/cadet-clearance-7b92');
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      setModalAuthError(null);
      console.log('🚀 [Sign-In Modal] Cadet initiating Google Sign-In...');
      const loggedIn = await loginWithGoogle();
      if (!loggedIn) {
        setIsSigningIn(false);
        return;
      }

      setShowSignInModal(false);

      if (loggedIn.hasRegistered) {
        console.log('✅ Cadet already registered, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('🚀 Cadet authenticated and unregistered, taking to registration clearance screen');
        router.push('/portal/cadet-clearance-7b92');
      }
    } catch (err: any) {
      console.error('Sign-in error from modal:', err);
      setModalAuthError(
        err?.message || 'Authentication failed. Please ensure you sign in with an official @kiet.edu Google account.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black">
      {/* Among Us Shhhh! Cinematic Splash Intro */}
      <ShhhIntroAnimation />

      {/* Moving Stars and Twinkling Starfield */}
      <div className="stars"></div>
      <div className="twinkling"></div>

      {/* Drifting Background Crewmates */}
      <div className="drift" style={{ top: '10%', left: '-10%', animationDuration: '35s' }}>
        <svg width="60" height="75" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill="#132ed1"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="5" y="30" width="20" height="40" rx="10" fill="#132ed1" stroke="#000" strokeWidth="6" />
          <path
            d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#9cdbfa"
            stroke="#000"
            strokeWidth="6"
          />
          <path
            d="M40,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
            fill="#ffffff"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="drift" style={{ top: '60%', left: '-20%', animationDuration: '25s', animationDelay: '-10s' }}>
        <svg width="40" height="50" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill="#117f2d"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="5" y="30" width="20" height="40" rx="10" fill="#117f2d" stroke="#000" strokeWidth="6" />
          <path
            d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#9cdbfa"
            stroke="#000"
            strokeWidth="6"
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          isScrolled ? 'bg-space/90 backdrop-blur-md border-b-4 border-black' : ''
        }`}
        id="navbar"
      >
        <div className="max-w-[96rem] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
            <div className="flex-shrink-0">
              <a href="#" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
                <svg width="30" height="30" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                    fill="#c51111"
                    stroke="#000"
                    strokeWidth="6"
                  />
                  <path
                    d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                    fill="#9cdbfa"
                    stroke="#000"
                    strokeWidth="6"
                  />
                </svg>
                <span
                  className="text-crew-red shadow-black font-black glitch-hover"
                  style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #fff' }}
                >
                  AMONG
                </span>
                U
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-3.5 lg:space-x-5 xl:space-x-6">
              <a href="#about" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-sm lg:text-base">
                About
              </a>
              <a href="#tracks" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-sm lg:text-base">
                Tracks
              </a>
              <a href="#schedule" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-sm lg:text-base">
                Schedule
              </a>
              <a href="#prizes" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-sm lg:text-base">
                Prizes
              </a>
              <a href="#faq" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-sm lg:text-base">
                FAQ
              </a>
              
              {firebaseUser ? (
                <div className="flex items-center gap-2 lg:gap-2.5">
                  <span className="hidden xl:inline text-xs text-crew-cyan font-bold bg-black/60 px-3 py-1 rounded-full border border-gray-700 font-mono">
                    {firebaseUser.email}
                  </span>
                  {isRegistered || profile?.hasRegistered ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 transition-all"
                      >
                        <span>DASHBOARD</span>
                      </Link>
                      <Link
                        href="/squad"
                        className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 transition-all font-bold shadow"
                      >
                        <span>SQUAD 👥</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs sm:text-sm py-2 px-3.5 rounded-full flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(80,239,57,0.5)] font-bold"
                      >
                        <span>PROFILE 👤</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/portal/cadet-clearance-7b92"
                      className="au-btn bg-crew-red hover:bg-red-500 text-white font-display text-sm py-2 px-4 rounded-full flex items-center gap-1.5 transition-all"
                    >
                      <span>REGISTER</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-xs text-gray-400 hover:text-crew-red font-bold underline cursor-pointer ml-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-sm py-2 px-5 rounded-full flex items-center gap-2 shadow-[0_0_12px_rgba(80,239,57,0.8)] hover:scale-105 transition-all cursor-pointer"
                >
                  <span>REGISTER</span>
                </button>
              )}
            </div>
            <div className="md:hidden flex items-center gap-2">
              {firebaseUser && (isRegistered || profile?.hasRegistered) ? (
                <>
                  <Link
                    href="/dashboard"
                    className="au-btn bg-crew-cyan text-black font-display text-xs py-1.5 px-2.5 rounded-full"
                  >
                    <span>DASHBOARD</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="au-btn bg-crew-lime text-black font-display text-xs py-1.5 px-2.5 rounded-full font-bold"
                  >
                    <span>PROFILE</span>
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="au-btn bg-crew-lime text-black font-display text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  <span>REGISTER</span>
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                id="mobile-menu-btn"
                className="text-white hover:text-crew-cyan focus:outline-none"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-space border-b-4 border-black">
            <div className="px-3 pt-2 pb-4 space-y-2 text-center">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
              >
                About
              </a>
              <a
                href="#tracks"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
              >
                Tracks
              </a>
              <a
                href="#schedule"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
              >
                Schedule
              </a>
              <a
                href="#prizes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
              >
                Prizes
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
              >
                FAQ
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleRegisterClick();
                }}
                className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-base py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-[0_0_12px_rgba(80,239,57,0.8)] cursor-pointer"
              >
                <span>{firebaseUser ? (isRegistered || profile?.hasRegistered ? 'MISSION DASHBOARD' : 'REGISTER') : 'REGISTER'}</span>
              </button>

              {firebaseUser && (isRegistered || profile?.hasRegistered) && (
                <>
                  <Link
                    href="/squad"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-base py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-2 font-bold cursor-pointer"
                  >
                    <span>SQUAD COMMS 👥</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display text-base py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-2 font-bold cursor-pointer"
                  >
                    <span>CADET PROFILE 👤</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="flex flex-col items-center justify-center">
            {/* Floating Main Crewmate SVG */}
            <div className="float-slow mb-8">
              <svg width="150" height="180" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                {/* Backpack */}
                <rect x="2" y="30" width="25" height="50" rx="8" fill="#c51111" stroke="#000" strokeWidth="4" />
                {/* Body */}
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill="#c51111"
                  stroke="#000"
                  strokeWidth="4"
                />
                {/* Highlight */}
                <path
                  d="M70,40 C70,25 55,20 45,20 C35,20 20,25 20,40"
                  fill="transparent"
                  stroke="#ff4d4d"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Visor */}
                <path
                  d="M30,30 h45 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-45 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                  fill="#9cdbfa"
                  stroke="#000"
                  strokeWidth="4"
                />
                {/* Visor Highlight */}
                <path
                  d="M35,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
                  fill="#ffffff"
                  opacity="0.8"
                />
              </svg>
            </div>

            <h1
              className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4 tracking-wide"
              style={{ textShadow: '4px 4px 0 #000, 8px 8px 0px rgba(0,0,0,0.5)' }}
            >
              <span className="text-crew-cyan">THERE IS AN</span> <span className="text-crew-red glitch-hover">IMPOSTOR</span> <br />{' '}
              AMONG US
            </h1>

            <p className="font-display text-2xl md:text-3xl text-crew-yellow mb-4" style={{ textShadow: '2px 2px 0 #000' }}>
              A Hackathon of Code, Creativity &amp; Sabotage
            </p>

            <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto font-bold mb-6 bg-black/50 p-4 rounded-xl au-border">
              October 28, 2026 • KIET Deemed to be University
            </p>

            {/* Live Event Countdown to October 28, 2026 */}
            <div className="mb-8 max-w-xl mx-auto w-full px-2">
              <div className="bg-black/80 au-border rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(56,254,220,0.25)] border-2 border-crew-cyan">
                <div className="flex items-center justify-center gap-2 text-crew-cyan font-mono text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-crew-lime animate-ping"></span>
                  <span>MISSION LIFTOFF COUNTDOWN</span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                  <div className="bg-gray-900/90 au-border rounded-xl p-2 sm:p-3">
                    <div className="font-mono text-2xl sm:text-4xl font-black text-crew-lime">{timeLeft.days}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-1">Days</div>
                  </div>
                  <div className="bg-gray-900/90 au-border rounded-xl p-2 sm:p-3">
                    <div className="font-mono text-2xl sm:text-4xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-1">Hours</div>
                  </div>
                  <div className="bg-gray-900/90 au-border rounded-xl p-2 sm:p-3">
                    <div className="font-mono text-2xl sm:text-4xl font-black text-crew-cyan">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-1">Mins</div>
                  </div>
                  <div className="bg-gray-900/90 au-border rounded-xl p-2 sm:p-3">
                    <div className="font-mono text-2xl sm:text-4xl font-black text-crew-yellow">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-1">Secs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6">
              {firebaseUser && (isRegistered || profile?.hasRegistered) ? (
                <>
                  <Link
                    href="/dashboard"
                    className="au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display text-xl sm:text-2xl py-4 px-8 sm:px-10 rounded-full flex items-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.8)] hover:scale-105 transition-all cursor-pointer font-bold"
                  >
                    <span>GO TO DASHBOARD</span>
                    <span>🚀</span>
                  </Link>
                  <Link
                    href="/squad"
                    className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xl sm:text-2xl py-4 px-8 sm:px-10 rounded-full flex items-center gap-2.5 shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-105 transition-all cursor-pointer font-bold"
                  >
                    <span>VIEW SQUAD</span>
                    <span>👥</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="au-btn bg-crew-red hover:bg-red-500 text-white font-display text-xl sm:text-2xl py-4 px-8 sm:px-10 rounded-full flex items-center gap-3 shadow-[0_0_25px_rgba(197,17,17,0.8)] animate-pulse hover:animate-none transition-all cursor-pointer"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>REGISTER NOW</span>
                  </button>
                  <a href="#about" className="au-btn bg-crew-white text-black hover:bg-gray-200 font-display text-xl py-4 px-8 rounded-full">
                    VIEW MISSIONS
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* System Overview Section */}
      <section id="about" className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="au-card bg-gray-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Tablet UI Elements */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black rounded-full border-4 border-gray-600"></div>

            <div className="bg-gray-900 border-4 border-black rounded-2xl p-6 md:p-10 mt-6 mb-8 text-center md:text-left">
              <h2 className="font-display text-4xl md:text-5xl text-crew-cyan mb-6" style={{ textShadow: '2px 2px 0 #000' }}>
                &gt; SYSTEM OVERVIEW
              </h2>
              <p className="text-lg md:text-2xl mb-4 font-bold text-gray-200 leading-relaxed">
                Welcome to AmongU, where coding meets social deduction. Form a randomly assigned crew, choose a problem worth solving, and build a working solution before time runs out.
              </p>
              <p className="text-lg md:text-xl text-gray-300 mb-4 font-bold leading-relaxed">
                But stay alert — one member of your team is secretly the <span className="text-crew-red">Impostor</span>, working to sabotage the project without getting caught. Collaborate, develop, debug, and identify the hidden threat before the final reveal.
              </p>
              <p className="text-base md:text-lg text-gray-400 mb-6 leading-relaxed">
                Whether you&apos;re a developer, designer, or problem-solver, your mission is to turn random ideas into real solutions.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                <div className="bg-black/50 rounded-xl p-4 au-border flex items-center gap-3">
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="text-sm text-gray-400 font-bold uppercase">Crew Size</p>
                    <p className="text-xl font-display text-white">4 Participants per Team</p>
                  </div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 au-border flex items-center gap-3">
                  <span className="text-3xl">⏳</span>
                  <div>
                    <p className="text-sm text-gray-400 font-bold uppercase">Duration</p>
                    <p className="text-xl font-display text-white">3 Hours 45 Minutes of Competition</p>
                  </div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 au-border flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="text-sm text-gray-400 font-bold uppercase">Prize Pool</p>
                    <p className="text-xl font-display text-crew-lime">₹10,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Tracks Section */}
      <section id="tracks" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-5xl md:text-6xl text-center mb-16 text-white" style={{ textShadow: '4px 4px 0 #000' }}>
            AVAILABLE <span className="text-crew-lime">TRACKS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Track 1: Web Development */}
            <div className="au-card bg-crew-blue rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
                <svg className="w-8 h-8 text-crew-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
              </div>
              <h3 className="font-display text-3xl text-white mb-3" style={{ textShadow: '2px 2px 0 #000' }}>
                Web Development
              </h3>
              <p className="text-gray-100 font-bold text-lg leading-relaxed">
                Build practical, engaging, and scalable web applications that solve real-world problems.
              </p>
            </div>

            {/* Track 2: Game Development */}
            <div className="au-card bg-crew-purple rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
                <svg className="w-8 h-8 text-crew-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
              </div>
              <h3 className="font-display text-3xl text-white mb-3" style={{ textShadow: '2px 2px 0 #000' }}>
                Game Development
              </h3>
              <p className="text-gray-100 font-bold text-lg leading-relaxed">
                Design interactive experiences, develop game mechanics, and turn creative concepts into playable prototypes.
              </p>
            </div>

            {/* Track 3: Open Track */}
            <div className="au-card bg-crew-orange rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
                <svg className="w-8 h-8 text-crew-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="font-display text-3xl text-white mb-3" style={{ textShadow: '2px 2px 0 #000' }}>
                Open Track
              </h3>
              <p className="text-gray-100 font-bold text-lg leading-relaxed">
                Explore any problem worth solving and build an original solution using your creativity and technical skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Timeline Section */}
      <section id="schedule" className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-5xl md:text-6xl text-center mb-16 text-white" style={{ textShadow: '4px 4px 0 #000' }}>
            MISSION <span className="text-crew-cyan">TIMELINE</span>
          </h2>

          <div className="relative">
            {/* Task Progress Bar (Vertical Line) */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-4 bg-gray-800 au-border rounded-full">
              <div className="w-full bg-crew-lime h-3/4 rounded-t-full relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-crew-lime blur-sm opacity-50"></div>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {/* Item 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-lime au-border rounded-full z-10 shadow-[0_0_15px_#50ef39]"></div>
                <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl">
                  <span className="text-crew-lime font-bold mb-1 block">Duration: 45 Minutes</span>
                  <h3 className="font-display text-2xl text-white mb-2">Round 1 — Random Ideas, Real Solutions</h3>
                  <p className="text-gray-300 font-bold">
                    Form a randomly assigned team, identify an interesting problem, choose a track, and submit your proposed solution as a presentation.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-lime au-border rounded-full z-10 shadow-[0_0_15px_#50ef39]"></div>
                <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl">
                  <span className="text-crew-lime font-bold mb-1 block">Duration: 1 Hour 30 Minutes</span>
                  <h3 className="font-display text-2xl text-white mb-2">Round 2 — Development Round I</h3>
                  <p className="text-gray-300 font-bold">
                    Turn your proposal into a working prototype. Collaborate with your team and bring your idea to life.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-yellow au-border rounded-full z-10 shadow-[0_0_15px_#f5f557]"></div>
                <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl">
                  <span className="text-crew-yellow font-bold mb-1 block">Duration: 1 Hour 30 Minutes</span>
                  <h3 className="font-display text-2xl text-white mb-2">Round 3 — Development Round II: Impostor Challenge</h3>
                  <p className="text-gray-300 font-bold">
                    Continue developing your prototype while navigating the hidden Impostor Challenge. Build, debug, and protect your project from sabotage.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-red au-border rounded-full z-10 shadow-[0_0_15px_#c51111]"></div>
                <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl border-crew-red">
                  <span className="text-crew-red font-bold mb-1 block">Final Phase</span>
                  <h3 className="font-display text-2xl text-white mb-2">Final Emergency Meeting</h3>
                  <p className="text-gray-300 font-bold">
                    After the final round, teams will be asked to identify the Impostor within their team. Correct identifications earn points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bounty Rewards Section */}
      <section id="prizes" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-5xl md:text-6xl text-center mb-4 text-white" style={{ textShadow: '4px 4px 0 #000' }}>
            BOUNTY <span className="text-crew-yellow">REWARDS</span>
          </h2>
          <p className="text-center font-display text-2xl text-crew-lime mb-16" style={{ textShadow: '2px 2px 0 #000' }}>
            Total Prize Pool: ₹10,000
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Prize 1 */}
            <div className="au-card bg-crew-yellow text-black rounded-3xl p-6 text-center relative">
              <div className="w-20 h-20 mx-auto bg-white au-border rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl">👑</span>
              </div>
              <h3 className="font-display text-xl text-black mb-1">Best Development Team</h3>
              <p className="text-4xl font-display text-black mt-2 drop-shadow-md">₹4,000</p>
            </div>

            {/* Prize 2 */}
            <div className="au-card bg-crew-red text-white rounded-3xl p-6 text-center relative">
              <div className="w-20 h-20 mx-auto bg-black au-border rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl">🔪</span>
              </div>
              <h3 className="font-display text-xl text-white mb-1">Best Impostor</h3>
              <p className="text-4xl font-display text-white mt-2 drop-shadow-md">₹3,000</p>
            </div>

            {/* Prize 3 */}
            <div className="au-card bg-gray-800 text-white rounded-3xl p-6 text-center relative">
              <div className="w-20 h-20 mx-auto bg-gray-400 au-border rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl">🥈</span>
              </div>
              <h3 className="font-display text-xl text-gray-200 mb-1">Second-Best Development Team</h3>
              <p className="text-4xl font-display text-crew-lime mt-2">₹2,000</p>
            </div>

            {/* Prize 4 */}
            <div className="au-card bg-gray-800 text-white rounded-3xl p-6 text-center relative">
              <div className="w-20 h-20 mx-auto bg-amber-700 au-border rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl">🎭</span>
              </div>
              <h3 className="font-display text-xl text-gray-200 mb-1">Second-Best Impostor</h3>
              <p className="text-4xl font-display text-crew-yellow mt-2">₹1,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Communications (FAQ) Section */}
      <section id="faq" className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12 text-white" style={{ textShadow: '4px 4px 0 #000' }}>
            COMMUNICATIONS (FAQ)
          </h2>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                Who can participate?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4 text-lg">
                First- and second-year students of KIET Deemed to be University.
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                How are teams formed?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4 text-lg">
                Participants register individually and are assigned to teams randomly. Each team consists of 4 participants.
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                What are the available tracks?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4 text-lg">
                Web Development, Game Development, and Open Track.
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                Can I use the internet and AI tools?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4 text-lg">
                Yes. Internet access and AI tools are allowed unless restricted during a particular round.
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                What is the Impostor Challenge?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4 text-lg">
                One team member secretly attempts to sabotage their own team’s project. After the final round, teams must identify the Impostor.
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                What kind of sabotage is allowed?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4 text-lg">
                Sabotage must remain within the designated project environment. Deleting entire projects or accessing other teams’ projects is strictly prohibited.
              </div>
            </details>

            {/* FAQ 7 */}
            <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
              <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
                How much is the registration fee?
                <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-crew-lime font-bold border-t-2 border-gray-800 pt-4 text-xl font-display">
                ₹55 per participant.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-gray-800 pt-12 pb-8 relative z-10 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <a
              href="#"
              className="font-display text-3xl text-white tracking-wider flex items-center justify-center md:justify-start gap-2 mb-2"
            >
              <span className="text-crew-red">AMONG</span>U
            </a>
            <p className="text-crew-cyan font-bold text-sm">A NextGen Supercomputing Initiative</p>
            <p className="text-gray-400 text-xs font-bold">Under the Centre of Excellence (CoE), Center for Supercomputing</p>
            <p className="text-gray-400 text-xs font-bold">KIET Deemed to be University</p>
            <p className="text-gray-500 font-bold text-xs mt-3">© 2026 AmongU. All missions reserved.</p>
          </div>

          <div className="flex space-x-6">
            {/* Twitter */}
            <a
              href="#"
              className="text-gray-400 hover:text-crew-cyan transition-colors au-border rounded-full p-2.5 hover:bg-gray-800"
            >
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            {/* Discord */}
            <a
              href="#"
              className="text-gray-400 hover:text-crew-purple transition-colors au-border rounded-full p-2.5 hover:bg-gray-800"
            >
              <span className="sr-only">Discord</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1569 2.419 0 1.3332-.946 2.4189-2.1569 2.4189z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors au-border rounded-full p-2.5 hover:bg-gray-800"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.022 1.531 1.022.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </div>

          {/* Compliance & Policy Links for Payment Gateway */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 text-xs font-mono text-gray-400">
            <Link href="/privacy" className="hover:text-crew-cyan transition-colors underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/terms" className="hover:text-crew-cyan transition-colors underline-offset-4 hover:underline">
              Terms &amp; Conditions
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/refund" className="hover:text-crew-cyan transition-colors underline-offset-4 hover:underline">
              Refund &amp; Cancellation
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/contact" className="hover:text-crew-cyan transition-colors underline-offset-4 hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      {/* 🚀 SIGN IN TO REGISTER POPUP MODAL */}
      {showSignInModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="au-card bg-gray-950 w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border-4 border-black relative shadow-[0_0_50px_rgba(56,254,220,0.3)]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowSignInModal(false);
                setModalAuthError(null);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 flex items-center justify-center text-sm font-mono transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Crewmate / Lock Graphic */}
            <div className="w-20 h-20 bg-crew-cyan/15 border-4 border-crew-cyan mx-auto rounded-full flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(56,254,220,0.5)]">
              <svg width="40" height="40" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="30" width="25" height="50" rx="8" fill="#38fedc" stroke="#000" strokeWidth="6" />
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill="#38fedc"
                  stroke="#000"
                  strokeWidth="6"
                />
                <path
                  d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                  fill="#000"
                  stroke="#000"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <div className="inline-block px-3 py-1 bg-cyan-950/80 border border-crew-cyan/50 rounded-full text-[11px] font-mono text-crew-cyan font-bold tracking-widest uppercase mb-2">
              CREW IDENTITY CHECK
            </div>

            <h3 className="font-display text-2xl sm:text-3xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
              SIGN IN TO REGISTER
            </h3>
            <p className="text-gray-300 font-bold text-xs sm:text-sm mb-5 leading-relaxed">
              Sign in with your official KIET Google account to proceed to hackathon registration.
            </p>

            {/* KIET Domain Notice */}
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-3.5 mb-5 text-left text-xs font-mono">
              <div className="flex items-center gap-2 text-crew-cyan font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-crew-cyan animate-pulse" />
                <span>OFFICIAL KIET DOMAIN REQUIRED</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                You must sign in with your <strong className="text-crew-lime font-mono">@kiet.edu</strong> student ID. Personal accounts will be rejected.
              </p>
            </div>

            {/* Error Message inside modal */}
            {modalAuthError && (
              <div className="bg-red-950/90 border-2 border-crew-red text-red-200 text-xs font-bold p-3 rounded-xl mb-4 text-left leading-relaxed">
                ⚠️ {modalAuthError}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleSignInWithGoogle}
              disabled={isSigningIn}
              className="w-full au-btn bg-white hover:bg-gray-100 text-gray-900 font-display text-base sm:text-lg py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {/* Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'CONNECTING TO GOOGLE...' : 'Sign in with Google'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ AUTH RESTRICTION / ERROR MODAL */}
      {authErrorModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="au-card bg-gray-900 w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border-4 border-crew-red animate-[float_0.3s_ease-out]">
            <div className="w-16 h-16 bg-crew-red/20 border-4 border-crew-red mx-auto rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(197,17,17,0.8)]">
              <span className="text-3xl">⛔</span>
            </div>
            <h3 className="font-display text-2xl text-crew-red mb-2" style={{ textShadow: '1px 1px 0 #000' }}>
              ACCESS RESTRICTED
            </h3>
            <p className="text-gray-300 text-sm font-bold mb-6 leading-relaxed">
              {authErrorModal}
            </p>
            <button
              type="button"
              onClick={() => setAuthErrorModal(null)}
              className="au-btn bg-crew-red hover:bg-red-500 text-white font-display py-2.5 px-8 rounded-full text-sm cursor-pointer shadow-lg"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
