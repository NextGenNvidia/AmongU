'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            <span className="inline-block px-3 py-1 bg-cyan-950/80 border border-crew-cyan/40 rounded-full text-[11px] font-mono text-crew-cyan font-bold tracking-widest uppercase mb-3">
              LEGAL COMPLIANCE &amp; DATA PRIVACY
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              PRIVACY POLICY
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-2">
              Last Updated: October 17, 2026 • Effective for AmongU Hackathon at KIET Deemed to be University
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">1. OVERVIEW &amp; SCOPE</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              This Privacy Policy describes how the organizers of <strong>AmongU Hackathon</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), hosted at <strong>KIET Deemed to be University</strong>, collect, store, use, and protect your personal information when you register, authenticate via Google OAuth, or participate in the AmongU event through our website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">2. INFORMATION WE COLLECT</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              When you interact with the AmongU portal, we may collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
              <li>
                <strong className="text-white">Authentication Data:</strong> Full Name, Profile Picture, and official institutional email address (ending strictly with <code>@kiet.edu</code>) provided via Google OAuth authentication.
              </li>
              <li>
                <strong className="text-white">Academic &amp; Student Credentials:</strong> College Roll/Registration ID (15-digit), Academic Year (Year 1 or Year 2), Department / Branch of study, and Section.
              </li>
              <li>
                <strong className="text-white">Contact Information:</strong> Active WhatsApp phone number for critical emergency briefings, schedule broadcasts, and team coordination.
              </li>
              <li>
                <strong className="text-white">Payment &amp; Transaction Details:</strong> Payment transaction identifier (Transaction ID / Payment ID / UTR), payment timestamp, and transaction status. We do <strong>NOT</strong> collect or store sensitive financial card numbers, CVVs, or bank netbanking credentials; all payment processing is handled securely by certified, RBI-licensed payment aggregators.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">3. HOW WE USE YOUR INFORMATION</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              We process your data strictly for legitimate operational purposes related to the AmongU Hackathon:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
              <li>To verify student eligibility and ensure only authorized students of KIET Deemed to be University register.</li>
              <li>To transmit one-time clearance passcodes (OTPs) and dispatch confirmed digital boarding passes (tickets) via email.</li>
              <li>To organize participants into balanced multi-disciplinary teams and assign secret roles (Crewmate / Impostor) for the social deduction hackathon format.</li>
              <li>To issue certificates of participation and announce hackathon winners and prize distributions.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">4. DATA SECURITY &amp; STORAGE</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Participant data is stored on encrypted, access-restricted database infrastructure (MongoDB Atlas) with strict role-based access control. Google authentication is verified using industry-standard Firebase Authentication SDKs. We do not sell, rent, or trade student data to third parties or marketing advertisers.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">5. THIRD-PARTY SERVICES</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Our website uses trusted third-party providers for infrastructure:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 pl-2">
              <li><strong>Google OAuth &amp; Firebase:</strong> Identity validation and authentication.</li>
              <li><strong>Payment Aggregators (Razorpay / Instamojo / Cashfree / UPI):</strong> End-to-end encrypted payment processing.</li>
              <li><strong>Nodemailer / Google SMTP:</strong> Automated transmission of OTPs and confirmation tickets.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">6. CONTACT FOR PRIVACY INQUIRIES</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              If you have any questions or request data deletion regarding your account records, please contact our organizing deck at:
            </p>
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-1">
              <p><strong className="text-white">Event:</strong> AmongU Hackathon 2026</p>
              <p><strong className="text-white">Institution:</strong> KIET Deemed to be University, Ghaziabad, Delhi-NCR, India</p>
              <p><strong className="text-white">Official Email:</strong> <a href="mailto:amongukiet@gmail.com" className="text-crew-cyan underline">amongukiet@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
