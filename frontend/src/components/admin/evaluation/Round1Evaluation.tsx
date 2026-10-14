'use client';

import React, { useState } from 'react';
import { Team } from '../../../types/team';

interface Round1EvaluationProps {
  teams: Team[];
  onUpdateTeamSubmission: (teamId: string, submission: any) => void;
}

export default function Round1Evaluation({
  teams,
  onUpdateTeamSubmission,
}: Round1EvaluationProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [pptUrl, setPptUrl] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [architectureSummary, setArchitectureSummary] = useState('');
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const submissionData = {
      pptUrl: pptUrl.trim() || selectedTeam.round1Submission?.pptUrl || 'https://docs.google.com/presentation/d/sample',
      projectTitle: projectTitle.trim() || selectedTeam.round1Submission?.projectTitle || 'System Architecture Deck',
      problemStatement: problemStatement.trim() || selectedTeam.round1Submission?.problemStatement || 'Decentralized Microservices Communication',
      architectureSummary: architectureSummary.trim() || selectedTeam.round1Submission?.architectureSummary || 'Event-driven pub/sub architecture',
      submittedAt: selectedTeam.round1Submission?.submittedAt || new Date().toLocaleTimeString(),
      score,
      juryFeedback: feedback.trim(),
    };

    onUpdateTeamSubmission(selectedTeam.id, {
      ...selectedTeam,
      round1Submission: submissionData,
    });

    setStatusMsg(`Saved Round 1 Architecture & PPT evaluation for ${selectedTeam.name} (Score: ${score}/100)`);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  return (
    <div className="au-card bg-gray-900/90 border-2 border-crew-yellow/40 p-5 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(255,204,0,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📑</span>
          <div>
            <h3 className="font-display text-lg text-white">AFTER ROUND 1: PPT &amp; ARCHITECTURE SUBMISSION</h3>
            <p className="text-xs text-gray-400 font-mono">
              Collect and grade team presentation slides (PPT) and architectural problem breakdowns
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-crew-yellow px-2.5 py-1 rounded bg-black/60 border border-gray-800">
          Phase 1 Evaluation Active
        </span>
      </div>

      {statusMsg !== null && (
        <div className="bg-green-950/70 border border-crew-lime text-crew-lime text-xs font-mono font-bold p-3 rounded-xl text-center">
          ✅ {statusMsg}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="py-8 text-center text-gray-500 font-mono text-xs">
          Generate squads in the &ldquo;Before Round 1&rdquo; section above to begin collecting submissions.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squad Submissions List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
              Squad Presentation Portfolios
            </span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {teams.map((t) => {
                const isEvaluated = t.round1Submission?.score !== undefined;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      if (t.round1Submission) {
                        setPptUrl(t.round1Submission.pptUrl);
                        setProjectTitle(t.round1Submission.projectTitle);
                        setProblemStatement(t.round1Submission.problemStatement);
                        setArchitectureSummary(t.round1Submission.architectureSummary);
                        setScore(t.round1Submission.score || 85);
                        setFeedback(t.round1Submission.juryFeedback || '');
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      (selectedTeam?.id === t.id)
                        ? 'bg-crew-yellow/15 border-crew-yellow shadow-[0_0_15px_rgba(255,204,0,0.15)]'
                        : 'bg-black/50 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white">{t.name}</span>
                      {isEvaluated ? (
                        <span className="text-[10px] font-mono bg-crew-lime/20 text-crew-lime border border-crew-lime/40 px-1.5 py-0.2 rounded">
                          {t.round1Submission?.score}/100
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono bg-yellow-950 text-yellow-300 border border-yellow-700/60 px-1.5 py-0.2 rounded">
                          Awaiting Review
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono truncate">
                      {t.round1Submission?.projectTitle || 'PPT Submission Ready'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submission Review & Grading Form */}
          {selectedTeam && (
            <form onSubmit={handleSaveEvaluation} className="lg:col-span-2 space-y-3 bg-black/60 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h4 className="font-display text-sm text-white">
                  REVIEWING: <span className="text-crew-yellow">{selectedTeam.name}</span> ({selectedTeam.id})
                </h4>
                <span className="text-[11px] font-mono text-gray-400">Track: {selectedTeam.track}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">PRESENTATION (PPT / DRIVE) URL</label>
                  <input
                    type="url"
                    value={pptUrl}
                    onChange={(e) => setPptUrl(e.target.value)}
                    placeholder="https://docs.google.com/presentation/d/..."
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-crew-yellow"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">PROJECT TITLE</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus Engine"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-crew-yellow font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">SELECTED PROBLEM STATEMENT</label>
                <textarea
                  rows={2}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Outline the domain problem addressed in Round 1..."
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">SYSTEM ARCHITECTURE BREAKDOWN</label>
                <textarea
                  rows={2}
                  value={architectureSummary}
                  onChange={(e) => setArchitectureSummary(e.target.value)}
                  placeholder="Summarize tech stack, data pipeline, and modular design..."
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow"
                />
              </div>

              {/* Score & Jury Feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-gray-800">
                <div>
                  <label className="block text-[11px] font-mono text-crew-yellow font-bold mb-1">
                    JURY SCORE (0 - 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-crew-yellow font-mono text-lg font-bold focus:outline-none focus:border-crew-yellow"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">JURY FEEDBACK NOTES</label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Critique on feasibility, architecture diagrams, clarity..."
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-xs py-2 px-5 rounded-xl shadow-md"
                >
                  SAVE ROUND 1 EVALUATION
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
