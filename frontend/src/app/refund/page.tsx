'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { refundService, RefundRecord } from '../../services/refund.service';
import { registrationService } from '../../services/registration.service';

export default function RefundPage() {
  const { firebaseUser, loading: authLoading, loginWithGoogle } = useAuth();

  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [registration, setRegistration] = useState<any>(null);
  const [existingRefund, setExistingRefund] = useState<RefundRecord | null>(null);
  const [isReapplying, setIsReapplying] = useState<boolean>(false);

  // Form Fields
  const [upiId, setUpiId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<string>('Schedule Conflict / Cannot Attend');
  const [reasonDetails, setReasonDetails] = useState<string>('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [confirmedDisclaimer, setConfirmedDisclaimer] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState<boolean>(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  const fetchRefundAndPaidStatus = async () => {
    if (!firebaseUser) {
      setIsLoadingStatus(false);
      return;
    }

    try {
      setIsLoadingStatus(true);
      setSubmitError(null);

      // Check registration & refund status in parallel
      const [regRes, refundRes] = await Promise.all([
        registrationService.getMyStatus().catch(() => null),
        refundService.getMyRefundStatus().catch(() => null),
      ]);

      const paid = Boolean(
        (regRes && regRes.isRegistered) ||
        (refundRes && refundRes.isPaidUser)
      );

      setIsPaidUser(paid);
      if (regRes && regRes.registration) {
        setRegistration(regRes.registration);
        if (regRes.registration.phone) {
          setPhone(regRes.registration.phone);
        }
      } else if (refundRes && refundRes.registration) {
        setRegistration(refundRes.registration);
        if (refundRes.registration.phone) {
          setPhone(refundRes.registration.phone);
        }
      }

      if (refundRes && refundRes.hasRequest && refundRes.refund) {
        setExistingRefund(refundRes.refund);
      } else {
        setExistingRefund(null);
      }
    } catch (err: any) {
      console.error('Error fetching refund status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchRefundAndPaidStatus();
  }, [firebaseUser]);

  // Handle Screenshot Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot file size must be under 5MB.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setScreenshotBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const cleanUpi = upiId.trim();
    if (!cleanUpi || !cleanUpi.includes('@')) {
      setSubmitError('Please enter a valid UPI ID / VPA containing "@" (e.g. 9818038500@upi, name@okaxis)');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number for communication.');
      return;
    }

    const fullReason = `${reasonCategory}: ${reasonDetails.trim()}`;
    if (fullReason.length < 8) {
      setSubmitError('Please provide a brief reason or details for your refund.');
      return;
    }

    if (!confirmedDisclaimer) {
      setSubmitError('Please check the confirmation box before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await refundService.submitRefundRequest({
        upiId: cleanUpi,
        phone: phone.trim(),
        reason: fullReason,
        screenshotUrl: screenshotBase64 || '',
      });

      setSubmitSuccess(res.message || 'Refund request submitted successfully!');
      setExistingRefund(res.refund);
      setIsReapplying(false);
    } catch (err: any) {
      console.error('Error submitting refund:', err);
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to submit refund request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-200 font-sans selection:bg-crew-cyan selection:text-black">
      {/* Top Header */}
      <header className="border-b-2 border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
            <span className="text-crew-red font-black">AMONG</span>
            <span>U</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-mono text-crew-cyan hover:text-white transition-colors"
            >
              Mission Dashboard →
            </Link>
            <Link
              href="/"
              className="text-xs sm:text-sm font-mono text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-2 border-b border-gray-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-950/80 border border-crew-red/40 rounded-full text-xs font-mono text-crew-red font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-crew-red animate-pulse" />
            OFFICIAL REFUND PORTAL
          </div>
          <h1 className="font-display text-3xl sm:text-5xl text-white tracking-wide">
            CADET REFUND REQUEST
          </h1>
          <p className="text-sm font-mono text-gray-400 max-w-xl mx-auto">
            Direct refund processing &amp; status tracking for verified AmongU Hackathon participants.
          </p>
        </div>

        {/* Loading State */}
        {authLoading || isLoadingStatus ? (
          <div className="au-card bg-gray-900/80 border-2 border-gray-800 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-display text-xl text-white">CHECKING CADET CLEARANCE STATUS...</h3>
            <p className="text-xs font-mono text-gray-400 mt-1">Verifying official KIET account and ticket records</p>
          </div>
        ) : !firebaseUser ? (
          /* State 1: Not Logged In */
          <div className="au-card bg-gray-900/90 border-2 border-gray-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 border-2 border-crew-red/60 flex items-center justify-center mx-auto text-crew-red shadow-[0_0_20px_rgba(197,17,17,0.4)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl text-white">AUTHENTICATION REQUIRED</h2>
              <p className="text-sm text-gray-300 font-sans">
                To check your ticket eligibility or file for a refund, please sign in with your official KIET Google Account (<strong>@kiet.edu</strong>).
              </p>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              className="au-btn bg-crew-red hover:bg-red-600 text-white font-display text-sm py-3.5 px-8 rounded-xl shadow-[0_0_25px_rgba(197,17,17,0.5)] transition-all cursor-pointer font-bold inline-flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.485 0 2.85.54 3.9 1.44l2.385-2.385C16.89 3.51 14.685 2.6 12.24 2.6 7.05 2.6 2.85 6.8 2.85 12s4.2 9.4 9.39 9.4c5.43 0 9.06-3.81 9.06-9.225 0-.615-.06-1.23-.165-1.89H12.24z"/>
              </svg>
              <span>SIGN IN WITH GOOGLE (@kiet.edu)</span>
            </button>
          </div>
        ) : !isPaidUser ? (
          /* State 2: Logged In, but NOT Paid */
          <div className="au-card bg-red-950/30 border-2 border-crew-red/80 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-950 border-2 border-crew-red flex items-center justify-center mx-auto text-crew-red">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl text-white">NO CONFIRMED PAID REGISTRATION</h2>
              <p className="text-sm text-gray-300 font-sans">
                Signed in as <strong className="text-crew-cyan">{firebaseUser.email}</strong>.
              </p>
              <div className="bg-black/60 border border-red-500/30 rounded-xl p-4 text-xs font-mono text-red-300 text-left space-y-1">
                <p>• Only cadets with a confirmed ₹55 ticket payment are eligible to submit refund requests.</p>
                <p>• If you paid but your POV/ticket was not confirmed, please contact the organizers directly with your bank transaction UTR reference at <strong>amongukiet@gmail.com</strong>.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <Link
                href="/dashboard"
                className="au-btn bg-gray-800 hover:bg-gray-700 text-white font-display text-xs sm:text-sm py-3 px-6 rounded-xl border border-gray-700 font-bold"
              >
                Go to Mission Dashboard
              </Link>
              <Link
                href="/"
                className="au-btn bg-black hover:bg-gray-900 text-gray-300 font-display text-xs sm:text-sm py-3 px-6 rounded-xl border border-gray-800 font-bold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : existingRefund && !isReapplying ? (
          /* State 3: Logged in, Paid, and has existing Refund Request */
          <div className="space-y-6">
            {/* Status Alert Banner */}
            <div
              className={`border-2 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
                existingRefund.status === 'approved'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                  : existingRefund.status === 'rejected'
                  ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                  : 'bg-yellow-950/40 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                      existingRefund.status === 'approved'
                        ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300'
                        : existingRefund.status === 'rejected'
                        ? 'bg-red-900/60 border-red-400 text-red-300'
                        : 'bg-yellow-900/60 border-yellow-400 text-yellow-300'
                    }`}
                  >
                    {existingRefund.status === 'approved' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : existingRefund.status === 'rejected' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        existingRefund.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                          : existingRefund.status === 'rejected'
                          ? 'bg-red-950 text-red-300 border-red-500/60'
                          : 'bg-yellow-950 text-yellow-300 border-yellow-500/60'
                      }`}
                    >
                      {existingRefund.status === 'approved'
                        ? '● REFUND PROCESSED / APPROVED'
                        : existingRefund.status === 'rejected'
                        ? '■ REFUND REQUEST REJECTED'
                        : '⏳ UNDER REVIEW BY ORGANIZERS'}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl text-white mt-1">
                      {existingRefund.status === 'approved'
                        ? 'REFUND APPROVED'
                        : existingRefund.status === 'rejected'
                        ? 'REQUEST REJECTED'
                        : 'CLAIM UNDER REVIEW'}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono text-gray-400">Refund Amount</p>
                  <p className="font-display text-2xl text-crew-lime font-bold">₹{existingRefund.amount || 55}</p>
                </div>
              </div>

              {/* Status Description & Admin Feedback */}
              <div className="pt-4 space-y-3 font-sans">
                {existingRefund.status === 'approved' && (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 text-xs font-mono text-emerald-200 space-y-1">
                    <p className="font-bold text-sm">🎉 Your refund of ₹{existingRefund.amount} has been approved!</p>
                    <p>Processed to UPI ID: <strong>{existingRefund.upiId}</strong></p>
                    {existingRefund.adminNotes && (
                      <p className="text-gray-300 pt-1">
                        <strong>Organizer Remark:</strong> {existingRefund.adminNotes}
                      </p>
                    )}
                    {existingRefund.reviewedAt && (
                      <p className="text-gray-400 text-[10px] pt-1">
                        Reviewed on: {new Date(existingRefund.reviewedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                {existingRefund.status === 'rejected' && (
                  <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-4 text-xs font-mono text-red-200 space-y-1">
                    <p className="font-bold text-sm">⚠️ Your refund request was reviewed and rejected.</p>
                    <p className="text-white">
                      <strong>Rejection Reason:</strong> {existingRefund.rejectionReason || 'Details could not be verified by organizers.'}
                    </p>
                    {existingRefund.reviewedAt && (
                      <p className="text-gray-400 text-[10px] pt-1">
                        Reviewed on: {new Date(existingRefund.reviewedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                {existingRefund.status === 'pending' && (
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">
                    Your request was received on <strong>{new Date(existingRefund.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. The organizing committee is verifying your clearance and UPI ID. Once approved or processed, you will see the update here.
                  </p>
                )}
              </div>
            </div>

            {/* Request Summary Details Card */}
            <div className="au-card bg-gray-900/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-display text-lg text-white border-b border-gray-800 pb-3 flex items-center justify-between">
                <span>SUBMITTED CLAIM DETAILS</span>
                <span className="text-xs font-mono text-gray-400">ID: {existingRefund._id.slice(-8)}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-400 block">Cadet Name</span>
                  <span className="text-white font-bold">{existingRefund.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">College ID</span>
                  <span className="text-white font-bold">{existingRefund.collegeId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Target UPI ID</span>
                  <span className="text-crew-cyan font-bold">{existingRefund.upiId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Contact Phone</span>
                  <span className="text-white">{existingRefund.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Payment Reference</span>
                  <span className="text-gray-300">{existingRefund.paymentId || 'pay_confirmed'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Submitted At</span>
                  <span className="text-gray-300">{new Date(existingRefund.createdAt).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border-t border-gray-800/80 pt-3">
                <span className="text-xs font-mono text-gray-400 block mb-1">Reason Stated</span>
                <p className="text-xs font-sans text-gray-300 bg-black/50 p-3 rounded-xl border border-gray-800">
                  {existingRefund.reason}
                </p>
              </div>

              {existingRefund.screenshotUrl && (
                <div className="border-t border-gray-800/80 pt-3">
                  <span className="text-xs font-mono text-gray-400 block mb-2">Payment Screenshot Attached</span>
                  <button
                    type="button"
                    onClick={() => setPreviewModalImg(existingRefund.screenshotUrl!)}
                    className="relative group block rounded-xl overflow-hidden border border-gray-700 hover:border-crew-cyan transition-colors"
                  >
                    <img
                      src={existingRefund.screenshotUrl}
                      alt="Payment Screenshot"
                      className="h-28 w-auto object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-mono text-crew-cyan">
                      Click to View Full Image 🔍
                    </div>
                  </button>
                </div>
              )}

              {/* If rejected, allow re-applying */}
              {existingRefund.status === 'rejected' && (
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    onClick={() => {
                      setIsReapplying(true);
                      setUpiId(existingRefund.upiId || '');
                      setPhone(existingRefund.phone || '');
                    }}
                    className="au-btn bg-crew-cyan hover:bg-cyan-400 text-black font-display text-xs sm:text-sm py-2.5 px-6 rounded-xl font-bold cursor-pointer"
                  >
                    SUBMIT REVISED REFUND REQUEST →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* State 4: Logged In, Paid, Ready to Submit Refund */
          <div className="au-card bg-gray-900/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="border-b border-gray-800 pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-white">SUBMIT REFUND CLAIM</h2>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  Reimbursements are issued to the verified UPI ID provided below.
                </p>
              </div>
              <span className="text-xs font-mono bg-green-950/80 border border-crew-lime/40 text-crew-lime px-3 py-1 rounded-full font-bold">
                ✓ Confirmed Paid Ticket (₹55)
              </span>
            </div>

            {/* Cadet Summary Info (Read-only) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/50 p-4 rounded-2xl border border-gray-800 text-xs font-mono">
              <div>
                <span className="text-gray-500 block">Cadet Name</span>
                <span className="text-white font-bold truncate block">{registration?.name || firebaseUser.displayName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">College Email</span>
                <span className="text-white truncate block">{firebaseUser.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block">College ID</span>
                <span className="text-white truncate block">{registration?.collegeId || 'Registered'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Amount to Refund</span>
                <span className="text-crew-lime font-bold">₹{registration?.amount || 55}</span>
              </div>
            </div>

            {/* Error & Success Messages */}
            {submitError && (
              <div className="bg-red-950/80 border border-crew-red text-red-200 text-xs font-mono p-3.5 rounded-xl">
                ⚠️ {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-mono p-3.5 rounded-xl">
                ✓ {submitSuccess}
              </div>
            )}

            {/* Refund Form */}
            <form onSubmit={handleSubmitRefund} className="space-y-5 font-sans">
              {/* UPI ID Field */}
              <div>
                <label className="block text-xs font-mono text-crew-cyan font-bold uppercase tracking-wider mb-1.5">
                  Your UPI ID / VPA <span className="text-crew-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9818038500@upi, yourname@oksbi, name@paytm"
                  className="w-full bg-black/80 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-crew-cyan"
                />
                <p className="text-[11px] font-mono text-gray-400 mt-1">
                  Ensure this UPI ID is active and accepts incoming payments.
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-mono text-gray-300 font-bold uppercase tracking-wider mb-1.5">
                  Contact Phone / WhatsApp Number <span className="text-crew-red">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-black/80 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-crew-cyan"
                />
              </div>

              {/* Reason Category */}
              <div>
                <label className="block text-xs font-mono text-gray-300 font-bold uppercase tracking-wider mb-1.5">
                  Reason for Refund <span className="text-crew-red">*</span>
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full bg-black/80 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-crew-cyan"
                >
                  <option value="Schedule Conflict / Cannot Attend">Schedule Conflict / Cannot Attend on Nov 28</option>
                  <option value="Accidental / Duplicate Payment">Accidental / Duplicate Payment</option>
                  <option value="Personal / Medical Exigency">Personal / Medical Exigency</option>
                  <option value="Team Disbanded / Cannot Form Squad">Team Disbanded / Cannot Form Squad</option>
                  <option value="Other Reason">Other Reason</option>
                </select>
              </div>

              {/* Reason Description */}
              <div>
                <label className="block text-xs font-mono text-gray-300 font-bold uppercase tracking-wider mb-1.5">
                  Additional Details / Explanation <span className="text-crew-red">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  placeholder="Please briefly describe why you are requesting a refund..."
                  className="w-full bg-black/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white font-sans placeholder-gray-500 focus:outline-none focus:border-crew-cyan"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-mono text-gray-300 font-bold uppercase tracking-wider mb-1.5">
                  Payment Screenshot / Supporting Proof <span className="text-gray-500 font-normal">(Recommended)</span>
                </label>
                <div className="border-2 border-dashed border-gray-700 hover:border-crew-cyan/60 rounded-2xl p-4 sm:p-6 text-center transition-colors bg-black/40">
                  {screenshotBase64 ? (
                    <div className="space-y-3">
                      <img
                        src={screenshotBase64}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain border border-gray-700"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-mono text-crew-cyan truncate max-w-xs">{screenshotName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotBase64('');
                            setScreenshotName('');
                          }}
                          className="text-xs font-mono text-red-400 hover:text-red-300 underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <label className="cursor-pointer">
                        <span className="text-xs font-mono text-crew-cyan hover:underline font-bold">
                          Upload Payment Screenshot (JPG, PNG)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-gray-500 font-mono mt-1">
                        Screenshot showing Razorpay / UPI confirmation or Bank SMS
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="disclaimer"
                  checked={confirmedDisclaimer}
                  onChange={(e) => setConfirmedDisclaimer(e.target.checked)}
                  className="mt-0.5 rounded text-crew-cyan focus:ring-0 cursor-pointer"
                />
                <label htmlFor="disclaimer" className="text-xs font-mono text-gray-300 cursor-pointer">
                  I confirm that the UPI ID provided belongs to me. I acknowledge that upon refund approval, my ticket pass and seating clearance for AmongU Hackathon will be revoked.
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {isReapplying && (
                  <button
                    type="button"
                    onClick={() => setIsReapplying(false)}
                    className="au-btn bg-gray-800 text-gray-300 font-display text-xs py-3 px-5 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="au-btn bg-crew-red hover:bg-red-600 disabled:opacity-50 text-white font-display text-sm py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(197,17,17,0.4)] transition-all cursor-pointer font-bold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>SUBMITTING CLAIM...</span>
                    </>
                  ) : (
                    <span>SUBMIT REFUND CLAIM (₹55) →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expandable Official Policy Section */}
        <div className="border border-gray-800/80 rounded-2xl overflow-hidden bg-gray-950/60">
          <button
            type="button"
            onClick={() => setShowPolicy(!showPolicy)}
            className="w-full p-4 flex items-center justify-between text-left text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>📜 View Official Cancellation &amp; Refund Policy Guidelines</span>
            <span>{showPolicy ? '▲ Collapse' : '▼ Expand'}</span>
          </button>

          {showPolicy && (
            <div className="p-6 border-t border-gray-800/80 space-y-4 text-xs text-gray-300 font-sans leading-relaxed">
              <h4 className="font-display text-sm text-white">Guidelines &amp; Refund Processing Timeline:</h4>
              <p>
                1. <strong>Verification:</strong> All refund requests are reviewed by the organizing committee to match against verified Razorpay / UPI payment receipts.
              </p>
              <p>
                2. <strong>Timeline:</strong> Once marked &quot;Approved&quot; by the admin, the payment transfer to your submitted UPI ID will be initiated within <strong>3 to 5 business days</strong>.
              </p>
              <p>
                3. <strong>Revocation:</strong> Accepted refund requests will automatically cancel and release the corresponding seat reservation for AmongU Hackathon.
              </p>
              <p>
                4. <strong>Support:</strong> For disputes or inquiries, you may reach out directly to the organizers at <a href="mailto:amongukiet@gmail.com" className="text-crew-cyan underline">amongukiet@gmail.com</a>.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Image Modal for Screenshot Viewing */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={previewModalImg}
              alt="Enlarged Screenshot"
              className="max-h-[80vh] w-auto rounded-2xl object-contain border-2 border-crew-cyan"
            />
            <p className="text-xs font-mono text-gray-400 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
