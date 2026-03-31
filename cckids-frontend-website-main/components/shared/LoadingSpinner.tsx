// components/shared/LoadingSpinner.tsx
/**
 * LoadingSpinner: basit yükleniyor animasyonu.
 * - Tailwind animate-spin kullanır, renk sınıfı override edilebilir.
 */
export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={[
        'inline-block h-8 w-8 rounded-full border-4 border-white/40 border-t-white animate-spin',
        className,
      ].join(' ')}
      role="status"
      aria-label="Loading"
    />
  );
}
