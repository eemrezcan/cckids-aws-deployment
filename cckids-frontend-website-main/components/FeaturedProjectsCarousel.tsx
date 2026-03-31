// components/FeaturedProjectsCarousel.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type ProjectImage = {
  imageUrl: string;
  title?: string | null;
  projectUuid?: string | null;
};

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function FeaturedProjectsCarousel({ items }: { items: ProjectImage[] }) {
  const router = useRouter();
  const { t } = useLanguage();

  const slides = useMemo(() => {
    const clean = (items ?? []).filter((x) => x?.imageUrl);
    // 1 ana + 4 yan = 5 görsel / slide
    const groups = chunk(clean, 5);

    // hiç görsel yoksa boş slide
    if (groups.length === 0) return [[] as ProjectImage[]];
    return groups;
  }, [items]);

  const totalSlides = slides.length;
  const [current, setCurrent] = useState(0);

  const goTo = (idx: number) => setCurrent((idx + totalSlides) % totalSlides);
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  // Auto slide
  useEffect(() => {
    if (totalSlides <= 1) return;
    const t = setInterval(() => next(), 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, totalSlides]);

  const active = slides[current] ?? [];
  const main = active[0];
  const side = active.slice(1, 5);

  const openProject = (uuid?: string | null) => {
    if (!uuid) return;
    router.push(`/projects/${uuid}`);
  };

  return (
    <div className="relative">
      {/* Decorative Borders */}
      <div className="absolute inset-0 bg-gradient-to-r from-cc-yellow to-cc-orange rounded-[3rem] rotate-1 translate-y-2 opacity-100 shadow-xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-cc-cyan to-cc-purple rounded-[3rem] -rotate-1 translate-y-1 opacity-100 shadow-lg -z-10" />

      {/* Main Carousel Card */}
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 border-4 border-white z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cc-orange to-yellow-400 text-white px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-md mb-2">
              <Star size={16} fill="currentColor" />
              {t('projectsPage.completed', 'Tamamlanan Projeler')}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-cc-text">
              {t('hero.happySpaces', 'Mutlu Kreşler, Renkli Alanlar')} <span className="inline-block animate-wiggle">🏫</span>
            </h2>
          </div>

          <button
            onClick={() => router.push('/projects')}
            className="inline-flex items-center gap-2 text-cc-pink font-bold hover:gap-3 transition-all"
          >
            {t('hero.allProjects', 'Tüm Projeler')} <span>→</span>
          </button>
        </div>

        {/* Slides area */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gray-50 min-h-[500px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* Main image */}
            <div
              className="relative h-[300px] lg:h-[450px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => openProject(main?.projectUuid)}
              role="button"
              tabIndex={0}
            >
              {main?.imageUrl ? (
                <>
                  <Image
                    src={main.imageUrl}
                    alt={main.title ?? t('projectsPage.project', 'Proje')}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                      {main.title || t('projectsPage.featuredProject', 'Öne Çıkan Proje')}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base">
                      {t('projectsPage.clickForDetails', 'Detaylar için projeye tıklayın')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {t('hero.loadingProjects', 'Proje görselleri yükleniyor…')}
                </div>
              )}
            </div>

            {/* Side images */}
            <div className="grid grid-cols-2 gap-4">
              {side.map((img, idx) => (
                <div
                  key={`${img.imageUrl}-${idx}`}
                  className="relative h-[140px] lg:h-[215px] rounded-xl overflow-hidden group cursor-pointer"
                  onClick={() => openProject(img.projectUuid)}
                  role="button"
                  tabIndex={0}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.title ?? t('projectsPage.project', 'Proje')}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}

              {/* Eğer 4 yan görsel yoksa boş placeholder */}
              {Array.from({ length: Math.max(0, 4 - side.length) }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="relative h-[140px] lg:h-[215px] rounded-xl overflow-hidden bg-white/60 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm"
                >
                  {t('productList.imageMissing', 'Görsel yok')}
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all duration-300 z-10"
                aria-label={t('hero.previous', 'Önceki')}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all duration-300 z-10"
                aria-label={t('hero.next', 'Sonraki')}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-3 h-3 rounded-full bg-gray-300 transition-all duration-300 ${
                  i === current ? 'bg-cc-pink scale-125' : ''
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Stats Bar (index.html’deki gibi statik) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-cc-pink">500+</p>
            <p className="text-gray-500 text-sm">{t('projectsPage.completed', 'Tamamlanan Proje')}</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-cc-cyan">81</p>
            <p className="text-gray-500 text-sm">{t('projectsPage.cities', "İl'de Hizmet")}</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-cc-orange">50K+</p>
            <p className="text-gray-500 text-sm">{t('about.happyChildren', 'Mutlu Çocuk')}</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-cc-purple">15+</p>
            <p className="text-gray-500 text-sm">{t('about.experience', 'Yıllık Tecrübe')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
