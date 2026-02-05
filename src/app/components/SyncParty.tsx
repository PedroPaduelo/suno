'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Users, Copy, Check, X, LogOut, Crown, Radio } from 'lucide-react';
import { useSyncSession } from '../hooks/useSyncSession';
import { usePlayer } from '../context/PlayerContext';

export default function SyncParty() {
  const [isOpen, setIsOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const {
    currentSong,
    isPlaying,
    currentTime,
    playSong,
    togglePlay,
    seek,
    songs,
    refreshSongs,
  } = usePlayer();

  const lastSyncRef = useRef<string | null>(null);
  const isUpdatingRef = useRef(false);
  const pendingSyncRef = useRef<{
    musicId: string;
    currentTime: number;
    isPlaying: boolean;
  } | null>(null);

  // Effect to handle pending sync after songs refresh
  useEffect(() => {
    if (pendingSyncRef.current && songs.length > 0) {
      const { musicId, currentTime: syncTime, isPlaying: syncPlaying } = pendingSyncRef.current;
      const song = songs.find(s => s.id === musicId);
      if (song) {
        playSong(song);
        setTimeout(() => {
          seek(syncTime);
          if (syncPlaying !== isPlaying) {
            togglePlay();
          }
        }, 500);
        pendingSyncRef.current = null;
      }
    }
  }, [songs, playSong, seek, togglePlay, isPlaying]);

  const handleStateChange = useCallback(async (state: {
    currentMusicId: string | null;
    isPlaying: boolean;
    currentTime: number;
    lastUpdate: string | null;
  }) => {
    // Prevent loops - don't process our own updates
    if (isUpdatingRef.current) return;
    if (state.lastUpdate === lastSyncRef.current) return;

    lastSyncRef.current = state.lastUpdate;

    // Find and play the song if different
    if (state.currentMusicId && state.currentMusicId !== currentSong?.id) {
      const song = songs.find(s => s.id === state.currentMusicId);
      if (song) {
        playSong(song);
        // Seek to position after a small delay
        setTimeout(() => {
          seek(state.currentTime);
        }, 500);
      } else {
        // Song not found - refresh songs and store pending sync
        pendingSyncRef.current = {
          musicId: state.currentMusicId,
          currentTime: state.currentTime,
          isPlaying: state.isPlaying,
        };
        await refreshSongs();
        return; // The effect above will handle the sync after refresh
      }
    }

    // Sync play/pause state
    if (state.isPlaying !== isPlaying && currentSong) {
      togglePlay();
    }

    // Sync time if diff is more than 3 seconds
    if (Math.abs(state.currentTime - currentTime) > 3 && currentSong) {
      seek(state.currentTime);
    }
  }, [currentSong, isPlaying, currentTime, songs, playSong, togglePlay, seek, refreshSongs]);

  const {
    isConnected,
    isHost,
    sessionCode,
    error,
    loading,
    createSession,
    joinSession,
    updateSession,
    leaveSession,
  } = useSyncSession({
    onStateChange: handleStateChange,
    pollInterval: 1500,
  });

  // Sync state when host makes changes
  useEffect(() => {
    if (!isConnected || !isHost) return;

    // Debounce updates
    const timeout = setTimeout(() => {
      isUpdatingRef.current = true;
      updateSession({
        currentMusicId: currentSong?.id || null,
        isPlaying,
        currentTime,
      }).finally(() => {
        isUpdatingRef.current = false;
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [isConnected, isHost, currentSong?.id, isPlaying, updateSession]);

  // Sync time periodically when host
  useEffect(() => {
    if (!isConnected || !isHost || !isPlaying) return;

    const interval = setInterval(() => {
      isUpdatingRef.current = true;
      updateSession({ currentTime }).finally(() => {
        isUpdatingRef.current = false;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, isHost, isPlaying, currentTime, updateSession]);

  const handleCreateSession = async () => {
    const code = await createSession();
    if (code) {
      setMode('menu');
    }
  };

  const handleJoinSession = async () => {
    if (joinCode.length < 6) return;
    const success = await joinSession(joinCode);
    if (success) {
      setMode('menu');
      setJoinCode('');
    }
  };

  const handleCopyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    leaveSession();
    setMode('menu');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-20 sm:bottom-32 right-4 z-30
          w-12 h-12 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-300
          ${isConnected
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30 animate-pulse'
            : 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20'
          }
        `}
        title={isConnected ? `Sync Party: ${sessionCode}` : 'Sync Party'}
      >
        {isConnected ? (
          <Radio className="w-5 h-5 text-white" />
        ) : (
          <Users className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Content */}
          <div className="relative w-full max-w-sm bg-surface rounded-3xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${isConnected
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-primary to-pink-500'
                  }
                `}>
                  {isConnected ? (
                    <Radio className="w-5 h-5 text-white" />
                  ) : (
                    <Users className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Sync Party</h3>
                  <p className="text-xs text-slate-400">
                    {isConnected ? 'Conectado' : 'Ouça junto com amigos'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {error}
                </div>
              )}

              {isConnected ? (
                // Connected state
                <div className="space-y-4">
                  {/* Session info */}
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-400">Código da sala</span>
                      {isHost && (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <Crown className="w-3 h-3" />
                          Host
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-2xl font-mono font-bold text-white tracking-widest">
                        {sessionCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>
                      {isHost
                        ? 'Você está controlando a música'
                        : 'Sincronizado com o host'
                      }
                    </span>
                  </div>

                  {/* Leave button */}
                  <button
                    onClick={handleLeave}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {isHost ? 'Encerrar sala' : 'Sair da sala'}
                  </button>
                </div>
              ) : mode === 'menu' ? (
                // Main menu
                <div className="space-y-3">
                  <button
                    onClick={() => setMode('create')}
                    className="w-full p-4 bg-gradient-to-r from-primary to-pink-500 rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Criar Sala
                  </button>
                  <button
                    onClick={() => setMode('join')}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Entrar em uma Sala
                  </button>
                </div>
              ) : mode === 'create' ? (
                // Create session
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Crie uma sala e compartilhe o código com seu amigo para ouvirem juntos.
                  </p>
                  <button
                    onClick={handleCreateSession}
                    disabled={loading}
                    className="w-full p-4 bg-gradient-to-r from-primary to-pink-500 rounded-2xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Sala'}
                  </button>
                  <button
                    onClick={() => setMode('menu')}
                    className="w-full p-3 text-slate-400 hover:text-white transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                // Join session
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Digite o código de 6 caracteres da sala.
                  </p>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="ABC123"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-2xl font-mono tracking-widest placeholder-slate-600 outline-none focus:border-primary/50"
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoinSession}
                    disabled={loading || joinCode.length < 6}
                    className="w-full p-4 bg-gradient-to-r from-primary to-pink-500 rounded-2xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                  <button
                    onClick={() => setMode('menu')}
                    className="w-full p-3 text-slate-400 hover:text-white transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
