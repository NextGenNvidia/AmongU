'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
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
            <span className="inline-block px-3 py-1 bg-yellow-950/80 border border-crew-yellow/40 rounded-full text-[11px] font-mono text-crew-yellow font-bold tracking-widest uppercase mb-3">
              OFFICIAL PARTICIPATION AGREEMENT
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              TERMS &amp; CONDITIONS
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-2">
              Last Updated: October 17, 2026 • Governs Participation in AmongU Hackathon at KIET Deemed to be University
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">1. ACCEPTANCE OF TERMS</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              By accessing, browsing, creating an account, or registering for the <strong>AmongU Hackathon</strong>, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions. If you do not agree, you must refrain from registering.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">2. ELIGIBILITY CRITERIA</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
              <li>
                <strong>Institutional Affiliation:</strong> Registration is strictly limited to currently enrolled undergraduate students of <strong>KIET Deemed to be University</strong>.
              </li>
              <li>
                <strong>Account Validation:</strong> Students must authenticate using their official institutional email (ending with <code>@kiet.edu</code>) and provide their valid 15-digit College Registration Roll Number.
              </li>
              <li>
                <strong>Individual Registration:</strong> All cadets register individually. Team allocation and secret role distribution (Crewmate vs Impostor) are conducted dynamically by the central organizer evaluation matrix.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">3. REGISTRATION FEES &amp; PAYMENT</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
              <li>
                <strong>Pass Fee:</strong> A nominal participant fee of <strong>₹55 (INR Fifty-Five Only)</strong> is charged to cover event server infrastructure, refreshments, badge fabrication, and logistics.
              </li>
              <li>
                <strong>Payment Confirmation:</strong> A registration is only marked as fully confirmed once payment is verified via the designated secure payment aggregator and a confirmation ticket with a unique digital Boarding Pass ID is dispatched.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">4. CODE OF CONDUCT &amp; FAIR PLAY</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              AmongU is an innovation-driven hackathon combining software development, problem solving, and social deduction. All participants must observe the following:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-300 pl-2">
              <li>Zero tolerance for plagiarism, pre-built template abuse, harassment, discrimination, or abusive conduct towards fellow participants or mentors.</li>
              <li>Participants assigned as &quot;Impostors&quot; must execute in-game social deduction tasks strictly within the prescribed event rules without malicious physical or digital harm to any individual or university property.</li>
              <li>The organizing committee reserves the right to disqualify or ban any participant violating campus discipline or event rules without refund.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">5. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Participants retain 100% intellectual property ownership of the codebase and applications they design and develop during the AmongU Hackathon. By submitting your project, you grant the organizing committee a non-exclusive license to display, demonstrate, and archive your project for academic, promotional, and university showcase purposes.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">6. EVENT MODIFICATIONS &amp; DISQUALIFICATIONS</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              The organizing deck reserves the right to modify the schedule, venue locations within KIET campus, tracks, evaluation criteria, or prize pool if necessitated by unforeseen technical or campus circumstances.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl text-crew-yellow">7. CONTACT &amp; GRIEVANCES</h2>
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-1">
              <p><strong className="text-white">Organizing Committee:</strong> AmongU Hackathon Command Deck</p>
              <p><strong className="text-white">Center of Excellence:</strong> Center for Supercomputing, KIET Deemed to be University</p>
              <p><strong className="text-white">Official Support:</strong> <a href="mailto:amongukiet@gmail.com" className="text-crew-cyan underline">amongukiet@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
