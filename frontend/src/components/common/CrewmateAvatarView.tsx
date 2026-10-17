'use client';

import React from 'react';

// 12 Authentic Among Us Colors
export const AVATAR_COLORS = [
  { name: 'Red', hex: '#c51111' },
  { name: 'Blue', hex: '#132ed1' },
  { name: 'Green', hex: '#117f2d' },
  { name: 'Pink', hex: '#ed54ba' },
  { name: 'Orange', hex: '#ef7d0d' },
  { name: 'Yellow', hex: '#f5f557' },
  { name: 'Black', hex: '#3f474e' },
  { name: 'White', hex: '#d6e0f0' },
  { name: 'Purple', hex: '#6b2fbb' },
  { name: 'Cyan', hex: '#38fedc' },
  { name: 'Lime', hex: '#50ef39' },
  { name: 'Brown', hex: '#71491e' },
];

// Hats Selection
export const AVATAR_HATS = [
  { id: 'none', label: 'None', emoji: '🚫' },
  { id: 'top-hat', label: 'Top Hat', emoji: '🎩' },
  { id: 'sprout', label: 'Sprout', emoji: '🌱' },
  { id: 'party-hat', label: 'Party Hat', emoji: '🎉' },
  { id: 'mini-crewmate', label: 'Mini Mate', emoji: '👨‍🚀' },
  { id: 'viking', label: 'Viking', emoji: '⚔️' },
  { id: 'detective', label: 'Detective', emoji: '🕵️' },
  { id: 'bandana', label: 'Bandana', emoji: '🔴' },
];

// Mufflers & Neckwear
export const AVATAR_MUFFLERS = [
  { id: 'none', label: 'None', emoji: '🚫' },
  { id: 'winter-scarf', label: 'Red Scarf', emoji: '🧣' },
  { id: 'cyan-muffler', label: 'Cyan Muffler', emoji: '🧣' },
  { id: 'gold-chain', label: 'Gold Chain', emoji: '🪙' },
  { id: 'bowtie', label: 'Bowtie', emoji: '🎀' },
  { id: 'necktie', label: 'Necktie', emoji: '👔' },
  { id: 'stethoscope', label: 'Stethoscope', emoji: '🩺' },
];

// Dynamic Crewmate SVG with Hats & Mufflers
export const CrewmateAvatarView: React.FC<{
  color: string;
  hat: string;
  muffler: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ color, hat, muffler, width = 110, height = 135, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 -28 100 148"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Backpack */}
      <rect x="2" y="30" width="25" height="50" rx="8" fill={color} stroke="#000" strokeWidth="5" />

      {/* Main Body & Legs */}
      <path
        d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
        fill={color}
        stroke="#000"
        strokeWidth="5"
      />

      {/* Visor */}
      <path
        d="M30,30 h45 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-45 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
        fill="#9cdbfa"
        stroke="#000"
        strokeWidth="5"
      />
      {/* Visor Reflection Gloss */}
      <path
        d="M35,37 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
        fill="#ffffff"
        opacity="0.8"
      />

      {/* Visor Shadow Undertone */}
      <path
        d="M32,48 h41 a5,5 0 0,1 5,3 v2 a13,13 0 0,1 -13,11 h-25 a13,13 0 0,1 -13,-11 v-2 a5,5 0 0,1 5,-3 Z"
        fill="#72b5db"
        opacity="0.45"
      />

      {/* Body Inner Shadow */}
      <path
        d="M20,60 v20 C20,95 30,95 45,95 c15,0 25,0 25,-15 v-20 C70,75 55,80 45,80 C35,80 20,75 20,60 Z"
        fill="#000000"
        opacity="0.18"
      />

      {/* --- HATS LAYER --- */}
      {hat === 'top-hat' && (
        <g id="hat-top-hat">
          <ellipse cx="48" cy="14" rx="26" ry="5" fill="#18181b" stroke="#000" strokeWidth="3" />
          <path d="M30,13 L32,-18 L64,-18 L66,13 Z" fill="#18181b" stroke="#000" strokeWidth="3" />
          <rect x="31.5" y="4" width="33" height="6.5" fill="#c51111" />
        </g>
      )}

      {hat === 'sprout' && (
        <g id="hat-sprout">
          <path d="M48,11 Q48,0 48,-6" stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M48,-6 Q37,-16 35,-4 Q42,-1 48,-6 Z" fill="#22c55e" stroke="#000" strokeWidth="2.5" />
          <path d="M48,-6 Q59,-16 61,-4 Q54,-1 48,-6 Z" fill="#22c55e" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {hat === 'party-hat' && (
        <g id="hat-party-hat">
          <polygon points="48,-24 30,13 66,13" fill="#facc15" stroke="#000" strokeWidth="3" />
          <circle cx="48" cy="-24" r="5" fill="#ec4899" stroke="#000" strokeWidth="2" />
          <polygon points="48,-14 36,4 42,4" fill="#3b82f6" />
          <polygon points="48,-4 42,12 54,12" fill="#ef4444" />
        </g>
      )}

      {hat === 'mini-crewmate' && (
        <g id="hat-mini-crewmate" transform="translate(34, -20) scale(0.35)">
          <rect x="2" y="30" width="25" height="50" rx="8" fill={color} stroke="#000" strokeWidth="7" />
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill={color}
            stroke="#000"
            strokeWidth="7"
          />
          <path
            d="M30,30 h45 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-45 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#9cdbfa"
            stroke="#000"
            strokeWidth="7"
          />
        </g>
      )}

      {hat === 'viking' && (
        <g id="hat-viking">
          <path d="M26,14 Q48,4 70,14 Q68,-2 48,-2 Q28,-2 26,14 Z" fill="#71717a" stroke="#000" strokeWidth="3" />
          <path d="M28,8 Q15,4 16,-14 Q22,-4 31,4 Z" fill="#fef08a" stroke="#000" strokeWidth="2.5" />
          <path d="M68,8 Q81,4 80,-14 Q74,-4 65,4 Z" fill="#fef08a" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {hat === 'detective' && (
        <g id="hat-detective">
          <ellipse cx="48" cy="13" rx="28" ry="6" fill="#854d0e" stroke="#000" strokeWidth="3" />
          <path d="M30,12 Q48,0 66,12 L63,-4 Q48,-10 33,-4 Z" fill="#a16207" stroke="#000" strokeWidth="3" />
          <rect x="31" y="8" width="34" height="4" fill="#451a03" />
        </g>
      )}

      {hat === 'bandana' && (
        <g id="hat-bandana">
          <path d="M22,23 Q48,15 74,23 L73,29 Q48,22 23,29 Z" fill="#ef4444" stroke="#000" strokeWidth="3" />
          <circle cx="21" cy="27" r="4.5" fill="#dc2626" stroke="#000" strokeWidth="2" />
          <path d="M19,29 L11,41 L18,40 Z" fill="#ef4444" stroke="#000" strokeWidth="2" />
        </g>
      )}

      {/* --- MUFFLERS & ACCESSORIES LAYER --- */}
      {muffler === 'winter-scarf' && (
        <g id="muffler-winter-scarf">
          <path
            d="M26,58 Q48,66 70,58 Q73,69 68,73 Q48,79 26,71 Z"
            fill="#c51111"
            stroke="#000"
            strokeWidth="3.5"
          />
          <path d="M30,67 L22,96 L36,98 L38,72 Z" fill="#c51111" stroke="#000" strokeWidth="3.5" />
          <line x1="22" y1="96" x2="36" y2="98" stroke="#facc15" strokeWidth="3" />
        </g>
      )}

      {muffler === 'cyan-muffler' && (
        <g id="muffler-cyan-muffler">
          <path
            d="M26,58 Q48,66 70,58 Q73,69 68,73 Q48,79 26,71 Z"
            fill="#06b6d4"
            stroke="#000"
            strokeWidth="3.5"
          />
          <path d="M33,67 L25,96 L39,98 L41,72 Z" fill="#06b6d4" stroke="#000" strokeWidth="3.5" />
        </g>
      )}

      {muffler === 'gold-chain' && (
        <g id="muffler-gold-chain">
          <path d="M28,60 Q48,82 68,60" fill="none" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="48" cy="74" r="6.5" fill="#f59e0b" stroke="#000" strokeWidth="2" />
          <circle cx="48" cy="74" r="3" fill="#c51111" />
        </g>
      )}

      {muffler === 'bowtie' && (
        <g id="muffler-bowtie">
          <polygon points="48,66 34,58 34,74" fill="#c51111" stroke="#000" strokeWidth="2.5" />
          <polygon points="48,66 62,58 62,74" fill="#c51111" stroke="#000" strokeWidth="2.5" />
          <circle cx="48" cy="66" r="4" fill="#18181b" stroke="#000" strokeWidth="2" />
        </g>
      )}

      {muffler === 'necktie' && (
        <g id="muffler-necktie">
          <polygon points="45,60 51,60 50,66 46,66" fill="#2563eb" stroke="#000" strokeWidth="2" />
          <polygon points="46,66 50,66 53,92 48,99 43,92" fill="#2563eb" stroke="#000" strokeWidth="2.5" />
        </g>
      )}

      {muffler === 'stethoscope' && (
        <g id="muffler-stethoscope">
          <path d="M32,58 Q48,78 64,58" fill="none" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M48,70 Q55,83 51,92" fill="none" stroke="#64748b" strokeWidth="3.5" />
          <circle cx="51" cy="94" r="5.5" fill="#e2e8f0" stroke="#000" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};
