'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Logo size="sm" showText={false} />
              <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm">
                  <span className="text-slate-500">© {currentYear}</span>
                  {' '}
                  <span className="text-gradient-primary font-semibold">nommand</span>
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Powered by <span className="text-primary">AETHER</span> AI
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/docs"
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
              >
                API Docs
              </Link>
              <a
                href="https://github.com/gcui-art/suno-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
              >
                GitHub
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/gcui-art/suno-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-slate-600 text-xs">
              Made with <span className="text-pink-500">♥</span> for music creators worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
