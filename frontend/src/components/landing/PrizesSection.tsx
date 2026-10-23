import React from 'react';

export const PrizesSection: React.FC = () => {
  return (
    <section id="prizes" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display text-5xl md:text-6xl text-center mb-16 text-white"
          style={{ textShadow: '4px 4px 0 #000' }}
        >
          BOUNTY <span className="text-crew-yellow">REWARDS</span>
        </h2>
        <p className="text-center font-display text-2xl text-crew-lime mb-16" style={{ textShadow: '2px 2px 0 #000' }}>
          Total Prize Pool: ₹25,000
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {/* 2nd Place */}
          <div className="au-card bg-gray-800 rounded-t-3xl p-6 text-center order-2 md:order-1 relative pb-12">
            <div className="absolute top-0 left-0 w-full h-2 bg-gray-400 rounded-t-3xl" />
            <div className="w-20 h-20 mx-auto bg-gray-400 au-border rounded-full flex items-center justify-center mb-4 -mt-12">
              <span className="text-3xl">🥈</span>
            </div>
            <h3 className="font-display text-2xl text-gray-300 mb-2">2nd Place</h3>
            <p className="text-3xl font-display text-white mb-4">Cash Prize + Trophy</p>
            <ul className="text-gray-400 font-bold space-y-2 mb-6 text-sm">
              <li>+ Runner-Up Certificates</li>
              <li>+ Tech Goodies &amp; Stickers</li>
            </ul>
          </div>

          {/* 1st Place */}
          <div className="au-card bg-crew-yellow text-black rounded-t-3xl p-8 text-center order-1 md:order-2 relative z-10 transform md:scale-110 pb-16">
            <div className="absolute top-0 left-0 w-full h-2 bg-white rounded-t-3xl" />
            <div className="w-24 h-24 mx-auto bg-white au-border rounded-full flex items-center justify-center mb-4 -mt-14 shadow-lg">
              <span className="text-5xl">👑</span>
            </div>
            <h3 className="font-display text-3xl text-black mb-2">Grand Champion</h3>
            <p className="text-5xl font-display text-black mb-6 drop-shadow-md">₹₹₹ + Trophy</p>
            <ul className="text-gray-800 font-bold space-y-2 mb-6 text-base">
              <li>+ Winner Mementos &amp; Certificates</li>
              <li>+ Exclusive AmongU Winner Swag</li>
              <li>+ Direct Club Project Fast-Track</li>
            </ul>
          </div>

          {/* 3rd Place */}
          <div className="au-card bg-gray-800 rounded-t-3xl p-6 text-center order-3 md:order-3 relative pb-12">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-700 rounded-t-3xl" />
            <div className="w-20 h-20 mx-auto bg-amber-700 au-border rounded-full flex items-center justify-center mb-4 -mt-12">
              <span className="text-3xl">🥉</span>
            </div>
            <h3 className="font-display text-2xl text-amber-600 mb-2">3rd Place</h3>
            <p className="text-3xl font-display text-white mb-4">Cash Prize + Medals</p>
            <ul className="text-gray-400 font-bold space-y-2 mb-6 text-sm">
              <li>+ Merit Certificates</li>
              <li>+ Club Goodies</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
