'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

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
    <div className="border-t border-white/5 p-4 bg-surface/50">
      <div className={`
        relative flex gap-3 p-1 rounded-2xl border transition-all duration-300
        ${isFocused
          ? 'border-primary/50 bg-surface-elevated shadow-glow-primary/20'
          : 'border-white/10 bg-surface-elevated/50'
        }
      `}>
        {/* Textarea container */}
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
            className="w-full resize-none bg-transparent text-slate-100 placeholder-slate-500
                     px-4 py-3 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                     min-h-[48px] max-h-[120px]"
            rows={1}
          />

          {/* Quick action hints */}
          {!message && !disabled && (
            <div className="absolute bottom-3 left-4 flex items-center gap-2 pointer-events-none">
              <span className="text-xs text-slate-600">Try:</span>
              <span className="text-xs text-slate-500">&quot;Create an upbeat pop song about summer&quot;</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-end gap-2 pr-2 pb-2">
          {/* Attachment button (decorative for now) */}
          <button
            type="button"
            disabled={disabled}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Attach file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={`
              relative px-5 py-2.5 rounded-xl font-medium text-white
              transition-all duration-200 flex items-center gap-2
              ${disabled || !message.trim()
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-pink-500 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {disabled ? (
              <>
                {/* Loading spinner */}
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-slate-600 mt-2">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated text-slate-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated text-slate-400 font-mono text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
