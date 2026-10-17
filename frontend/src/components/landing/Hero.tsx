'use client';

import React from 'react';
import { FloatingCrewmate } from '../animations/FloatingCrewmate';

interface HeroProps {
  onJoinClick: () => void;
  feeINR?: number;
}

export const Hero: React.FC<HeroProps> = ({ onJoinClick, feeINR = 55 }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <div className="flex flex-col items-center justify-center">
          {/* Main Floating Red Crewmate */}
          <div className="mb-8">
            <FloatingCrewmate color="#c51111" size={150} speed="slow" />
          </div>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4 tracking-wide"
            style={{ textShadow: '4px 4px 0 #000, 8px 8px 0px rgba(0,0,0,0.5)' }}
          >
            <span className="text-crew-cyan">THERE IS 1</span>{' '}
            <span className="text-crew-red glitch-hover">HACKER</span> <br />
            AMONG US
          </h1>

          <p className="mt-4 text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto font-bold mb-8 bg-black/50 p-4 rounded-xl au-border">
            October 28, 2026 • Registration Fee: ₹{feeINR}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-6">
            <button
              onClick={onJoinClick}
              className="au-btn bg-crew-red hover:bg-red-500 text-white font-display text-2xl py-4 px-10 rounded-full flex items-center gap-3"
            >
              <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              JOIN THE LOBBY
            </button>
            <a
              href="#about"
              className="au-btn bg-crew-white text-black hover:bg-gray-200 font-display text-xl py-4 px-8 rounded-full"
            >
              VIEW TASKS
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
