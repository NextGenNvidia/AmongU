'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminEvaluationPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unreviewed' | 'flagged' | 'scored'>('all');

  const upcomingFeatures = [
    {
      title: 'Repository & Code Artifact Submission',
      icon: '💻',
      desc: 'Automatic GitHub repo analyzer inspecting commits, PR branch history, and code authenticity per team.',
      status: 'AWAITING ROUND 2',
      color: 'border-crew-cyan text-crew-cyan',
    },
    {
      title: 'Impostor Sabotage & Task Analysis',
      icon: '🕵️',
      desc: 'Real-time telemetry measuring subtle bugs introduced, stealth scores, and team sabotage success rate.',
      status: 'AWAITING ROUND 2',
      color: 'border-crew-red text-crew-red',
    },
    {
      title: 'Emergency Meeting Voting Matrix',
      icon: '🗳️',
      desc: 'Crewmate voting tally console. Tracks who voted for whom, impostor ejections, and accuracy multipliers.',
      status: 'AWAITING ROUND 3',
      color: 'border-crew-yellow text-crew-yellow',
    },
    {
      title: 'Jury Multi-Criteria Scoring Rubric',
      icon: '⚖️',
      desc: 'Weighted evaluation: Innovation (30%), Architecture (25%), Impostor Stealth (25%), Final Presentation (20%).',
      status: 'CONFIGURED',
      color: 'border-crew-lime text-crew-lime',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚖️</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-yellow bg-yellow-950/60 border border-crew-yellow/40 px-2.5 py-0.5 rounded-full">
              ADMIN WORKSPACE: SECTION 2
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white">EVALUATION &amp; JUDGING ROOM</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">
            Project submission grading, Impostor stealth telemetry, jury scorecards, and emergency meeting audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="au-btn bg-crew-cyan hover:bg-cyan-400 text-black font-display text-sm py-2.5 px-5 rounded-xl flex items-center gap-2"
          >
            <span>📡</span> RETURN TO MONITORING SECTION
          </Link>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="au-card bg-gradient-to-r from-yellow-950/40 via-gray-900 to-black border-2 border-crew-yellow/50 p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-crew-yellow/20 border border-crew-yellow/40 flex items-center justify-center shrink-0 text-2xl">
              ⏳
            </div>
            <div>
              <h2 className="font-display text-xl text-white">EVALUATION PHASE SCHEDULED AFTER REGISTRATION LOCK</h2>
              <p className="text-gray-300 text-sm mt-1 max-w-2xl leading-relaxed">
                Candidate registrations and fee verifications are currently being gathered in the{' '}
                <strong className="text-crew-cyan">Monitoring Section</strong>. Once Round 1 commences on event day, project submissions and impostor vote tallies will become interactive here.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="inline-block px-3 py-1 bg-black/60 border border-gray-700 text-xs font-mono text-crew-yellow rounded-lg">
              SYSTEM STATUS: STANDBY
            </span>
          </div>
        </div>
      </div>

      {/* Evaluation Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingFeatures.map((feat) => (
          <div
            key={feat.title}
            className={`au-card bg-gray-900/90 border-2 ${feat.color} p-6 rounded-2xl flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{feat.icon}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-gray-300">
                  {feat.status}
                </span>
              </div>
              <h3 className="font-display text-lg text-white mb-2">{feat.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-bold">{feat.desc}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">Privilege: Judge / Lead Admin</span>
              <span className="text-gray-400">Lock: Active on Round 2</span>
            </div>
          </div>
        ))}
      </div>

      {/* Jury Rubric Matrix Preview */}
      <div className="au-card bg-gray-900/80 border-2 border-gray-800 p-6 rounded-2xl">
        <h3 className="font-display text-xl text-white mb-4 flex items-center gap-2">
          <span>📊</span> OFFICIAL JUDGING SCORE WEIGHT MATRIX
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/50 border border-gray-800 p-4 rounded-xl">
            <span className="text-xs font-mono text-gray-400 block mb-1">TECHNICAL INNOVATION</span>
            <span className="font-display text-3xl text-crew-cyan">30%</span>
            <p className="text-[11px] text-gray-500 mt-1">Novelty of solution &amp; complexity of algorithms</p>
          </div>
          <div className="bg-black/50 border border-gray-800 p-4 rounded-xl">
            <span className="text-xs font-mono text-gray-400 block mb-1">SYSTEM ARCHITECTURE</span>
            <span className="font-display text-3xl text-crew-lime">25%</span>
            <p className="text-[11px] text-gray-500 mt-1">Code structure, modularity &amp; deployment readiness</p>
          </div>
          <div className="bg-black/50 border border-gray-800 p-4 rounded-xl">
            <span className="text-xs font-mono text-gray-400 block mb-1">IMPOSTOR SUBVERSION</span>
            <span className="font-display text-3xl text-crew-red">25%</span>
            <p className="text-[11px] text-gray-500 mt-1">Stealth, hidden sabotage execution &amp; survival</p>
          </div>
          <div className="bg-black/50 border border-gray-800 p-4 rounded-xl">
            <span className="text-xs font-mono text-gray-400 block mb-1">FINAL PRESENTATION</span>
            <span className="font-display text-3xl text-crew-yellow">20%</span>
            <p className="text-[11px] text-gray-500 mt-1">Demo defense, Q&amp;A response, emergency argumentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
