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
              Collect and evaluate team presentations, problem statements, and proposed solution architectures.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-crew-yellow px-2.5 py-1 rounded bg-black/60 border border-gray-800 font-bold">
          Round 1 Evaluation
        </span>
      </div>

      {statusMsg !== null && (
        <div className="bg-green-950/70 border border-crew-lime text-crew-lime text-xs font-mono font-bold p-3 rounded-xl text-center">
          ✅ {statusMsg}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="py-8 text-center text-gray-400 font-mono text-xs max-w-xl mx-auto leading-relaxed">
          Generate teams in the Squad Randomizer section above to enable team-wise presentation submissions and evaluation.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squad Submissions List */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block font-bold">
              Team Presentation Submissions
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
                      selectedTeam?.id === t.id
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
                      {t.round1Submission?.problemStatement || 'PPT Submission Ready'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Evaluation Criteria Callout */}
            <div className="bg-black/60 border border-gray-800 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-crew-yellow font-bold uppercase tracking-wider block">
                Evaluation Criteria:
              </span>
              <ul className="text-[11px] text-gray-400 font-mono space-y-1 list-disc list-inside">
                <li>Problem relevance and originality</li>
                <li>Creativity of the proposed solution</li>
                <li>Quality of the presentation</li>
                <li>Clarity and feasibility of the solution</li>
              </ul>
            </div>
          </div>

          {/* Submission Review & Grading Form */}
          {selectedTeam && (
            <form onSubmit={handleSaveEvaluation} className="lg:col-span-2 space-y-3 bg-black/60 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Team Name</span>
                  <h4 className="font-display text-base text-white">
                    <span className="text-crew-yellow">{selectedTeam.name}</span>{' '}
                    <span className="text-gray-400 text-xs font-mono">({selectedTeam.id})</span>
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Selected Track</span>
                  <span className="text-xs font-mono text-crew-cyan font-bold bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
                    {selectedTeam.track}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">PROBLEM STATEMENT</label>
                <textarea
                  rows={2}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Outline the domain problem addressed in Round 1..."
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">PROPOSED SOLUTION</label>
                <textarea
                  rows={2}
                  value={architectureSummary}
                  onChange={(e) => setArchitectureSummary(e.target.value)}
                  placeholder="Detail the proposed solution, system architecture, and tech implementation..."
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">PPT / PRESENTATION LINK</label>
                <input
                  type="url"
                  value={pptUrl}
                  onChange={(e) => setPptUrl(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/... or Figma / Drive URL"
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-crew-yellow"
                />
              </div>

              {/* Evaluation Score & Evaluator Feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800">
                <div>
                  <label className="block text-[11px] font-mono text-crew-yellow font-bold mb-1">
                    EVALUATION SCORE (0 - 100)
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
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">EVALUATOR FEEDBACK</label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback on relevance, originality, presentation clarity, and feasibility..."
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-yellow font-sans"
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
