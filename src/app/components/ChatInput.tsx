'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Mic, Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="p-4 border-t border-white/5">
      <div className={`
        relative flex items-end gap-2 p-2 rounded-2xl transition-all duration-300
        ${isFocused
          ? 'bg-white/5 border border-primary/30'
          : 'bg-white/[0.02] border border-white/5'
        }
      `}>
        {/* Mic button */}
        <button
          type="button"
          disabled={disabled}
          className="p-2 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10
                   disabled:opacity-50 transition-all duration-200"
          aria-label="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe the music you want to create..."
            disabled={disabled}
            className="w-full resize-none bg-transparent text-white placeholder-slate-500
                     px-2 py-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                     min-h-[40px] max-h-[120px] text-sm"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`
            p-2.5 rounded-xl transition-all duration-200
            ${disabled || !message.trim()
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-primary to-pink-500 hover:shadow-glow-primary hover:scale-105'
            }
          `}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[10px] text-slate-600 mt-2">
        <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-500 font-mono">Enter</kbd>
        {' '}to send • {' '}
        <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-500 font-mono">Shift+Enter</kbd>
        {' '}for new line
      </p>
    </div>
  );
}
