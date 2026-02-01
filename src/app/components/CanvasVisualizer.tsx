'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export default function CanvasVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const { isPlaying, audioRef, currentSong } = usePlayer();

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const numParticles = 70;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 180, // Cyan to blue range
      });
    }

    particlesRef.current = particles;
  }, []);

  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, beatPulse: number) => {
    if (!isPlaying) return;

    const waveHeight = height * 0.15;
    const centerY = height * 0.5;
    const numBars = 64;
    const barWidth = width / numBars;
    const gap = 2;

    ctx.save();
    ctx.globalAlpha = 0.3;

    for (let i = 0; i < numBars; i++) {
      const randomHeight = Math.random() * waveHeight * (0.3 + beatPulse * 0.7);
      const barHeight = randomHeight * (Math.sin(Date.now() / 200 + i * 0.2) * 0.5 + 0.5);

      const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
      gradient.addColorStop(0.5, 'rgba(109, 40, 217, 0.6)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.4)');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        i * barWidth + gap / 2,
        centerY - barHeight / 2,
        barWidth - gap,
        barHeight
      );
    }

    ctx.restore();
  }, [isPlaying]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with trail effect
    ctx.fillStyle = 'rgba(3, 3, 8, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Beat pulse effect
    const beatPulse = isPlaying
      ? Math.abs(Math.sin(Date.now() / 100)) * 0.5 + 0.5
      : 0.3;

    // Draw waveform in background
    drawWaveform(ctx, width, height, beatPulse);

    // Update and draw particles
    const particles = particlesRef.current;
    const particleColor = isPlaying ? '34, 211, 238' : '100, 100, 120'; // Cyan when playing, gray when stopped

    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx * (1 + beatPulse * 0.5);
      particle.y += particle.vy * (1 + beatPulse * 0.5);

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Add some random movement when playing
      if (isPlaying) {
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;
        particle.vx = Math.max(-1, Math.min(1, particle.vx));
        particle.vy = Math.max(-1, Math.min(1, particle.vy));
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (1 + beatPulse * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity * (0.7 + beatPulse * 0.3)})`;
      ctx.fill();

      // Draw glow
      if (isPlaying) {
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, `rgba(${particleColor}, ${particle.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });

    // Draw connections between nearby particles
    ctx.strokeStyle = `rgba(${particleColor}, 0.1)`;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.globalAlpha = (1 - distance / 100) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, drawWaveform]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initParticles]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, #030308, #0a0a0f, #030308)' }}
    />
  );
}
