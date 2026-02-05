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
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  filter: FilterType;
  searchQuery: string;
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
  setCrossfade: (enabled: boolean, duration?: number) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
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
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(3); // seconds
  const [filter, setFilterState] = useState<FilterType>('all');
  const [searchQuery, setSearchQueryState] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered songs based on current filter and search query
  const filteredSongs = songs.filter(song => {
    // First apply filter
    let passesFilter = true;
    if (filter === 'liked') passesFilter = song.isLiked;
    else if (filter !== 'all') passesFilter = song.source === filter;

    if (!passesFilter) return false;

    // Then apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        song.tags?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.volume = 0.7;
        audioRef.current.preload = 'auto';
      }
      if (!nextAudioRef.current) {
        nextAudioRef.current = new Audio();
        nextAudioRef.current.volume = 0;
        nextAudioRef.current.preload = 'auto';
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current = null;
      }
      if (crossfadeIntervalRef.current) {
        clearInterval(crossfadeIntervalRef.current);
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

  // Crossfade transition helper
  const performCrossfade = useCallback((nextSong: Song) => {
    if (!audioRef.current || !nextAudioRef.current || !nextSong.audioUrl) return;

    // Clear any existing crossfade
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
    }

    const currentAudio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    const targetVolume = volume;
    const steps = crossfadeDuration * 20; // 50ms intervals
    const volumeStep = targetVolume / steps;
    let step = 0;

    // Setup next audio
    nextAudio.src = nextSong.audioUrl;
    nextAudio.volume = 0;
    nextAudio.play().catch(console.error);

    // Update current song immediately for UI
    setCurrentSong(nextSong);
    setIsPlaying(true);

    crossfadeIntervalRef.current = setInterval(() => {
      step++;

      // Fade out current
      const currentVol = Math.max(0, targetVolume - (volumeStep * step));
      currentAudio.volume = currentVol;

      // Fade in next
      const nextVol = Math.min(targetVolume, volumeStep * step);
      nextAudio.volume = nextVol;

      if (step >= steps) {
        // Crossfade complete - swap audio elements
        if (crossfadeIntervalRef.current) {
          clearInterval(crossfadeIntervalRef.current);
        }

        currentAudio.pause();
        currentAudio.src = nextSong.audioUrl!;
        currentAudio.volume = targetVolume;
        currentAudio.currentTime = nextAudio.currentTime;
        currentAudio.play().catch(console.error);

        nextAudio.pause();
        nextAudio.volume = 0;
        nextAudio.src = '';
      }
    }, 50);
  }, [volume, crossfadeDuration]);

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
      // For YouTube songs (no crossfade support)
      if (nextSong.source === 'youtube' && nextSong.youtubeId) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentSong(nextSong);
        setIsPlaying(true);
        setCurrentTime(0);
        setDuration(0);
      } else if (nextSong.audioUrl) {
        // For Suno songs - use crossfade if enabled
        if (crossfadeEnabled && currentSong?.source !== 'youtube') {
          performCrossfade(nextSong);
        } else if (audioRef.current) {
          setCurrentSong(nextSong);
          audioRef.current.src = nextSong.audioUrl;
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [songs, currentSong, crossfadeEnabled, performCrossfade]);

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
      // For YouTube songs (no crossfade support)
      if (prevSong.source === 'youtube' && prevSong.youtubeId) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentSong(prevSong);
        setIsPlaying(true);
        setCurrentTime(0);
        setDuration(0);
      } else if (prevSong.audioUrl) {
        // For Suno songs - use crossfade if enabled
        if (crossfadeEnabled && currentSong?.source !== 'youtube') {
          performCrossfade(prevSong);
        } else if (audioRef.current) {
          setCurrentSong(prevSong);
          audioRef.current.src = prevSong.audioUrl;
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [songs, currentSong, crossfadeEnabled, performCrossfade]);

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

  const setCrossfade = useCallback((enabled: boolean, duration?: number) => {
    setCrossfadeEnabled(enabled);
    if (duration !== undefined) {
      setCrossfadeDuration(duration);
    }
  }, []);

  const setFilter = useCallback((newFilter: FilterType) => {
    setFilterState(newFilter);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
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
        crossfadeEnabled,
        crossfadeDuration,
        filter,
        searchQuery,
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
        setCrossfade,
        setFilter,
        setSearchQuery,
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
