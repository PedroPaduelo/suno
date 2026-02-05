'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SyncState {
  code: string | null;
  hostId: string | null;
  currentMusicId: string | null;
  isPlaying: boolean;
  currentTime: number;
  lastUpdate: string | null;
}

interface UseSyncSessionOptions {
  onStateChange?: (state: SyncState) => void;
  pollInterval?: number; // ms
}

export function useSyncSession(options: UseSyncSessionOptions = {}) {
  const { onStateChange, pollInterval = 1500 } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hostIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string | null>(null);

  // Generate or get user ID
  useEffect(() => {
    let userId = localStorage.getItem('syncUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('syncUserId', userId);
    }
    hostIdRef.current = userId;
  }, []);

  // Create a new session
  const createSession = useCallback(async () => {
    if (!hostIdRef.current) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: hostIdRef.current }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionCode(data.code);
      setIsHost(true);
      setIsConnected(true);
      localStorage.setItem('syncSessionCode', data.code);
      localStorage.setItem('syncIsHost', 'true');

      return data.code;
    } catch (err) {
      setError('Erro ao criar sala');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join an existing session
  const joinSession = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sync?code=${code.toUpperCase()}`);

      if (response.status === 404) {
        setError('Sala não encontrada');
        return false;
      }

      if (response.status === 410) {
        setError('Sala expirada');
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to join session');
      }

      const data = await response.json();
      setSessionCode(data.code);
      setIsHost(data.hostId === hostIdRef.current);
      setIsConnected(true);
      localStorage.setItem('syncSessionCode', data.code);
      localStorage.setItem('syncIsHost', data.hostId === hostIdRef.current ? 'true' : 'false');

      // Trigger initial state change
      if (onStateChange) {
        onStateChange({
          code: data.code,
          hostId: data.hostId,
          currentMusicId: data.currentMusicId,
          isPlaying: data.isPlaying,
          currentTime: data.currentTime,
          lastUpdate: data.lastUpdate,
        });
      }

      return true;
    } catch (err) {
      setError('Erro ao entrar na sala');
      return false;
    } finally {
      setLoading(false);
    }
  }, [onStateChange]);

  // Update session state (only host should call this frequently)
  const updateSession = useCallback(async (state: Partial<{
    currentMusicId: string | null;
    isPlaying: boolean;
    currentTime: number;
  }>) => {
    if (!sessionCode) return false;

    try {
      const response = await fetch('/api/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sessionCode,
          ...state,
        }),
      });

      return response.ok;
    } catch (err) {
      return false;
    }
  }, [sessionCode]);

  // Leave session
  const leaveSession = useCallback(async () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // If host, delete the session
    if (isHost && sessionCode) {
      try {
        await fetch(`/api/sync?code=${sessionCode}`, { method: 'DELETE' });
      } catch (err) {
        // Ignore errors
      }
    }

    setSessionCode(null);
    setIsHost(false);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('syncSessionCode');
    localStorage.removeItem('syncIsHost');
  }, [isHost, sessionCode]);

  // Poll for updates
  useEffect(() => {
    if (!isConnected || !sessionCode) return;

    const poll = async () => {
      try {
        const response = await fetch(`/api/sync?code=${sessionCode}`);

        if (!response.ok) {
          if (response.status === 404 || response.status === 410) {
            // Session ended
            leaveSession();
            setError('Sala encerrada');
          }
          return;
        }

        const data = await response.json();

        // Only trigger change if something actually changed
        if (data.lastUpdate !== lastUpdateRef.current) {
          lastUpdateRef.current = data.lastUpdate;

          if (onStateChange) {
            onStateChange({
              code: data.code,
              hostId: data.hostId,
              currentMusicId: data.currentMusicId,
              isPlaying: data.isPlaying,
              currentTime: data.currentTime,
              lastUpdate: data.lastUpdate,
            });
          }
        }
      } catch (err) {
        // Ignore polling errors
      }
    };

    // Initial poll
    poll();

    // Set up interval
    pollIntervalRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isConnected, sessionCode, pollInterval, onStateChange, leaveSession]);

  // Restore session on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('syncSessionCode');
    const savedIsHost = localStorage.getItem('syncIsHost') === 'true';

    if (savedCode) {
      // Verify session still exists
      fetch(`/api/sync?code=${savedCode}`)
        .then((res) => {
          if (res.ok) {
            setSessionCode(savedCode);
            setIsHost(savedIsHost);
            setIsConnected(true);
          } else {
            localStorage.removeItem('syncSessionCode');
            localStorage.removeItem('syncIsHost');
          }
        })
        .catch(() => {
          localStorage.removeItem('syncSessionCode');
          localStorage.removeItem('syncIsHost');
        });
    }
  }, []);

  return {
    isConnected,
    isHost,
    sessionCode,
    error,
    loading,
    createSession,
    joinSession,
    updateSession,
    leaveSession,
    userId: hostIdRef.current,
  };
}
