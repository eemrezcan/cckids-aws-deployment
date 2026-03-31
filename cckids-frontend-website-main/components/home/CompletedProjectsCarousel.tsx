// components/home/CompletedProjectsCarousel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Item = {
  image_url: string;
  title?: string | null;
  link_url?: string | null; // sadece bunu kullanacağız
};

export default function CompletedProjectsCarousel({
  items,
  heading,
  subheading,
}: {
  items: Item[];
  heading?: string;
  subheading?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();



  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);

  // Drag vs Click ayırımı
  const pointerDownX = useRef<number | null>(null);
  const pointerDownY = useRef<number | null>(null);
  const dragged = useRef(false);

  const loopItems = useMemo(() => {
    if (!items?.length) return [];
    const safe = items.filter((x) => !!x?.image_url);
    const out = [...safe, ...safe];
    console.log("", out.length);
    return out;
  }, [items]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    if (!loopItems.length) return;

    const el = scrollerRef.current;

    let raf = 0;
    const speed = 0.6;

    const tick = () => {
      if (!paused) {
        el.scrollLeft += speed;

        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, loopItems.length]);

  const scrollBy = (delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerDownX.current = e.clientX;
    pointerDownY.current = e.clientY;
    dragged.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerDownX.current === null || pointerDownY.current === null) return;
    const dx = Math.abs(e.clientX - pointerDownX.current);
    const dy = Math.abs(e.clientY - pointerDownY.current);
    // 6px üstü drag sayalım
    if (dx > 6 || dy > 6) dragged.current = true;
  };

  const onPointerUp = () => {
    pointerDownX.current = null;
    pointerDownY.current = null;
  };

  const handleNavigate = (hrefRaw: string, meta: any) => {
    const href = (hrefRaw ?? "").trim();
    console.log("", {
      ...meta,
      href,
      dragged: dragged.current,
    });

    // drag ile tıklamayı iptal
    if (dragged.current) return;
    if (!href) return;

    // internal route ise router.push ile git
    if (href.startsWith("/")) {
      router.push(href);
      return;
    }

    // external ise normal yönlendir
    window.location.href = href;
  };

  if (!items?.length) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-2">
              {(heading ?? t("projectsPage.completed", "Tamamlanan Projeler"))} <span className="inline-block animate-wiggle">✨</span>
            </h2>
            <p className="text-gray-500">{subheading ?? t("home.completedProjects.subtitle", "Türkiye’nin dört bir yanından mutlu projeler")}</p>
          </div>

          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-420)}
              className="w-11 h-11 rounded-xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all flex items-center justify-center text-cc-text"
              aria-label={t("hero.previous", "Geri")}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollBy(420)}
              className="w-11 h-11 rounded-xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all flex items-center justify-center text-cc-text"
              aria-label={t("hero.next", "İleri")}
            >
              ›
            </button>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
          >
            {loopItems.map((it, idx) => {
              const href = (it.link_url ?? "").trim();

              // item debug
              console.log("", {
                idx,
                title: it.title,
                link_url: it.link_url,
                href,
              });

              return (
                <button
                  key={`${href || it.image_url}-${idx}`}
                  type="button"
                  className="text-left outline-none focus:ring-4 focus:ring-cc-pink/20 rounded-[2rem]"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onClick={() =>
                    handleNavigate(href, { idx, title: it.title, link_url: it.link_url })
                  }
                >
                  <div className="group relative flex-shrink-0 w-[260px] sm:w-[320px] md:w-[360px] h-[220px] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img
                      src={it.image_url}
                      alt={it.title ?? t("projectsPage.projectImage", "Proje görseli")}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute left-5 right-5 bottom-5">
                      <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-cc-text px-4 py-2 rounded-full text-sm font-bold shadow">
                        🏫 {it.title ?? t("projectsPage.project", "Proje")}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobil oklar */}
          <div className="md:hidden flex justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => scrollBy(-320)}
              className="px-6 py-3 rounded-full bg-white shadow-lg border border-gray-100 font-bold text-cc-text"
            >
              {t("hero.previous", "Geri")}
            </button>
            <button
              type="button"
              onClick={() => scrollBy(320)}
              className="px-6 py-3 rounded-full bg-cc-pink text-white shadow-lg font-bold"
            >
              {t("hero.next", "İleri")}
            </button>
          </div>

          <div className="mt-3 text-center text-xs text-gray-400">
            {t("home.completedProjects.hint", "Üzerine gelince durur • Parmağınla sürükleyebilirsin")}
          </div>
        </div>
      </div>
    </section>
  );
}
