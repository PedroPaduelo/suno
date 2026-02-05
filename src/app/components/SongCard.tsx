'use client';

import { memo, useCallback } from 'react';
import { Play, Pause, Download, Trash2, Heart, Youtube, ListPlus } from 'lucide-react';
import Image from 'next/image';
import { usePlayer, Song } from '../context/PlayerContext';

interface SongCardProps {
  song: Song;
  onDelete?: (id: string) => void;
  onAddToPlaylist?: (songId: string) => void;
}

const SongCard = memo(function SongCard({ song, onDelete, onAddToPlaylist }: SongCardProps) {
  const { currentSong, isPlaying, playSong, toggleLike } = usePlayer();

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrentSong && isPlaying;
  const isYouTube = song.source === 'youtube';
  const isReady = song.status === 'complete' && (song.audioUrl || isYouTube);

  const handlePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (song.status === 'complete' && (song.audioUrl || song.source === 'youtube')) {
      playSong(song);
    }
  }, [playSong, song]);

  const handleDownload = useCallback(() => {
    if (song.audioUrl) {
      const link = document.createElement('a');
      link.href = song.audioUrl;
      link.download = `${song.title}.mp3`;
      link.click();
    }
  }, [song.audioUrl, song.title]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(song.id);
  }, [toggleLike, song.id]);

  const handleDelete = useCallback(() => {
    onDelete?.(song.id);
  }, [onDelete, song.id]);

  const handleAddToPlaylist = useCallback(() => {
    onAddToPlaylist?.(song.id);
  }, [onAddToPlaylist, song.id]);

  const getStatusBadge = () => {
    switch (song.status) {
      case 'complete':
        return null;
      case 'streaming':
        return (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] font-medium bg-cyan-500/20 text-cyan-400 rounded-full backdrop-blur-sm animate-pulse">
            Processing...
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded-full backdrop-blur-sm animate-pulse">
            Generating...
          </span>
        );
      case 'error':
        return (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-full backdrop-blur-sm">
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl sm:rounded-3xl
        bg-black/40 backdrop-blur-2xl border transition-all duration-300
        ${isCurrentSong ? 'border-primary/50 shadow-lg shadow-primary/20' : 'border-white/5 hover:border-white/10'}
      `}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {song.imageUrl ? (
          <Image
            src={song.imageUrl}
            alt={song.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isCurrentPlaying ? 'animate-pulse' : ''}`}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-surface to-pink-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Status badge */}
        {getStatusBadge()}

        {/* Source badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1">
          {isYouTube ? (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-medium bg-red-500/20 text-red-400 rounded-full backdrop-blur-sm flex items-center gap-0.5 sm:gap-1">
              <Youtube className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">YouTube</span>
            </span>
          ) : (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-medium bg-purple-500/20 text-purple-400 rounded-full backdrop-blur-sm">
              Suno
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-200 z-10 ${
            song.isLiked
              ? 'bg-pink-500/20 text-pink-400'
              : 'bg-black/20 text-white/60 hover:text-pink-400 hover:bg-pink-500/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${song.isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Play button overlay */}
        {isReady && (
          <button
            onClick={handlePlay}
            className={`
              absolute inset-0 flex items-center justify-center
              transition-opacity duration-300
              ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
          >
            <div className={`
              w-14 h-14 rounded-full flex items-center justify-center
              transition-all duration-300 hover:scale-110
              ${isCurrentPlaying
                ? 'bg-white text-black'
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-black'
              }
            `}>
              {isCurrentPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </div>
          </button>
        )}

        {/* Now playing indicator */}
        {isCurrentPlaying && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full waveform-bar"
                style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4">
        <h3 className="text-xs sm:text-sm font-medium text-white truncate mb-1" title={song.title}>
          {song.title}
        </h3>

        {/* Tags - hidden on very small screens */}
        {song.tags && (
          <div className="hidden sm:flex flex-wrap gap-1 mb-3">
            {song.tags.split(',').slice(0, 2).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] text-slate-400 bg-white/5 rounded-full">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {isReady && (
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
            {!isYouTube && (
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl
                         text-[10px] sm:text-xs font-medium text-white bg-white/10 hover:bg-white/20
                         transition-colors"
              >
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {onAddToPlaylist && (
              <button
                onClick={handleAddToPlaylist}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10
                         transition-colors"
                title="Add to playlist"
              >
                <ListPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10
                         transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default SongCard;
