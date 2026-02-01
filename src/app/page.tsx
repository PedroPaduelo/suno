'use client';

import { useState, useCallback } from 'react';
import CanvasVisualizer from './components/CanvasVisualizer';
import FloatingDock, { ViewMode } from './components/FloatingDock';
import PlayerBar from './components/PlayerBar';
import StudioView from './components/StudioView';
import DJDeckView from './components/DJDeckView';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('studio');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMusicGenerated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <>
      {/* Canvas Layer (z-0) - Animated particles background */}
      <CanvasVisualizer />

      {/* Atmosphere Layer (z-10) - Gradient fades */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Content Layer (z-20) - Current view */}
      <div className="relative z-20">
        {viewMode === 'studio' ? (
          <StudioView refreshTrigger={refreshTrigger} />
        ) : (
          <DJDeckView />
        )}
      </div>

      {/* Player Bar (z-40) - Persistent player */}
      <PlayerBar />

      {/* Navigation Dock (z-50) - Floating navigation */}
      <FloatingDock currentView={viewMode} onViewChange={setViewMode} />
    </>
  );
}
