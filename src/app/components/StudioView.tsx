'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { RefreshCw, Music2, LayoutGrid, List, Youtube, Plus, ListMusic, Sparkles, X } from 'lucide-react';
import SongCard from './SongCard';
import SongListItem from './SongListItem';
import GlassCard from './GlassCard';
import FilterBar from './FilterBar';
import { usePlayer, Song } from '../context/PlayerContext';

// Lazy load heavy components
const Chat = lazy(() => import('./Chat'));
const AddMusicModal = lazy(() => import('./AddMusicModal'));
const PlaylistSidebar = lazy(() => import('./PlaylistSidebar'));

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

interface StudioViewProps {
  refreshTrigger?: number;
}

export default function StudioView({ refreshTrigger }: StudioViewProps) {
  const { songs, setSongs, filteredSongs } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPlaylistSidebarOpen, setIsPlaylistSidebarOpen] = useState(false);
  const [selectedMusicForPlaylist, setSelectedMusicForPlaylist] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchMusic(true);
  }, [fetchMusic]);

  const handleDelete = useCallback(async (id: string) => {
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
  }, [setSongs, songs]);

  const handleAddToPlaylist = useCallback((songId: string) => {
    setSelectedMusicForPlaylist(songId);
    setIsPlaylistSidebarOpen(true);
  }, []);

  const handlePlaylistSidebarClose = useCallback(() => {
    setIsPlaylistSidebarOpen(false);
    setSelectedMusicForPlaylist(null);
  }, []);

  const handleMusicGenerated = useCallback(() => {
    fetchMusic(true);
    // Close chat modal on mobile after generating
    if (window.innerWidth < 1024) {
      setIsChatOpen(false);
    }
  }, [fetchMusic]);

  return (
    <>
      <div className="w-full min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-32 sm:pb-36 lg:pb-48 px-2 sm:px-4 lg:px-6 safe-area-inset">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
            {/* Library - Full width on mobile */}
            <div className="lg:col-span-7 lg:order-2">
              <GlassCard className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-16rem)] flex flex-col" padding="none">
                {/* Header */}
                <div className="px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-lg sm:rounded-xl blur-lg" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                          <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-1.5 sm:gap-2">
                          Library
                          {songs.length > 0 && (
                            <span className="text-xs sm:text-sm font-normal text-slate-400">({songs.length})</span>
                          )}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Your generated tracks</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {/* Playlists Button */}
                      <button
                        onClick={() => setIsPlaylistSidebarOpen(true)}
                        className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Manage playlists"
                      >
                        <ListMusic className="w-4 h-4" />
                      </button>

                      {/* Add YouTube Button */}
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Add YouTube music"
                      >
                        <Youtube className="w-4 h-4" />
                      </button>

                      {/* View Mode Toggle */}
                      <div className="flex items-center bg-white/5 rounded-lg p-0.5 ml-0.5 sm:ml-1">
                        <button
                          onClick={() => setViewMode('cards')}
                          className={`p-1.5 rounded-md transition-all duration-200 ${
                            viewMode === 'cards'
                              ? 'bg-white/10 text-white'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Grid view"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded-md transition-all duration-200 ${
                            viewMode === 'list'
                              ? 'bg-white/10 text-white'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="List view"
                        >
                          <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5
                                 disabled:opacity-50 transition-all duration-200"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 border-b border-white/5">
                  <FilterBar />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 scrollbar-hide">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4">
                          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400">Loading...</p>
                      </div>
                    </div>
                  ) : songs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-xs px-4">
                        <div className="relative inline-block mb-4 sm:mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 rounded-full blur-2xl opacity-20" />
                          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Music2 className="w-7 h-7 sm:w-10 sm:h-10 text-slate-600" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No music yet</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mb-4">
                          Create your first track with AI
                        </p>
                        <button
                          onClick={() => setIsChatOpen(true)}
                          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-sm font-medium"
                        >
                          <Sparkles className="w-4 h-4" />
                          Create Music
                        </button>
                      </div>
                    </div>
                  ) : filteredSongs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-sm">
                        <div className="relative inline-block mb-4">
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No matches</h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          No music matches the current filter.
                        </p>
                      </div>
                    </div>
                  ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                      {filteredSongs.map((song: Song, index: number) => (
                        <div
                          key={song.id}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                        >
                          <SongCard song={song} onDelete={handleDelete} onAddToPlaylist={handleAddToPlaylist} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      {filteredSongs.map((song: Song, index: number) => (
                        <div
                          key={song.id}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
                        >
                          <SongListItem song={song} onDelete={handleDelete} onAddToPlaylist={handleAddToPlaylist} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* AI Composer - Desktop only (hidden on mobile, shown as modal) */}
            <div className="hidden lg:block lg:col-span-5 lg:order-1">
              <GlassCard className="h-[calc(100vh-16rem)] flex flex-col" padding="none">
                <Suspense fallback={<LoadingSpinner />}>
                  <Chat onMusicGenerated={handleMusicGenerated} />
                </Suspense>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Floating Create Button - Mobile only */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="lg:hidden fixed right-4 bottom-20 sm:bottom-24 z-30 w-14 h-14 sm:w-16 sm:h-16
                   bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full
                   flex items-center justify-center shadow-lg shadow-cyan-500/30
                   active:scale-95 transition-transform"
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </button>

        {/* Add Music Modal - Only render when open */}
        {isAddModalOpen && (
          <Suspense fallback={null}>
            <AddMusicModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSuccess={() => fetchMusic(true)}
            />
          </Suspense>
        )}

        {/* Playlist Sidebar - Only render when open */}
        {isPlaylistSidebarOpen && (
          <Suspense fallback={null}>
            <PlaylistSidebar
              isOpen={isPlaylistSidebarOpen}
              onClose={handlePlaylistSidebarClose}
              selectedMusicId={selectedMusicForPlaylist}
              onMusicAdded={() => setSelectedMusicForPlaylist(null)}
            />
          </Suspense>
        )}
      </div>

      {/* Mobile Chat Modal/Drawer */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-surface rounded-t-3xl border-t border-white/10 overflow-hidden animate-slide-up safe-area-bottom">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/10 text-white/60 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Chat content */}
            <div className="h-full">
              <Suspense fallback={<LoadingSpinner />}>
                <Chat onMusicGenerated={handleMusicGenerated} />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
