'use client';

import { useState, useCallback } from 'react';
import Chat from './components/Chat';
import MusicList from './components/MusicList';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMusicGenerated = useCallback(() => {
    // Trigger a refresh of the music list
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 p-4">
      {/* Chat Section - Left */}
      <div className="lg:w-1/2 h-full min-h-[400px]">
        <Chat onMusicGenerated={handleMusicGenerated} />
      </div>

      {/* Music List Section - Right */}
      <div className="lg:w-1/2 h-full min-h-[400px] bg-gray-50 rounded-lg shadow-lg overflow-hidden">
        <MusicList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
