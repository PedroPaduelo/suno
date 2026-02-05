'use client';

import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc, Youtube, ExternalLink, AudioWaveform } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { YTPlayer } from '@/types/youtube';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    crossfadeEnabled,
    crossfadeDuration,
    togglePlay,
    next,
    previous,
    setVolume,
    seek,
    setCrossfade,
  } = usePlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [showCrossfade, setShowCrossfade] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const isYouTube = currentSong?.source === 'youtube' && currentSong?.youtubeId;

  // Load YouTube API
  useEffect(() => {
    if (!isYouTube) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setYtReady(true);
      };
    } else {
      setYtReady(true);
    }
  }, [isYouTube]);

  // Initialize/Update YouTube player
  useEffect(() => {
    if (!ytReady || !isYouTube || !currentSong?.youtubeId || !ytContainerRef.current) return;

    // Destroy existing player
    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
      ytPlayerRef.current = null;
    }

    // Clear container
    if (ytContainerRef.current) {
      ytContainerRef.current.innerHTML = '';
      const playerDiv = document.createElement('div');
      playerDiv.id = 'yt-player-bar';
      ytContainerRef.current.appendChild(playerDiv);
    }

    ytPlayerRef.current = new window.YT.Player('yt-player-bar', {
      videoId: currentSong.youtubeId,
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          setYtDuration(event.target.getDuration());
          event.target.setVolume(volume * 100);
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            next();
          }
        },
      },
    });

    // Start time tracking
    timeUpdateRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        setYtCurrentTime(ytPlayerRef.current.getCurrentTime());
        setYtDuration(ytPlayerRef.current.getDuration() || 0);
      }
    }, 500);

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, currentSong?.youtubeId, isYouTube]);

  // Handle play/pause for YouTube
  useEffect(() => {
    if (!ytPlayerRef.current || !isYouTube) return;

    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch {
      // Player might not be ready yet
    }
  }, [isPlaying, isYouTube]);

  // Handle volume for YouTube
  useEffect(() => {
    if (!ytPlayerRef.current || !isYouTube) return;

    try {
      ytPlayerRef.current.setVolume(volume * 100);
      if (volume === 0) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    } catch {
      // Player might not be ready yet
    }
  }, [volume, isYouTube]);

  // YouTube seek handler
  const handleYtSeek = useCallback((percent: number) => {
    if (ytPlayerRef.current && ytDuration > 0) {
      const seekTime = percent * ytDuration;
      ytPlayerRef.current.seekTo(seekTime, true);
      setYtCurrentTime(seekTime);
    }
  }, [ytDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Use YouTube time values when playing YouTube content
  const displayCurrentTime = isYouTube ? ytCurrentTime : currentTime;
  const displayDuration = isYouTube ? ytDuration : duration;
  const progress = displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

  // Extract BPM from tags if available
  const bpm = currentSong?.tags?.match(/(\d+)\s*bpm/i)?.[1] || '120';

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-2 sm:px-4">
      {/* Hidden YouTube player container */}
      {isYouTube && (
        <div ref={ytContainerRef} className="hidden" />
      )}

      <div className="glass-liquid rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/50 border border-white/10">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden ${isPlaying && !isYouTube ? 'animate-spin-slow' : ''}`}>
              {currentSong.imageUrl ? (
                <Image
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/50 to-pink-500/50 flex items-center justify-center">
                  <Disc className="w-4 h-4 sm:w-6 sm:h-6 text-white/70" />
                </div>
              )}
              {/* YouTube indicator overlay */}
              {isYouTube && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Youtube className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
                </div>
              )}
            </div>
            {isPlaying && (
              <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl opacity-30 blur-md -z-10 animate-pulse ${
                isYouTube ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500' : 'bg-gradient-to-r from-primary via-pink-500 to-accent'
              }`} />
            )}
          </div>

          {/* Song info & progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <h4 className="text-xs sm:text-sm font-medium text-white truncate">{currentSong.title}</h4>
              {isYouTube ? (
                <span className="hidden sm:flex flex-shrink-0 px-2 py-0.5 text-[10px] font-medium text-red-400 bg-red-500/20 rounded-full items-center gap-1">
                  <Youtube className="w-3 h-3" />
                  YouTube
                </span>
              ) : (
                <span className="hidden sm:block flex-shrink-0 px-2 py-0.5 text-[10px] font-mono text-cyan-400 bg-cyan-500/20 rounded-full">
                  {bpm} BPM
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono w-6 sm:w-8">{formatTime(displayCurrentTime)}</span>
              <div
                className="flex-1 h-1 sm:h-1 bg-white/10 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  if (isYouTube) {
                    handleYtSeek(percent);
                  } else {
                    seek(percent * duration);
                  }
                }}
              >
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isYouTube
                      ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500'
                      : 'bg-gradient-to-r from-primary via-pink-500 to-accent'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono w-6 sm:w-8 text-right">{formatTime(displayDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0 sm:gap-1">
            <button
              onClick={previous}
              className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 sm:p-3 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
            </button>

            <button
              onClick={next}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Crossfade - hidden on mobile */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setShowCrossfade(true)}
              onMouseLeave={() => setShowCrossfade(false)}
            >
              <button
                onClick={() => setCrossfade(!crossfadeEnabled)}
                className={`p-2 transition-colors ${
                  crossfadeEnabled
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={crossfadeEnabled ? 'Crossfade ON' : 'Crossfade OFF'}
              >
                <AudioWaveform className="w-5 h-5" />
              </button>

              {showCrossfade && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 glass-liquid rounded-2xl min-w-[140px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400">Crossfade</span>
                    <button
                      onClick={() => setCrossfade(!crossfadeEnabled)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        crossfadeEnabled ? 'bg-primary' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        crossfadeEnabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  {crossfadeEnabled && (
                    <div>
                      <span className="text-[10px] text-slate-400">{crossfadeDuration}s</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={crossfadeDuration}
                        onChange={(e) => setCrossfade(true, parseInt(e.target.value))}
                        className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer mt-1"
                        style={{
                          background: `linear-gradient(to right, #6D28D9 ${(crossfadeDuration / 10) * 100}%, rgba(255,255,255,0.2) ${(crossfadeDuration / 10) * 100}%)`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Volume - hidden on mobile */}
            <div
              className="relative ml-1 sm:ml-2 hidden sm:block"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {showVolume && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 glass-liquid rounded-2xl">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${isYouTube ? '#ef4444' : '#6D28D9'} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Open in YouTube - hidden on mobile */}
            {isYouTube && currentSong.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${currentSong.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Open in YouTube"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
