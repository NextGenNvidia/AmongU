'use client';

import React from 'react';
import Link from 'next/link';

interface SponsorTier {
  tier: string;
  badgeColor: string;
  borderColor: string;
  items: {
    name: string;
    role: string;
    description?: string;
    logo?: string;
    url?: string;
    isPlaceholder?: boolean;
  }[];
}

export default function SponsorsPage() {
  const sponsorTiers: SponsorTier[] = [
    {
      tier: 'TITLE PARTNER',
      badgeColor: 'bg-crew-yellow/20 text-crew-yellow border-crew-yellow/50',
      borderColor: 'border-crew-yellow/40 hover:border-crew-yellow',
      items: [
        {
          name: 'Title Partner Slot',
          role: 'Headline Event Sponsor',
          description: 'Official Headline Partner powering AmongU Hackathon 2026 at KIET Deemed to be University.',
          isPlaceholder: true,
        },
      ],
    },
    {
      tier: 'TRACK & DOMAIN PARTNERS',
      badgeColor: 'bg-crew-cyan/20 text-crew-cyan border-crew-cyan/50',
      borderColor: 'border-crew-cyan/40 hover:border-crew-cyan',
      items: [
        {
          name: 'Web Track Partner',
          role: 'Track Sponsor',
          description: 'Supporting innovators building scalable web and cloud solutions.',
          isPlaceholder: true,
        },
        {
          name: 'AI & Innovation Partner',
          role: 'Track Sponsor',
          description: 'Powering cutting-edge AI prototypes and developer tools.',
          isPlaceholder: true,
        },
        {
          name: 'Gaming & Interactive Partner',
          role: 'Track Sponsor',
          description: 'Empowering game mechanics, physics, and interactive experiences.',
          isPlaceholder: true,
        },
      ],
    },
    {
      tier: 'COMMUNITY & ECOSYSTEM ALLIES',
      badgeColor: 'bg-crew-lime/20 text-crew-lime border-crew-lime/50',
      borderColor: 'border-crew-lime/40 hover:border-crew-lime',
      items: [
        {
          name: 'NextGen Supercomputing Club',
          role: 'Host & Organizing Body',
          description: 'Centre of Excellence (CoE), Center for Supercomputing at KIET Deemed to be University.',
          url: 'https://www.linkedin.com/company/nextgen-supercomputing',
          isPlaceholder: false,
        },
        {
          name: 'Community Partner Slot',
          role: 'Outreach & Student Community',
          description: 'Connecting top tech student clubs and developer communities across Delhi-NCR.',
          isPlaceholder: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-200 font-sans selection:bg-crew-cyan selection:text-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-900/10 blur-[130px] rounded-full"></div>
        <div className="absolute top-3/4 left-1/3 w-[500px] h-[250px] bg-red-950/15 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navbar */}
      <header className="border-b-2 border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
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
            <span
              className="text-crew-red font-black glitch-hover"
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #fff' }}
            >
              AMONG
            </span>
            U
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm font-mono text-crew-cyan hover:text-white transition-colors flex items-center gap-1.5 au-border bg-black/60 px-4 py-2 rounded-full"
            >
              <span>← Back to Mission Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-950/70 border border-crew-cyan/40 rounded-full text-xs font-mono text-crew-cyan font-bold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(56,254,220,0.2)]">
            <span className="w-2 h-2 rounded-full bg-crew-lime animate-ping"></span>
            MISSION ALLIES &amp; SUPPORTERS
          </div>
          <h1
            className="font-display text-4xl sm:text-6xl text-white mb-6 tracking-wide"
            style={{ textShadow: '4px 4px 0 #000, 8px 8px 0 rgba(0,0,0,0.5)' }}
          >
            OUR <span className="text-crew-yellow">SPONSORS</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg font-bold leading-relaxed max-w-2xl mx-auto">
            Powering 48 hours of innovation, real-world development, social deduction, and a ₹25,000 bounty prize pool at KIET Deemed to be University.
          </p>
        </div>

        {/* Sponsor Tiers */}
        <div className="space-y-16">
          {sponsorTiers.map((tierGroup, idx) => (
            <div key={idx} className="space-y-6">
              {/* Tier Heading */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${tierGroup.badgeColor}`}>
                  {tierGroup.tier}
                </span>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
              </div>

              {/* Cards Grid */}
              <div
                className={`grid gap-6 ${
                  tierGroup.items.length === 1
                    ? 'grid-cols-1 max-w-2xl mx-auto'
                    : tierGroup.items.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {tierGroup.items.map((sponsor, sIdx) => (
                  <div
                    key={sIdx}
                    className={`au-card bg-gray-900/90 border-2 ${tierGroup.borderColor} rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group`}
                  >
                    <div>
                      {/* Top Role Tag */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                          {sponsor.role}
                        </span>
                        {sponsor.isPlaceholder && (
                          <span className="text-[10px] font-mono text-crew-cyan/80 bg-crew-cyan/10 px-2 py-0.5 rounded border border-crew-cyan/30">
                            Slot Open
                          </span>
                        )}
                      </div>

                      {/* Icon / Brand Box */}
                      <div className="w-16 h-16 rounded-xl bg-black/80 au-border flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform">
                        {sponsor.isPlaceholder ? '🚀' : '⚡'}
                      </div>

                      {/* Name & Description */}
                      <h3 className="font-display text-2xl text-white mb-2 group-hover:text-crew-cyan transition-colors">
                        {sponsor.name}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                        {sponsor.description}
                      </p>
                    </div>

                    {/* Bottom Action */}
                    {sponsor.url ? (
                      <a
                        href={sponsor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-crew-lime hover:underline"
                      >
                        <span>Visit Website</span>
                        <span>→</span>
                      </a>
                    ) : (
                      <span className="text-xs font-mono text-gray-500 italic">
                        Partner details dropping soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* "Become a Sponsor" Callout */}
        <div className="mt-24 au-card bg-gradient-to-r from-gray-950 via-gray-900 to-black border-2 border-crew-cyan/60 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_40px_rgba(56,254,220,0.15)]">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-3xl">🤝</span>
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              WANT TO PARTNER WITH <span className="text-crew-cyan">AMONGU</span>?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-bold leading-relaxed">
              Connect with top developers, designers, and innovators at KIET Deemed to be University. Elevate your brand presence, conduct challenges, and scout standout engineering talent.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:nextgen.supercomputing@kiet.edu?subject=AmongU%20Hackathon%20Sponsorship%20Inquiry"
                className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-sm py-3 px-8 rounded-full shadow-[0_0_15px_rgba(80,239,57,0.7)] hover:scale-105 transition-all"
              >
                SPONSOR THE HACKATHON ✉️
              </a>
              <Link
                href="/contact"
                className="text-xs sm:text-sm font-mono text-gray-300 hover:text-white underline underline-offset-4"
              >
                View Organizer Contact Details →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-gray-800 pt-10 pb-8 mt-20 relative z-10 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500">
          <p>© 2026 AmongU • NextGen Supercomputing Club • KIET Deemed to be University</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-crew-cyan transition-colors">Home</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-crew-cyan transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-crew-cyan transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
