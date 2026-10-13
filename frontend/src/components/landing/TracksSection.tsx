import React from 'react';

export const TracksSection: React.FC = () => {
  return (
    <section id="tracks" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display text-5xl md:text-6xl text-center mb-16 text-white"
          style={{ textShadow: '4px 4px 0 #000' }}
        >
          AVAILABLE <span className="text-crew-lime">TASKS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Track 1 */}
          <div className="au-card bg-crew-purple rounded-2xl p-6 relative group overflow-hidden">
            <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
              <svg className="w-8 h-8 text-crew-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
              Electrical / AI
            </h3>
            <p className="text-gray-200 font-bold">
              Rewire the ship&apos;s intelligence. Build AI models, automation tools, or machine learning solutions.
            </p>
          </div>

          {/* Track 2 */}
          <div className="au-card bg-crew-orange rounded-2xl p-6 relative group overflow-hidden">
            <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
              <svg className="w-8 h-8 text-crew-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
              Navigation / Web3
            </h3>
            <p className="text-gray-200 font-bold">
              Chart a new course. Develop decentralized apps, smart contracts, or blockchain innovations.
            </p>
          </div>

          {/* Track 3 */}
          <div className="au-card bg-crew-red rounded-2xl p-6 relative group overflow-hidden">
            <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
              Security / Sabotage
            </h3>
            <p className="text-gray-200 font-bold">
              Protect the crew or exploit the system. Focus on cybersecurity, privacy, or ethical hacking.
            </p>
          </div>

          {/* Track 4 */}
          <div className="au-card bg-crew-blue rounded-2xl p-6 relative group overflow-hidden">
            <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center au-border mb-6">
              <svg className="w-8 h-8 text-crew-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
              Comms / Mobile
            </h3>
            <p className="text-gray-200 font-bold">
              Keep the crew connected. Build intuitive mobile apps, social platforms, or communication tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
