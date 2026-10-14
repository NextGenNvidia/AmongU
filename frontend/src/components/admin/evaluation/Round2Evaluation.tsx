'use client';

import React, { useState } from 'react';
import { Team } from '../../../types/team';

interface Round2EvaluationProps {
  teams: Team[];
  onUpdateTeamSubmission: (teamId: string, submission: any) => void;
}

export default function Round2Evaluation({
  teams,
  onUpdateTeamSubmission,
}: Round2EvaluationProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('React, Node.js, Express, TailwindCSS');
  const [scoreInnovation, setScoreInnovation] = useState<number>(25);
  const [scoreArchitecture, setScoreArchitecture] = useState<number>(20);
  const [scoreExecution, setScoreExecution] = useState<number>(40);
  const [feedback, setFeedback] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const totalDevScore = scoreInnovation + scoreArchitecture + scoreExecution;

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const devData = {
      repoUrl: repoUrl.trim() || selectedTeam.round2Submission?.repoUrl || 'https://github.com/team-project/amongu-repo',
      liveDemoUrl: liveDemoUrl.trim() || selectedTeam.round2Submission?.liveDemoUrl || 'https://team-demo.vercel.app',
      techStack: techStackInput.split(',').map((s) => s.trim()).filter(Boolean),
      commitsCount: selectedTeam.round2Submission?.commitsCount || 24,
      submittedAt: selectedTeam.round2Submission?.submittedAt || new Date().toLocaleTimeString(),
      score: totalDevScore,
      juryFeedback: feedback.trim(),
    };

    onUpdateTeamSubmission(selectedTeam.id, {
      ...selectedTeam,
      round2Submission: devData,
    });

    setStatusMsg(`Saved Round 2 Development evaluation for ${selectedTeam.name} (Score: ${totalDevScore}/100)`);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  return (
    <div className="au-card bg-gray-900/90 border-2 border-crew-lime/40 p-5 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(50,205,50,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">💻</span>
          <div>
            <h3 className="font-display text-lg text-white">ROUND 2: DEVELOPMENT PHASE EVALUATION</h3>
            <p className="text-xs text-gray-400 font-mono">
              Audit code repositories, commit histories, prototype execution, and technical complexity
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-crew-lime px-2.5 py-1 rounded bg-black/60 border border-gray-800">
          Phase 2 Sprint Review
        </span>
      </div>

      {statusMsg !== null && (
        <div className="bg-green-950/70 border border-crew-lime text-crew-lime text-xs font-mono font-bold p-3 rounded-xl text-center">
          ✅ {statusMsg}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="py-8 text-center text-gray-500 font-mono text-xs">
          Generate squads in the &ldquo;Before Round 1&rdquo; section above to evaluate development progress.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squad Select List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
              Development Portfolios
            </span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {teams.map((t) => {
                const isEvaluated = t.round2Submission?.score !== undefined;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      if (t.round2Submission) {
                        setRepoUrl(t.round2Submission.repoUrl);
                        setLiveDemoUrl(t.round2Submission.liveDemoUrl || '');
                        setTechStackInput(t.round2Submission.techStack.join(', '));
                        setFeedback(t.round2Submission.juryFeedback || '');
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedTeam?.id === t.id
                        ? 'bg-crew-lime/15 border-crew-lime shadow-[0_0_15px_rgba(50,205,50,0.15)]'
                        : 'bg-black/50 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white">{t.name}</span>
                      {isEvaluated ? (
                        <span className="text-[10px] font-mono bg-crew-lime/20 text-crew-lime border border-crew-lime/40 px-1.5 py-0.2 rounded font-bold">
                          {t.round2Submission?.score}/100
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono bg-green-950 text-green-300 border border-green-700/60 px-1.5 py-0.2 rounded">
                          Dev Sprint Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono truncate">
                      {t.round2Submission?.repoUrl || 'GitHub repo linked'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Development Scorecard Form */}
          {selectedTeam && (
            <form onSubmit={handleSaveEvaluation} className="lg:col-span-2 space-y-3 bg-black/60 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h4 className="font-display text-sm text-white">
                  CODE AUDIT: <span className="text-crew-lime">{selectedTeam.name}</span>
                </h4>
                <span className="text-[11px] font-mono text-crew-lime font-bold">
                  TOTAL DEV SCORE: {totalDevScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">GITHUB / GITLAB REPO URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-crew-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">LIVE DEPLOYMENT DEMO URL</label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://app.vercel.app"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-crew-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">TECH STACK UTILITIES</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. Next.js, FastAPI, PostgreSQL, Docker"
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-lime font-mono"
                />
              </div>

              {/* Development Rubric Sliders / Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">
                    INNOVATION (MAX 30)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={scoreInnovation}
                    onChange={(e) => setScoreInnovation(Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-crew-cyan font-mono text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">
                    ARCHITECTURE (MAX 25)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={scoreArchitecture}
                    onChange={(e) => setScoreArchitecture(Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-crew-lime font-mono text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">
                    PROTOTYPE DEMO (MAX 45)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={45}
                    value={scoreExecution}
                    onChange={(e) => setScoreExecution(Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-crew-yellow font-mono text-base font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">DEV CRITIQUE &amp; FEEDBACK</label>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Code quality remarks, repo activity, robustness..."
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-crew-lime"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2 px-5 rounded-xl shadow-md"
                >
                  SAVE ROUND 2 DEV EVALUATION
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
