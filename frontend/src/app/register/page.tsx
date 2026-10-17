'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirectGate() {
  const router = useRouter();

  useEffect(() => {
    // Block direct unauthenticated access to /register and bounce to home deck
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-center p-4">
      <div className="bg-gray-900 border-2 border-crew-red p-8 rounded-3xl max-w-md shadow-2xl">
        <div className="text-4xl mb-4">🚨</div>
        <h1 className="font-display text-2xl text-white mb-2">ACCESS RESTRICTED</h1>
        <p className="text-gray-400 text-sm mb-4">
          Direct access to registration is disabled. Redirecting to official Command Deck...
        </p>
        <div className="w-8 h-8 border-2 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
