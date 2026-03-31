// /components/Hero.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type ProjectImage = {
  imageUrl: string;
  title?: string | null;
  projectUuid?: string | null;
  linkUrl?: string | null;
};

function projectHref(item?: ProjectImage | null) {
  if (!item) return '/projects';
  if (item.linkUrl) return item.linkUrl;
  if (item.projectUuid) return `/projects/${item.projectUuid}`;
  return '/projects';
}

export default function Hero({ projectImages }: { projectImages: ProjectImage[] }) {
  const { t } = useLanguage();
  const slides = useMemo(
    () => (projectImages || []).filter((x) => x && typeof x.imageUrl === 'string' && x.imageUrl.trim() !== ''),
    [projectImages],
  );
  const totalSlides = slides.length;

  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const goToSlide = (idx: number) => {
    if (totalSlides === 0) return;
    const next = ((idx % totalSlides) + totalSlides) % totalSlides;
    setCurrentSlide(next);
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  const resetAutoSlide = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide((s) => (totalSlides ? (s + 1) % totalSlides : 0));
    }, 5000);
  };

  useEffect(() => {
    if (totalSlides <= 1) return;
    resetAutoSlide();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    resetAutoSlide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, totalSlides]);

  const activeSlide = totalSlides > 0 ? slides[currentSlide] : null;

  return (
    <section className="relative overflow-hidden bg-[#f8f5ee] px-4 pb-20 pt-24">
      <div className="pointer-events-none absolute -left-10 top-4 h-14 w-14 rounded-full bg-[#f4b8c4]/40" />
      <div className="pointer-events-none absolute right-8 top-6 h-10 w-10 rounded-full bg-[#f8d6a1]/50" />
      <div className="pointer-events-none absolute bottom-16 right-24 h-24 w-24 rounded-full bg-[#c7e9f2]/45" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-7 w-7 rounded-full bg-[#f8e8a5]/70" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,530px)_1fr]">
          <div className="relative">
            <div className="absolute inset-0 translate-y-3 rounded-[2.3rem] bg-gradient-to-r from-cc-cyan to-cc-purple shadow-lg" />
            <div className="absolute inset-0 -rotate-2 rounded-[2.3rem] bg-gradient-to-r from-cc-yellow to-cc-orange shadow-lg" />

            <div className="relative rounded-[2.2rem] border-4 border-white bg-white p-4 shadow-2xl">
              <div className="absolute -top-4 left-4 z-20 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cc-orange to-yellow-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                <Star size={14} fill="currentColor" />
                {t('home.hero.star', 'Haftanın Yıldızı')}
              </div>

              <div className="relative min-h-[360px] overflow-hidden rounded-[1.6rem] bg-[#f4f4f4]">
                {totalSlides === 0 ? (
                  <div className="flex h-[360px] items-center justify-center px-8 text-center text-gray-400">
                    {t('hero.loadingProjects', 'Proje görselleri yükleniyor…')}
                  </div>
                ) : (
                  slides.map((slide, idx) => {
                    const active = idx === currentSlide;
                    return (
                      <div
                        key={`${slide.imageUrl}-${idx}`}
                        className={`absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                      >
                        <Link href={projectHref(slide)} className="group block h-full w-full">
                          <Image
                            src={slide.imageUrl}
                            alt={slide.title ?? t('hero.project', 'Proje')}
                            fill
                            sizes="(max-width: 1024px) 100vw, 520px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority={idx === 0}
                          />
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-3 pb-2 pt-5 text-center">
                <h2 className="font-display text-2xl font-bold text-cc-text">
                  {activeSlide?.title || t('hero.completedProjectCount', 'Tamamlanan Proje')}
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
                  <span className="text-green-600">{t('home.hero.inStock', 'Stokta')}</span>
                </div>
              </div>
            </div>

            {totalSlides > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="hidden md:flex absolute left-0 top-1/2 z-30 h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#6c6a67] text-white transition-colors hover:bg-cc-pink"
                  aria-label={t('hero.previous', 'Önceki')}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="hidden md:flex absolute right-0 top-1/2 z-30 h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#6c6a67] text-white transition-colors hover:bg-cc-pink"
                  aria-label={t('hero.next', 'Sonraki')}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            ) : null}

            {totalSlides > 1 ? (
              <div className="relative z-30 mt-5 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-md backdrop-blur">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    className={`h-3 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-9 bg-cc-pink' : 'w-3 bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`${t('hero.slide', 'Slayt')} ${i + 1}`}
                  />
                ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative z-10 max-w-xl space-y-7 text-center lg:text-left">
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-cc-purple md:text-6xl">
              {t('hero.title', 'Renkli Dünyalar Yaratıyoruz!')}
            </h1>

            <p className="text-lg leading-relaxed text-gray-600 md:text-2xl">
              {t('hero.subtitle', 'Çocuklarınızın hayal gücünü besleyen, güvenli ve eğlenceli kreş mobilyaları ile tanışın.')}
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cc-pink to-cc-orange px-10 py-4 text-lg font-bold text-white shadow-[0_10px_28px_rgba(233,30,99,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(233,30,99,0.45)]"
              >
                {t('hero.contactNow', 'Hemen İletişime Geç')}
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border-2 border-cc-purple/25 bg-white px-10 py-4 text-lg font-bold text-cc-purple transition-all duration-300 hover:-translate-y-0.5 hover:border-cc-purple hover:bg-purple-50"
              >
                {t('hero.exploreProducts', 'Ürünleri İncele')}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
