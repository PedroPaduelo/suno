'use client';

import { useState } from 'react';
import Image from 'next/image';
import AudioPlayer from './AudioPlayer';

export interface MusicItem {
  id: string;
  sunoId: string;
  title: string;
  lyrics?: string | null;
  tags?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  status: string;
  model?: string | null;
  createdAt: string;
}

interface MusicCardProps {
  music: MusicItem;
  onDelete?: (id: string) => void;
}

export default function MusicCard({ music, onDelete }: MusicCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const getStatusBadge = () => {
    switch (music.status) {
      case 'complete':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 backdrop-blur-sm">
            Ready
          </span>
        );
      case 'streaming':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full border border-accent/30 backdrop-blur-sm animate-pulse">
            Processing...
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 backdrop-blur-sm animate-pulse">
            Generating...
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30 backdrop-blur-sm">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-slate-500/20 text-slate-400 rounded-full border border-slate-500/30 backdrop-blur-sm">
            {music.status}
          </span>
        );
    }
  };

  const handleDownload = () => {
    if (music.audioUrl) {
      const link = document.createElement('a');
      link.href = music.audioUrl;
      link.download = `${music.title}.mp3`;
      link.click();
    }
  };

  return (
    <div
      className="glass-card-hover group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square -mx-6 -mt-6 mb-4 overflow-hidden">
        {music.imageUrl ? (
          <Image
            src={music.imageUrl}
            alt={music.title}
            fill
            className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 via-surface to-pink-500/30">
            <svg className="w-16 h-16 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>

        {/* Play overlay on hover */}
        {music.audioUrl && music.status === 'complete' && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-white truncate text-lg group-hover:text-gradient-primary transition-colors" title={music.title}>
          {music.title}
        </h3>

        {/* Tags */}
        {music.tags && (
          <div className="flex flex-wrap gap-1.5">
            {music.tags.split(',').slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-xs text-slate-400 bg-surface-elevated rounded-full">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Audio Player */}
        {music.audioUrl && music.status === 'complete' && (
          <div className="pt-2">
            <AudioPlayer src={music.audioUrl} compact />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {music.audioUrl && music.status === 'complete' && (
            <button
              onClick={handleDownload}
              className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(music.id)}
              className="p-2.5 rounded-xl text-slate-400 bg-surface-elevated border border-white/10
                       hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10
                       transition-all duration-200"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Lyrics preview */}
        {music.lyrics && (
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors"
            >
              <svg className={`w-3 h-3 transition-transform ${showLyrics ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showLyrics ? 'Hide lyrics' : 'View lyrics'}
            </button>

            {showLyrics && (
              <div className="mt-3 p-3 rounded-xl bg-surface-elevated/50 max-h-40 overflow-y-auto animate-fade-in">
                <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {music.lyrics}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
