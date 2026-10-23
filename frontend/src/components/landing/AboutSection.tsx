import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="au-card bg-gray-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Tablet UI Elements */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black rounded-full border-4 border-gray-600" />

          <div className="bg-gray-900 border-4 border-black rounded-2xl p-6 md:p-10 mt-6 mb-8 text-center md:text-left">
            <h2
              className="font-display text-4xl md:text-5xl text-crew-cyan mb-6"
              style={{ textShadow: '2px 2px 0 #000' }}
            >
              &gt; SYSTEM OVERVIEW
            </h2>
            <p className="text-lg md:text-2xl mb-6 font-bold text-gray-300 leading-relaxed">
              Welcome to the Skeld, developers. We&apos;re on a critical mission to build the future, but{' '}
              <span className="text-crew-red">imposters (bugs)</span> are sabotaging our systems.
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-6 leading-relaxed">
              Complete your coding tasks, fix the sabotages, and present your project before the final emergency
              meeting. Whether you&apos;re a seasoned engineer or a sus beginner, there&apos;s a task for you.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
              <div className="bg-black/50 rounded-xl p-4 au-border flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <p className="text-sm text-gray-400 font-bold uppercase">Eligibility</p>
                  <p className="text-xl font-display text-white">All Years (1st - 4th)</p>
                </div>
              </div>
              <div className="bg-black/50 rounded-xl p-4 au-border flex items-center gap-3">
                <span className="text-3xl">⏳</span>
                <div>
                  <p className="text-sm text-gray-400 font-bold uppercase">Duration</p>
                  <p className="text-xl font-display text-white">9:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="bg-black/50 rounded-xl p-4 au-border flex items-center gap-3">
                <span className="text-3xl">🎟️</span>
                <div>
                  <p className="text-sm text-gray-400 font-bold uppercase">Entry Fee</p>
                  <p className="text-xl font-display text-crew-lime">₹55 Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
