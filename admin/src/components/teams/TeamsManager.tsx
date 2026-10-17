'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { TeamRecord, TeamMember } from '../../types';

const SUIT_COLORS = [
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EAB308', // Yellow
  '#A855F7', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#6366F1', // Indigo
];

const SQUAD_NAMES = [
  'THE SKELD',
  'MIRA HQ',
  'POLUS',
  'THE AIRSHIP',
  'THE FUNGLE',
  'SUBMERGED',
  'ECLIPSE',
  'NEBULA',
  'VORTEX',
  'ORION',
  'TITAN',
  'CYPHER',
  'VALKYRIE',
  'NOVA',
  'CHRONOS',
  'AURORA',
  'PHANTOM',
  'ZENITH',
  'PULSAR',
  'COBALT',
  'HELIX',
  'SPECTRE',
  'NEXUS',
  'SOLARIS',
];

interface UnassignedCandidate {
  collegeId: string;
  name: string;
  email: string;
  branch: string;
  year: string;
  section: string;
  phone?: string;
  registeredAt?: string;
  isPresent?: boolean;
}

export default function TeamsManager() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [unassigned, setUnassigned] = useState<UnassignedCandidate[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [filterPresentOnly, setFilterPresentOnly] = useState<boolean>(false);

  // Drag and drop state
  const [draggedCadet, setDraggedCadet] = useState<{
    cadet: TeamMember | UnassignedCandidate;
    sourceTeamId: string | 'unassigned';
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Load initial teams overview from backend
  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getTeamsOverview();
      if (res && res.success) {
        setTeams(res.teams || []);
        const rawUnassigned = res.unassignedMembers || (res as any).unassignedCandidates || [];
        setUnassigned(rawUnassigned);
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      console.error('Failed to load teams overview:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch squads from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();
  }, []);

  // 1-Click Auto-Generate 4-Cadet Squads
  const handleAutoGenerate = () => {
    // Gather all candidates: everyone currently in teams + unassigned
    const allCandidates: UnassignedCandidate[] = [];

    // Collect from unassigned
    unassigned.forEach((u) => allCandidates.push(u));

    // Collect from existing teams
    teams.forEach((t) => {
      t.members.forEach((m) => {
        allCandidates.push({
          collegeId: m.collegeId,
          name: m.name,
          email: m.email,
          branch: m.branch,
          year: m.year,
          section: m.section,
          isPresent: m.isPresent,
        });
      });
    });

    if (allCandidates.length === 0) {
      alert('No registered candidates found to form squads.');
      return;
    }

    let poolToSquad = allCandidates;
    let excludedAbsent: UnassignedCandidate[] = [];

    if (filterPresentOnly) {
      poolToSquad = allCandidates.filter((c) => c.isPresent);
      excludedAbsent = allCandidates.filter((c) => !c.isPresent);

      if (poolToSquad.length === 0) {
        alert('No cadets marked as PRESENT at the venue yet. Scan the Venue QR Pass first or uncheck "Present Cadets Only".');
        return;
      }
    }

    // Shuffle candidates randomly for fair and exciting distribution
    const shuffled = [...poolToSquad].sort(() => Math.random() - 0.5);

    const newTeams: TeamRecord[] = [];
    const remainingUnassigned: UnassignedCandidate[] = [...excludedAbsent];

    let teamCounter = 1;
    for (let i = 0; i < shuffled.length; i += 4) {
      const chunk = shuffled.slice(i, i + 4);

      if (chunk.length === 4) {
        // Standard squad of 4
        const squadCodename = SQUAD_NAMES[(teamCounter - 1) % SQUAD_NAMES.length];
        const teamId = `SQUAD-${String(teamCounter).padStart(3, '0')}`;
        
        // Pick 1 random member as secret impostor initially (admin can change anytime)
        const impostorIndex = Math.floor(Math.random() * chunk.length);
        const impostorCollegeId = chunk[impostorIndex].collegeId;

        const members: TeamMember[] = chunk.map((c, idx) => ({
          collegeId: c.collegeId,
          name: c.name,
          email: c.email,
          branch: c.branch || 'CSE',
          year: c.year || '1st',
          section: c.section || 'A',
          suitColor: SUIT_COLORS[idx % SUIT_COLORS.length],
          role: c.collegeId === impostorCollegeId ? 'impostor' : 'crewmate',
        }));

        newTeams.push({
          teamId,
          name: `${squadCodename} - ${String(teamCounter).padStart(2, '0')}`,
          tableNumber: teamCounter,
          members,
          impostorId: impostorCollegeId,
        });

        teamCounter++;
      } else {
        // Remaining 1, 2, or 3 candidates go to the unassigned bench
        // so admin can easily slide them into existing squads!
        remainingUnassigned.push(...chunk);
      }
    }

    setTeams(newTeams);
    setUnassigned(remainingUnassigned);
    setHasUnsavedChanges(true);

    setSuccessMsg(
      `⚡ Formed ${newTeams.length} squads of 4 cadets! ${
        remainingUnassigned.length > 0
          ? `${remainingUnassigned.length} remaining cadets are in the Unassigned Bench — slide them into any squad below.`
          : 'All cadets assigned!'
      }`
    );
    setTimeout(() => setSuccessMsg(null), 8000);
  };

  // Add a new empty custom squad
  const handleAddSquad = () => {
    const nextNum = teams.length + 1;
    const squadCodename = SQUAD_NAMES[(nextNum - 1) % SQUAD_NAMES.length];
    const newTeam: TeamRecord = {
      teamId: `SQUAD-${String(nextNum).padStart(3, '0')}`,
      name: `${squadCodename} - ${String(nextNum).padStart(2, '0')}`,
      tableNumber: nextNum,
      members: [],
    };
    setTeams([...teams, newTeam]);
    setHasUnsavedChanges(true);
  };

  // Delete a squad and move its members to unassigned
  const handleDeleteSquad = (teamId: string) => {
    const targetTeam = teams.find((t) => t.teamId === teamId);
    if (!targetTeam) return;

    if (
      targetTeam.members.length > 0 &&
      !window.confirm(`Disband ${targetTeam.name}? All ${targetTeam.members.length} members will move to the Unassigned Bench.`)
    ) {
      return;
    }

    const releasedMembers: UnassignedCandidate[] = targetTeam.members.map((m) => ({
      collegeId: m.collegeId,
      name: m.name,
      email: m.email,
      branch: m.branch,
      year: m.year,
      section: m.section,
    }));

    setUnassigned([...unassigned, ...releasedMembers]);
    setTeams(teams.filter((t) => t.teamId !== teamId));
    setHasUnsavedChanges(true);
  };

  // Slide/Move Cadet to a specific team or to unassigned
  const moveCadet = (
    cadetCollegeId: string,
    sourceTeamId: string | 'unassigned',
    destTeamId: string | 'unassigned'
  ) => {
    if (sourceTeamId === destTeamId) return;

    let cadetData: TeamMember | UnassignedCandidate | null = null;

    // Remove from source
    if (sourceTeamId === 'unassigned') {
      const idx = unassigned.findIndex((c) => c.collegeId === cadetCollegeId);
      if (idx !== -1) {
        cadetData = unassigned[idx];
        setUnassigned((prev) => prev.filter((c) => c.collegeId !== cadetCollegeId));
      }
    } else {
      const srcTeam = teams.find((t) => t.teamId === sourceTeamId);
      if (srcTeam) {
        const idx = srcTeam.members.findIndex((m) => m.collegeId === cadetCollegeId);
        if (idx !== -1) {
          cadetData = srcTeam.members[idx];
          const updatedMembers = srcTeam.members.filter((m) => m.collegeId !== cadetCollegeId);
          // If this member was the impostor, reset impostorId or pick another
          const newImpostorId =
            srcTeam.impostorId === cadetCollegeId
              ? updatedMembers[0]?.collegeId || undefined
              : srcTeam.impostorId;

          setTeams((prev) =>
            prev.map((t) =>
              t.teamId === sourceTeamId
                ? {
                    ...t,
                    members: updatedMembers.map((m) => ({
                      ...m,
                      role: m.collegeId === newImpostorId ? 'impostor' : 'crewmate',
                    })),
                    impostorId: newImpostorId,
                  }
                : t
            )
          );
        }
      }
    }

    if (!cadetData) return;

    // Add to destination
    if (destTeamId === 'unassigned') {
      const unassignedCadet: UnassignedCandidate = {
        collegeId: cadetData.collegeId,
        name: cadetData.name,
        email: cadetData.email,
        branch: cadetData.branch,
        year: cadetData.year,
        section: cadetData.section,
      };
      setUnassigned((prev) => [...prev, unassignedCadet]);
    } else {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.teamId === destTeamId) {
            const suitColor = SUIT_COLORS[t.members.length % SUIT_COLORS.length];
            const newMember: TeamMember = {
              collegeId: cadetData!.collegeId,
              name: cadetData!.name,
              email: cadetData!.email,
              branch: cadetData!.branch || 'CSE',
              year: cadetData!.year || '1st',
              section: cadetData!.section || 'A',
              suitColor,
              role: t.members.length === 0 ? 'impostor' : 'crewmate', // First member default impostor if empty
            };
            const updatedMembers = [...t.members, newMember];
            const impostorId = t.impostorId || newMember.collegeId;

            return {
              ...t,
              members: updatedMembers.map((m) => ({
                ...m,
                role: m.collegeId === impostorId ? 'impostor' : 'crewmate',
              })),
              impostorId,
            };
          }
          return t;
        })
      );
    }

    setHasUnsavedChanges(true);
  };

  // Appoint someone as Impostor in a team
  const handleAppointImpostor = async (teamId: string, collegeId: string) => {
    // Optimistically update UI
    setTeams((prev) =>
      prev.map((t) => {
        if (t.teamId === teamId) {
          return {
            ...t,
            impostorId: collegeId,
            members: t.members.map((m) => ({
              ...m,
              role: m.collegeId === collegeId ? 'impostor' : 'crewmate',
            })),
          };
        }
        return t;
      })
    );
    setHasUnsavedChanges(true);

    // If team has an actual MongoDB _id, also call the immediate appoint API endpoint
    const existingTeam = teams.find((t) => t.teamId === teamId);
    if (existingTeam && existingTeam._id) {
      try {
        await adminService.appointImpostor(existingTeam._id, collegeId);
        setSuccessMsg(`Appointed ${collegeId} as secret Impostor! Teammates will not see this.`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err) {
        console.warn('Deferred backend impostor save to Publish step:', err);
      }
    }
  };

  // Save & Publish All Teams to Database
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await adminService.saveAllTeams(teams);
      if (res && res.success) {
        setHasUnsavedChanges(false);
        setSuccessMsg('🎉 All squads & secret impostor roles have been successfully saved & published!');
        setTimeout(() => setSuccessMsg(null), 5000);
        // Refresh with latest data
        await fetchTeamsData();
      }
    } catch (err: any) {
      console.error('Failed to save squads:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save squads to database');
    } finally {
      setSaving(false);
    }
  };

  // Drag-and-drop handlers
  const handleDragStart = (
    cadet: TeamMember | UnassignedCandidate,
    sourceTeamId: string | 'unassigned'
  ) => {
    setDraggedCadet({ cadet, sourceTeamId });
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (dragOverTarget !== targetId) {
      setDragOverTarget(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, destTeamId: string | 'unassigned') => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedCadet) return;

    moveCadet(draggedCadet.cadet.collegeId, draggedCadet.sourceTeamId, destTeamId);
    setDraggedCadet(null);
  };

  const totalAssigned = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalCadets = totalAssigned + unassigned.length;
  const presentCadetsCount =
    teams.reduce((acc, t) => acc + t.members.filter((m) => m.isPresent).length, 0) +
    unassigned.filter((u) => u.isPresent).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-2 border-crew-cyan/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-crew-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-crew-cyan animate-ping" />
              <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-white">
                SQUAD CREATION & <span className="text-crew-cyan">IMPOSTOR CONTROL</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
              Assemble 4-cadet squads with 1-click. Filter by venue attendance. Slide members into any team. Appoint secret Impostors visible only to the chosen cadet.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 font-mono">
            <div className="bg-black/60 border border-gray-800 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-gray-400 block uppercase">Total Registered</span>
              <span className="text-lg font-bold text-white">{totalCadets}</span>
            </div>
            <div className="bg-black/60 border border-crew-lime/40 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-crew-lime block uppercase">Present at Venue</span>
              <span className="text-lg font-bold text-crew-lime">{presentCadetsCount}</span>
            </div>
            <div className="bg-black/60 border border-crew-cyan/40 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-crew-cyan block uppercase">In Squads</span>
              <span className="text-lg font-bold text-crew-cyan">{totalAssigned}</span>
            </div>
            <div className="bg-black/60 border border-amber-500/40 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-amber-400 block uppercase">Unassigned Bench</span>
              <span className="text-lg font-bold text-amber-400">{unassigned.length}</span>
            </div>
            <div className="bg-black/60 border border-purple-500/40 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-purple-400 block uppercase">Squads Formed</span>
              <span className="text-lg font-bold text-purple-400">{teams.length}</span>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="mt-6 pt-5 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1-Click Auto Generate */}
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="bg-crew-cyan hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl font-display text-sm tracking-wider font-bold shadow-[0_0_20px_rgba(56,254,220,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>1-CLICK AUTO-GENERATE (TEAMS OF 4)</span>
            </button>

            {/* Present Only Toggle */}
            <label className="flex items-center gap-2 bg-black/60 border border-gray-700 hover:border-crew-lime px-3 py-2 rounded-xl cursor-pointer text-xs font-mono transition-colors select-none">
              <input
                type="checkbox"
                checked={filterPresentOnly}
                onChange={(e) => setFilterPresentOnly(e.target.checked)}
                className="accent-crew-lime w-4 h-4 cursor-pointer"
              />
              <span className={filterPresentOnly ? 'text-crew-lime font-bold' : 'text-gray-300'}>
                🎯 Present Cadets Only ({presentCadetsCount})
              </span>
            </label>

            {/* Add Squad */}
            <button
              type="button"
              onClick={handleAddSquad}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-4 py-2.5 rounded-xl font-display text-sm tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-crew-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>ADD EMPTY SQUAD</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchTeamsData}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 px-3.5 py-2.5 rounded-xl font-mono text-xs border border-gray-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>SYNC</span>
            </button>
          </div>

          {/* Save / Publish */}
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Unsaved changes pending
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-crew-lime hover:bg-lime-400 text-black px-5 py-2.5 rounded-xl font-display text-sm tracking-wider font-bold shadow-[0_0_20px_rgba(80,239,57,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>SAVING TO ATLAS...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>SAVE & PUBLISH SQUADS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/80 border border-crew-red text-red-200 rounded-xl text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-crew-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-gray-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-crew-lime text-emerald-200 rounded-xl text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-crew-lime shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-gray-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* SECTION 1: UNASSIGNED CADETS TRAY ("RESERVE BENCH") */}
      <div
        onDragOver={(e) => handleDragOver(e, 'unassigned')}
        onDrop={(e) => handleDrop(e, 'unassigned')}
        className={`bg-gray-950/90 border-2 rounded-2xl p-5 transition-all ${
          dragOverTarget === 'unassigned'
            ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
            : 'border-amber-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base tracking-wider text-amber-400">
                UNASSIGNED CADETS BENCH ({unassigned.length})
              </h2>
              <p className="text-[11px] font-mono text-gray-400">
                Cadets waiting for squad allocation. Drag or slide any cadet directly into a squad below!
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-black/60 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full font-bold">
            DRAG TARGET ACTIVE
          </span>
        </div>

        {unassigned.length === 0 ? (
          <div className="py-8 text-center text-gray-500 font-mono text-xs border border-dashed border-gray-800 rounded-xl">
            ✓ All registered cadets have been placed into squads! You can slide members between squads anytime.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unassigned.map((cadet) => (
              <div
                key={cadet.collegeId}
                draggable
                onDragStart={() => handleDragStart(cadet, 'unassigned')}
                className="bg-gray-900/90 border border-amber-500/30 hover:border-amber-400 rounded-xl p-3 shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-white">
                      {cadet.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                        {cadet.name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 truncate">{cadet.collegeId}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      {cadet.branch} {cadet.year}-{cadet.section}
                    </span>
                    <span
                      className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                        cadet.isPresent
                          ? 'bg-emerald-950 text-crew-lime border border-crew-lime/60'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {cadet.isPresent ? '✓ PRESENT' : 'NOT HERE'}
                    </span>
                  </div>
                </div>

                {/* Quick Slide Selector for Touch & Fast Assignment */}
                <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-gray-500">Slide to:</span>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        moveCadet(cadet.collegeId, 'unassigned', e.target.value);
                      }
                    }}
                    className="bg-black text-xs font-mono text-crew-cyan border border-gray-700 rounded-lg px-2 py-1 outline-none focus:border-crew-cyan cursor-pointer"
                  >
                    <option value="" disabled>Choose squad...</option>
                    {teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.name} ({t.members.length} cadets)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: SQUADS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-crew-cyan/20 border border-crew-cyan/50 flex items-center justify-center text-crew-cyan">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg tracking-wider text-white">
                SQUADS ROSTER ({teams.length})
              </h2>
              <p className="text-[11px] font-mono text-gray-400">
                Drag cadets into squads or use the dropdown to reassign. Click &quot;Appoint Impostor&quot; to secretly nominate the infiltrator for each squad.
              </p>
            </div>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="bg-gray-950/80 border-2 border-gray-800 rounded-2xl p-12 text-center font-mono">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-white text-sm font-bold mb-1">No Squads Formed Yet</p>
            <p className="text-xs text-gray-500 mb-4">Click 1-Click Auto-Generate to build 4-cadet squads from registered participants.</p>
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="bg-crew-cyan hover:bg-cyan-400 text-black px-5 py-2.5 rounded-xl font-display text-xs tracking-wider font-bold transition-all cursor-pointer"
            >
              ⚡ AUTO-GENERATE SQUADS NOW
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {teams.map((team) => {
              const isOver = dragOverTarget === team.teamId;
              const hasImpostor = Boolean(team.impostorId);

              return (
                <div
                  key={team.teamId}
                  onDragOver={(e) => handleDragOver(e, team.teamId)}
                  onDrop={(e) => handleDrop(e, team.teamId)}
                  className={`bg-gray-950/95 border-2 rounded-2xl p-5 shadow-xl transition-all relative flex flex-col justify-between ${
                    isOver
                      ? 'border-crew-cyan bg-cyan-950/30 shadow-[0_0_25px_rgba(56,254,220,0.3)] scale-[1.01]'
                      : 'border-gray-800/90 hover:border-gray-700'
                  }`}
                >
                  {/* Squad Header */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center font-display text-sm font-bold text-crew-cyan">
                          T{team.tableNumber}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setTeams((prev) =>
                                prev.map((t) => (t.teamId === team.teamId ? { ...t, name: newName } : t))
                              );
                              setHasUnsavedChanges(true);
                            }}
                            className="bg-transparent font-display text-base tracking-wider text-white border-b border-transparent hover:border-gray-700 focus:border-crew-cyan focus:bg-gray-900/60 px-1 py-0.5 rounded outline-none transition-all"
                          />
                          <p className="text-[10px] font-mono text-gray-500 px-1">
                            TABLE {team.tableNumber} • ID: {team.teamId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Member count badge */}
                        <span
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                            team.members.length === 4
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : team.members.length > 4
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {team.members.length}/4 Cadets
                        </span>

                        {/* Delete Squad */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSquad(team.teamId)}
                          title="Disband squad and move members to unassigned bench"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Impostor Status Alert for this squad */}
                    <div className="my-3 px-3 py-1.5 rounded-xl bg-black/60 border border-gray-800/90 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Secret Impostor:</span>
                        {hasImpostor ? (
                          <span className="text-crew-red font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-crew-red animate-pulse" />
                            {team.members.find((m) => m.collegeId === team.impostorId)?.name || team.impostorId} (CONFIDENTIAL)
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">None appointed</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 italic">
                        Visible only to the impostor
                      </span>
                    </div>

                    {/* Members List */}
                    <div className="space-y-2 mt-3 min-h-[140px]">
                      {team.members.length === 0 ? (
                        <div className="h-32 border border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-500 font-mono text-xs">
                          <span>Empty Squad</span>
                          <span className="text-[10px] text-gray-600 mt-1">
                            Drag or slide cadets here to fill this squad
                          </span>
                        </div>
                      ) : (
                        team.members.map((member) => {
                          const isImpostor = member.collegeId === team.impostorId || member.role === 'impostor';

                          return (
                            <div
                              key={member.collegeId}
                              draggable
                              onDragStart={() => handleDragStart(member, team.teamId)}
                              className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 ${
                                isImpostor
                                  ? 'bg-red-950/30 border-crew-red/60 shadow-[0_0_15px_rgba(197,17,17,0.2)]'
                                  : 'bg-gray-900/70 border-gray-800/80 hover:border-gray-700'
                              }`}
                            >
                              {/* Member Identity & Suit */}
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                                  style={{ backgroundColor: member.suitColor || '#38FEDC' }}
                                >
                                  {isImpostor ? '🔪' : '🛡️'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-xs text-white truncate">{member.name}</p>
                                    {isImpostor && (
                                      <span className="text-[9px] bg-red-950 text-crew-red border border-crew-red/60 px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                                        IMPOSTOR
                                      </span>
                                    )}
                                    {member.isPresent && (
                                      <span className="text-[8px] bg-emerald-950 text-crew-lime border border-crew-lime/60 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                                        ✓ PRESENT
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-mono text-gray-400 truncate">
                                    {member.collegeId} • {member.branch} {member.year}-{member.section}
                                  </p>
                                </div>
                              </div>

                              {/* Action Buttons: Appoint Impostor & Slide */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Appoint Impostor Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleAppointImpostor(team.teamId, member.collegeId)}
                                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isImpostor
                                      ? 'bg-crew-red text-white shadow-[0_0_10px_rgba(197,17,17,0.5)] border border-red-500'
                                      : 'bg-gray-800/80 text-gray-400 hover:text-white hover:bg-red-950/60 border border-gray-700'
                                  }`}
                                  title="Appoint as secret Impostor. Teammates will not see this role on their screens."
                                >
                                  <span>{isImpostor ? '🔪 IMPOSTOR' : 'APPOINT IMPOSTOR'}</span>
                                </button>

                                {/* Slide to Another Team Selector */}
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      moveCadet(member.collegeId, team.teamId, e.target.value);
                                    }
                                  }}
                                  className="bg-black text-[10px] font-mono text-gray-300 border border-gray-700 rounded-lg px-1.5 py-1 outline-none focus:border-crew-cyan cursor-pointer"
                                  title="Slide to another squad or bench"
                                >
                                  <option value="" disabled>Slide...</option>
                                  <option value="unassigned">➡️ Unassigned Bench</option>
                                  {teams
                                    .filter((t) => t.teamId !== team.teamId)
                                    .map((t) => (
                                      <option key={t.teamId} value={t.teamId}>
                                        ➡️ {t.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Drop zone indicator when dragging */}
                  {isOver && (
                    <div className="mt-2 py-2 border-2 border-dashed border-crew-cyan/60 rounded-xl text-center text-crew-cyan font-mono text-xs bg-crew-cyan/10">
                      Release to drop cadet into {team.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
