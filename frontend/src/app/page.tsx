'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS, ALLOWED_YEARS } from '../constants/branches';
import { useRazorpay } from '../hooks/useRazorpay';
import { clientEnv } from '../config/env';

interface RegistrationData {
  name: string;
  collegeId: string;
  year: '1' | '2';
  branch: string;
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  phone: string;
  email: string;
  track: string;
}

interface ConfirmedTicket extends RegistrationData {
  paymentId: string;
  amount: number;
  registeredAt: string;
}

export default function AmongUHomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'form' | 'otp'>('form');
  const [isScrolled, setIsScrolled] = useState(false);

  // Form State
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    collegeId: '',
    year: '1',
    branch: ALLOWED_BRANCHES[0],
    section: 'A',
    phone: '',
    email: '',
    track: 'Web Development',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingTicket, setPendingTicket] = useState<ConfirmedTicket | null>(null);

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  const { openCheckout } = useRazorpay();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // OTP Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalStep === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [modalStep, resendCountdown]);

  const openModal = () => {
    setModalOpen(true);
    setModalStep('form');
    setFormError(null);
    setOtpError(null);
    setIsOtpSuccess(false);
    setIsVerifyingOtp(false);
    setOtpDigits(['', '', '', '', '', '']);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalStep('form');
    setIsOtpSuccess(false);
    setIsVerifyingOtp(false);
    document.body.style.overflow = 'auto';
  };

  const validateForm = (): boolean => {
    if (formData.name.trim().length < 2) {
      setFormError('Please enter your name (at least 2 characters).');
      return false;
    }
    if (!formData.collegeId.trim() || !/^\d{15}$/.test(formData.collegeId.trim())) {
      setFormError('College ID must be strictly 15 digits (e.g. 210029012000000).');
      return false;
    }
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setFormError('WhatsApp number must be a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return false;
    }
    if (!formData.email.trim() || !formData.email.trim().toLowerCase().endsWith('@kiet.edu')) {
      setFormError('Only official KIET college email IDs ending with @kiet.edu are allowed (e.g. cadet@kiet.edu).');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleRazorpayPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessingPayment(true);
    setFormError(null);

    const razorpayKey = clientEnv.RAZORPAY_KEY_ID;
    const isPlaceholderKey =
      !razorpayKey ||
      razorpayKey.includes('xxxxxx') ||
      razorpayKey === 'your_razorpay_key' ||
      razorpayKey === 'rzp_test_dummy_key_123';

    // If a live/production key is present, invoke real Razorpay modal
    if (!isPlaceholderKey && typeof window !== 'undefined' && window.Razorpay) {
      try {
        openCheckout({
          key: razorpayKey,
          amount: 5500, // 5500 paise = ₹55
          currency: 'INR',
          name: 'AmongU Hackathon',
          description: 'AmongU Registration Fee (₹55)',
          order_id: '',
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#c51111',
          },
          handler: (response: any) => {
            const payId = response.razorpay_payment_id ? response.razorpay_payment_id : `pay_${Date.now()}`;
            const ticket: ConfirmedTicket = {
              ...formData,
              paymentId: payId,
              amount: 55,
              registeredAt: new Date().toLocaleString(),
            };
            setPendingTicket(ticket);
            setIsProcessingPayment(false);
            setModalStep('otp');
            setResendCountdown(30);
          },
        });
        return;
      } catch (err: any) {
        console.warn('Real Razorpay initialization failed, proceeding with dev flow:', err);
      }
    }

    // Development preview with dummy key: simulate successful payment and proceed to email OTP
    setTimeout(() => {
      const generatedPayId = `pay_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const ticket: ConfirmedTicket = {
        ...formData,
        paymentId: generatedPayId,
        amount: 55,
        registeredAt: new Date().toLocaleString(),
      };
      setPendingTicket(ticket);
      setIsProcessingPayment(false);
      setModalStep('otp');
      setResendCountdown(30);
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal && val !== '') return;

    const newOtp = [...otpDigits];
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      pasted.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpDigits(newOtp);
      const nextIdx = Math.min(pasted.length, 5);
      const targetEl = document.getElementById(`otp-input-${nextIdx}`);
      if (targetEl) (targetEl as HTMLInputElement).focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtpDigits(newOtp);
    setOtpError(null);

    if (cleanVal && index < 5) {
      const targetEl = document.getElementById(`otp-input-${index + 1}`);
      if (targetEl) (targetEl as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevEl = document.getElementById(`otp-input-${index - 1}`);
      if (prevEl) (prevEl as HTMLInputElement).focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      setOtpError('Please enter all 6 digits of the transmission passcode.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    setTimeout(() => {
      if (pendingTicket) {
        const verifiedTicket = {
          ...pendingTicket,
          isEmailVerified: true,
        };
        try {
          localStorage.setItem('amongu_user_ticket', JSON.stringify(verifiedTicket));
        } catch (err) {
          console.error('Failed to store ticket in localStorage:', err);
        }
        setIsOtpSuccess(true);
        setTimeout(() => {
          closeModal();
          router.push('/dashboard');
        }, 900);
      } else {
        setIsVerifyingOtp(false);
      }
    }, 600);
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(30);
    setOtpError(null);
    setOtpDigits(['', '', '', '', '', '']);
  };

  return (
    <div className="relative min-h-screen font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black">
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

      {/* 🛸 FLOATING "REGISTER NOW" BUTTON (Stuck along scrollbar on right top corner) */}
      <aside aria-label="Quick Registration" className="fixed top-24 right-4 z-[90] sm:right-6 pointer-events-auto">
        <button
          type="button"
          onClick={() => openModal()}
          className="au-btn group bg-crew-red hover:bg-red-500 cursor-pointer text-white font-display text-sm sm:text-base py-3 px-5 sm:px-6 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(197,17,17,0.9)] hover:scale-105 active:scale-95 transition-all"
          title="Click to Register for AmongU (₹55)"
        >
          <svg width="22" height="26" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path
              d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
              fill="#fff"
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
          <span className="tracking-wide">REGISTER NOW</span>
          <span className="bg-crew-yellow text-black text-xs font-black px-2 py-0.5 rounded-full border-2 border-black">
            ₹55
          </span>
        </button>
      </aside>

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          isScrolled ? 'bg-space/90 backdrop-blur-md border-b-4 border-black' : ''
        }`}
        id="navbar"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
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
            <div className="hidden md:flex items-center space-x-6">
              <a href="#about" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-base lg:text-lg">
                About
              </a>
              <a href="#tracks" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-base lg:text-lg">
                Tracks
              </a>
              <a href="#schedule" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-base lg:text-lg">
                Schedule
              </a>
              <a href="#prizes" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-base lg:text-lg">
                Prizes
              </a>
              <a href="#faq" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-base lg:text-lg">
                FAQ
              </a>
              <button
                type="button"
                onClick={() => openModal()}
                className="au-btn bg-crew-red hover:bg-red-500 text-white font-display text-sm py-2 px-5 rounded-full flex items-center gap-2 shadow-[0_0_12px_rgba(197,17,17,0.8)] hover:scale-105 transition-all cursor-pointer"
              >
                <span>REGISTER NOW</span>
                <span className="bg-crew-yellow text-black text-xs font-black px-1.5 py-0.5 rounded-full border border-black">
                  ₹55
                </span>
              </button>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <button
                type="button"
                onClick={() => openModal()}
                className="au-btn bg-crew-red text-white font-display text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5"
              >
                <span>REGISTER</span>
                <span className="bg-crew-yellow text-black text-[10px] font-black px-1 rounded-full">₹55</span>
              </button>
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
                  openModal();
                }}
                className="w-full au-btn bg-crew-red hover:bg-red-500 text-white font-display text-base py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-[0_0_12px_rgba(197,17,17,0.8)] cursor-pointer"
              >
                <span>REGISTER NOW</span>
                <span className="bg-crew-yellow text-black text-xs font-black px-2 py-0.5 rounded-full border border-black">
                  ₹55
                </span>
              </button>
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

            <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto font-bold mb-8 bg-black/50 p-4 rounded-xl au-border">
              November 2, 2026 • KIET Deemed to be University
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-6">
              <button
                type="button"
                onClick={() => openModal()}
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
                <span className="bg-crew-yellow text-black text-sm font-black px-2.5 py-0.5 rounded-full border-2 border-black">
                  ₹55
                </span>
              </button>
              <a href="#about" className="au-btn bg-crew-white text-black hover:bg-gray-200 font-display text-xl py-4 px-8 rounded-full">
                VIEW MISSIONS
              </a>
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

            {/* Track 3: Open Innovation */}
            <div className="au-card bg-crew-orange rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
                <svg className="w-8 h-8 text-crew-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="font-display text-3xl text-white mb-3" style={{ textShadow: '2px 2px 0 #000' }}>
                Open Innovation
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
                Web Development, Game Development, and Open Innovation.
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
        </div>
      </footer>

      {/* 🚨 EMERGENCY MEETING REGISTRATION MODAL */}
      {modalOpen && (
        <div
          id="registerModal"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="au-card bg-gray-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative my-8 animate-[float_0.3s_ease-out]">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 w-12 h-12 bg-crew-red au-border rounded-full text-white font-display text-xl hover:bg-red-500 hover:scale-110 transition-transform flex items-center justify-center shadow-lg"
            >
              ✕
            </button>

            {/* Modal Header */}
            {modalStep === 'form' ? (
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-crew-red mx-auto au-border rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_#c51111] animate-pulse">
                  <span className="text-4xl">🚨</span>
                </div>
                <h3 className="font-display text-3xl text-white mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
                  EMERGENCY MEETING
                </h3>
                <p className="text-gray-400 font-bold text-sm">Register your crew before the ship takes off!</p>
                <div className="inline-block bg-black au-border rounded-full px-4 py-1 mt-2 text-crew-lime font-display text-sm">
                  Registration Fee: ₹55
                </div>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-crew-cyan/20 border-4 border-crew-cyan mx-auto rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(56,254,220,0.5)]">
                  <span className="text-4xl">🔐</span>
                </div>
                <h3 className="font-display text-3xl text-crew-cyan mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
                  CLEARANCE PASSCODE
                </h3>
                <p className="text-gray-300 font-bold text-sm">Step 2: Validate your college email ID</p>
                <div className="inline-block bg-black au-border rounded-full px-4 py-1 mt-2 text-crew-lime font-mono text-xs">
                  PAYMENT CONFIRMED (₹55) • CODE TRANSMITTED
                </div>
              </div>
            )}

            {/* Error Message */}
            {formError && modalStep === 'form' && (
              <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs sm:text-sm font-bold p-3 rounded-xl mb-4 text-center">
                ⚠️ {formError}
              </div>
            )}

            {/* STEP 1: REGISTRATION FORM */}
            {modalStep === 'form' ? (
              <form onSubmit={handleRazorpayPayment} className="space-y-3.5">
                {/* Quick Auto-Fill for Testing */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: 'Ankit Singh',
                      collegeId: '210029012000001',
                      year: '1',
                      branch: ALLOWED_BRANCHES[0],
                      section: 'A',
                      phone: '9876543210',
                      email: 'ankit.singh@kiet.edu',
                      track: 'Web Development',
                    });
                    setFormError(null);
                  }}
                  className="w-full bg-gray-800/90 hover:bg-gray-700 text-crew-cyan hover:text-white text-xs font-bold py-2 px-3 rounded-xl border border-gray-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  ⚡ Auto-Fill Sample Details (Quick Test)
                </button>

                {/* Name */}
                <div>
                  <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">
                    Full Name (First &amp; Last Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>

                {/* College ID */}
                <div>
                  <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">
                    College ID (15 Digits Roll Number)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={formData.collegeId}
                    onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                    className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono text-sm"
                    placeholder="210029012000000"
                  />
                </div>

                {/* Year & Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value as '1' | '2' })}
                      className="w-full bg-black au-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crew-cyan text-sm"
                    >
                      {ALLOWED_YEARS.map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' })
                      }
                      className="w-full bg-black au-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crew-cyan text-sm"
                    >
                      {ALLOWED_SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          Section {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department / Branch */}
                <div>
                  <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Department / Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full bg-black au-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crew-cyan text-sm"
                  >
                    {ALLOWED_BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* WhatsApp Phone & KIET Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black au-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crew-cyan font-mono text-sm"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">KIET Email (@kiet.edu)</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black au-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crew-cyan text-xs font-mono"
                      placeholder="your.name@kiet.edu"
                    />
                  </div>
                </div>

                {/* Preferred Track */}
                <div>
                  <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Preferred Track</label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full bg-black au-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crew-cyan text-sm"
                  >
                    <option>Web Development</option>
                    <option>Game Development</option>
                    <option>Open Innovation</option>
                  </select>
                </div>

                {/* Razorpay Fee Notice */}
                <div className="bg-black/60 au-border rounded-xl p-3 flex items-center justify-between mt-2">
                  <div className="text-xs">
                    <p className="font-bold text-gray-300">Registration Fee</p>
                    <p className="text-gray-500">Secure Razorpay Payment</p>
                  </div>
                  <div className="font-display text-xl text-crew-lime">₹55</div>
                </div>

                {/* Secondary Error Notice if scrolled down */}
                {formError && (
                  <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs font-bold p-2.5 rounded-xl text-center">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Submit / Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xl py-3.5 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      CONNECTING RAZORPAY...
                    </>
                  ) : (
                    'REGISTER & PAY ₹55 (RAZORPAY)'
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: EMAIL OTP VALIDATION */
              <div className="text-center space-y-4">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm font-bold">
                    A 6-digit transmission code was sent to:
                  </p>
                  <p className="font-mono text-crew-yellow font-bold text-sm sm:text-base mt-1">
                    {pendingTicket?.email}
                  </p>
                </div>

                {otpError && (
                  <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs font-bold p-3 rounded-xl text-center">
                    ⚠️ {otpError}
                  </div>
                )}

                {isOtpSuccess ? (
                  <div className="bg-green-950/90 border-2 border-crew-lime text-green-200 text-sm font-display p-5 rounded-2xl animate-pulse space-y-2">
                    <p className="text-2xl">✅ CLEARANCE APPROVED!</p>
                    <p className="text-xs font-mono text-gray-300">REDIRECTING TO CREWMATE DASHBOARD...</p>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* 6 Digit Input Boxes */}
                    <div className="flex justify-center gap-2 sm:gap-3 my-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 bg-black border-2 border-crew-cyan/70 focus:border-crew-cyan text-crew-cyan font-mono font-bold text-xl sm:text-2xl text-center rounded-xl focus:outline-none focus:shadow-[0_0_10px_#38fedc] transition-all"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <div className="bg-black/60 au-border rounded-xl p-3 text-xs text-gray-400 font-bold text-left">
                      💡 <span className="text-gray-300">Preview Mode:</span> Enter any 6-digit code (e.g.{' '}
                      <span className="text-crew-lime font-mono">123456</span>) to authenticate email.
                    </div>

                    {/* Resend Option */}
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-1">
                      <span>Didn&apos;t receive code?</span>
                      {resendCountdown > 0 ? (
                        <span className="text-crew-yellow font-mono">Resend in {resendCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-crew-cyan hover:underline font-bold"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display text-xl py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          AUTHENTICATING...
                        </>
                      ) : (
                        'VALIDATE & ENTER DASHBOARD'
                      )}
                    </button>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setModalStep('form')}
                        className="text-gray-400 hover:text-white text-xs font-bold underline"
                      >
                        ← Modify Registration Info
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
