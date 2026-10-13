'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParticipantsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="py-20 text-center">
      <p className="font-display text-xl text-crew-cyan animate-pulse">
        REDIRECTING TO CANDIDATE MONITORING CONSOLE...
      </p>
    </div>
  );
}
