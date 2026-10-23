'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onOpenRegister: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegister, userEmail, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 top-0 transition-all duration-300 ${
        isScrolled ? 'bg-space/90 backdrop-blur-md border-b-4 border-black' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="font-display text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2">
              <svg width="30" height="30" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
                  fill="#c51111"
                  stroke="#000"
                  strokeWidth="6"
                />
                <path
                  d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
                  fill="#9cdbfa"
                  stroke="#000"
                  strokeWidth="6"
                />
              </svg>
              <span
                className="text-crew-red font-black glitch-hover"
                style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #fff' }}
              >
                AMONG
              </span>
              U
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#about" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-lg">
                About
              </a>
              <a href="#tracks" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-lg">
                Tasks
              </a>
              <a href="#schedule" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-lg">
                Timeline
              </a>
              <a href="#prizes" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-lg">
                Prizes
              </a>
              <Link href="/sponsors" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-lg">
                Sponsors
              </Link>
              <a href="#faq" className="hover:text-crew-cyan hover:-translate-y-1 transition-transform font-bold text-lg">
                FAQ
              </a>

              {userEmail ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-crew-cyan font-bold bg-black/60 px-3 py-1 rounded-full border border-gray-700">
                    {userEmail}
                  </span>
                  <button
                    onClick={onLogout}
                    className="text-xs text-gray-400 hover:text-crew-red font-bold underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenRegister}
                  className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-sm py-2 px-5 rounded-full"
                >
                  REGISTER / LOGIN
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-crew-cyan focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-space border-b-4 border-black">
          <div className="px-2 pt-2 pb-3 space-y-1 text-center">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
            >
              About
            </a>
            <a
              href="#tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
            >
              Tasks
            </a>
            <a
              href="#schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
            >
              Timeline
            </a>
            <a
              href="#prizes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
            >
              Prizes
            </a>
            <Link
              href="/sponsors"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
            >
              Sponsors
            </Link>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold hover:bg-gray-800 hover:text-crew-cyan"
            >
              FAQ
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
