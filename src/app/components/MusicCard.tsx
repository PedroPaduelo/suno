'use client';

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
  const getStatusBadge = () => {
    switch (music.status) {
      case 'complete':
        return (
          <span className="px-2 py-1 text-xs bg-green-900/80 text-green-300 rounded-full border border-green-700">
            Pronto
          </span>
        );
      case 'streaming':
        return (
          <span className="px-2 py-1 text-xs bg-blue-900/80 text-blue-300 rounded-full animate-pulse border border-blue-700">
            Processando...
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="px-2 py-1 text-xs bg-yellow-900/80 text-yellow-300 rounded-full animate-pulse border border-yellow-700">
            Gerando...
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 text-xs bg-red-900/80 text-red-300 rounded-full border border-red-700">
            Erro
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700">
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
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
      {/* Image */}
      <div className="relative aspect-square bg-gray-900">
        {music.imageUrl ? (
          <Image
            src={music.imageUrl}
            alt={music.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-900/50 to-pink-900/50">
            🎵
          </div>
        )}
        <div className="absolute top-2 right-2">{getStatusBadge()}</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate" title={music.title}>
          {music.title}
        </h3>

        {music.tags && (
          <p className="text-xs text-gray-400 mt-1 truncate" title={music.tags}>
            {music.tags}
          </p>
        )}

        {/* Audio Player */}
        {music.audioUrl && music.status === 'complete' && (
          <div className="mt-3">
            <AudioPlayer src={music.audioUrl} />
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {music.audioUrl && music.status === 'complete' && (
            <button
              onClick={handleDownload}
              className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-1 shadow-lg shadow-purple-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(music.id)}
              className="px-3 py-2 text-sm bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800/50 transition-colors border border-red-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Lyrics preview */}
        {music.lyrics && (
          <details className="mt-3">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-purple-400 transition-colors">
              Ver letra
            </summary>
            <p className="mt-2 text-xs text-gray-500 whitespace-pre-wrap max-h-32 overflow-y-auto bg-gray-900/50 p-2 rounded-lg">
              {music.lyrics}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
