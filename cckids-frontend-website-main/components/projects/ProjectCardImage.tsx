"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ProjectCardImage({ src, alt }: { src: string; alt: string }) {
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
      onLoad={(e) => {
        detectOrientation(e.currentTarget);
      }}
      className={`w-full h-full group-hover:scale-110 transition-[transform,opacity] duration-700 ${
        isPortrait ? "object-contain bg-black/10" : "object-cover"
      } ${
        isMeasured ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
