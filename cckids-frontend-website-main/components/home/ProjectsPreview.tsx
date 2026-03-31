// components/home/ProjectsPreview.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * ProjectsPreview:
 * - index.html’deki carousel mantığı (auto slide + dots + ok tuşları)
 * - API’den gelen görselleri 5’li “slide” paketlerine böler:
 *   1 ana + 4 küçük
 */
export default function ProjectsPreview({
  title,
  items,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  items: Array<{ imageUrl: string; title?: string; projectUuid?: string | null }>;
  ctaHref: string;
  ctaLabel: string;
}) {
  const { t } = useLanguage();
  const slides = useMemo(() => {
    const chunkSize = 5;
    const out: typeof items[] = [];
    for (let i = 0; i < items.length; i += chunkSize) out.push(items.slice(i, i + chunkSize));
    return out.filter((x) => x.length > 0);
  }, [items]);

  const total = slides.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (total <= 1) return;

    const interval = setInterval(() => {
      setIndex((v) => (v + 1) % total);
    }, 5000);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((v) => (v + 1) % total);
      if (e.key === 'ArrowLeft') setIndex((v) => (v - 1 + total) % total);
    };

    document.addEventListener('keydown', onKey);
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', onKey);
    };
  }, [total]);

  if (total === 0) return null;

  const slide = slides[index];
  const main = slide[0];
  const side = slide.slice(1);

  const mainHref = main?.projectUuid ? `/projects/${main.projectUuid}` : ctaHref;

  return (
    <section className="relative pb-20 px-4 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto">
        <div className="w-full relative">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cc-pink/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cc-cyan/20 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cc-yellow to-cc-orange rounded-[3rem] rotate-1 translate-y-2 opacity-100 shadow-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-cc-cyan to-cc-purple rounded-[3rem] -rotate-1 translate-y-1 opacity-100 shadow-lg -z-10" />

            <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 border-4 border-white z-10">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cc-orange to-yellow-400 text-white px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-md mb-2">
                    <Star size={16} fill="currentColor" />
                    {t('projectsPage.completed', 'Tamamlanan Projeler')}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-cc-text">{title}</h2>
                </div>

                <Link href={ctaHref} className="inline-flex items-center gap-2 text-cc-pink font-bold hover:gap-3 transition-all">
                  {ctaLabel} <ArrowRight size={20} />
                </Link>
              </div>

              {/* Slide */}
              <div className="relative overflow-hidden rounded-[2rem] bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
                  {/* Main */}
                  <Link href={mainHref} className="relative h-[300px] lg:h-[450px] rounded-2xl overflow-hidden group cursor-pointer">
                    <Image
                      src={main.imageUrl}
                      alt={main.title || t('projectsPage.project', 'Proje')}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 680px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                        {main.title || t('projectsPage.project', 'Proje')}
                      </h3>
                      <p className="text-white/80 text-sm md:text-base">{t('projectsPage.clickForDetails', 'Detayları görmek için tıklayın')}</p>
                    </div>
                  </Link>

                  {/* Side */}
                  <div className="grid grid-cols-2 gap-4">
                    {side.map((s, i) => (
                      <div key={`${s.imageUrl}-${i}`} className="relative h-[140px] lg:h-[215px] rounded-xl overflow-hidden group">
                        <Image
                          src={s.imageUrl}
                          alt={s.title || t('projectsPage.projectImage', 'Proje görseli')}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 1024px) 50vw, 320px"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                {total > 1 ? (
                  <>
                    <button
                      onClick={() => setIndex((v) => (v - 1 + total) % total)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all duration-300 z-10"
                      aria-label={t('hero.previous', 'Önceki')}
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      onClick={() => setIndex((v) => (v + 1) % total)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all duration-300 z-10"
                      aria-label={t('hero.next', 'Sonraki')}
                    >
                      <ChevronRight />
                    </button>
                  </>
                ) : null}
              </div>

              {/* Dots */}
              {total > 1 ? (
                <div className="flex justify-center gap-3 mt-6">
                  {Array.from({ length: total }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={[
                        'w-3 h-3 rounded-full bg-gray-300 transition-all duration-300',
                        i === index ? 'bg-cc-pink scale-125' : '',
                      ].join(' ')}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              ) : null}

              {/* Stats */}
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

          <div className="hidden md:block absolute top-10 right-[5%] text-7xl animate-float opacity-40 rotate-12 -z-10">🎨</div>
          <div className="hidden md:block absolute bottom-20 left-[5%] text-5xl text-cc-cyan animate-wiggle -z-10 opacity-60">🚀</div>
        </div>
      </div>
    </section>
  );
}
