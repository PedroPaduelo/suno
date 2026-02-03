'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Music,
  Trash2,
  Edit3,
  Check,
  ChevronRight,
  ListMusic,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  musicCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PlaylistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMusicId?: string | null;
  onMusicAdded?: () => void;
}

export default function PlaylistSidebar({
  isOpen,
  onClose,
  selectedMusicId,
  onMusicAdded,
}: PlaylistSidebarProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen, fetchPlaylists]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      });

      if (response.ok) {
        setNewPlaylistName('');
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const response = await fetch(`/api/playlists?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlaylists(playlists.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handleUpdatePlaylist = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/playlists?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedMusicId) return;

    setAddingToPlaylist(playlistId);
    try {
      const response = await fetch('/api/playlists/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, musicId: selectedMusicId }),
      });

      if (response.ok) {
        fetchPlaylists();
        onMusicAdded?.();
      } else {
        const data = await response.json();
        if (data.error) {
          alert(data.error);
        }
      }
    } catch (error) {
      console.error('Failed to add to playlist:', error);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const startEditing = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setEditingName(playlist.name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative w-80 max-w-full bg-surface border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ListMusic className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-white">Playlists</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add to playlist hint */}
        {selectedMusicId && (
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
            <p className="text-sm text-primary">
              Click a playlist to add the selected music
            </p>
          </div>
        )}

        {/* Create new playlist */}
        <form onSubmit={handleCreatePlaylist} className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isCreating || !newPlaylistName.trim()}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        {/* Playlists list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <ListMusic className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">No playlists yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Create one to organize your music
              </p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`
                  group relative rounded-xl border transition-all duration-200
                  ${selectedMusicId
                    ? 'bg-white/5 border-white/10 hover:border-primary/50 cursor-pointer'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                  }
                `}
                onClick={() => selectedMusicId && handleAddToPlaylist(playlist.id)}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                    {playlist.imageUrl ? (
                      <Image
                        src={playlist.imageUrl}
                        alt={playlist.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-pink-500/20">
                        <Music className="w-5 h-5 text-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === playlist.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-primary/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdatePlaylist(playlist.id);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdatePlaylist(playlist.id);
                          }}
                          className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-white text-sm truncate">
                          {playlist.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {playlist.musicCount} {playlist.musicCount === 1 ? 'track' : 'tracks'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions or loading indicator */}
                  {addingToPlaylist === playlist.id ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : selectedMusicId ? (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(playlist);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(playlist.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
