'use client';

import React, { useState, useEffect } from 'react';

interface RoundControlProps {
  activeRound: 'round1' | 'round2' | 'round3';
  onChangeRound: (round: 'round1' | 'round2' | 'round3') => void;
  onBroadcastTimerState?: (state: string) => void;
}

export default function RoundControl({
  activeRound,
  onChangeRound,
  onBroadcastTimerState,
}: RoundControlProps) {
  // Timer State
  const defaultMinutes = activeRound === 'round1' ? 75 : activeRound === 'round2' ? 105 : 45;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<number>(defaultMinutes);

  useEffect(() => {
    // When round changes, update default duration
    const mins = activeRound === 'round1' ? 75 : activeRound === 'round2' ? 105 : 45;
    setCustomMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsRunning(false);
  }, [activeRound]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining]);

  // Sync timer to localStorage for participant dashboards
  useEffect(() => {
    try {
      localStorage.setItem('amongu_timer_remaining_seconds', secondsRemaining.toString());
      localStorage.setItem('amongu_timer_is_running', isRunning ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [secondsRemaining, isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    if (onBroadcastTimerState) onBroadcastTimerState('Timer Started');
  };

  const handlePause = () => {
    setIsRunning(false);
    if (onBroadcastTimerState) onBroadcastTimerState('Timer Paused');
  };

  const handleStop = () => {
    setIsRunning(false);
    setSecondsRemaining(customMinutes * 60);
    if (onBroadcastTimerState) onBroadcastTimerState('Timer Stopped & Reset');
  };

  const handleSetCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    setSecondsRemaining(customMinutes * 60);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="au-card bg-gray-900/90 border-2 border-crew-cyan/40 p-5 rounded-2xl space-y-4 shadow-[0_0_20px_rgba(0,255,255,0.08)]">
      {/* Title & Active Round Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⏱️</span>
          <div>
            <h3 className="font-display text-lg text-white">ROUND CONTROL &amp; TIMER</h3>
            <p className="text-xs text-gray-400 font-mono">Time / Start / Stop controls synchronized with candidate terminals</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isRunning ? 'bg-crew-lime animate-ping' : 'bg-crew-red'
            }`}
          />
          <span className="text-xs font-mono font-bold uppercase text-gray-300">
            {isRunning ? 'CHRONO RUNNING' : 'CHRONO STOPPED'}
          </span>
        </div>
      </div>

      {/* Round Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onChangeRound('round1')}
          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
            activeRound === 'round1'
              ? 'bg-crew-cyan/20 border-crew-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]'
              : 'bg-black/50 border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-bold text-crew-cyan">PHASE 1</span>
            {activeRound === 'round1' && (
              <span className="text-[9px] bg-crew-cyan text-black font-bold px-1.5 py-0.2 rounded">ACTIVE</span>
            )}
          </div>
          <p className="font-display text-sm text-white">Round 1: Architecture &amp; PPT</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Problem selection &amp; system deck</p>
        </button>

        <button
          onClick={() => onChangeRound('round2')}
          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
            activeRound === 'round2'
              ? 'bg-crew-lime/20 border-crew-lime shadow-[0_0_15px_rgba(50,205,50,0.2)]'
              : 'bg-black/50 border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-bold text-crew-lime">PHASE 2</span>
            {activeRound === 'round2' && (
              <span className="text-[9px] bg-crew-lime text-black font-bold px-1.5 py-0.2 rounded">ACTIVE</span>
            )}
          </div>
          <p className="font-display text-sm text-white">Round 2: Development Sprint</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Code repository &amp; prototype build</p>
        </button>

        <button
          onClick={() => onChangeRound('round3')}
          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
            activeRound === 'round3'
              ? 'bg-crew-red/20 border-crew-red shadow-[0_0_15px_rgba(255,59,48,0.2)]'
              : 'bg-black/50 border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-bold text-crew-red">PHASE 3</span>
            {activeRound === 'round3' && (
              <span className="text-[9px] bg-crew-red text-white font-bold px-1.5 py-0.2 rounded">ACTIVE</span>
            )}
          </div>
          <p className="font-display text-sm text-white">Round 3: Impostor Reveal &amp; Judging</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Emergency meeting &amp; deduction</p>
        </button>
      </div>

      {/* Live Timer Display & Start / Stop Controls */}
      <div className="bg-black/60 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Countdown Digits */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-black border-2 border-crew-cyan/50 rounded-xl font-mono text-3xl sm:text-4xl font-black text-crew-cyan tracking-wider shadow-[0_0_20px_rgba(0,255,255,0.15)]">
            {formatTime(secondsRemaining)}
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase">
            {isRunning ? '● TIME RUNNING' : '⏸️ COUNTDOWN PAUSED'}
          </span>
        </div>

        {/* Start / Stop / Pause Actions */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-sm py-2 px-5 rounded-xl flex items-center gap-1.5"
            >
              <span>▶</span> START TIME
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="au-btn bg-crew-yellow hover:bg-yellow-400 text-black font-display text-sm py-2 px-5 rounded-xl flex items-center gap-1.5"
            >
              <span>⏸</span> PAUSE
            </button>
          )}

          <button
            onClick={handleStop}
            className="au-btn bg-red-950/60 hover:bg-crew-red text-white border border-crew-red font-display text-sm py-2 px-4 rounded-xl flex items-center gap-1.5"
          >
            <span>⏹</span> STOP / RESET
          </button>
        </div>

        {/* Custom Minutes Input */}
        <form onSubmit={handleSetCustomTime} className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={300}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="w-16 bg-black border border-gray-800 rounded px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-crew-cyan"
          />
          <span className="text-xs text-gray-500 font-mono">Min</span>
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-mono font-bold"
          >
            Set
          </button>
        </form>
      </div>
    </div>
  );
}
