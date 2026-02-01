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
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            Pronto
          </span>
        );
      case 'streaming':
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full animate-pulse">
            Processando...
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full animate-pulse">
            Gerando...
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
            Erro
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {music.imageUrl ? (
          <Image
            src={music.imageUrl}
            alt={music.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎵
          </div>
        )}
        <div className="absolute top-2 right-2">{getStatusBadge()}</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate" title={music.title}>
          {music.title}
        </h3>

        {music.tags && (
          <p className="text-xs text-gray-500 mt-1 truncate" title={music.tags}>
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
              className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
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
              className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Ver letra
            </summary>
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {music.lyrics}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
