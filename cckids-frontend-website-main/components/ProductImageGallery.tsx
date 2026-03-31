// components/ProductImageGallery.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type GalleryImage = {
  id: number;
  url: string;
  sortOrder: number;
};

export default function ProductImageGallery({ images }: { images: GalleryImage[] }) {
  const { t } = useLanguage();
  const sorted = useMemo(() => {
    return (images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const active = sorted[currentIndex];

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const changeImage = (index: number) => {
    if (!sorted.length) return;
    const safe = Math.max(0, Math.min(sorted.length - 1, index));
    setCurrentIndex(safe);
  };

  const nextImage = () => changeImage((currentIndex + 1) % sorted.length);
  const prevImage = () => changeImage((currentIndex - 1 + sorted.length) % sorted.length);

  const openLightbox = () => {
    if (!sorted.length) return;
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, currentIndex, sorted.length]);

  if (!sorted.length) {
    return (
      <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 flex items-center justify-center text-gray-300">
        {t('productList.imageMissing', 'Görsel yok')}
      </div>
    );
  }

  return (
    <div>
      {/* Main image card */}
      <div className="relative bg-white rounded-[2.5rem] p-4 shadow-xl mb-4 overflow-hidden group">
        {/* Badges (UI placeholder) */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          <span className="bg-gradient-to-r from-cc-orange to-cc-yellow text-white px-4 py-2 rounded-full font-display font-bold text-sm shadow-lg flex items-center gap-2">
            <Star size={16} fill="currentColor" />
            {t('productDetail.badge.featured', 'Öne Çıkan')}
          </span>
          <span className="bg-cc-lime text-white px-4 py-2 rounded-full font-display font-bold text-sm shadow-lg">
            {t('products.askStock', 'Stok Sor')}
          </span>
        </div>

        {/* Zoom button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={openLightbox}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all duration-300 shadow-lg"
            aria-label={t('productDetail.aria.zoom', 'Büyüt')}
          >
            <Maximize2 size={22} />
          </button>
        </div>

        {/* Main image */}
        <button
          type="button"
          onClick={openLightbox}
          className="w-full aspect-square rounded-[2rem] overflow-hidden bg-gray-50 cursor-zoom-in"
          aria-label={t('productDetail.aria.zoom', 'Büyüt')}
        >
          <img
            src={active.url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
        </button>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {sorted.map((img, i) => {
            const isActive = i === currentIndex;
            return (
              <button
                key={img.id}
                onClick={() => changeImage(i)}
                className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-[3px] transition-all duration-300 ${
                  isActive ? 'border-cc-pink shadow-[0_0_0_3px_rgba(233,30,99,0.2)]' : 'border-transparent hover:border-cc-pink'
                }`}
                aria-label={t('productDetail.aria.image', 'Görsel {index}').replace('{index}', String(i + 1))}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Lightbox */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label={t('common.close', 'Kapat')}
          >
            <X size={28} />
          </button>

          {sorted.length > 1 ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={t('hero.previous', 'Önceki')}
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={t('hero.next', 'Sonraki')}
              >
                <ChevronRight size={28} />
              </button>
            </>
          ) : null}

          <img
            src={active.url}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
