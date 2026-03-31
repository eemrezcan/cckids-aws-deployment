// components/shared/Badge.tsx
import React from 'react';

/**
 * Badge: küçük etiket/badge bileşeni.
 * - variant ile renk tonu değişebilir
 */
export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold font-display shadow-sm border';

  const variants: Record<string, string> = {
    default: 'bg-white/80 text-cc-text border-white/40',
    success: 'bg-cc-lime/20 text-cc-text border-cc-lime/40',
    warning: 'bg-cc-yellow/25 text-cc-text border-cc-yellow/50',
    info: 'bg-cc-cyan/20 text-cc-text border-cc-cyan/40',
  };

  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}
