'use client';

import React, { useState, useMemo } from 'react';
import { CandidateRecord } from '../../../types/admin';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS } from '../../../constants/branches';

interface CandidateTableProps {
  candidates: CandidateRecord[];
  onToggleAttendance: (candidateId: string) => void;
  onSelectCandidate: (candidate: CandidateRecord) => void;
  onUpdateRole: (candidateId: string, role: 'crewmate' | 'impostor' | 'unassigned') => void;
  onExportCsv: () => void;
}

export default function CandidateTable({
  candidates,
  onToggleAttendance,
  onSelectCandidate,
  onUpdateRole,
  onExportCsv,
}: CandidateTableProps) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'crewmate' | 'impostor' | 'unassigned'>('all');

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search
      const q = search.toLowerCase().trim();
      if (q.length > 0) {
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesId = c.collegeId.includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q);
        const matchesTeam = c.assignedTeamName !== undefined && c.assignedTeamName.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone && !matchesTeam) {
          return false;
        }
      }

      // Dept / Branch Filter
      if (deptFilter !== 'all' && c.branch !== deptFilter) return false;

      // Section Filter
      if (sectionFilter !== 'all' && c.section !== sectionFilter) return false;

      // Year Filter
      if (yearFilter !== 'all' && c.year !== yearFilter) return false;

      // Attendance Filter
      if (attendanceFilter === 'present' && !c.isPresent) return false;
      if (attendanceFilter === 'absent' && c.isPresent) return false;

      // Role Filter
      if (roleFilter !== 'all' && c.assignedRole !== roleFilter) return false;

      return true;
    });
  }, [candidates, search, deptFilter, sectionFilter, yearFilter, attendanceFilter, roleFilter]);

  const presentCount = candidates.filter((c) => c.isPresent).length;

  return (
    <div className="space-y-4">
      {/* Table Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-white flex items-center gap-2">
            <span>👥</span> INDIVIDUAL REGISTERED CANDIDATE ROSTER
          </h3>
          <p className="text-xs text-gray-400 font-mono">
            Showing {filteredCandidates.length} of {candidates.length} candidates • {presentCount} Marked Present at Venue
          </p>
        </div>

        {/* Export All Data in CSV/Excel Button (Requested in handwritten notes) */}
        <button
          onClick={onExportCsv}
          className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(50,205,50,0.2)]"
        >
          <span>📥</span> EXPORT ALL DATA (CSV / EXCEL)
        </button>
      </div>

      {/* Multi-Filter Toolbar (Dept, Section, Attendance, Role, Year) */}
      <div className="au-card bg-gray-900/90 border-2 border-gray-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Search name, ID, email, phone, team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan"
          />
        </div>

        {/* Filter Dept / Branch */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">All Depts / Branches</option>
            {ALLOWED_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Section */}
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

        {/* Filter Attendance */}
        <div>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">Attendance: All</option>
            <option value="present">📍 Present (Checked In)</option>
            <option value="absent">⚪ Absent</option>
          </select>
        </div>

        {/* Filter Role (Once assigned) */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-crew-cyan"
          >
            <option value="all">Assigned Role: All</option>
            <option value="crewmate">🛡️ Crewmate</option>
            <option value="impostor">🚨 Impostor</option>
            <option value="unassigned">⏳ Unassigned</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="au-card bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/80 text-gray-400 font-mono uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">15-Digit College ID</th>
                <th className="py-3 px-4">Dept &amp; Section</th>
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
                    No individual candidates match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr
                    key={c.collegeId}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => onSelectCandidate(c)}
                  >
                    {/* Candidate Name & Suit Color */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0 shadow text-xs"
                          style={{ backgroundColor: c.suitColor }}
                        >
                          🚀
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-crew-cyan transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* College ID */}
                    <td className="py-3 px-4 font-mono font-bold text-crew-cyan tracking-wider">
                      {c.collegeId}
                    </td>

                    {/* Dept & Section */}
                    <td className="py-3 px-4 font-mono">
                      <span className="inline-block px-2 py-0.5 rounded bg-black/60 border border-gray-800 text-white font-bold">
                        {c.branch} - Sec {c.section}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Yr {c.year}</span>
                    </td>

                    {/* Attendance Toggle (Present / Absent) */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleAttendance(c.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all ${
                          c.isPresent
                            ? 'bg-crew-lime/20 text-crew-lime border-crew-lime/60 shadow-[0_0_10px_rgba(50,205,50,0.15)]'
                            : 'bg-black/60 text-gray-400 border-gray-700 hover:border-gray-500'
                        }`}
                        title="Click to toggle check-in attendance"
                      >
                        {c.isPresent ? '📍 PRESENT' : '⚪ ABSENT'}
                      </button>
                    </td>

                    {/* Assigned Team */}
                    <td className="py-3 px-4 font-mono">
                      {c.assignedTeamName !== undefined && c.assignedTeamName.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-700/60 font-bold text-[11px]">
                          {c.assignedTeamName}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Assigned Role (Requested: "once we assign them a role should be displayed") */}
                    <td className="py-3 px-4 font-mono">
                      {c.assignedRole === 'impostor' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 text-crew-red border border-crew-red font-bold text-[11px] animate-pulse">
                          🚨 IMPOSTOR
                        </span>
                      ) : c.assignedRole === 'crewmate' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 text-crew-cyan border border-crew-cyan/60 font-bold text-[11px]">
                          🛡️ CREWMATE
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">Pending Role</span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 font-mono">
                      {c.paymentStatus === 'success' ? (
                        <span className="text-crew-lime font-bold">₹55 PAID</span>
                      ) : (
                        <span className="text-crew-yellow font-bold">PENDING</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5 font-mono">
                        <button
                          onClick={() => onSelectCandidate(c)}
                          className="px-2 py-1 bg-black/60 hover:bg-gray-800 text-crew-cyan border border-gray-800 rounded text-[11px] transition-colors"
                        >
                          Dossier
                        </button>

                        <select
                          value={c.assignedRole}
                          onChange={(e) => onUpdateRole(c.id, e.target.value as any)}
                          className="bg-black text-[10px] border border-gray-800 rounded px-1 py-1 text-gray-300 focus:outline-none"
                          title="Override Role"
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
    </div>
  );
}
