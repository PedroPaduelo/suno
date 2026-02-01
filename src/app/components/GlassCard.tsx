'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        glass-liquid rounded-3xl
        ${paddingClasses[padding]}
        ${hover ? 'glass-liquid-hover transition-all duration-300 hover:shadow-lg hover:shadow-primary/10' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
