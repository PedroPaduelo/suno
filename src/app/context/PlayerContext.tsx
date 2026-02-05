'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface Song {
  id: string;
  sunoId?: string | null;
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
  // Novos campos
  source: 'suno' | 'youtube';
  youtubeId?: string | null;
  isLiked: boolean;
}

export type FilterType = 'all' | 'suno' | 'youtube' | 'liked';

interface PlayerContextType {
  // State
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  autoPlayEnabled: boolean;
  filter: FilterType;
  filteredSongs: Song[];

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
  setFilter: (filter: FilterType) => void;
  toggleLike: (songId: string) => Promise<void>;
  updateSong: (songId: string, updates: Partial<Song>) => void;

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
  const [filter, setFilterState] = useState<FilterType>('all');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtered songs based on current filter
  const filteredSongs = songs.filter(song => {
    if (filter === 'all') return true;
    if (filter === 'liked') return song.isLiked;
    return song.source === filter;
  });

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
    // For YouTube songs, just set current song (YouTube player handles playback)
    if (song.source === 'youtube' && song.youtubeId) {
      // Pause any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // If same YouTube song, just toggle play state
      if (currentSong?.id === song.id) {
        setIsPlaying(!isPlaying);
        return;
      }

      setCurrentSong(song);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // For Suno songs with audioUrl
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
    // For YouTube songs, just toggle the state (PlayerBar handles YouTube player)
    if (currentSong?.source === 'youtube' && currentSong?.youtubeId) {
      setIsPlaying(!isPlaying);
      return;
    }

    // For Suno songs with audio element
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, currentSong]);

  const pause = useCallback(() => {
    // For YouTube songs, just set the state (PlayerBar handles YouTube player)
    if (currentSong?.source === 'youtube' && currentSong?.youtubeId) {
      setIsPlaying(false);
      return;
    }
    audioRef.current?.pause();
  }, [currentSong]);

  const play = useCallback(() => {
    // For YouTube songs, just set the state (PlayerBar handles YouTube player)
    if (currentSong?.source === 'youtube' && currentSong?.youtubeId) {
      setIsPlaying(true);
      return;
    }
    audioRef.current?.play().catch(console.error);
  }, [currentSong]);

  const next = useCallback(() => {
    if (songs.length === 0) return;

    // Include both Suno songs with audioUrl and YouTube songs with youtubeId
    const playableSongs = songs.filter(s =>
      (s.audioUrl && s.status === 'complete') ||
      (s.source === 'youtube' && s.youtubeId)
    );
    if (playableSongs.length === 0) return;

    const currentIndex = currentSong
      ? playableSongs.findIndex(s => s.id === currentSong.id)
      : -1;

    const nextIndex = (currentIndex + 1) % playableSongs.length;
    const nextSong = playableSongs[nextIndex];

    if (nextSong) {
      // For YouTube songs
      if (nextSong.source === 'youtube' && nextSong.youtubeId) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentSong(nextSong);
        setIsPlaying(true);
        setCurrentTime(0);
        setDuration(0);
      } else if (nextSong.audioUrl && audioRef.current) {
        // For Suno songs
        setCurrentSong(nextSong);
        audioRef.current.src = nextSong.audioUrl;
        audioRef.current.play().catch(console.error);
      }
    }
  }, [songs, currentSong]);

  // Update nextRef when next changes
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const previous = useCallback(() => {
    if (songs.length === 0) return;

    // Include both Suno songs with audioUrl and YouTube songs with youtubeId
    const playableSongs = songs.filter(s =>
      (s.audioUrl && s.status === 'complete') ||
      (s.source === 'youtube' && s.youtubeId)
    );
    if (playableSongs.length === 0) return;

    const currentIndex = currentSong
      ? playableSongs.findIndex(s => s.id === currentSong.id)
      : 0;

    const prevIndex = currentIndex <= 0 ? playableSongs.length - 1 : currentIndex - 1;
    const prevSong = playableSongs[prevIndex];

    if (prevSong) {
      // For YouTube songs
      if (prevSong.source === 'youtube' && prevSong.youtubeId) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentSong(prevSong);
        setIsPlaying(true);
        setCurrentTime(0);
        setDuration(0);
      } else if (prevSong.audioUrl && audioRef.current) {
        // For Suno songs
        setCurrentSong(prevSong);
        audioRef.current.src = prevSong.audioUrl;
        audioRef.current.play().catch(console.error);
      }
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

  const setFilter = useCallback((newFilter: FilterType) => {
    setFilterState(newFilter);
  }, []);

  const toggleLike = useCallback(async (songId: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const newLikedState = !song.isLiked;

    // Optimistic update
    setSongsState(prev =>
      prev.map(s => (s.id === songId ? { ...s, isLiked: newLikedState } : s))
    );

    // Update current song if it's the one being liked
    if (currentSong?.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, isLiked: newLikedState } : prev);
    }

    try {
      const response = await fetch(`/api/music?id=${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLiked: newLikedState }),
      });

      if (!response.ok) {
        // Revert on error
        setSongsState(prev =>
          prev.map(s => (s.id === songId ? { ...s, isLiked: !newLikedState } : s))
        );
        if (currentSong?.id === songId) {
          setCurrentSong(prev => prev ? { ...prev, isLiked: !newLikedState } : prev);
        }
      }
    } catch {
      // Revert on error
      setSongsState(prev =>
        prev.map(s => (s.id === songId ? { ...s, isLiked: !newLikedState } : s))
      );
      if (currentSong?.id === songId) {
        setCurrentSong(prev => prev ? { ...prev, isLiked: !newLikedState } : prev);
      }
    }
  }, [songs, currentSong]);

  const updateSong = useCallback((songId: string, updates: Partial<Song>) => {
    setSongsState(prev =>
      prev.map(s => (s.id === songId ? { ...s, ...updates } : s))
    );
    if (currentSong?.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [currentSong]);

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
        filter,
        filteredSongs,
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
        setFilter,
        toggleLike,
        updateSong,
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
