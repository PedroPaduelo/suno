'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import type { YTPlayer } from '@/types/youtube';

interface YouTubePlayerProps {
  youtubeId: string;
  title?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

export default function YouTubePlayer({
  youtubeId,
  title,
  autoPlay = false,
  onPlay,
  onPause,
  onEnd,
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef(`yt-player-${youtubeId}-${Math.random().toString(36).substr(2, 9)}`);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!containerRef.current) return;

      // Create a div for the player
      const playerDiv = document.createElement('div');
      playerDiv.id = playerIdRef.current;
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerIdRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
            if (autoPlay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              onPlay?.();
              // Start time tracking
              intervalRef.current = setInterval(() => {
                if (playerRef.current) {
                  setCurrentTime(playerRef.current.getCurrentTime());
                }
              }, 1000);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              onPause?.();
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onEnd?.();
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            }
          },
        },
      });
    };

    // Wait for API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [youtubeId, autoPlay, onPlay, onPause, onEnd]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;

    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  const handleFullscreen = () => {
    const iframe = containerRef.current?.querySelector('iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black group">
      {/* Video container */}
      <div ref={containerRef} className="aspect-video w-full" />

      {/* Custom controls overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Title */}
        {title && (
          <div className="absolute top-3 left-3 right-3">
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
        )}

        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/20 cursor-pointer mx-3 mb-2"
          style={{ width: 'calc(100% - 24px)' }}
          onClick={handleSeek}
        >
          <div
            className="h-full bg-red-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 px-3 pb-3">
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleMute}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <span className="text-white/80 text-xs font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            onClick={handleFullscreen}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
