'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ShhhIntroAnimationProps {
  onComplete?: () => void;
}

export default function ShhhIntroAnimation({ onComplete }: ShhhIntroAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasFinishedRef = useRef(false);

  const completeIntro = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 600);
  }, [onComplete]);

  // Only show once when the page loads for the first time
  useEffect(() => {
    try {
      const alreadySeen =
        sessionStorage.getItem('amongu_intro_seen') ||
        localStorage.getItem('amongu_intro_seen');
      if (alreadySeen) {
        onComplete?.();
        return;
      }
    } catch {
      // ignore storage errors
    }

    // First time viewing: activate splash screen and set flag
    setIsVisible(true);
    try {
      sessionStorage.setItem('amongu_intro_seen', 'true');
      localStorage.setItem('amongu_intro_seen', 'true');
    } catch {
      // ignore
    }
  }, [onComplete]);

  useEffect(() => {
    if (!isVisible) return;

    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    // 1. Force muted on video element so browser never pauses the visual playback
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    // Start video playback
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });

    // 2. Play shhh.mp3 by default on load
    const playAudio = () => {
      if (!audio) return;
      audio.muted = false;
      audio.volume = 1.0;
      if (video && video.currentTime > 0) {
        audio.currentTime = video.currentTime;
      }
      audio.play().catch(() => {});
    };

    // Trigger audio immediately
    playAudio();

    // 3. Fallback: If browser autoplay policy delays audio on initial paint,
    // trigger audio immediately on ANY subtle interaction
    const unlockAudio = () => {
      playAudio();
    };

    const interactionEvents = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel', 'click', 'focus'];
    interactionEvents.forEach((evt) => window.addEventListener(evt, unlockAudio, { once: true, passive: true }));

    // 4. Safety timer so intro never hangs (video is 3.3s, timer 4.2s)
    const safetyTimer = setTimeout(() => {
      completeIntro();
    }, 4200);

    return () => {
      clearTimeout(safetyTimer);
      interactionEvents.forEach((evt) => window.removeEventListener(evt, unlockAudio));
    };
  }, [isVisible, completeIntro]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Container (Skip button removed per user specification) */}
      <div className="relative w-full h-full max-w-5xl max-h-screen flex items-center justify-center p-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={completeIntro}
          onCanPlay={(e) => {
            const v = e.currentTarget;
            if (v.paused) v.play().catch(() => {});
          }}
          className="w-full h-full max-h-[85vh] object-contain drop-shadow-2xl pointer-events-none"
        >
          <source src="/videos/among-us-shhh.mp4" type="video/mp4" />
          <source src="/videos/The%20among%20us%20shhhh!%20animation%20clip.mp4" type="video/mp4" />
          <source src="/videos/the-among-us-shhhh-animation-clip.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Synchronized Auxiliary Audio element */}
      <audio
        ref={audioRef}
        src="/audio/shhh.mp3"
        autoPlay
        preload="auto"
        onEnded={completeIntro}
      />
    </div>
  );
}
