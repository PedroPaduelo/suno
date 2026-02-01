'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Disc } from 'lucide-react';
import Image from 'next/image';
import { Song } from '../context/PlayerContext';

interface DeckProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  label: string;
  color: 'cyan' | 'pink';
}

export default function Deck({
  song,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  label,
  color,
}: DeckProps) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>(0);

  // Vinyl rotation animation
  useEffect(() => {
    let lastTime = Date.now();

    const animate = () => {
      if (isPlaying) {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;
        setRotation((prev) => (prev + delta * 0.03) % 360);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const colorClasses = {
    cyan: {
      glow: 'from-cyan-500/30 to-blue-500/20',
      border: 'border-cyan-500/30',
      bg: 'from-cyan-500 to-blue-500',
      text: 'text-cyan-400',
      shadow: 'shadow-cyan-500/30',
    },
    pink: {
      glow: 'from-pink-500/30 to-purple-500/20',
      border: 'border-pink-500/30',
      bg: 'from-pink-500 to-purple-500',
      text: 'text-pink-400',
      shadow: 'shadow-pink-500/30',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="glass-liquid rounded-[3rem] p-6 flex flex-col items-center">
      {/* Deck Label */}
      <div className="flex items-center justify-between w-full mb-4">
        <span className={`text-sm font-bold ${colors.text}`}>{label}</span>
        <span className="text-xs text-slate-500 font-mono">
          {song?.tags?.match(/(\d+)\s*bpm/i)?.[1] || '120'} BPM
        </span>
      </div>

      {/* Vinyl */}
      <div className="relative mb-6">
        {/* Outer glow */}
        <div className={`absolute -inset-4 bg-gradient-radial ${colors.glow} rounded-full blur-xl opacity-50`} />

        {/* Turntable platter */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
          {/* Vinyl disc */}
          <div
            className="absolute inset-4 rounded-full bg-zinc-950 border border-white/5 overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Grooves */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-white/5"
                style={{
                  inset: `${i * 12 + 8}px`,
                }}
              />
            ))}

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10">
                {song?.imageUrl ? (
                  <Image
                    src={song.imageUrl}
                    alt={song.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                    <Disc className="w-8 h-8 text-white/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Highlight */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
          </div>

          {/* Center spindle */}
          <div className="absolute w-4 h-4 rounded-full bg-zinc-800 border border-white/20 z-10" />

          {/* Tonearm placeholder */}
          {isPlaying && (
            <div className="absolute -right-2 top-1/4 w-1 h-24 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-full transform rotate-12 origin-top" />
          )}
        </div>
      </div>

      {/* Song info */}
      <div className="w-full text-center mb-4">
        <h4 className="font-medium text-white truncate text-sm mb-1">
          {song?.title || 'No track loaded'}
        </h4>
        <p className="text-xs text-slate-500 truncate">
          {song?.tags?.split(',')[0]?.trim() || 'Load a track to start'}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div
          className="h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            onSeek(percent * duration);
          }}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colors.bg} transition-all duration-100`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSeek(0)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          disabled={!song}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          disabled={!song}
          className={`
            p-4 rounded-full transition-all duration-200
            ${song
              ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg ${colors.shadow} hover:scale-105`
              : 'bg-white/10 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        <div className="w-10" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
