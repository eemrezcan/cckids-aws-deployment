// components/projects/ProjectsSearchInput.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProjectsSearchInput({
  placeholder,
  className = "",
  debounceMs = 0,
}: {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const pathname = usePathname();
  const sp = useSearchParams();

  const spString = sp.toString();
  const initialQ = sp.get("q") ?? "";

  const [value, setValue] = useState(initialQ);

  // back/forward veya dış navigasyonlarda input'u sync tut
  useEffect(() => {
    setValue(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(spString);
      const trimmed = value.trim();

      // aramada sayfayı 1'e resetle (page paramını kaldır)
      params.delete("page");

      if (!trimmed) params.delete("q");
      else params.set("q", trimmed);

      const qs = params.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      const currentUrl = spString ? `${pathname}?${spString}` : pathname;

      // aynı URL'ye tekrar replace etmeyelim (loop önler)
      if (nextUrl !== currentUrl) {
        router.replace(nextUrl, { scroll: false });
      }
    }, debounceMs);

    return () => window.clearTimeout(t);
  }, [value, debounceMs, pathname, router, spString]);

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>

      <input
        suppressHydrationWarning
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? t("projects.searchPlaceholder", "Proje ara...")}
        className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-full shadow-sm outline-none focus:ring-4 focus:ring-[#E91E63]/20 focus:border-[#E91E63] transition-all text-gray-600 placeholder-gray-400"
      />

      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          aria-label={t("projects.clearSearch", "Aramayı temizle")}
          title={t("projects.clear", "Temizle")}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
