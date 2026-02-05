'use client';

import { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { usePlayer, FilterType } from '../context/PlayerContext';
import { Music, Youtube, Heart, LayoutGrid, Search, X } from 'lucide-react';

const FilterBar = memo(function FilterBar() {
  const { songs, filter, setFilter, searchQuery, setSearchQuery } = usePlayer();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Memoize counts calculation - only recalculate when songs array changes
  const counts = useMemo(() => ({
    all: songs.length,
    suno: songs.filter(s => s.source === 'suno').length,
    youtube: songs.filter(s => s.source === 'youtube').length,
    liked: songs.filter(s => s.isLiked).length,
  }), [songs]);

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { key: 'suno', label: 'Suno', icon: <Music className="w-3.5 h-3.5" /> },
    { key: 'youtube', label: 'YouTube', icon: <Youtube className="w-3.5 h-3.5" /> },
    { key: 'liked', label: 'Liked', icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchOpen(false);
  }, [setSearchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Search */}
      <div className={`
        flex items-center transition-all duration-300 ease-out
        ${isSearchOpen ? 'flex-1' : 'flex-shrink-0'}
      `}>
        {isSearchOpen ? (
          <div className="flex items-center gap-2 w-full bg-white/5 border border-white/10 rounded-full px-3 py-1 sm:py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar música..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 outline-none min-w-0"
            />
            <button
              onClick={handleClearSearch}
              className="p-0.5 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`
              flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium
              transition-all duration-200 flex-shrink-0
              ${searchQuery
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <Search className="w-3.5 h-3.5" />
            {searchQuery && <span className="max-w-[60px] truncate">{searchQuery}</span>}
          </button>
        )}
      </div>

      {/* Filters - hide when search is open on mobile */}
      <div className={`
        flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-hide
        ${isSearchOpen ? 'hidden sm:flex' : 'flex'}
      `}>
        {filters.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`
              flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium
              transition-all duration-200 flex-shrink-0
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
            <span className="hidden sm:inline">{label}</span>
            <span className={`
              px-1 sm:px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold
              ${filter === key ? 'bg-white/20' : 'bg-white/10'}
            `}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

export default FilterBar;
