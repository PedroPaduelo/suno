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
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Left Section - Chat/Manual with Tabs */}
      <div className="lg:w-1/2 h-full min-h-[500px] lg:min-h-[600px] flex flex-col">
        {/* Tabs */}
        <div className="flex mb-4 gap-2 p-1 glass rounded-2xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-accent to-cyan-400 text-aether-bg shadow-glow-accent/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Chat
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-glow-primary/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manual
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 animate-fade-in">
          {activeTab === 'chat' ? (
            <Chat onMusicGenerated={handleMusicGenerated} />
          ) : (
            <ManualForm onMusicGenerated={handleMusicGenerated} />
          )}
        </div>
      </div>

      {/* Music List Section - Right */}
      <div className="lg:w-1/2 h-full min-h-[500px] lg:min-h-[600px]">
        <MusicList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
