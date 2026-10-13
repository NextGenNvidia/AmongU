'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinkleDir: number;
}

export const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette inspired by Among Us space starfield
    const starColors = ['#ffffff', '#ffffff', '#ffffff', '#38fedc', '#9cdbfa', '#f5f557', '#ed54ba'];

    // Generate ~150 stars with parallax depth
    const starCount = Math.floor(Math.min(180, Math.max(80, (width * height) / 9000)));
    const stars: Star[] = Array.from({ length: starCount }, () => {
      const depth = Math.random(); // 0 = far, 1 = close
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: depth > 0.85 ? Math.random() * 1.5 + 1.5 : depth > 0.5 ? Math.random() * 1 + 1 : Math.random() * 0.8 + 0.6,
        speed: depth > 0.85 ? Math.random() * 0.6 + 0.7 : depth > 0.5 ? Math.random() * 0.35 + 0.35 : Math.random() * 0.2 + 0.15,
        opacity: Math.random() * 0.6 + 0.3,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      };
    });

    // Shooting star state
    let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number; active: boolean } | null = null;
    let shootingStarTimer = 0;

    const spawnShootingStar = () => {
      shootingStar = {
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 80 + 60,
        speed: Math.random() * 10 + 12,
        opacity: 1,
        active: true,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Space background
      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw & Update stars (drifting leftward like in Among Us)
      for (const star of stars) {
        // Move star to the left
        star.x -= star.speed;
        // Minor vertical wobble
        star.y += star.speed * 0.08;

        // Wrap around boundaries
        if (star.x < -10) {
          star.x = width + 10;
          star.y = Math.random() * height;
        }
        if (star.y > height + 10) {
          star.y = -10;
          star.x = Math.random() * width;
        }

        // Twinkle oscillation
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 0.95) {
          star.opacity = 0.95;
          star.twinkleDir = -1;
        } else if (star.opacity < 0.25) {
          star.opacity = 0.25;
          star.twinkleDir = 1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.fill();

        // Soft glow for larger foreground stars
        if (star.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.opacity * 0.25;
          ctx.fill();
        }
      }

      // 3. Optional shooting star
      shootingStarTimer++;
      if (shootingStarTimer > 400 && Math.random() < 0.015 && (!shootingStar || !shootingStar.active)) {
        spawnShootingStar();
        shootingStarTimer = 0;
      }

      if (shootingStar && shootingStar.active) {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          shootingStar.x + shootingStar.length,
          shootingStar.y - shootingStar.length * 0.5
        );
        gradient.addColorStop(0, 'rgba(56, 254, 220, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + shootingStar.length, shootingStar.y - shootingStar.length * 0.5);
        ctx.stroke();

        shootingStar.x -= shootingStar.speed;
        shootingStar.y += shootingStar.speed * 0.5;
        shootingStar.opacity -= 0.02;

        if (shootingStar.opacity <= 0 || shootingStar.x < -100 || shootingStar.y > height + 100) {
          shootingStar.active = false;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* 1. Canvas Starfield with Moving Dots and Twinkles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Drifting Among Us Crewmates floating in space */}
      {/* Blue Crewmate Tumbling diagonally from top-left */}
      <div
        className="drift-crewmate pointer-events-none"
        style={{
          top: '12%',
          left: '-80px',
          animation: 'drift-across-1 32s linear infinite',
        }}
      >
        <svg width="65" height="80" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill="#132ed1"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="5" y="30" width="20" height="40" rx="10" fill="#132ed1" stroke="#000" strokeWidth="6" />
          <path
            d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#9cdbfa"
            stroke="#000"
            strokeWidth="6"
          />
          <path
            d="M40,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
            fill="#ffffff"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Green Crewmate Tumbling across lower space */}
      <div
        className="drift-crewmate pointer-events-none"
        style={{
          top: '65%',
          left: '-70px',
          animation: 'drift-across-2 26s linear infinite',
          animationDelay: '-12s',
        }}
      >
        <svg width="50" height="62" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill="#117f2d"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="5" y="30" width="20" height="40" rx="10" fill="#117f2d" stroke="#000" strokeWidth="6" />
          <path
            d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#9cdbfa"
            stroke="#000"
            strokeWidth="6"
          />
          <path
            d="M40,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
            fill="#ffffff"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Pink Crewmate Drifting slowly in upper right */}
      <div
        className="drift-crewmate pointer-events-none"
        style={{
          top: '35%',
          right: '-70px',
          animation: 'drift-across-3 38s linear infinite',
          animationDelay: '-6s',
        }}
      >
        <svg width="45" height="55" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill="#ed54ba"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="5" y="30" width="20" height="40" rx="10" fill="#ed54ba" stroke="#000" strokeWidth="6" />
          <path
            d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#9cdbfa"
            stroke="#000"
            strokeWidth="6"
          />
          <path
            d="M40,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
            fill="#ffffff"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Cyan Crewmate Ejected floating across bottom */}
      <div
        className="drift-crewmate pointer-events-none"
        style={{
          bottom: '10%',
          left: '-80px',
          animation: 'drift-across-4 42s linear infinite',
          animationDelay: '-18s',
        }}
      >
        <svg width="55" height="68" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <path
            d="M70,100 v10 a10,10 0 0,1 -20,0 v-10 h-10 v10 a10,10 0 0,1 -20,0 v-10 C10,95 10,70 10,60 v-20 C10,15 30,10 45,10 c15,0 35,5 35,30 v20 C80,70 80,95 70,100 Z"
            fill="#38fedc"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="5" y="30" width="20" height="40" rx="10" fill="#38fedc" stroke="#000" strokeWidth="6" />
          <path
            d="M35,30 h40 a15,15 0 0,1 15,15 v5 a15,15 0 0,1 -15,15 h-40 a15,15 0 0,1 -15,-15 v-5 a15,15 0 0,1 15,-15 Z"
            fill="#ffffff"
            stroke="#000"
            strokeWidth="6"
          />
          <path
            d="M40,38 h25 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-25 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z"
            fill="#9cdbfa"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
};
