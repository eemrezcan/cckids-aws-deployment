// components/shared/Lightbox.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Lightbox:
 * - open/close state dışarıdan yönetilir
 * - ESC kapatır, oklar ile gezinir
 */
export type LightboxImage = { src: string; alt?: string };

export function Lightbox({
  open,
  images,
  index,
  onChangeIndex,
  onClose,
}: {
  open: boolean;
  images: LightboxImage[];
  index: number;
  onChangeIndex: (next: number) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChangeIndex((index - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onChangeIndex((index + 1) % images.length);
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, images.length, onClose, onChangeIndex]);

  if (!open || images.length === 0) return null;

  const current = images[index];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
        aria-label={t('common.close', 'Kapat')}
      >
        <X />
      </button>

      <button
        onClick={() => onChangeIndex((index - 1 + images.length) % images.length)}
        className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
        aria-label={t('hero.previous', 'Önceki')}
      >
        <ChevronLeft />
      </button>

      <div className="relative w-full max-w-5xl aspect-[16/10] rounded-3xl overflow-hidden bg-white/5 shadow-2xl">
        <Image
          src={current.src}
          alt={current.alt ?? t('productDetail.aria.image', 'Görsel {index}').replace('{index}', String(index + 1))}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 1000px"
          priority
        />
      </div>

      <button
        onClick={() => onChangeIndex((index + 1) % images.length)}
        className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
        aria-label={t('hero.next', 'Sonraki')}
      >
        <ChevronRight />
      </button>
    </div>
  );
}
