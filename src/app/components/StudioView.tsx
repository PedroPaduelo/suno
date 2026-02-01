'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Music2 } from 'lucide-react';
import Chat from './Chat';
import SongCard from './SongCard';
import GlassCard from './GlassCard';
import { usePlayer, Song } from '../context/PlayerContext';

interface StudioViewProps {
  refreshTrigger?: number;
}

export default function StudioView({ refreshTrigger }: StudioViewProps) {
  const { songs, setSongs } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMusic = useCallback(async (refresh = false) => {
    try {
      const url = refresh ? '/api/music?refresh=true' : '/api/music';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Failed to fetch music:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setSongs]);

  useEffect(() => {
    fetchMusic(true);
  }, [fetchMusic]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchMusic(true);
    }
  }, [refreshTrigger, fetchMusic]);

  useEffect(() => {
    const hasPending = songs.some(
      (m: Song) => m.status !== 'complete' && m.status !== 'error'
    );
    if (hasPending) {
      const interval = setInterval(() => fetchMusic(true), 10000);
      return () => clearInterval(interval);
    }
  }, [songs, fetchMusic]);

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
        setSongs(songs.filter((m: Song) => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete music:', error);
    }
  };

  return (
    <div className="w-full min-h-screen pt-24 pb-48 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Composer - Left Side */}
          <div className="lg:col-span-5 animate-fade-in-left">
            <GlassCard className="h-[calc(100vh-16rem)] flex flex-col" padding="none">
              <Chat onMusicGenerated={() => fetchMusic(true)} />
            </GlassCard>
          </div>

          {/* Library - Right Side */}
          <div className="lg:col-span-7 animate-fade-in-right">
            <GlassCard className="h-[calc(100vh-16rem)] flex flex-col" padding="none">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg" />
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-white flex items-center gap-2">
                        Library
                        {songs.length > 0 && (
                          <span className="text-sm font-normal text-slate-400">({songs.length})</span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-500">Your generated tracks</p>
                    </div>
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5
                             disabled:opacity-50 transition-all duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm text-slate-400">Loading...</p>
                    </div>
                  </div>
                ) : songs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-sm">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 rounded-full blur-2xl opacity-20" />
                        <div className="relative w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <Music2 className="w-10 h-10 text-slate-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No music yet</h3>
                      <p className="text-sm text-slate-500">
                        Chat with the AI to create your first track.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {songs.map((song: Song, index: number) => (
                      <div
                        key={song.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <SongCard song={song} onDelete={handleDelete} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
