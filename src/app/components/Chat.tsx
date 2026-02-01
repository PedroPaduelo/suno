'use client';

import { useState, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatMessages, { Message } from './ChatMessages';

interface ChatProps {
  onMusicGenerated?: () => void;
}

export default function Chat({ onMusicGenerated }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            chatId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        if (data.chatId && !chatId) {
          setChatId(data.chatId);
        }

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.musicGenerated && onMusicGenerated) {
          onMusicGenerated();
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'Sorry, an error occurred while processing your message. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, onMusicGenerated]
  );

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20" />

        <div className="relative px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-aether-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-white">AI Music Assistant</h2>
              <p className="text-xs text-slate-400">Powered by AETHER</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       text-slate-300 bg-white/5 border border-white/10
                       hover:bg-white/10 hover:border-white/20 hover:text-white
                       active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Input area */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
