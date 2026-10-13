import React from 'react';

interface FloatingCrewmateProps {
  color?: string;
  size?: number;
  className?: string;
  speed?: 'slow' | 'fast';
}

export const FloatingCrewmate: React.FC<FloatingCrewmateProps> = ({
  color = '#c51111',
  size = 120,
  className = '',
  speed = 'slow',
}) => {
  return (
    <div className={`${speed === 'slow' ? 'float-slow' : 'float-fast'} ${className}`}>
      <svg
        width={size}
        height={(size * 1.2).toFixed(0)}
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Backpack */}
        <rect x="2" y="30" width="25" height="50" rx="8" fill={color} stroke="#000" strokeWidth="5" />
        {/* Body */}
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
        {/* Visor Highlight */}
        <path
          d="M35,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
          fill="#ffffff"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
