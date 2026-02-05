'use client';

import { memo, useCallback, useMemo } from 'react';
import { Play, Pause, Download, Trash2, Heart, Youtube, ListPlus } from 'lucide-react';
import Image from 'next/image';
import { usePlayer, Song } from '../context/PlayerContext';

interface SongListItemProps {
  song: Song;
  onDelete?: (id: string) => void;
  onAddToPlaylist?: (songId: string) => void;
}

const SongListItem = memo(function SongListItem({ song, onDelete, onAddToPlaylist }: SongListItemProps) {
  const { currentSong, isPlaying, playSong, currentTime, duration, toggleLike } = usePlayer();

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrentSong && isPlaying;
  const isYouTube = song.source === 'youtube';
  const isReady = song.status === 'complete' && (song.audioUrl || isYouTube);

  const handlePlay = useCallback(() => {
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

  const formatTime = useCallback((time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const progress = isCurrentSong && duration > 0 ? (currentTime / duration) * 100 : 0;

  const getStatusBadge = () => {
    switch (song.status) {
      case 'complete':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
            Ready
          </span>
        );
      case 'streaming':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 animate-pulse">
            Processing
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 animate-pulse">
            Generating
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-500/20 text-slate-400 rounded-full border border-slate-500/30">
            {song.status}
          </span>
        );
    }
  };

  return (
    <div
      className={`
        group relative rounded-xl p-3 transition-all duration-200
        ${isCurrentSong
          ? 'bg-primary/10 border border-primary/30'
          : 'bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {song.imageUrl ? (
            <Image
              src={song.imageUrl}
              alt={song.title}
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

          {/* Now playing indicator overlay */}
          {isCurrentPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex items-center gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-white rounded-full waveform-bar"
                    style={{
                      height: `${6 + Math.random() * 6}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Play Button */}
        {isReady ? (
          <button
            onClick={handlePlay}
            className={`
              w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full
              transition-all duration-200
              ${isCurrentPlaying
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white hover:text-black hover:scale-105'
              }
            `}
          >
            {isCurrentPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
        ) : (
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-white/5 text-slate-500 rounded-full">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {/* Info & Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate text-sm" title={song.title}>
              {song.title}
            </h3>
            {/* Source badge */}
            {isYouTube ? (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-full flex items-center gap-0.5 flex-shrink-0">
                <Youtube className="w-2.5 h-2.5" />
                YT
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-400 rounded-full flex-shrink-0">
                Suno
              </span>
            )}
            {getStatusBadge()}
          </div>

          {isReady ? (
            <div className="flex items-center gap-2">
              {isCurrentSong && (
                <span className="text-[10px] text-slate-500 w-7 flex-shrink-0 font-mono">
                  {formatTime(currentTime)}
                </span>
              )}

              {/* Progress bar */}
              <div className="flex-1 relative h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isCurrentSong ? 'bg-gradient-to-r from-primary to-pink-500' : 'bg-white/20'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {isCurrentSong && (
                <span className="text-[10px] text-slate-500 w-7 text-right flex-shrink-0 font-mono">
                  {formatTime(duration)}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 truncate">
              {song.tags || 'Processing...'}
            </p>
          )}
        </div>

        {/* Tags (visible on wider screens) */}
        {song.tags && isReady && (
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            {song.tags.split(',').slice(0, 2).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] text-slate-400 bg-white/5 rounded-full">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Like button - always visible */}
          <button
            onClick={handleLike}
            className={`p-2 rounded-lg transition-all duration-200 ${
              song.isLiked
                ? 'text-pink-400 bg-pink-500/10'
                : 'text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 opacity-0 group-hover:opacity-100'
            }`}
            title={song.isLiked ? 'Remove from liked' : 'Add to liked'}
          >
            <Heart className={`w-4 h-4 ${song.isLiked ? 'fill-current' : ''}`} />
          </button>
          {isReady && !isYouTube && (
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {onAddToPlaylist && (
            <button
              onClick={handleAddToPlaylist}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Add to playlist"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default SongListItem;
