'use client';

import React, { useState, useMemo } from 'react';
import { CandidateRecord } from '../../../types/admin';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS } from '../../../constants/branches';
import { Team } from '../../../types/team';

interface CandidateTableProps {
  candidates: CandidateRecord[];
  teams?: Team[];
  onToggleAttendance: (candidateId: string) => void;
  onSelectCandidate: (candidate: CandidateRecord) => void;
  onUpdateRole: (candidateId: string, role: 'crewmate' | 'impostor' | 'unassigned') => void;
  onExportCsv: () => void;
}

export default function CandidateTable({
  candidates,
  teams = [],
  onToggleAttendance,
  onSelectCandidate,
  onUpdateRole,
  onExportCsv,
}: CandidateTableProps) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'impostor' | 'crewmate' | 'unassigned'>('all');
  const [viewMode, setViewMode] = useState<'clusters' | 'table'>('clusters');

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search by name, college ID, email, phone, or team...
      const q = search.toLowerCase().trim();
      if (q.length > 0) {
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesId = c.collegeId.includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q);
        const matchesTeam = c.assignedTeamName !== undefined && c.assignedTeamName.toLowerCase().includes(q);
        const matchesTeamId = c.assignedTeamId !== undefined && c.assignedTeamId.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone && !matchesTeam && !matchesTeamId) {
          return false;
        }
      }

      // Filter 1: All Departments / Branches
      if (deptFilter !== 'all' && c.branch !== deptFilter) return false;

      // Filter 2: All Sections
      if (sectionFilter !== 'all' && c.section !== sectionFilter) return false;

      // Filter 3: Attendance — All | Present | Absent
      if (attendanceFilter === 'present' && !c.isPresent) return false;
      if (attendanceFilter === 'absent' && c.isPresent) return false;

      // Filter 4: Assigned Role — All | Impostor | Crewmate | Pending Assignment
      if (roleFilter !== 'all') {
        if (roleFilter === 'impostor' && c.assignedRole !== 'impostor') return false;
        if (roleFilter === 'crewmate' && c.assignedRole !== 'crewmate') return false;
        if (roleFilter === 'unassigned' && c.assignedRole !== 'unassigned') return false;
      }

      return true;
    });
  }, [candidates, search, deptFilter, sectionFilter, attendanceFilter, roleFilter]);

  // Group candidates into Team Clusters
  const clusters = useMemo(() => {
    const teamMap = new Map<
      string,
      { teamId: string; teamName: string; track?: string; tableNumber?: number; members: CandidateRecord[] }
    >();
    const unassigned: CandidateRecord[] = [];

    // Pre-populate from teams
    if (teams && teams.length > 0) {
      teams.forEach((t) => {
        teamMap.set(t.id, {
          teamId: t.id,
          teamName: t.name,
          track: t.track,
          tableNumber: t.tableNumber,
          members: [],
        });
      });
    }

    filteredCandidates.forEach((c) => {
      const teamId = c.assignedTeamId;
      if (teamId && teamId.trim()) {
        if (!teamMap.has(teamId)) {
          teamMap.set(teamId, {
            teamId,
            teamName: c.assignedTeamName || teamId,
            track: c.track,
            members: [],
          });
        }
        teamMap.get(teamId)!.members.push(c);
      } else {
        unassigned.push(c);
      }
    });

    const activeSquads = Array.from(teamMap.values()).filter((sq) => sq.members.length > 0);
    return { squads: activeSquads, unassigned };
  }, [filteredCandidates, teams]);

  const presentCount = candidates.filter((c) => c.isPresent).length;

  return (
    <div className="space-y-4">
      {/* Section Heading & View Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-cyan bg-cyan-950/60 border border-crew-cyan/40 px-2 py-0.5 rounded">
              ROSTER &amp; SQUAD CLUSTERS
            </span>
            <span className="text-xs font-mono text-gray-400">
              {clusters.squads.length} Teams Formed • {presentCount} Present
            </span>
          </div>
          <h2 className="font-display text-2xl text-white flex items-center gap-2">
            <span>👥</span> EVENT PARTICIPANTS &amp; SQUAD MATRIX
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            View participant details, team clusters marked with team_id, live venue attendance, and role assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-950 border border-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('clusters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'clusters'
                  ? 'bg-crew-cyan text-black shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>👥 SQUAD CLUSTERS</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-crew-cyan text-black shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>📋 TABLE VIEW</span>
            </button>
          </div>

          {/* Button: EXPORT PARTICIPANT DATA (CSV / EXCEL) */}
          <button
            onClick={onExportCsv}
            className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(50,205,50,0.2)] font-bold shrink-0"
          >
            <span>📥</span> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="au-card bg-gray-900/90 border-2 border-gray-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
        {/* Search Placeholder */}
        <div className="lg:col-span-1">
          <input
            type="text"
            placeholder="Search by name, college ID, email, phone, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan font-sans"
          />
        </div>

        {/* Filter 1: All Departments / Branches */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">All Departments / Branches</option>
            {ALLOWED_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: All Sections */}
        <div>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">All Sections</option>
            {ALLOWED_SECTIONS.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Attendance — All | Present | Absent */}
        <div>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">Attendance — All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Filter 4: Assigned Role — All | Impostor | Crewmate | Pending Assignment */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">Assigned Role — All</option>
            <option value="impostor">Impostor</option>
            <option value="crewmate">Crewmate</option>
            <option value="unassigned">Pending Assignment</option>
          </select>
        </div>
      </div>

      {/* Main Content: Clusters View or Table View */}
      {viewMode === 'clusters' ? (
        <div className="space-y-6">
          {clusters.squads.length === 0 && clusters.unassigned.length === 0 ? (
            <div className="py-14 text-center bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <p className="text-gray-400 font-mono text-sm">No candidates or teams match your current filters.</p>
            </div>
          ) : null}

          {/* SQUAD CLUSTERS GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {clusters.squads.map((squad) => {
              const presentInSquad = squad.members.filter((m) => m.isPresent).length;
              const allPresent = presentInSquad === squad.members.length;

              return (
                <div
                  key={squad.teamId}
                  className="au-card bg-gray-950/95 border-2 border-crew-cyan/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(0,255,255,0.07)] flex flex-col justify-between hover:border-crew-cyan transition-all"
                >
                  {/* Cluster Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-crew-cyan text-black font-mono font-black text-xs sm:text-sm tracking-wider shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                        {squad.teamId}
                      </span>
                      <div>
                        <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-tight">
                          {squad.teamName}
                        </h3>
                        <span className="text-[11px] font-mono text-gray-400">
                          {squad.track || 'Web Development'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-lg">
                        Table #{squad.tableNumber || squad.teamId.slice(-2)}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          allPresent
                            ? 'bg-green-950/60 border-crew-lime text-crew-lime'
                            : 'bg-yellow-950/60 border-crew-yellow text-crew-yellow'
                        }`}
                      >
                        {presentInSquad}/{squad.members.length} Present
                      </span>
                    </div>
                  </div>

                  {/* Cluster Members (4-Crew Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {squad.members.map((member) => (
                      <div
                        key={member.collegeId}
                        className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-xl p-3 flex flex-col justify-between gap-2 transition-all relative overflow-hidden"
                      >
                        {/* Member Identity */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-xs shrink-0 shadow"
                              style={{ backgroundColor: member.suitColor }}
                            >
                              🚀
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => onSelectCandidate(member)}
                                className="font-bold text-white text-xs hover:text-crew-cyan truncate block text-left"
                              >
                                {member.name}
                              </button>
                              <span className="text-[10px] font-mono text-gray-400 block truncate">
                                {member.email}
                              </span>
                            </div>
                          </div>

                          {/* Role Tag & Toggle Action */}
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateRole(
                                member.id || member.collegeId,
                                member.assignedRole === 'impostor' ? 'crewmate' : 'impostor'
                              )
                            }
                            title={`Click to switch ${member.name} to ${member.assignedRole === 'impostor' ? 'Crewmate' : 'Impostor'}`}
                            className="shrink-0 hover:scale-105 active:scale-95 transition-transform"
                          >
                            {member.assignedRole === 'impostor' ? (
                              <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-crew-red text-white shadow-[0_0_8px_rgba(255,59,48,0.5)] animate-pulse">
                                🚨 IMPOSTOR
                              </span>
                            ) : member.assignedRole === 'crewmate' ? (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-crew-cyan/20 text-crew-cyan border border-crew-cyan/40">
                                🛡️ CREW
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-gray-500 border border-gray-800 px-1.5 py-0.5 rounded hover:text-white hover:border-gray-600">
                                + ROLE
                              </span>
                            )}
                          </button>
                        </div>

                        {/* ID & Branch / Year */}
                        <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between border-t border-gray-800/80 pt-1.5">
                          <span className="text-crew-cyan font-bold">{member.collegeId}</span>
                          <span>
                            {member.branch} • Y{member.year}-{member.section}
                          </span>
                        </div>

                        {/* Attendance Action */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            onClick={() => onToggleAttendance(member.id || member.collegeId)}
                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-all text-center ${
                              member.isPresent
                                ? 'bg-crew-lime/15 border-crew-lime/60 text-crew-lime hover:bg-red-950/40 hover:text-red-400 hover:border-red-500'
                                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:bg-crew-lime hover:text-black hover:border-crew-lime'
                            }`}
                            title="Click to toggle attendance"
                          >
                            {member.isPresent ? '📍 PRESENT' : '⚪ MARK PRESENT'}
                          </button>

                          <button
                            onClick={() => onSelectCandidate(member)}
                            className="px-2 py-1 rounded-lg text-[10px] font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                          >
                            DOSSIER ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unassigned Candidates Cluster */}
          {clusters.unassigned.length > 0 && (
            <div className="au-card bg-gray-950/90 border-2 border-dashed border-gray-800 rounded-2xl p-4 sm:p-5 mt-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <div>
                    <h3 className="font-display text-base text-gray-300">
                      UNASSIGNED CANDIDATES ({clusters.unassigned.length})
                    </h3>
                    <p className="text-[11px] font-mono text-gray-500">
                      These participants are registered but not yet assigned to an active 4-member squad.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {clusters.unassigned.map((member) => (
                  <div
                    key={member.collegeId}
                    className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-xs font-mono space-y-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-6 h-6 rounded-full border border-black flex items-center justify-center text-[10px] shrink-0"
                        style={{ backgroundColor: member.suitColor }}
                      >
                        🚀
                      </div>
                      <span className="text-white font-bold truncate">{member.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 flex justify-between">
                      <span className="text-crew-cyan font-bold">{member.collegeId}</span>
                      <span>
                        {member.branch} • Y{member.year}
                      </span>
                    </div>
                    <button
                      onClick={() => onToggleAttendance(member.id || member.collegeId)}
                      className={`w-full py-1 text-[10px] font-bold rounded-lg border ${
                        member.isPresent
                          ? 'bg-crew-lime/20 border-crew-lime text-crew-lime'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      {member.isPresent ? '📍 PRESENT' : '⚪ MARK PRESENT'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="au-card bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/80 text-gray-400 font-mono uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">College ID</th>
                  <th className="py-3 px-4">Department &amp; Section</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Assigned Team</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80 font-medium font-sans">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500 font-mono text-sm">
                      No participants match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => (
                    <tr
                      key={c.collegeId}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => onSelectCandidate(c)}
                    >
                      {/* Participant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0 shadow text-xs"
                            style={{ backgroundColor: c.suitColor }}
                            title={`Suit: ${c.suitColor}`}
                          >
                            🚀
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-crew-cyan transition-colors">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* College ID */}
                      <td className="py-3 px-4 font-mono font-bold text-crew-cyan tracking-wider">
                        {c.collegeId}
                      </td>

                      {/* Department & Section */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-white">
                          {c.branch} - Sec {c.section}
                        </span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">Year {c.year}</span>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleAttendance(c.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border transition-all ${
                            c.isPresent
                              ? 'bg-crew-lime/20 text-crew-lime border-crew-lime/60 shadow-[0_0_10px_rgba(50,205,50,0.15)]'
                              : 'bg-black/60 text-gray-400 border-gray-700 hover:border-gray-500'
                          }`}
                          title="Click to toggle Present/Absent"
                        >
                          {c.isPresent ? 'Present' : 'Absent'}
                        </button>
                      </td>

                      {/* Assigned Team */}
                      <td className="py-3 px-4 font-mono">
                        {c.assignedTeamId && c.assignedTeamId.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-crew-cyan/20 text-crew-cyan border border-crew-cyan/50 font-bold text-[11px]">
                              {c.assignedTeamId}
                            </span>
                            <span className="text-gray-300 text-[11px] hidden sm:inline">
                              {c.assignedTeamName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3 px-4 font-mono">
                        {c.assignedRole === 'impostor' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-950 text-crew-red border border-crew-red font-bold text-[11px] animate-pulse">
                            Impostor
                          </span>
                        ) : c.assignedRole === 'crewmate' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-cyan-950 text-crew-cyan border border-crew-cyan/60 font-bold text-[11px]">
                            Crewmate
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Pending</span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 font-mono">
                        {c.paymentStatus === 'success' ? (
                          <span className="text-crew-lime font-bold">₹55 Paid</span>
                        ) : c.paymentStatus === 'pending' ? (
                          <span className="text-crew-yellow font-bold">Pending</span>
                        ) : (
                          <span className="text-crew-red font-bold">Verification Required</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2 font-mono">
                          <button
                            onClick={() => onSelectCandidate(c)}
                            className="px-2.5 py-1 bg-black/70 hover:bg-gray-800 text-crew-cyan border border-crew-cyan/50 rounded text-[11px] font-bold transition-colors"
                          >
                            VIEW PROFILE
                          </button>

                          <select
                            value={c.assignedRole}
                            onChange={(e) => onUpdateRole(c.id, e.target.value as any)}
                            className="bg-black text-[11px] border border-gray-800 rounded px-1.5 py-1 text-gray-300 focus:outline-none focus:border-crew-cyan"
                            title="Assign Role"
                          >
                            <option value="unassigned">Unassigned</option>
                            <option value="crewmate">Crewmate</option>
                            <option value="impostor">Impostor</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
