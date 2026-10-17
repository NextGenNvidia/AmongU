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
                <strong className="text-white">Account &amp; Profile Information:</strong> Full Name, Profile Picture, and institutional email address (ending with <code>@kiet.edu</code>) provided during sign-in.
              </li>
              <li>
                <strong className="text-white">Academic Credentials:</strong> College Roll / Student Registration ID, Academic Year, Department / Branch of study, and Section.
              </li>
              <li>
                <strong className="text-white">Contact Information:</strong> Contact phone number for event alerts, schedule updates, and team coordination.
              </li>
              <li>
                <strong className="text-white">Payment Transaction Details:</strong> Order identifier, transaction timestamp, and payment confirmation status. We do <strong>NOT</strong> store or have access to sensitive card numbers, CVVs, UPI PINs, or banking credentials; all transactions are processed securely through certified third-party payment gateways.
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
            <h2 className="font-display text-xl text-crew-cyan">4. DATA SECURITY &amp; RETENTION</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              We implement industry-standard administrative, physical, and technical safeguards to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Access to participant records is strictly restricted to authorized event administrators. We retain registration data only for the duration necessary to conduct the event, fulfill academic verification, and issue certificates. We do not sell, rent, or trade participant data to any commercial third parties or advertisers.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">5. THIRD-PARTY SERVICE PROVIDERS</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              We may utilize trusted third-party service providers to facilitate platform functionality, including secure payment processing, identity verification, and transactional notifications. These third-party entities are bound by confidentiality obligations and are only permitted to process data in accordance with our instructions and applicable privacy regulations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-cyan">6. CONTACT FOR PRIVACY INQUIRIES</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or wish to review your registration information, please contact the organizing team:
            </p>
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-1">
              <p><strong className="text-white">Event:</strong> AmongU Hackathon</p>
              <p><strong className="text-white">Institution:</strong> KIET Deemed to be University, Ghaziabad, Delhi-NCR, India</p>
              <p><strong className="text-white">Official Email:</strong> <a href="mailto:amongukiet@gmail.com" className="text-crew-cyan underline">amongukiet@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
