'use client';

import React, { useState } from 'react';
import { Team } from '../../../types/team';
import { CandidateRecord } from '../../../types/admin';

interface ImpostorAssignerProps {
  teams: Team[];
  candidates: CandidateRecord[];
  onImpostorsAssigned: (updatedTeams: Team[], updatedCandidates: CandidateRecord[]) => void;
}

export default function ImpostorAssigner({
  teams,
  candidates,
  onImpostorsAssigned,
}: ImpostorAssignerProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [revealToAdmin, setRevealToAdmin] = useState(true);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleAssignImpostors = () => {
    if (teams.length === 0) {
      alert('Please generate teams before assigning Round 3 Impostors.');
      return;
    }

    const confirmRun = window.confirm(
      'Activate Round 3 Impostor Protocol? Exactly one random member from each squad will be secretly designated as the Impostor and notified on their participant dashboard.'
    );
    if (!confirmRun) return;

    setIsAssigning(true);

    const impostorCollegeIds = new Set<string>();

    const updatedTeams: Team[] = teams.map((team) => {
      if (team.members.length === 0) return team;

      // Pick one random member index
      const randomIndex = Math.floor(Math.random() * team.members.length);
      const chosenImpostor = team.members[randomIndex];
      impostorCollegeIds.add(chosenImpostor.collegeId);

      const updatedMembers = team.members.map((member, idx) => ({
        ...member,
        role: idx === randomIndex ? ('impostor' as const) : ('crewmate' as const),
      }));

      return {
        ...team,
        impostorId: chosenImpostor.id,
        impostorRevealed: false,
        members: updatedMembers,
      };
    });

    // Update global candidate roster records
    const updatedCandidates: CandidateRecord[] = candidates.map((c) => {
      if (impostorCollegeIds.has(c.collegeId)) {
        return { ...c, assignedRole: 'impostor' as const };
      }
      // If candidate is in any team, mark crewmate, else unassigned
      const inTeam = updatedTeams.some((t) => t.members.some((m) => m.collegeId === c.collegeId));
      if (inTeam) {
        return { ...c, assignedRole: 'crewmate' as const };
      }
      return c;
    });

    // Save to persistent storage so participant dashboards immediately reflect it
    try {
      localStorage.setItem('amongu_teams_data', JSON.stringify(updatedTeams));
      localStorage.setItem('amongu_impostor_protocol_active', 'true');
      localStorage.setItem(
        'amongu_admin_broadcast',
        '🚨 EMERGENCY ALERT: ROUND 3 IMPOSTOR SELECTION COMPLETED. Check your personal dashboard for your classified role assignment!'
      );

      // Check current local user ticket
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw !== null) {
        const ticket = JSON.parse(ticketRaw);
        if (impostorCollegeIds.has(ticket.collegeId)) {
          ticket.assignedRole = 'impostor';
          ticket.impostorAlert = true;
        } else {
          ticket.assignedRole = 'crewmate';
          ticket.impostorAlert = false;
        }
        localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('amongu_role_updated', { detail: { action: 'bulk_impostors_assigned' } }));
    } catch {
      // ignore
    }

    onImpostorsAssigned(updatedTeams, updatedCandidates);
    setIsAssigning(false);
    setSuccessBanner(
      `Round 3 Active! Exactly 1 secret Impostor assigned across all ${updatedTeams.length} squads and broadcast to participant dashboards.`
    );
  };

  const handleToggleSingleMemberRole = (teamId: string, memberCollegeId: string) => {
    let nextRole: 'impostor' | 'crewmate' = 'impostor';
    const updatedTeams = teams.map((team) => {
      if (team.id !== teamId) return team;
      return {
        ...team,
        members: team.members.map((m) => {
          if (m.collegeId === memberCollegeId) {
            nextRole = m.role === 'impostor' ? 'crewmate' : 'impostor';
            return { ...m, role: nextRole };
          }
          return m;
        }),
      };
    });

    const updatedCandidates = candidates.map((c) => {
      if (c.collegeId === memberCollegeId) {
        return { ...c, assignedRole: nextRole };
      }
      return c;
    });

    try {
      localStorage.setItem('amongu_teams_data', JSON.stringify(updatedTeams));
      const ticketRaw = localStorage.getItem('amongu_user_ticket');
      if (ticketRaw) {
        const ticket = JSON.parse(ticketRaw);
        if (ticket.collegeId === memberCollegeId) {
          ticket.assignedRole = nextRole;
          ticket.impostorAlert = nextRole === 'impostor';
          localStorage.setItem('amongu_user_ticket', JSON.stringify(ticket));
        }
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('amongu_role_updated', { detail: { collegeId: memberCollegeId, role: nextRole } }));
    } catch {}

    onImpostorsAssigned(updatedTeams, updatedCandidates);
  };

  return (
    <div className="au-card bg-gray-900/90 border-2 border-crew-red/40 p-5 rounded-2xl space-y-5 shadow-[0_0_25px_rgba(255,59,48,0.1)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-pulse">🕵️</span>
          <div>
            <h3 className="font-display text-lg text-white">ROUND 3: SECRET IMPOSTOR INFILTRATION ENGINE</h3>
            <p className="text-xs text-gray-400 font-mono">
              Randomly assign one Impostor within each eligible team and privately notify the selected participant through their individual dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-gray-300">
            <input
              type="checkbox"
              checked={revealToAdmin}
              onChange={(e) => setRevealToAdmin(e.target.checked)}
              className="accent-crew-red"
            />
            <span>Admin Eyes-in-the-Sky View</span>
          </label>

          <button
            onClick={handleAssignImpostors}
            disabled={isAssigning || teams.length === 0}
            className="au-btn bg-crew-red hover:bg-red-500 text-white font-display text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,59,48,0.3)] disabled:opacity-50"
          >
            <span>🚨</span>
            <span>{isAssigning ? 'ASSIGNING IMPOSTORS...' : 'ASSIGN ROUND 3 IMPOSTORS'}</span>
          </button>
        </div>
      </div>

      {/* Impostor Assignment Rules Callout */}
      <div className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-2">
        <span className="text-xs font-mono text-crew-red font-bold uppercase tracking-wider block">
          Impostor Assignment Rules:
        </span>
        <ul className="text-xs text-gray-400 font-mono space-y-1 list-disc list-inside">
          <li>Assign one Impostor per eligible team.</li>
          <li>Keep each assignment confidential from other team members.</li>
          <li>Notify the selected Impostor privately.</li>
          <li>Restrict access to confidential assignments to authorized organizers.</li>
          <li>Allow organizers to review assignments through the protected admin panel.</li>
        </ul>
      </div>

      {successBanner !== null && (
        <div className="bg-red-950/80 border-2 border-crew-red text-red-200 text-xs font-mono font-bold p-3.5 rounded-xl text-center space-y-1">
          <p className="text-crew-red text-sm font-display">🚨 CLASSIFIED PROTOCOL ACTIVE</p>
          <p>{successBanner}</p>
        </div>
      )}

      {/* Squad Overview with Classified Role Markers */}
      {teams.length === 0 ? (
        <div className="py-8 text-center text-gray-400 font-mono text-xs max-w-xl mx-auto leading-relaxed">
          Teams must be generated in the Squad Randomizer section before Impostor assignments can be created.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((team) => {
            const hasImpostor = team.members.some((m) => m.role === 'impostor');
            return (
              <div
                key={team.id}
                className="bg-black/60 border border-gray-800 p-4 rounded-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="font-display text-xs text-white truncate">{team.name}</h4>
                  {hasImpostor ? (
                    <span className="text-[10px] font-mono text-crew-red font-bold animate-pulse">
                      INFILTRATED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-500">Awaiting Round 3</span>
                  )}
                </div>

                {/* 4 Members */}
                <div className="space-y-1.5">
                  {team.members.map((m) => {
                    const isImpostor = m.role === 'impostor';
                    return (
                      <div
                        key={m.collegeId}
                        className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border ${
                          isImpostor && revealToAdmin
                            ? 'bg-red-950/60 border-crew-red/80 text-white shadow-[0_0_10px_rgba(255,59,48,0.2)]'
                            : 'bg-gray-900/40 border-transparent text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <div
                            className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px] shrink-0"
                            style={{ backgroundColor: m.suitColor }}
                          >
                            🚀
                          </div>
                          <span className="truncate">{m.name}</span>
                        </div>

                        {revealToAdmin && (
                          <button
                            type="button"
                            onClick={() => handleToggleSingleMemberRole(team.id, m.collegeId)}
                            title={`Admin Action: Click to flip ${m.name}'s role to ${isImpostor ? 'Crewmate' : 'Impostor'}`}
                            className="shrink-0 ml-1 hover:scale-105 active:scale-95 transition-all"
                          >
                            {isImpostor ? (
                              <span className="text-[9px] bg-crew-red text-white font-extrabold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,59,48,0.5)] animate-pulse border border-red-400">
                                🚨 IMPOSTOR
                              </span>
                            ) : (
                              <span className="text-[9px] bg-cyan-950/90 text-crew-cyan border border-crew-cyan/60 font-bold px-2 py-0.5 rounded hover:bg-cyan-900/60">
                                🛡️ CREWMATE
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
