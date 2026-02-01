'use client';

import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  compact?: boolean;
}

export default function AudioPlayer({ src, title, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = Number(e.target.value);
    audio.volume = vol;
    setVolume(vol);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`glass rounded-xl ${compact ? 'p-2' : 'p-4'}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`
            relative flex-shrink-0 flex items-center justify-center
            rounded-full transition-all duration-200
            ${isPlaying
              ? 'bg-gradient-to-r from-primary to-pink-500 animate-pulse-glow'
              : 'bg-gradient-to-r from-primary to-pink-500 hover:shadow-glow-primary'
            }
            ${compact ? 'w-10 h-10' : 'w-12 h-12'}
            hover:scale-105 active:scale-95
          `}
        >
          {isPlaying ? (
            <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white ml-0.5`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Section */}
        <div className="flex-1 min-w-0">
          {title && !compact && (
            <p className="text-sm font-medium text-white truncate mb-2">
              {title}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-10 font-mono">
              {formatTime(currentTime)}
            </span>

            {/* Custom Progress Bar */}
            <div className="flex-1 relative h-2 group">
              <div className="absolute inset-0 bg-surface-elevated rounded-full overflow-hidden">
                {/* Progress fill */}
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Range input overlay */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />

              {/* Thumb indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-glow-primary
                         opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            <span className="text-xs text-slate-400 w-10 text-right font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        {!compact && (
          <div className="relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {volume === 0 ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {showVolume && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 glass rounded-xl animate-fade-in">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1"
                  style={{ writingMode: 'horizontal-tb' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Waveform visualization when playing */}
      {isPlaying && !compact && (
        <div className="flex items-end justify-center gap-1 h-8 mt-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="waveform-bar w-1"
              style={{
                height: `${Math.random() * 100}%`,
                minHeight: '20%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
