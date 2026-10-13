import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t-4 border-gray-800 pt-12 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <div className="font-display text-2xl text-white tracking-wider flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-crew-red">AMONG</span>U
          </div>
          <p className="text-gray-500 font-bold text-sm">© 2026 AmongU College Club Event. All tasks verified.</p>
        </div>

        <div className="flex items-center space-x-6">
          <Link
            href="/admin"
            className="text-xs text-gray-500 hover:text-crew-cyan font-bold transition-colors underline"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};
