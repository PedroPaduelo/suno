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
    if (!confirm('Are you sure you want to delete this track?')) return;

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
        <div className="text-center animate-fade-in">
          {/* Animated loader */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-pink-500/5 to-primary/10" />

        <div className="relative px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                My Music
                {music.length > 0 && (
                  <span className="text-sm font-normal text-slate-400">({music.length})</span>
                )}
              </h2>
              <p className="text-xs text-slate-500">Your generated tracks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex glass rounded-xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-primary text-white shadow-glow-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-glow-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl glass text-slate-400 hover:text-white hover:bg-white/5
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Refresh"
            >
              {isRefreshing ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {music.length === 0 ? (
          <div className="flex items-center justify-center h-full animate-fade-in">
            <div className="text-center max-w-sm">
              {/* Empty state illustration */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 rounded-full blur-2xl opacity-20" />
                <div className="relative w-24 h-24 rounded-full bg-surface-elevated flex items-center justify-center border border-white/10">
                  <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">No music yet</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Chat with the AI assistant to create your first track. Describe the style, mood, and vibe you want.
              </p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {music.map((item, index) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <MusicCard music={item} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {music.map((item, index) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
                <MusicListItem music={item} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
