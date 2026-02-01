'use client';

import { Sparkles, Disc } from 'lucide-react';

export type ViewMode = 'studio' | 'dj';

interface FloatingDockProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function FloatingDock({ currentView, onViewChange }: FloatingDockProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-2 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
        <button
          onClick={() => onViewChange('studio')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm
            transition-all duration-300
            ${currentView === 'studio'
              ? 'bg-white text-black shadow-lg shadow-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          <span>STUDIO</span>
        </button>

        <button
          onClick={() => onViewChange('dj')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm
            transition-all duration-300
            ${currentView === 'dj'
              ? 'bg-white text-black shadow-lg shadow-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <Disc className="w-4 h-4" />
          <span>DECK</span>
        </button>
      </div>
    </div>
  );
}
