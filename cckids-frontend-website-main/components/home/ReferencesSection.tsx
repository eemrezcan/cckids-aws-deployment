'use client';

import { useRef, type PointerEvent } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { buildMediaUrl } from '@/lib/utils/url';
import type { ReferenceLogoPublicOut } from '@/lib/api/types';

export default function ReferencesSection({
  items,
}: {
  items: ReferenceLogoPublicOut[];
}) {
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const normalized = (items || [])
    .map((r, idx) => ({
      key: r.uuid ?? r.id ?? idx,
      name: r.name ?? `Referans ${idx + 1}`,
      logo: buildMediaUrl(r.logo_url ?? null) ?? "",
      href: r.website_url ?? undefined,
    }))
    .filter((x) => Boolean(x.logo));

  if (normalized.length === 0) return null;
  const loopItems = normalized.length > 1 ? [...normalized, ...normalized] : normalized;
  const animateClass = normalized.length > 1 ? 'references-marquee-track' : '';

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = sliderRef.current.scrollLeft;
    sliderRef.current.setPointerCapture(e.pointerId);
    sliderRef.current.classList.add('references-dragging');
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    sliderRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = false;
    if (sliderRef.current.hasPointerCapture(e.pointerId)) {
      sliderRef.current.releasePointerCapture(e.pointerId);
    }
    sliderRef.current.classList.remove('references-dragging');
  };

  return (
    <section className="relative z-10 px-4 py-14">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text">
            {t('projectsPage.referencesTitle', 'Güvenilir Markalar Bizi Tercih Ediyor')}
          </h2>
          <p className="text-gray-500 text-lg">{t('projectsPage.referencesSubtitle', 'Birlikte çalıştığımız kurumlardan bazıları')}</p>
        </div>

        <div
          ref={sliderRef}
          className="overflow-x-auto no-scrollbar cursor-grab [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className={`flex w-max items-center gap-8 md:gap-14 ${animateClass}`}>
            {loopItems.map((r, i) => {
              const content = (
                <div className="flex h-24 w-24 min-w-24 items-center justify-center rounded-2xl bg-white/90 px-2 py-2 shadow-sm transition-all duration-300 hover:shadow-lg md:h-28 md:w-28 md:min-w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.logo}
                    alt={r.name}
                    draggable={false}
                    className="pointer-events-none select-none block h-full w-full max-h-full max-w-full object-contain"
                  />
                </div>
              );

              return r.href ? (
                <a
                  key={`${r.key}-${i}`}
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-100"
                  title={r.name}
                  aria-label={r.name}
                >
                  {content}
                </a>
              ) : (
                <div key={`${r.key}-${i}`} title={r.name} aria-label={r.name}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
