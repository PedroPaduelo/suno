'use client';

import { useState, useCallback } from 'react';
import Chat from './components/Chat';
import ManualForm from './components/ManualForm';
import MusicList from './components/MusicList';

type TabType = 'chat' | 'manual';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  const handleMusicGenerated = useCallback(() => {
    // Trigger a refresh of the music list
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 p-4">
      {/* Left Section - Chat/Manual with Tabs */}
      <div className="lg:w-1/2 h-full min-h-[400px] flex flex-col">
        {/* Tabs */}
        <div className="flex mb-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-tl-lg rounded-tr-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chat IA
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-tl-lg rounded-tr-lg transition-all ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manual
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'chat' ? (
            <Chat onMusicGenerated={handleMusicGenerated} />
          ) : (
            <ManualForm onMusicGenerated={handleMusicGenerated} />
          )}
        </div>
      </div>

      {/* Music List Section - Right */}
      <div className="lg:w-1/2 h-full min-h-[400px] bg-gray-50 rounded-lg shadow-lg overflow-hidden">
        <MusicList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
