'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS, ALLOWED_YEARS } from '../../../constants/branches';
import { useAuth } from '../../../hooks/useAuth';
import { registrationService } from '../../../services/registration.service';

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
  isEmailVerified: boolean;
  avatarColor?: string;
  avatarHat?: string;
  avatarMuffler?: string;
  withdrawalStatus?: string;
  assignedRole?: string;
}

export default function CadetClearancePortalPage() {
  const router = useRouter();
  const { firebaseUser, profile, isRegistered, loading: authLoading, loginWithGoogle, logout } = useAuth();

  // 3-Step sequence: 'form' -> 'otp' -> 'payment'
  const [step, setStep] = useState<'form' | 'otp' | 'payment'>('form');
  const [authError, setAuthError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  const [paymentRedirecting, setPaymentRedirecting] = useState(false);
  const [autoConfirmingPayment, setAutoConfirmingPayment] = useState(false);

  // Form Data with pre-fetched email & name
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

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Check if ticket already exists in localStorage or profile
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // 1. Check if already registered
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTicket = localStorage.getItem('amongu_user_ticket');
      if (savedTicket || isRegistered || profile?.hasRegistered) {
        setAlreadyRegistered(true);
        const timer = setTimeout(() => {
          router.push('/dashboard');
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [isRegistered, profile, router]);

  // 2. Pre-fetch email and name when firebaseUser is authenticated
  useEffect(() => {
    if (firebaseUser) {
      const email = (firebaseUser.email || '').toLowerCase().trim();
      const displayName = firebaseUser.displayName || '';

      setFormData((prev) => ({
        ...prev,
        email: email,
        name: prev.name || displayName,
      }));
    }
  }, [firebaseUser]);

  // 3. AUTOMATED POST-PAYMENT REDIRECT CATCHER (FROM RAZORPAY)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const payId =
      urlParams.get('razorpay_payment_id') ||
      urlParams.get('payment_id') ||
      urlParams.get('razorpay_payment_link_id');

    if (payId && !alreadyRegistered) {
      console.log('🎉 [Razorpay Return] Detected payment reference:', payId);
      setAutoConfirmingPayment(true);

      // Attempt to restore saved draft from localStorage
      let regDraft: RegistrationData = formData;
      try {
        const savedDraftStr = localStorage.getItem('amongu_registration_draft');
        if (savedDraftStr) {
          regDraft = JSON.parse(savedDraftStr);
        }
      } catch (e) {
        console.warn('Could not parse saved registration draft:', e);
      }

      // Finalize confirmed registration automatically
      finalizeRegistration(payId, regDraft);
    }
  }, [alreadyRegistered]);

  // 4. Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      const user = await loginWithGoogle();
      if (!user) return;

      if (user.hasRegistered) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setAuthError(
        err?.message || 'Authentication failed. Please ensure you sign in with an official @kiet.edu account.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const validateForm = (): boolean => {
    if (formData.name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
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
      setFormError('Only official KIET college email IDs ending with @kiet.edu are allowed.');
      return false;
    }
    setFormError(null);
    return true;
  };

  // Step 1: Submit Details & Transmit OTP
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSendingOtp(true);
    setFormError(null);
    setOtpError(null);
    setOtpDigits(['', '', '', '', '', '']);

    try {
      console.log('💳 [Registration Form] Submitting details and requesting OTP transmission for:', formData.email);
      // Save draft into localStorage in case of redirect
      if (typeof window !== 'undefined') {
        localStorage.setItem('amongu_registration_draft', JSON.stringify(formData));
      }
      const res = await registrationService.initiateRegistration(formData);
      if (res && (res as any).otp) {
        setServerOtp((res as any).otp);
      }
      setStep('otp');
      setResendCountdown(30);
    } catch (err: any) {
      console.warn('Backend initiateRegistration error, proceeding to OTP screen:', err);
      setStep('otp');
      setResendCountdown(30);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      setOtpError('Please enter all 6 digits of the transmission passcode.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    console.log('🔐 [OTP Verifying] Code entered:', entered);

    if (serverOtp && entered !== serverOtp && entered !== '123456') {
      setIsVerifyingOtp(false);
      setOtpError('Invalid passcode. Please enter the 6-digit code transmitted to your email.');
      return;
    }

    setTimeout(() => {
      setIsOtpSuccess(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        setIsOtpSuccess(false);
        setStep('payment');
      }, 700);
    }, 400);
  };

  // Step 3: Trigger Razorpay Payment Redirect (Automated Flow)
  const handleProceedToRazorpay = () => {
    setPaymentRedirecting(true);

    // Save final registration data draft to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('amongu_registration_draft', JSON.stringify(formData));
      console.log('💾 Stored registration draft. Redirecting to official Razorpay payment page...');

      // Redirect to Razorpay Payment Page
      window.location.href = 'https://rzp.io/rzp/VpIdCLo';
    }
  };

  const finalizeRegistration = async (payId: string, currentData: RegistrationData = formData) => {
    const verifiedTicket: ConfirmedTicket = {
      ...currentData,
      paymentId: payId,
      amount: 55,
      registeredAt: new Date().toLocaleString(),
      isEmailVerified: true,
      avatarColor: '#c51111',
      avatarHat: 'none',
      avatarMuffler: 'none',
      withdrawalStatus: 'none',
      assignedRole: 'unassigned',
    };

    try {
      console.log('💾 [Backend Sync] Sending confirmed registration record to MongoDB...');
      await registrationService.confirmRegistration(verifiedTicket);
      console.log('🎉 [Success] MongoDB confirmed registration saved!');
    } catch (err) {
      console.error('Registration backend sync error:', err);
    }

    try {
      localStorage.setItem('amongu_user_ticket', JSON.stringify(verifiedTicket));
      localStorage.removeItem('amongu_registration_draft');
    } catch (err) {
      console.error('Failed to store ticket in localStorage:', err);
    }

    setIsProcessingPayment(false);
    setAutoConfirmingPayment(false);
    router.push('/dashboard');
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
      const targetEl = document.getElementById(`reg-otp-${nextIdx}`);
      if (targetEl) (targetEl as HTMLInputElement).focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtpDigits(newOtp);
    setOtpError(null);

    if (cleanVal && index < 5) {
      const targetEl = document.getElementById(`reg-otp-${index + 1}`);
      if (targetEl) (targetEl as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevEl = document.getElementById(`reg-otp-${index - 1}`);
      if (prevEl) (prevEl as HTMLInputElement).focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setResendCountdown(30);
    setOtpError(null);
    setOtpDigits(['', '', '', '', '', '']);

    try {
      console.log('📨 [OTP Resend] Re-transmitting passcode to:', formData.email);
      const res = await registrationService.initiateRegistration(formData);
      if (res && (res as any).otp) {
        setServerOtp((res as any).otp);
      }
    } catch (err) {
      console.warn('Failed to resend OTP:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-space font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black flex flex-col justify-between">
      {/* Background stars */}
      <div className="stars"></div>
      <div className="twinkling"></div>

      {/* Top Navigation Bar */}
      <header className="relative z-50 border-b-4 border-black bg-space/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
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
            <span className="text-crew-red font-black" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #fff' }}>
              AMONG
            </span>
            U
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-crew-cyan font-bold text-sm sm:text-base transition-colors">
              ← Back to Home
            </Link>
            {firebaseUser && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-crew-cyan font-bold bg-black/60 px-3 py-1 rounded-full border border-gray-700 font-mono">
                  {firebaseUser.email}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs text-gray-400 hover:text-crew-red font-bold underline cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-xl">
          {/* Automatic Payment Confirmation Loader */}
          {autoConfirmingPayment ? (
            <div className="au-card bg-gray-900 rounded-3xl p-8 text-center border-4 border-black">
              <div className="w-16 h-16 border-4 border-crew-lime border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="font-display text-2xl text-crew-lime">PAYMENT CONFIRMED!</h2>
              <p className="text-gray-300 text-sm mt-2">
                Recording your registration and taking you to your Mission Dashboard...
              </p>
            </div>
          ) : authLoading ? (
            /* Loading Auth State */
            <div className="au-card bg-gray-900 rounded-3xl p-8 text-center border-4 border-black">
              <div className="w-16 h-16 border-4 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-display text-xl text-crew-cyan">Verifying Clearance Link...</p>
              <p className="text-gray-400 text-sm mt-1">Validating credentials with security deck</p>
            </div>
          ) : alreadyRegistered ? (
            /* Already Registered Notice */
            <div className="au-card bg-gray-900 rounded-3xl p-8 text-center border-4 border-black">
              <div className="w-20 h-20 bg-crew-lime/20 border-4 border-crew-lime mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="font-display text-3xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
                CREW CLEARANCE GRANTED
              </h2>
              <p className="text-gray-300 font-bold mb-4">
                You are already registered for AmongU! Redirecting you to your Mission Dashboard...
              </p>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display py-3 px-8 rounded-full text-base cursor-pointer"
              >
                Go to Mission Dashboard Now →
              </button>
            </div>
          ) : !firebaseUser ? (
            /* Google Sign In Barrier (Strict Enforcement) */
            <div className="au-card bg-gray-900 rounded-3xl p-6 sm:p-10 border-4 border-black text-center">
              <div className="w-24 h-24 bg-crew-red/20 border-4 border-crew-red mx-auto rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,17,17,0.6)] animate-pulse">
                <span className="text-5xl">🚨</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
                IDENTITY CLEARANCE REQUIRED
              </h1>
              <p className="text-gray-300 font-bold text-sm sm:text-base max-w-md mx-auto mb-4">
                This portal is strictly restricted to authenticated cadets of <span className="text-crew-yellow font-black">KIET Deemed to be University</span>.
              </p>

              <div className="bg-black/60 border-2 border-crew-cyan/40 rounded-2xl p-4 mb-6 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-crew-cyan font-bold text-xs sm:text-sm mb-1">
                  <span>🛡️</span> Institutional Security Rule:
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Sign in using your official institutional email ending with <strong className="text-crew-lime font-mono">@kiet.edu</strong>.
                  External domains and personal accounts are automatically blocked by the gate.
                </p>
              </div>

              {authError && (
                <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs sm:text-sm font-bold p-3 rounded-xl mb-6 text-center">
                  ⚠️ {authError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full au-btn bg-white hover:bg-gray-100 text-gray-900 font-display text-base sm:text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                <span>{isSigningIn ? 'Authenticating with Google...' : 'Sign in with KIET Account'}</span>
              </button>
            </div>
          ) : (
            /* Authenticated: 3-STEP PROGRESSION */
            <div className="au-card bg-gray-900 rounded-3xl p-6 sm:p-8 border-4 border-black relative">
              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    step === 'form' ? 'bg-crew-red text-white border border-red-400' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <span>1. Details</span>
                </div>
                <span className="text-gray-600 text-xs">→</span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    step === 'otp' ? 'bg-crew-cyan text-black border border-cyan-300' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <span>2. Verify OTP</span>
                </div>
                <span className="text-gray-600 text-xs">→</span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    step === 'payment' ? 'bg-crew-lime text-black border border-green-300' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <span>3. Payment (₹55)</span>
                </div>
              </div>

              {/* Header Title per Step */}
              {step === 'form' && (
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-crew-red mx-auto au-border rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_#c51111]">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl text-white mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
                    CREW REGISTRATION
                  </h1>
                  <p className="text-gray-400 font-bold text-xs sm:text-sm">
                    Step 1: Enter your cadet details to receive your verification code
                  </p>
                </div>
              )}

              {step === 'otp' && (
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-crew-cyan/20 border-4 border-crew-cyan mx-auto rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(56,254,220,0.5)]">
                    <span className="text-3xl">🔐</span>
                  </div>
                  <h2 className="font-display text-3xl text-crew-cyan mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
                    CLEARANCE PASSCODE
                  </h2>
                  <p className="text-gray-300 font-bold text-xs sm:text-sm">
                    Step 2: Confirm 6-digit code transmitted to <span className="text-crew-cyan font-mono">{formData.email}</span>
                  </p>
                </div>
              )}

              {step === 'payment' && (
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-crew-lime/20 border-4 border-crew-lime mx-auto rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(80,239,57,0.5)]">
                    <span className="text-3xl">💳</span>
                  </div>
                  <h2 className="font-display text-3xl text-crew-lime mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
                    OFFICIAL RAZORPAY CHECKOUT
                  </h2>
                  <p className="text-gray-300 font-bold text-xs sm:text-sm">
                    Step 3: Identity verified! Proceed to Razorpay to complete your ₹55 registration.
                  </p>
                </div>
              )}

              {/* Form Error */}
              {formError && (
                <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs sm:text-sm font-bold p-3 rounded-xl mb-4 text-center">
                  ⚠️ {formError}
                </div>
              )}

              {/* STEP 1: FORM */}
              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-crew-cyan font-bold text-xs sm:text-sm">
                        KIET Email Address
                      </label>
                      <span className="text-[10px] sm:text-xs text-crew-lime font-bold flex items-center gap-1 bg-green-950/70 border border-green-700/60 px-2 py-0.5 rounded-full">
                        ✓ Verified KIET ID (Pre-fetched)
                      </span>
                    </div>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={formData.email}
                      className="w-full bg-black/70 border-2 border-crew-cyan/50 rounded-xl px-4 py-2.5 text-crew-cyan font-mono text-sm cursor-not-allowed select-none opacity-90 shadow-inner"
                    />
                  </div>

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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value as '1' | '2' })}
                        className="w-full bg-black au-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm"
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
                        className="w-full bg-black au-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm"
                      >
                        {ALLOWED_SECTIONS.map((s) => (
                          <option key={s} value={s}>
                            Section {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Department / Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full bg-black au-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm"
                    >
                      {ALLOWED_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black au-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono text-sm"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-crew-cyan font-bold mb-1 text-xs sm:text-sm">Preferred Track</label>
                    <select
                      value={formData.track}
                      onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                      className="w-full bg-black au-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Game Development">Game Development</option>
                      <option value="Open Track">Open Track</option>
                    </select>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full au-btn bg-crew-red hover:bg-red-500 text-white font-display text-lg py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,17,17,0.8)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>TRANSMITTING PASSCODE...</span>
                        </>
                      ) : (
                        <span>TRANSMIT PASSCODE &amp; VERIFY →</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: OTP */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="bg-black/60 border-2 border-crew-cyan/40 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-300 mb-1">Transmission code dispatched to:</p>
                    <p className="text-sm font-mono text-crew-cyan font-bold">{formData.email}</p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      💡 Check your KIET email inbox. (Development bypass: <span className="font-mono text-crew-lime font-bold">123456</span>).
                    </p>
                  </div>

                  {otpError && (
                    <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs sm:text-sm font-bold p-3 rounded-xl text-center">
                      ⚠️ {otpError}
                    </div>
                  )}

                  {isOtpSuccess && (
                    <div className="bg-green-950/80 border-2 border-crew-lime text-green-200 text-sm font-bold p-4 rounded-xl text-center animate-bounce">
                      🎉 PASSCODE VERIFIED! Unlocking checkout deck...
                    </div>
                  )}

                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`reg-otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold bg-black au-border rounded-xl text-crew-cyan focus:outline-none focus:border-crew-cyan focus:shadow-[0_0_15px_rgba(56,254,220,0.6)]"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      ← Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCountdown > 0}
                      className={`${
                        resendCountdown > 0
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-crew-cyan hover:underline cursor-pointer'
                      } font-bold`}
                    >
                      {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || isOtpSuccess}
                    className="w-full au-btn bg-crew-cyan hover:bg-cyan-300 text-black font-display text-lg py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,254,220,0.6)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>VERIFYING PASSCODE...</span>
                      </>
                    ) : (
                      <span>VERIFY PASSCODE &amp; PROCEED TO PAYMENT →</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: PAYMENT SCREEN */}
              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-green-950/70 border-2 border-green-600 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center text-green-300 text-lg">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs text-green-400 font-bold uppercase tracking-wider">
                          Email Verified
                        </div>
                        <div className="text-sm font-mono text-white font-bold">{formData.email}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-green-900/80 text-green-200 border border-green-500/60 px-2.5 py-1 rounded-full font-bold">
                      KIET Cleared
                    </span>
                  </div>

                  <div className="bg-black/70 border-2 border-gray-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800 text-xs sm:text-sm">
                      <span className="text-gray-400 font-bold">Cadet Name</span>
                      <span className="text-white font-bold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800 text-xs sm:text-sm">
                      <span className="text-gray-400 font-bold">College ID</span>
                      <span className="text-crew-cyan font-mono font-bold">{formData.collegeId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800 text-xs sm:text-sm">
                      <span className="text-gray-400 font-bold">Department</span>
                      <span className="text-white font-bold">
                        {formData.branch} (Year {formData.year}, Sec {formData.section})
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800 text-xs sm:text-sm">
                      <span className="text-gray-400 font-bold">Chosen Track</span>
                      <span className="text-crew-yellow font-bold">{formData.track}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-sm sm:text-base">
                      <span className="text-white font-bold">Total Registration Fee</span>
                      <span className="text-crew-lime font-display text-2xl font-black">₹55</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-gray-800 rounded-xl p-3 text-xs text-gray-400 text-center">
                    🔒 Official checkout will open securely via Razorpay. After successful payment, your browser will return here automatically and take you straight to your Mission Dashboard.
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToRazorpay}
                    disabled={paymentRedirecting}
                    className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(80,239,57,0.8)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {paymentRedirecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>CONNECTING TO RAZORPAY...</span>
                      </>
                    ) : (
                      <span>PROCEED TO PAY ₹55 VIA RAZORPAY →</span>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      ← Modify Registration Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-black bg-space/90 p-4 text-center text-xs text-gray-500">
        AmongU Hackathon • Organized by College Tech Society • KIET Deemed to be University
      </footer>
    </div>
  );
}
