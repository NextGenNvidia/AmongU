'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { AboutSection } from '../components/landing/AboutSection';
import { TracksSection } from '../components/landing/TracksSection';
import { TimelineSection } from '../components/landing/TimelineSection';
import { PrizesSection } from '../components/landing/PrizesSection';
import { FaqSection } from '../components/landing/FaqSection';
import { Footer } from '../components/landing/Footer';
import { EmergencyMeetingModal } from '../components/registration/EmergencyMeetingModal';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { profile, logout } = useAuth();

  return (
    <main className="min-h-screen bg-space text-white">
      <Navbar
        onOpenRegister={() => setModalOpen(true)}
        userEmail={profile?.email}
        onLogout={logout}
      />
      <Hero onJoinClick={() => setModalOpen(true)} feeINR={55} />
      <AboutSection />
      <TracksSection />
      <TimelineSection />
      <PrizesSection />
      <FaqSection />
      <Footer />

      <EmergencyMeetingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        feeINR={55}
      />
    </main>
  );
}
