'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
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

// Constants moved outside component to avoid recreation
const PARTICLE_COUNT_PLAYING = 50; // Reduced from 70
const PARTICLE_COUNT_IDLE = 25;    // Even fewer when not playing
const CONNECTION_DISTANCE = 80;    // Reduced from 100
const MAX_CONNECTIONS = 3;         // Limit connections per particle

export default function CanvasVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const { isPlaying } = usePlayer();

  const initParticles = useCallback((width: number, height: number, count: number) => {
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 180,
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

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Throttle: 30fps when idle, 60fps when playing
    const targetFPS = isPlaying ? 60 : 30;
    const frameInterval = 1000 / targetFPS;

    if (timestamp - lastFrameTime.current < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime.current = timestamp;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with trail effect
    ctx.fillStyle = 'rgba(3, 3, 8, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Beat pulse effect
    const beatPulse = isPlaying
      ? Math.abs(Math.sin(timestamp / 100)) * 0.5 + 0.5
      : 0.3;

    // Draw waveform only when playing
    if (isPlaying) {
      drawWaveform(ctx, width, height, beatPulse);
    }

    // Update and draw particles
    const particles = particlesRef.current;
    const particleColor = isPlaying ? '34, 211, 238' : '100, 100, 120';

    // Batch particle drawing
    ctx.fillStyle = `rgba(${particleColor}, 0.5)`;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Update position
      particle.x += particle.vx * (1 + beatPulse * 0.5);
      particle.y += particle.vy * (1 + beatPulse * 0.5);

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Random movement only for some particles when playing
      if (isPlaying && i % 3 === 0) {
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;
        particle.vx = Math.max(-1, Math.min(1, particle.vx));
        particle.vy = Math.max(-1, Math.min(1, particle.vy));
      }

      // Draw particle (simplified - no individual gradients)
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (1 + beatPulse * 0.3), 0, Math.PI * 2);
      ctx.globalAlpha = particle.opacity * (0.7 + beatPulse * 0.3);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Draw connections (optimized - limit per particle, avoid sqrt)
    if (particles.length > 1) {
      ctx.strokeStyle = `rgba(${particleColor}, 0.1)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      const distSqThreshold = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length && connections < MAX_CONNECTIONS; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;

          // Skip if too far on either axis
          if (Math.abs(dx) > CONNECTION_DISTANCE || Math.abs(dy) > CONNECTION_DISTANCE) continue;

          const distSq = dx * dx + dy * dy;
          if (distSq < distSqThreshold) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            connections++;
          }
        }
      }

      ctx.stroke();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, drawWaveform]);

  // Adjust particle count based on playing state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const count = isPlaying ? PARTICLE_COUNT_PLAYING : PARTICLE_COUNT_IDLE;
    initParticles(canvas.width, canvas.height, count);
  }, [isPlaying, initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = isPlaying ? PARTICLE_COUNT_PLAYING : PARTICLE_COUNT_IDLE;
      initParticles(canvas.width, canvas.height, count);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initParticles, isPlaying]);

  useEffect(() => {
    const startAnimation = (timestamp: number) => animate(timestamp);
    animationRef.current = requestAnimationFrame(startAnimation);

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
