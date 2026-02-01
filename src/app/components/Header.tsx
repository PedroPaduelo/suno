'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './Logo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/docs', label: 'API Docs' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphic background */}
      <nav className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Logo size="sm" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300
                           hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              {/* GitHub Link */}
              <a
                href="https://github.com/gcui-art/suno-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300
                         hover:text-white hover:bg-white/5 transition-all duration-200 ml-2"
              >
                <Image
                  src="/github-mark.png"
                  alt="GitHub"
                  width={18}
                  height={18}
                  className="invert opacity-80"
                />
                <span>GitHub</span>
              </a>

              {/* CTA Button */}
              <Link
                href="/"
                className="ml-4 px-5 py-2 rounded-xl text-sm font-medium text-white
                         bg-gradient-to-r from-primary to-pink-500
                         hover:shadow-glow-primary hover:scale-[1.02]
                         active:scale-[0.98] transition-all duration-200"
              >
                Create Music
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              <a
                href="https://github.com/gcui-art/suno-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Image
                  src="/github-mark.png"
                  alt="GitHub"
                  width={18}
                  height={18}
                  className="invert opacity-80"
                />
                <span>GitHub</span>
              </a>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-xl text-sm font-medium text-white
                         bg-gradient-to-r from-primary to-pink-500 mt-4"
              >
                Create Music
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
