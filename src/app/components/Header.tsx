'use client';

import Link from 'next/link';
import Logo from './Logo';
import { Command, Wifi } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Status */}
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 glass-liquid rounded-full">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-medium">ONLINE</span>
            </div>

            {/* Command hint */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 glass-liquid rounded-full">
              <Command className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500 font-mono">AETHER OS</span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center border border-white/10">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
