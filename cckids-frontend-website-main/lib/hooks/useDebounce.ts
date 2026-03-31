// lib/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

/**
 * Basit debounce hook.
 * Örn: const q = useDebounce(searchTerm, 400)
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
