'use client';

import { useEffect, useRef } from 'react';
import { Sparkles, User } from 'lucide-react';
import Markdown from 'react-markdown';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm animate-fade-in">
          {/* Animated icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-medium text-white mb-2">
            Create Something Amazing
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Describe the music you want and I&apos;ll bring it to life.
          </p>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Upbeat pop song',
              'Chill lo-fi',
              'Epic orchestral',
            ].map((suggestion) => (
              <span
                key={suggestion}
                className="px-3 py-1.5 rounded-full text-xs text-slate-400 bg-white/5 border border-white/5"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
        >
          <div className="flex gap-3 max-w-[85%]">
            {/* Avatar for assistant */}
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`
                rounded-2xl px-4 py-3
                ${message.role === 'user'
                  ? 'bg-gradient-to-r from-primary to-pink-500 text-white rounded-br-md'
                  : 'bg-white/5 border border-white/5 text-slate-200 rounded-bl-md'
                }
              `}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none
                              prose-p:text-slate-200 prose-p:leading-relaxed prose-p:text-sm
                              prose-headings:text-white prose-headings:font-semibold
                              prose-strong:text-white prose-code:text-cyan-400
                              prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  <Markdown>{message.content}</Markdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              )}
            </div>

            {/* Avatar for user */}
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start animate-fade-in">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex items-center gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
