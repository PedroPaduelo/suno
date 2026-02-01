'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Music2 } from 'lucide-react';
import Deck from './Deck';
import Mixer from './Mixer';
import { usePlayer, Song } from '../context/PlayerContext';
import Image from 'next/image';

export default function DJDeckView() {
  const { songs } = usePlayer();

  // Deck A state
  const [deckASong, setDeckASong] = useState<Song | null>(null);
  const [playingA, setPlayingA] = useState(false);
  const [currentTimeA, setCurrentTimeA] = useState(0);
  const [durationA, setDurationA] = useState(0);
  const audioRefA = useRef<HTMLAudioElement | null>(null);

  // Deck B state
  const [deckBSong, setDeckBSong] = useState<Song | null>(null);
  const [playingB, setPlayingB] = useState(false);
  const [currentTimeB, setCurrentTimeB] = useState(0);
  const [durationB, setDurationB] = useState(0);
  const audioRefB = useRef<HTMLAudioElement | null>(null);

  // Mixer state
  const [crossfader, setCrossfader] = useState(50);
  const [volumeA, setVolumeA] = useState(0.7);
  const [volumeB, setVolumeB] = useState(0.7);

  // Track selector dropdowns
  const [showSelectorA, setShowSelectorA] = useState(false);
  const [showSelectorB, setShowSelectorB] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRefA.current = new Audio();
      audioRefB.current = new Audio();

      const handleTimeUpdateA = () => setCurrentTimeA(audioRefA.current?.currentTime || 0);
      const handleDurationA = () => setDurationA(audioRefA.current?.duration || 0);
      const handleEndedA = () => setPlayingA(false);

      const handleTimeUpdateB = () => setCurrentTimeB(audioRefB.current?.currentTime || 0);
      const handleDurationB = () => setDurationB(audioRefB.current?.duration || 0);
      const handleEndedB = () => setPlayingB(false);

      audioRefA.current.addEventListener('timeupdate', handleTimeUpdateA);
      audioRefA.current.addEventListener('durationchange', handleDurationA);
      audioRefA.current.addEventListener('ended', handleEndedA);

      audioRefB.current.addEventListener('timeupdate', handleTimeUpdateB);
      audioRefB.current.addEventListener('durationchange', handleDurationB);
      audioRefB.current.addEventListener('ended', handleEndedB);

      return () => {
        audioRefA.current?.removeEventListener('timeupdate', handleTimeUpdateA);
        audioRefA.current?.removeEventListener('durationchange', handleDurationA);
        audioRefA.current?.removeEventListener('ended', handleEndedA);
        audioRefB.current?.removeEventListener('timeupdate', handleTimeUpdateB);
        audioRefB.current?.removeEventListener('durationchange', handleDurationB);
        audioRefB.current?.removeEventListener('ended', handleEndedB);
        audioRefA.current?.pause();
        audioRefB.current?.pause();
      };
    }
  }, []);

  // Apply crossfader to volumes
  useEffect(() => {
    if (audioRefA.current && audioRefB.current) {
      // Crossfader: 0 = only A, 50 = both, 100 = only B
      const fadeA = crossfader <= 50 ? 1 : 1 - (crossfader - 50) / 50;
      const fadeB = crossfader >= 50 ? 1 : crossfader / 50;

      audioRefA.current.volume = volumeA * fadeA;
      audioRefB.current.volume = volumeB * fadeB;
    }
  }, [crossfader, volumeA, volumeB]);

  // Load track to deck
  const loadToDeckA = useCallback((song: Song) => {
    if (audioRefA.current && song.audioUrl) {
      setPlayingA(false);
      audioRefA.current.pause();
      audioRefA.current.src = song.audioUrl;
      setDeckASong(song);
      setCurrentTimeA(0);
      setShowSelectorA(false);
    }
  }, []);

  const loadToDeckB = useCallback((song: Song) => {
    if (audioRefB.current && song.audioUrl) {
      setPlayingB(false);
      audioRefB.current.pause();
      audioRefB.current.src = song.audioUrl;
      setDeckBSong(song);
      setCurrentTimeB(0);
      setShowSelectorB(false);
    }
  }, []);

  // Play/pause controls
  const togglePlayA = useCallback(() => {
    if (!audioRefA.current || !deckASong) return;
    if (playingA) {
      audioRefA.current.pause();
      setPlayingA(false);
    } else {
      audioRefA.current.play();
      setPlayingA(true);
    }
  }, [playingA, deckASong]);

  const togglePlayB = useCallback(() => {
    if (!audioRefB.current || !deckBSong) return;
    if (playingB) {
      audioRefB.current.pause();
      setPlayingB(false);
    } else {
      audioRefB.current.play();
      setPlayingB(true);
    }
  }, [playingB, deckBSong]);

  // Seek controls
  const seekA = useCallback((time: number) => {
    if (audioRefA.current) {
      audioRefA.current.currentTime = time;
    }
  }, []);

  const seekB = useCallback((time: number) => {
    if (audioRefB.current) {
      audioRefB.current.currentTime = time;
    }
  }, []);

  // Filter playable songs
  const playableSongs = songs.filter((s: Song) => s.audioUrl && s.status === 'complete');

  // Auto-load first two songs if available
  useEffect(() => {
    if (playableSongs.length > 0 && !deckASong) {
      loadToDeckA(playableSongs[0]);
    }
    if (playableSongs.length > 1 && !deckBSong) {
      loadToDeckB(playableSongs[1]);
    }
  }, [playableSongs, deckASong, deckBSong, loadToDeckA, loadToDeckB]);

  return (
    <div className="w-full min-h-screen pt-24 pb-48 px-4 sm:px-6 animate-zoom-in">
      <div className="max-w-6xl mx-auto">
        {/* Track Selectors */}
        <div className="flex justify-between mb-6">
          {/* Deck A Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSelectorA(!showSelectorA)}
              className="flex items-center gap-2 px-4 py-2 glass-liquid rounded-2xl text-sm text-cyan-400 hover:border-cyan-500/30 transition-colors"
            >
              <Music2 className="w-4 h-4" />
              <span className="truncate max-w-32">{deckASong?.title || 'Select Track A'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSelectorA ? 'rotate-180' : ''}`} />
            </button>

            {showSelectorA && (
              <div className="absolute top-full mt-2 left-0 w-64 max-h-64 overflow-y-auto glass-liquid rounded-2xl p-2 z-50">
                {playableSongs.length === 0 ? (
                  <p className="text-sm text-slate-500 p-2">No tracks available</p>
                ) : (
                  playableSongs.map((song: Song) => (
                    <button
                      key={song.id}
                      onClick={() => loadToDeckA(song)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                        deckASong?.id === song.id ? 'bg-cyan-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        {song.imageUrl ? (
                          <Image
                            src={song.imageUrl}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30" />
                        )}
                      </div>
                      <span className="text-sm text-white truncate">{song.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Deck B Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSelectorB(!showSelectorB)}
              className="flex items-center gap-2 px-4 py-2 glass-liquid rounded-2xl text-sm text-pink-400 hover:border-pink-500/30 transition-colors"
            >
              <Music2 className="w-4 h-4" />
              <span className="truncate max-w-32">{deckBSong?.title || 'Select Track B'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSelectorB ? 'rotate-180' : ''}`} />
            </button>

            {showSelectorB && (
              <div className="absolute top-full mt-2 right-0 w-64 max-h-64 overflow-y-auto glass-liquid rounded-2xl p-2 z-50">
                {playableSongs.length === 0 ? (
                  <p className="text-sm text-slate-500 p-2">No tracks available</p>
                ) : (
                  playableSongs.map((song: Song) => (
                    <button
                      key={song.id}
                      onClick={() => loadToDeckB(song)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                        deckBSong?.id === song.id ? 'bg-pink-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        {song.imageUrl ? (
                          <Image
                            src={song.imageUrl}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-purple-500/30" />
                        )}
                      </div>
                      <span className="text-sm text-white truncate">{song.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decks and Mixer */}
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {/* Deck A */}
          <div className="flex-1 max-w-sm">
            <Deck
              song={deckASong}
              isPlaying={playingA}
              onTogglePlay={togglePlayA}
              currentTime={currentTimeA}
              duration={durationA}
              onSeek={seekA}
              label="DECK A"
              color="cyan"
            />
          </div>

          {/* Mixer */}
          <div className="flex-shrink-0">
            <Mixer
              crossfader={crossfader}
              onCrossfaderChange={setCrossfader}
              volumeA={volumeA}
              volumeB={volumeB}
              onVolumeAChange={setVolumeA}
              onVolumeBChange={setVolumeB}
            />
          </div>

          {/* Deck B */}
          <div className="flex-1 max-w-sm">
            <Deck
              song={deckBSong}
              isPlaying={playingB}
              onTogglePlay={togglePlayB}
              currentTime={currentTimeB}
              duration={durationB}
              onSeek={seekB}
              label="DECK B"
              color="pink"
            />
          </div>
        </div>

        {/* Hint */}
        {playableSongs.length < 2 && (
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500">
              Generate more tracks in Studio mode to use both decks!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
