import React from 'react';

export const TimelineSection: React.FC = () => {
  return (
    <section id="schedule" className="py-20 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display text-5xl md:text-6xl text-center mb-16 text-white"
          style={{ textShadow: '4px 4px 0 #000' }}
        >
          MISSION <span className="text-crew-cyan">TIMELINE</span>
        </h2>

        <div className="relative">
          {/* Vertical Task Progress Bar */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-4 bg-gray-800 au-border rounded-full">
            <div className="w-full bg-crew-lime h-1/2 rounded-t-full relative">
              <div className="absolute inset-0 bg-crew-lime blur-sm opacity-50" />
            </div>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-lime au-border rounded-full z-10 shadow-[0_0_15px_#50ef39]" />
              <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl">
                <span className="text-crew-lime font-bold mb-1 block">Phase 1</span>
                <h3 className="font-display text-2xl text-white mb-2">Registration &amp; Verification</h3>
                <p className="text-gray-400 font-bold">
                  Login with your KIET Google ID, verify details, and complete the ₹55 registration.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-lime au-border rounded-full z-10 shadow-[0_0_15px_#50ef39]" />
              <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl">
                <span className="text-crew-lime font-bold mb-1 block">Phase 2</span>
                <h3 className="font-display text-2xl text-white mb-2">Opening Briefing</h3>
                <p className="text-gray-400 font-bold">
                  Emergency meeting in the Auditorium. Tracks, guidelines, and rules released.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-yellow au-border rounded-full z-10" />
              <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl">
                <span className="text-crew-yellow font-bold mb-1 block">Phase 3</span>
                <h3 className="font-display text-2xl text-white mb-2">Building &amp; Sabotage Round</h3>
                <p className="text-gray-400 font-bold">
                  Code through the night. Mentors on duty and surprise challenges incoming.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-crew-red au-border rounded-full z-10" />
              <div className="ml-20 md:ml-0 md:w-5/12 au-card bg-gray-900 p-6 rounded-2xl border-crew-red">
                <span className="text-crew-red font-bold mb-1 block">Phase 4</span>
                <h3 className="font-display text-2xl text-white mb-2">Emergency Meeting &amp; Results</h3>
                <p className="text-gray-400 font-bold">
                  Final presentations before the judges. Survivors and champions crowned!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
