'use client';

import { useEffect, useRef } from 'react';
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
        <div className="text-center max-w-md animate-fade-in">
          {/* Animated icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gradient-primary">
            Welcome to AETHER
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Describe the music you want to create, and I&apos;ll help you bring it to life with AI.
          </p>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Try saying:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Create an upbeat pop song',
                'Jazz melody with piano',
                'Chill lo-fi beat',
                'Epic orchestral music',
              ].map((suggestion) => (
                <span
                  key={suggestion}
                  className="px-3 py-1.5 rounded-full text-xs text-slate-400 bg-surface-elevated border border-white/5
                           hover:border-primary/30 hover:text-primary transition-all duration-200 cursor-default"
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex gap-3 max-w-[85%]">
            {/* Avatar for assistant */}
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`
                rounded-2xl px-4 py-3
                ${message.role === 'user'
                  ? 'bg-gradient-to-r from-primary to-pink-500 text-white rounded-br-md'
                  : 'glass text-slate-200 rounded-bl-md'
                }
              `}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none
                              prose-p:text-slate-200 prose-p:leading-relaxed
                              prose-headings:text-white prose-headings:font-semibold
                              prose-strong:text-white prose-code:text-accent
                              prose-code:bg-surface-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  <Markdown>{message.content}</Markdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {/* Avatar for user */}
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start animate-fade-in">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 animate-pulse">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <div className="glass rounded-2xl rounded-bl-md px-5 py-4">
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
