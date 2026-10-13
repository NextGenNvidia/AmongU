'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRazorpay } from '../../hooks/useRazorpay';
import { registrationService } from '../../services/registration.service';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS, ALLOWED_YEARS } from '../../constants/branches';
import { RegistrationFormData, RegistrationRecord } from '../../types/registration';

interface EmergencyMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeINR?: number;
}

export const EmergencyMeetingModal: React.FC<EmergencyMeetingModalProps> = ({
  isOpen,
  onClose,
  feeINR = 55,
}) => {
  const { profile, loading: authLoading, loginWithGoogle } = useAuth();
  const { openCheckout } = useRazorpay();

  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    collegeId: '',
    year: '1',
    branch: ALLOWED_BRANCHES[0],
    section: 'A',
    phone: '',
    email: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState<RegistrationRecord | null>(null);

  // Sync email & name when user logs in
  React.useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || profile.name || '',
        email: profile.email || prev.email,
      }));
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic frontend checks before sending
    if (formData.name.trim().split(/\s+/).length < 2) {
      setErrorMsg('Please enter both your First Name and Last Name.');
      return;
    }
    if (!/^\d{15}$/.test(formData.collegeId.trim())) {
      setErrorMsg('College ID must be strictly 15 digits.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setErrorMsg('Phone number must be a valid 10-digit Indian WhatsApp number.');
      return;
    }
    if (!formData.email.toLowerCase().endsWith('@kiet.edu')) {
      setErrorMsg('Only official @kiet.edu college emails are allowed.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Create Razorpay Order via backend API
      const res = await registrationService.createOrder(formData);

      if (!res.success || !res.order) {
        throw new Error(res.message || 'Failed to create payment order');
      }

      // 2. Open Razorpay Checkout modal
      openCheckout({
        key: res.order.keyId,
        amount: res.order.amount,
        currency: res.order.currency,
        name: 'AmongU College Club',
        description: 'AmongU Event Registration Fee',
        order_id: res.order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#c51111',
        },
        handler: async (response) => {
          try {
            // 3. Cryptographically verify signature on backend
            const verifyRes = await registrationService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setConfirmedRegistration(verifyRes.registration);
            } else {
              setErrorMsg(verifyRes.message || 'Payment verification failed');
            }
          } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || err?.message || 'Verification error');
          }
        },
      });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Error creating registration order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="au-card bg-gray-900 w-full max-w-lg rounded-3xl p-6 md:p-8 relative my-8 animate-[float_0.3s_ease-out]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-12 h-12 bg-crew-red au-border rounded-full text-white font-display text-xl hover:bg-red-500 hover:scale-110 transition-transform flex items-center justify-center"
        >
          ✕
        </button>

        {/* Siren Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-crew-red mx-auto au-border rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_#c51111] animate-pulse">
            <span className="text-4xl">🚨</span>
          </div>
          <h3 className="font-display text-3xl text-white mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
            EMERGENCY MEETING
          </h3>
          <p className="text-gray-400 font-bold text-sm">Register your crew before the ship takes off!</p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-sm font-bold p-3 rounded-xl mb-4 text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Case 1: Confirmed Registration Receipt */}
        {confirmedRegistration ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-crew-lime mx-auto rounded-full flex items-center justify-center au-border">
              <span className="text-3xl">✅</span>
            </div>
            <h4 className="font-display text-2xl text-crew-lime">TASK COMPLETED!</h4>
            <p className="text-gray-300 font-bold">You are officially registered for AmongU.</p>
            <div className="bg-black/60 au-border rounded-xl p-4 text-left text-sm space-y-2">
              <p>
                <strong className="text-gray-400">Name:</strong> {confirmedRegistration.name}
              </p>
              <p>
                <strong className="text-gray-400">College ID:</strong> {confirmedRegistration.collegeId}
              </p>
              <p>
                <strong className="text-gray-400">Branch &amp; Year:</strong> {confirmedRegistration.branch} (Year{' '}
                {confirmedRegistration.year})
              </p>
              <p>
                <strong className="text-gray-400">Section:</strong> {confirmedRegistration.section}
              </p>
              <p>
                <strong className="text-gray-400">Payment ID:</strong>{' '}
                <span className="text-crew-cyan font-mono">{confirmedRegistration.razorpayPaymentId}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="au-btn w-full bg-crew-cyan hover:bg-cyan-300 text-black font-display text-lg py-3 rounded-xl mt-4"
            >
              RETURN TO SHIP
            </button>
          </div>
        ) : !profile ? (
          /* Case 2: User Not Logged In */
          <div className="text-center py-6 space-y-4">
            <p className="text-gray-300 font-bold">
              Sign in with your official <span className="text-crew-cyan">@kiet.edu</span> Google Account to begin
              registration.
            </p>
            <button
              onClick={loginWithGoogle}
              disabled={authLoading}
              className="au-btn w-full bg-crew-lime hover:bg-green-400 text-black font-display text-xl py-4 rounded-xl flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              SIGN IN WITH GOOGLE
            </button>
          </div>
        ) : (
          /* Case 3: Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-crew-cyan font-bold mb-1 text-sm">Full Name (First &amp; Last)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-crew-cyan font-bold mb-1 text-sm">College ID (15 Digits)</label>
              <input
                type="text"
                required
                maxLength={15}
                value={formData.collegeId}
                onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono"
                placeholder="e.g. 210029012000000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-crew-cyan font-bold mb-1 text-sm">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value as '1' | '2' })}
                  className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
                >
                  {ALLOWED_YEARS.map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-crew-cyan font-bold mb-1 text-sm">Section</label>
                <select
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' })
                  }
                  className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
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
              <label className="block text-crew-cyan font-bold mb-1 text-sm">Branch</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
              >
                {ALLOWED_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-crew-cyan font-bold mb-1 text-sm">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-crew-cyan font-bold mb-1 text-sm">KIET Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  readOnly
                  className="w-full bg-gray-900 au-border rounded-xl px-4 py-2.5 text-gray-300 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xl py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2"
            >
              {submitting ? 'GENERATING SECURE LINK...' : `PAY ₹${feeINR} VIA RAZORPAY`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
