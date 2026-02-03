'use client';

import { usePlayer, FilterType } from '../context/PlayerContext';
import { Music, Youtube, Heart, LayoutGrid } from 'lucide-react';

export default function FilterBar() {
  const { songs, filter, setFilter } = usePlayer();

  // Calculate counts for each filter
  const counts = {
    all: songs.length,
    suno: songs.filter(s => s.source === 'suno').length,
    youtube: songs.filter(s => s.source === 'youtube').length,
    liked: songs.filter(s => s.isLiked).length,
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { key: 'suno', label: 'Suno', icon: <Music className="w-3.5 h-3.5" /> },
    { key: 'youtube', label: 'YouTube', icon: <Youtube className="w-3.5 h-3.5" /> },
    { key: 'liked', label: 'Liked', icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${filter === key
              ? key === 'liked'
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : key === 'youtube'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : key === 'suno'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white'
            }
          `}
        >
          {icon}
          <span>{label}</span>
          <span className={`
            px-1.5 py-0.5 rounded-full text-[10px] font-semibold
            ${filter === key ? 'bg-white/20' : 'bg-white/10'}
          `}>
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
