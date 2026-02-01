'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { MusicItem } from './MusicCard';

interface MusicListItemProps {
  music: MusicItem;
  onDelete?: (id: string) => void;
}

export default function MusicListItem({ music, onDelete }: MusicListItemProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (music.audioUrl) {
      const link = document.createElement('a');
      link.href = music.audioUrl;
      link.download = `${music.title}.mp3`;
      link.click();
    }
  };

  const getStatusBadge = () => {
    switch (music.status) {
      case 'complete':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
            Ready
          </span>
        );
      case 'streaming':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full border border-accent/30 animate-pulse">
            Processing
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 animate-pulse">
            Generating
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-500/20 text-slate-400 rounded-full border border-slate-500/30">
            {music.status}
          </span>
        );
    }
  };

  const isReady = music.status === 'complete' && music.audioUrl;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass rounded-xl p-3 group hover:bg-white/5 hover:border-white/20 transition-all duration-200">
      {music.audioUrl && <audio ref={audioRef} src={music.audioUrl} preload="metadata" />}

      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {music.imageUrl ? (
            <Image
              src={music.imageUrl}
              alt={music.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-pink-500/30">
              <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
        </div>

        {/* Play Button */}
        {isReady ? (
          <button
            onClick={togglePlay}
            className={`
              w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full
              transition-all duration-200
              ${isPlaying
                ? 'bg-gradient-to-r from-primary to-pink-500 animate-pulse-glow'
                : 'bg-gradient-to-r from-primary to-pink-500 hover:shadow-glow-primary hover:scale-105'
              }
            `}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        ) : (
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-surface-elevated text-slate-500 rounded-full">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {/* Info & Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate text-sm" title={music.title}>
              {music.title}
            </h3>
            {getStatusBadge()}
          </div>

          {isReady ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-8 flex-shrink-0 font-mono">
                {formatTime(currentTime)}
              </span>

              {/* Progress bar */}
              <div className="flex-1 relative h-1.5 group/progress">
                <div className="absolute inset-0 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>

              <span className="text-xs text-slate-500 w-8 text-right flex-shrink-0 font-mono">
                {formatTime(duration)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 truncate">
              {music.tags || 'Processing...'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isReady && (
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-200"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(music.id)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all duration-200"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
