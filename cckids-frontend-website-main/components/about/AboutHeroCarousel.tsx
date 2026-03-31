"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AboutHeroCarousel({
  images,
  fallbackImage,
  alt,
}: {
  images: string[];
  fallbackImage: string;
  alt: string;
}) {
  const { t } = useLanguage();
  const slides = useMemo(() => {
    const filtered = (images ?? []).filter(Boolean);
    return filtered.length ? filtered : [fallbackImage];
  }, [images, fallbackImage]);

  const [active, setActive] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const currentOffsetRef = useRef(0);

  const slideCount = slides.length;

  useEffect(() => {
    if (slideCount <= 1 || isPaused || isDragging) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideCount, isPaused, isDragging]);

  function goNext() {
    setActive((prev) => (prev + 1) % slideCount);
  }

  function goPrev() {
    setActive((prev) => (prev - 1 + slideCount) % slideCount);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (slideCount <= 1) return;
    setIsDragging(true);
    setIsPaused(true);
    startXRef.current = e.clientX;
    currentOffsetRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const delta = e.clientX - startXRef.current;
    currentOffsetRef.current = delta;
    setDragOffsetPx(delta);
  }

  function onPointerEnd() {
    if (!isDragging) return;
    const width = containerRef.current?.clientWidth ?? 1;
    const threshold = width * 0.15;
    const delta = currentOffsetRef.current;

    if (delta <= -threshold) goNext();
    else if (delta >= threshold) goPrev();

    setDragOffsetPx(0);
    setIsDragging(false);
    setIsPaused(false);
    currentOffsetRef.current = 0;
  }

  const stepPercent = 100 / slideCount;
  const baseTranslate = -active * stepPercent;
  const dragTranslate = containerRef.current
    ? (dragOffsetPx / containerRef.current.clientWidth) * stepPercent
    : 0;
  const translateX = baseTranslate + dragTranslate;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] rounded-[2.3rem] overflow-hidden touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "h-full flex",
          isDragging ? "transition-none" : "transition-transform duration-500 ease-out",
        )}
        style={{ width: `${slideCount * 100}%`, transform: `translateX(${translateX}%)` }}
      >
        {slides.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="h-full shrink flex basis-full items justify-center bg-white"
            style={{ width: `${100 / slideCount}%` }}
          >
            <img
              src={src}
              alt={alt}
              loading={index === 0 ? "eager" : "lazy"}
              className="max-w-full max-h-full object-contain object-center"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {slideCount > 1 ? (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                active === index ? "bg-white" : "bg-white/45",
              )}
              aria-label={t("productDetail.aria.image", "Görsel {index}").replace("{index}", String(index + 1))}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
