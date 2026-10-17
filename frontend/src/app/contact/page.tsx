'use client';

import React from 'react';
import Link from 'next/link';

export default function ContactUsPage() {
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
              ORGANIZER COMMAND DECK
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              CONTACT US
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-2">
              Official Contact &amp; Support Matrix for AmongU Hackathon at KIET Deemed to be University
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Host Details */}
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-6 space-y-3">
              <h3 className="font-display text-xl text-crew-cyan">EVENT &amp; VENUE DETAILS</h3>
              <div className="text-xs font-mono text-gray-300 space-y-2">
                <p>
                  <strong className="text-white">Event Name:</strong> AmongU Hackathon 2026
                </p>
                <p>
                  <strong className="text-white">Organized Under:</strong> Centre of Excellence (CoE), Center for Supercomputing
                </p>
                <p>
                  <strong className="text-white">Campus Location:</strong><br />
                  KIET Deemed to be University<br />
                  Delhi-NCR, Meerut Road (NH-58), Ghaziabad, Uttar Pradesh - 201206, India
                </p>
              </div>
            </div>

            {/* Support & Grievance */}
            <div className="bg-black/60 border border-gray-800 rounded-2xl p-6 space-y-3">
              <h3 className="font-display text-xl text-crew-lime">DIRECT COMMUNICATION</h3>
              <div className="text-xs font-mono text-gray-300 space-y-2">
                <p>
                  <strong className="text-white">Primary Support Email:</strong><br />
                  <a href="mailto:amongukiet@gmail.com" className="text-crew-cyan underline font-bold">
                    amongukiet@gmail.com
                  </a>
                </p>
                <p>
                  <strong className="text-white">Hours of Operation:</strong><br />
                  Monday – Saturday: 9:00 AM – 7:00 PM IST
                </p>
                <p>
                  <strong className="text-white">Response Turnaround:</strong><br />
                  Within 12 to 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
