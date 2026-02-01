'use client';

import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    next,
    previous,
    setVolume,
    seek,
  } = usePlayer();

  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Extract BPM from tags if available
  const bpm = currentSong?.tags?.match(/(\d+)\s*bpm/i)?.[1] || '120';

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
      <div className="glass-liquid rounded-3xl p-4 shadow-2xl shadow-black/50 border border-white/10">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
              {currentSong.imageUrl ? (
                <Image
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/50 to-pink-500/50 flex items-center justify-center">
                  <Disc className="w-6 h-6 text-white/70" />
                </div>
              )}
            </div>
            {isPlaying && (
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-pink-500 to-accent opacity-30 blur-md -z-10 animate-pulse" />
            )}
          </div>

          {/* Song info & progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-white truncate">{currentSong.title}</h4>
              <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-mono text-cyan-400 bg-cyan-500/20 rounded-full">
                {bpm} BPM
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono w-8">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seek(percent * duration);
                }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-pink-500 to-accent transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono w-8 text-right">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={previous}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={next}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div
              className="relative ml-2"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {showVolume && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 glass-liquid rounded-2xl">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6D28D9 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
