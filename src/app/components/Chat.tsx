'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Plus } from 'lucide-react';
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-white">AI Composer</h2>
              <p className="text-xs text-slate-500">Powered by AETHER</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                       text-slate-400 hover:text-white hover:bg-white/5
                       transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
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
