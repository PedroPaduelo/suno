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
            'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
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
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎵</span>
          <h2 className="font-semibold">Assistente de Musica IA</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors backdrop-blur"
          >
            Nova Conversa
          </button>
        )}
      </div>
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
