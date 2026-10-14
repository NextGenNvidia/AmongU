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
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'impostor' | 'crewmate' | 'unassigned'>('all');

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
        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone && !matchesTeam) {
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

  const presentCount = candidates.filter((c) => c.isPresent).length;

  return (
    <div className="space-y-4">
      {/* Section Heading & Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-white flex items-center gap-2">
            <span>👥</span> REGISTERED PARTICIPANT ROSTER
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            View participant details, verify attendance and payments, assign teams and roles, and manage registrations.
          </p>
          <p className="text-xs text-crew-cyan font-mono font-bold mt-1">
            Showing {filteredCandidates.length} of {candidates.length} participants • {presentCount} marked present
          </p>
        </div>

        {/* Button: EXPORT PARTICIPANT DATA (CSV / EXCEL) */}
        <button
          onClick={onExportCsv}
          className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(50,205,50,0.2)] font-bold shrink-0"
        >
          <span>📥</span> EXPORT PARTICIPANT DATA (CSV / EXCEL)
        </button>
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

      {/* Participant Table */}
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
                    {/* Participant: Full name and registered email */}
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

                    {/* College ID: 15-digit college ID */}
                    <td className="py-3 px-4 font-mono font-bold text-crew-cyan tracking-wider">
                      {c.collegeId}
                    </td>

                    {/* Department & Section: Branch, section, and academic year */}
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-white">
                        {c.branch} - Sec {c.section}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Year {c.year}</span>
                    </td>

                    {/* Attendance: Present / Absent */}
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

                    {/* Assigned Team: Team name or Unassigned */}
                    <td className="py-3 px-4 font-mono">
                      {c.assignedTeamName && c.assignedTeamName.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-700/60 font-bold text-[11px]">
                          {c.assignedTeamName}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Assigned Role: Impostor / Crewmate / Pending Assignment */}
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
                        <span className="text-gray-500 text-[11px]">Pending Assignment</span>
                      )}
                    </td>

                    {/* Payment: ₹55 Paid / Pending / Verification Required */}
                    <td className="py-3 px-4 font-mono">
                      {c.paymentStatus === 'success' ? (
                        <span className="text-crew-lime font-bold">₹55 Paid</span>
                      ) : c.paymentStatus === 'pending' ? (
                        <span className="text-crew-yellow font-bold">Pending</span>
                      ) : (
                        <span className="text-crew-red font-bold">Verification Required</span>
                      )}
                    </td>

                    {/* Actions: VIEW PROFILE / Assign Role */}
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
    </div>
  );
}
