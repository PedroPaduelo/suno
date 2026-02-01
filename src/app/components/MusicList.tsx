'use client';

import { useState, useEffect, useCallback } from 'react';
import MusicCard, { MusicItem } from './MusicCard';
import MusicListItem from './MusicListItem';

interface MusicListProps {
  refreshTrigger?: number;
}

type ViewMode = 'cards' | 'list';

export default function MusicList({ refreshTrigger }: MusicListProps) {
  const [music, setMusic] = useState<MusicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const fetchMusic = useCallback(async (refresh = false) => {
    try {
      const url = refresh ? '/api/music?refresh=true' : '/api/music';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMusic(data);
      }
    } catch (error) {
      console.error('Failed to fetch music:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMusic(true);
  }, [fetchMusic]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchMusic(true);
    }
  }, [refreshTrigger, fetchMusic]);

  useEffect(() => {
    const hasPending = music.some(
      (m) => m.status !== 'complete' && m.status !== 'error'
    );
    if (hasPending) {
      const interval = setInterval(() => fetchMusic(true), 10000);
      return () => clearInterval(interval);
    }
  }, [music, fetchMusic]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMusic(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta musica?')) return;

    try {
      const response = await fetch(`/api/music?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMusic((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete music:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          <p className="mt-4 text-gray-400">Carregando musicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900/50 px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <span>🎶</span>
          Minhas Musicas
          {music.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({music.length})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'cards'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Visualizar em Cards"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Visualizar em Lista"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 border border-gray-700"
          >
            {isRefreshing ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {music.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🎧</div>
              <h3 className="text-lg font-medium mb-2 text-white">Nenhuma musica ainda</h3>
              <p className="text-sm text-gray-500">
                Converse com o assistente para criar suas primeiras musicas!
              </p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {music.map((item) => (
              <MusicCard
                key={item.id}
                music={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {music.map((item) => (
              <MusicListItem
                key={item.id}
                music={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
