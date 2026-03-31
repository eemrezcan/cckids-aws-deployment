"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Img = { url: string; alt?: string | null };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function GalleryAdaptiveImage({
  src,
  alt,
  className,
  portraitClass = "object-contain bg-black/10",
  landscapeClass = "object-cover",
  onClick,
}: {
  src: string;
  alt: string;
  className: string;
  portraitClass?: string;
  landscapeClass?: string;
  onClick?: (e: MouseEvent<HTMLImageElement>) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isMeasured, setIsMeasured] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const detectOrientation = useCallback((img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
    setIsMeasured(true);
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    setIsMeasured(false);

    if (img.complete) {
      detectOrientation(img);
      return;
    }

    const onLoad = () => detectOrientation(img);
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [src, detectOrientation]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={(e) => detectOrientation(e.currentTarget)}
      onClick={onClick}
      className={cn(
        className,
        isPortrait ? portraitClass : landscapeClass,
        isMeasured ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[1.03] blur-sm",
        "transition-[opacity,transform,filter] duration-500 ease-out will-change-[opacity,transform,filter]"
      )}
    />
  );
}

export default function ProjectGallery({
  images,
  badges,
  title,
}: {
  images: Img[];
  badges?: Array<{ text: string; tone?: "pink" | "white" }>;
  title: string;
}) {
  const { t } = useLanguage();
  const safeImages = useMemo(() => images.filter((x) => !!x?.url), [images]);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = safeImages.length;
  const activeImg = safeImages[active]?.url ?? "";

  function open(i: number) {
    if (!total) return;
    setActive(Math.max(0, Math.min(i, total - 1)));
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }

  function close() {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }

  function next() {
    if (!total) return;
    setActive((x) => (x + 1) % total);
  }

  function prev() {
    if (!total) return;
    setActive((x) => (x - 1 + total) % total);
  }

  // keyboard navigation (lightbox)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, total]);

  const side1 = safeImages[1]?.url ?? "";
  const side2 = safeImages[2]?.url ?? "";

  return (
    <section className="pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main + side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-start">
          {/* Main */}
          <div
            className="lg:col-span-2 relative rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer animate-slide-right"
            onClick={() => open(active)}
            role="button"
            tabIndex={0}
          >
            {activeImg ? (
              <GalleryAdaptiveImage
                src={activeImg}
                alt={safeImages[active]?.alt ?? title}
                className="w-full h-[420px] sm:h-[500px] group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-[420px] sm:h-[500px] bg-gradient-to-br from-cc-pink/10 via-cc-purple/10 to-cc-cyan/10" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {(badges ?? []).map((b, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "px-4 py-2 rounded-full font-display font-bold text-sm",
                      b.tone === "white"
                        ? "bg-white/90 text-cc-text"
                        : "bg-cc-pink text-white"
                    )}
                  >
                    {b.text}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {title}
              </h1>
            </div>

            <div className="absolute top-6 right-6 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open(active);
                }}
                className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all shadow-lg"
                aria-label={t("productDetail.aria.zoom", "Büyüt")}
                title={t("productDetail.aria.zoom", "Büyüt")}
              >
                ⤢
              </button>
            </div>
          </div>

          {/* Side images */}
          <div className="grid grid-rows-2 gap-4 self-start">
            <div
              className="relative rounded-[1.5rem] overflow-hidden shadow-xl group cursor-pointer animate-slide-left"
              style={{ animationDelay: "0.1s" }}
              onClick={() => (side1 ? open(1) : undefined)}
              role="button"
              tabIndex={0}
            >
              {side1 ? (
                <GalleryAdaptiveImage
                  src={side1}
                  alt={t("productDetail.aria.image", "Görsel {index}").replace("{index}", "2")}
                  className="w-full h-[180px] sm:h-[220px] lg:h-[242px] group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-[180px] sm:h-[220px] lg:h-[242px] bg-gradient-to-br from-cc-cyan/10 to-cc-purple/10" />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>

            <div
              className="relative rounded-[1.5rem] overflow-hidden shadow-xl group cursor-pointer animate-slide-left"
              style={{ animationDelay: "0.2s" }}
              onClick={() => (side2 ? open(2) : undefined)}
              role="button"
              tabIndex={0}
            >
              {side2 ? (
                <GalleryAdaptiveImage
                  src={side2}
                  alt={t("productDetail.aria.image", "Görsel {index}").replace("{index}", "3")}
                  className="w-full h-[180px] sm:h-[220px] lg:h-[242px] group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-[180px] sm:h-[220px] lg:h-[242px] bg-gradient-to-br from-cc-orange/10 to-cc-pink/10" />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              {total > 3 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-display font-bold text-lg">
                    +{total - 3} {t("projectsPage.photos", "Fotoğraf")}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Thumbs */}
        {total > 1 ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {safeImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "gallery-thumb flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                  i === active
                    ? "border-cc-pink shadow-[0_0_0_3px_rgba(233,30,99,0.3)]"
                    : "border-transparent hover:border-cc-pink"
                )}
                aria-label={t("productDetail.aria.image", "Görsel {index}").replace("{index}", String(i + 1))}
              >
                <GalleryAdaptiveImage src={img.url} alt={`Thumb ${i + 1}`} className="w-full h-full" />
              </button>
            ))}
          </div>
        ) : null}

        {/* Lightbox */}
        <div
          className={cn(
            "fixed inset-0 bg-black/95 z-[100] items-center justify-center p-4",
            lightboxOpen ? "flex" : "hidden"
          )}
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            aria-label={t("common.close", "Kapat")}
          >
            ✕
          </button>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={t("hero.previous", "Önceki")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={t("hero.next", "Sonraki")}
              >
                ›
              </button>
            </>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImg}
            alt={t("productDetail.largeImage", "Büyük Görsel")}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {total ? `${active + 1} / ${total}` : ""}
          </div>
        </div>
      </div>
    </section>
  );
}

