'use client';

import React, { useState } from 'react';
import { CandidateRecord } from '../../../types/admin';
import { Team, TeamMember } from '../../../types/team';

interface TeamGeneratorProps {
  candidates: CandidateRecord[];
  teams: Team[];
  onTeamsGenerated: (newTeams: Team[], updatedCandidates: CandidateRecord[]) => void;
}

const SQUAD_NAMES = [
  'Red Saboteurs',
  'Cyan Navigators',
  'Lime Engineers',
  'Yellow Specialists',
  'Purple Voyagers',
  'Orange Architects',
  'Pink Vanguard',
  'Black Ops Terminal',
];

export default function TeamGenerator({
  candidates,
  teams,
  onTeamsGenerated,
}: TeamGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  // Present candidates eligible for team formation
  const presentCandidates = candidates.filter((c) => c.isPresent);
  const eligiblePool = presentCandidates.length >= 4 ? presentCandidates : candidates;

  const handleGenerateTeams = () => {
    setIsGenerating(true);
    setSuccessNote(null);

    // Shuffle algorithm (Fisher-Yates)
    const pool = [...eligiblePool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    const newTeams: Team[] = [];
    const teamSize = 4;
    let teamCounter = 1;

    for (let i = 0; i < pool.length; i += teamSize) {
      const slice = pool.slice(i, i + teamSize);
      if (slice.length >= 2) {
        // Form team even if last team has 2-4 members
        const teamId = `TEAM-${teamCounter.toString().padStart(2, '0')}`;
        const teamName = SQUAD_NAMES[(teamCounter - 1) % SQUAD_NAMES.length];

        const members: TeamMember[] = slice.map((c) => ({
          id: c.id,
          name: c.name,
          collegeId: c.collegeId,
          email: c.email,
          phone: c.phone,
          branch: c.branch,
          year: c.year,
          section: c.section,
          suitColor: c.suitColor,
          role: 'unassigned',
          isPresent: c.isPresent,
        }));

        newTeams.push({
          id: teamId,
          name: teamName,
          track: slice[0].track,
          members,
          impostorRevealed: false,
          tableNumber: teamCounter,
          createdAt: new Date().toLocaleTimeString(),
        });

        teamCounter++;
      }
    }

    // Update candidate records with assigned team
    const updatedCandidates = candidates.map((c) => {
      const foundTeam = newTeams.find((t) => t.members.some((m) => m.collegeId === c.collegeId));
      if (foundTeam) {
        return {
          ...c,
          assignedTeamId: foundTeam.id,
          assignedTeamName: foundTeam.name,
        };
      }
      return c;
    });

    onTeamsGenerated(newTeams, updatedCandidates);
    setIsGenerating(false);
    setSuccessNote(`Generated ${newTeams.length} randomized 4-person squads from present candidates!`);
    setTimeout(() => setSuccessNote(null), 4000);
  };

  return (
    <div className="au-card bg-gray-900/90 border-2 border-crew-cyan/40 p-5 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(0,255,255,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">👥</span>
          <div>
            <h3 className="font-display text-lg text-white">BEFORE ROUND 1: SQUAD RANDOMIZER</h3>
            <p className="text-xs text-gray-400 font-mono">
              Group present candidates into randomized 4-person hackathon teams before round start
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-crew-lime px-2.5 py-1 rounded bg-black/60 border border-gray-800">
            {presentCandidates.length} Present Checked In
          </span>
          <button
            onClick={handleGenerateTeams}
            disabled={isGenerating}
            className="au-btn bg-crew-cyan hover:bg-cyan-400 text-black font-display text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
          >
            <span>🎲</span>
            <span>{isGenerating ? 'SHUFFLING...' : 'GENERATE RANDOM TEAMS (4)'}</span>
          </button>
        </div>
      </div>

      {successNote !== null && (
        <div className="bg-green-950/70 border border-crew-lime text-crew-lime text-xs font-mono font-bold p-3 rounded-xl text-center">
          ✅ {successNote}
        </div>
      )}

      {/* Generated Teams Grid */}
      {teams.length === 0 ? (
        <div className="py-8 text-center bg-black/40 border border-gray-800/80 rounded-xl space-y-2">
          <p className="text-sm font-display text-gray-400">NO TEAMS CREATED YET</p>
          <p className="text-xs text-gray-500 font-mono">
            Click &ldquo;GENERATE RANDOM TEAMS (4)&rdquo; to automatically assemble 4-member squads from present verified candidates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-3 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-crew-cyan text-black px-2 py-0.5 rounded">
                    {team.id}
                  </span>
                  <h4 className="font-display text-sm text-white">{team.name}</h4>
                </div>
                <span className="text-[11px] font-mono text-gray-400">Track: {team.track}</span>
              </div>

              {/* 4 Team Members */}
              <div className="space-y-1.5">
                {team.members.map((member, idx) => (
                  <div
                    key={member.collegeId}
                    className="flex items-center justify-between text-xs font-mono p-1.5 bg-gray-900/60 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-black flex items-center justify-center text-[10px] shrink-0"
                        style={{ backgroundColor: member.suitColor }}
                      >
                        🚀
                      </div>
                      <span className="text-white font-bold">{member.name}</span>
                      <span className="text-gray-500 text-[10px]">({member.branch} Yr{member.year})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[10px]">{member.collegeId}</span>
                      {member.role === 'impostor' && (
                        <span className="text-[9px] bg-crew-red text-white font-bold px-1 py-0.2 rounded">
                          IMPOSTOR
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
