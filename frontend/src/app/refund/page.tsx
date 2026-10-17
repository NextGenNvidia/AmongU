'use client';

import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-gray-200 font-sans selection:bg-crew-cyan selection:text-black">
      {/* Top Header */}
      <header className="border-b-2 border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-white tracking-wider flex items-center gap-2">
            <span className="text-crew-red font-black">AMONG</span>
            <span>U</span>
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-mono text-crew-cyan hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="au-card bg-gray-900/90 border-2 border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Title Header */}
          <div className="border-b border-gray-800 pb-6">
            <span className="inline-block px-3 py-1 bg-red-950/80 border border-crew-red/40 rounded-full text-[11px] font-mono text-crew-red font-bold tracking-widest uppercase mb-3">
              PAYMENT &amp; TICKET POLICY
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              CANCELLATION &amp; REFUND POLICY
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-2">
              Last Updated: October 17, 2026 • Governs All Ticket Transactions for AmongU Hackathon
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-red">1. PARTICIPATION FEE POLICY</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              The nominal registration fee of <strong>₹55 (INR Fifty-Five Only)</strong> charged for the AmongU Hackathon is utilized immediately towards provisioning computational resources, event badges, meal/refreshment reservations, and logistics for registered cadets.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-red">2. CANCELLATION BY PARTICIPANT</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
              <li>
                <strong>Non-Refundable Standard Passes:</strong> Due to immediate operational allocation of seats, catering, and team balancing algorithms, ticket registrations are generally non-refundable once successfully processed and confirmed.
              </li>
              <li>
                <strong>Ticket Transferability:</strong> If a student cannot attend in person due to medical or academic exigencies, they may request a transfer of their ticket to another eligible KIET classmate by notifying the organizers at least 48 hours prior to event kickoff.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-red">3. ELIGIBLE REFUND CIRCUMSTANCES</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Refunds will be processed in full under the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
              <li>
                <strong className="text-white">Technical Double-Deduction:</strong> In the event that your bank account or UPI is debited multiple times due to a gateway lag or network timeout for a single registration, the duplicate deduction will be automatically refunded.
              </li>
              <li>
                <strong className="text-white">Event Cancellation by Organizers:</strong> In the rare scenario that the hackathon is cancelled entirely by the university without a rescheduled date, 100% of all registration fees will be refunded to the original payment source.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-red">4. REFUND PROCESSING TIMELINE</h2>
            <div className="bg-black/60 border border-crew-cyan/40 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-2">
              <p className="text-crew-cyan font-bold text-sm">
                ⏱️ Resolution Timeline: 5 to 7 Business Days
              </p>
              <p className="leading-relaxed">
                Approved refunds are initiated via our authorized payment processing partner directly to the original source payment method (Bank Account / UPI / Card) within <strong>5 to 7 working days</strong>, adhering to standard banking clearing cycles.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-red">5. HOW TO CLAIM A REFUND OR ASSISTANCE</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              To report a duplicate transaction or request assistance, email us with your <strong>Payment ID / Transaction Reference (UTR)</strong>, student name, and College ID:
            </p>
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-1">
              <p><strong className="text-white">Email Address:</strong> <a href="mailto:amongukiet@gmail.com" className="text-crew-cyan underline font-bold">amongukiet@gmail.com</a></p>
              <p><strong className="text-white">Subject Format:</strong> <code>[Refund Request] - Transaction ID - College ID</code></p>
              <p><strong className="text-white">Response Time:</strong> Within 24 hours</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
