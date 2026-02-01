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
          <span className="px-2 py-0.5 text-xs bg-green-900/80 text-green-300 rounded-full border border-green-700">
            Pronto
          </span>
        );
      case 'streaming':
        return (
          <span className="px-2 py-0.5 text-xs bg-blue-900/80 text-blue-300 rounded-full animate-pulse border border-blue-700">
            Processando
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="px-2 py-0.5 text-xs bg-yellow-900/80 text-yellow-300 rounded-full animate-pulse border border-yellow-700">
            Gerando
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 text-xs bg-red-900/80 text-red-300 rounded-full border border-red-700">
            Erro
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700">
            {music.status}
          </span>
        );
    }
  };

  const isReady = music.status === 'complete' && music.audioUrl;

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-3 hover:border-purple-500/50 hover:bg-gray-800/70 transition-all group">
      {music.audioUrl && <audio ref={audioRef} src={music.audioUrl} preload="metadata" />}

      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
          {music.imageUrl ? (
            <Image
              src={music.imageUrl}
              alt={music.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50">
              🎵
            </div>
          )}
        </div>

        {/* Play Button */}
        {isReady ? (
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full transition-all shadow-lg shadow-purple-500/30"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        ) : (
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-700 text-gray-400 rounded-full">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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
              <span className="text-xs text-gray-400 w-8 flex-shrink-0">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-500 truncate">
              {music.tags || 'Aguardando processamento...'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isReady && (
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(music.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Excluir"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
