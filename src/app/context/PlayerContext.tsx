'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface Song {
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
  bpm?: number;
}

interface PlayerContextType {
  // State
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  autoPlayEnabled: boolean;

  // Actions
  setSongs: (songs: Song[]) => void;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  setAutoPlay: (enabled: boolean) => void;

  // Audio ref for external access
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [songs, setSongsState] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.7; // Initial volume
      audioRef.current.preload = 'auto';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store next function in ref to avoid dependency issues
  const nextRef = useRef<() => void>(() => {});

  // Handle time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      if (autoPlayEnabled) {
        nextRef.current();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [autoPlayEnabled]);

  const setSongs = useCallback((newSongs: Song[]) => {
    setSongsState(newSongs);
  }, []);

  const playSong = useCallback((song: Song) => {
    if (!audioRef.current || !song.audioUrl) return;

    // If same song, just toggle play/pause
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      return;
    }

    // New song
    setCurrentSong(song);
    audioRef.current.src = song.audioUrl;
    audioRef.current.play().catch(console.error);
  }, [currentSong, isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const next = useCallback(() => {
    if (songs.length === 0) return;

    const playableSongs = songs.filter(s => s.audioUrl && s.status === 'complete');
    if (playableSongs.length === 0) return;

    const currentIndex = currentSong
      ? playableSongs.findIndex(s => s.id === currentSong.id)
      : -1;

    const nextIndex = (currentIndex + 1) % playableSongs.length;
    const nextSong = playableSongs[nextIndex];

    if (nextSong && audioRef.current) {
      setCurrentSong(nextSong);
      audioRef.current.src = nextSong.audioUrl!;
      audioRef.current.play().catch(console.error);
    }
  }, [songs, currentSong]);

  // Update nextRef when next changes
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const previous = useCallback(() => {
    if (songs.length === 0) return;

    const playableSongs = songs.filter(s => s.audioUrl && s.status === 'complete');
    if (playableSongs.length === 0) return;

    const currentIndex = currentSong
      ? playableSongs.findIndex(s => s.id === currentSong.id)
      : 0;

    const prevIndex = currentIndex <= 0 ? playableSongs.length - 1 : currentIndex - 1;
    const prevSong = playableSongs[prevIndex];

    if (prevSong && audioRef.current) {
      setCurrentSong(prevSong);
      audioRef.current.src = prevSong.audioUrl!;
      audioRef.current.play().catch(console.error);
    }
  }, [songs, currentSong]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setAutoPlay = useCallback((enabled: boolean) => {
    setAutoPlayEnabled(enabled);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        songs,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        autoPlayEnabled,
        setSongs,
        playSong,
        togglePlay,
        pause,
        play,
        next,
        previous,
        setVolume,
        seek,
        setAutoPlay,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
