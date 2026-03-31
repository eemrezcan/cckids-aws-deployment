// components/products/ProductsCategoryTabsAndSearch.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CategoryPublicOut } from "@/lib/api/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Products list page için:
 * - Kategori tab'leri (pill UI)
 * - Debounce arama (Enter'sız)
 * URL'yi günceller: ?category=...&q=...&page=1&page_size=...
 *
 * Not:
 * - Aramada scroll-to-top istemiyoruz => scroll:false
 * - Debounce aramada history şişmesin => replace
 */
export default function ProductsCategoryTabsAndSearch(props: {
  categories: CategoryPublicOut[];
  pageSize: number;
}) {
  const { categories, pageSize } = props;
  const { t } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const activeCategory = (sp.get("category") ?? "").trim();
  const activeQ = (sp.get("q") ?? "").trim();

  const [value, setValue] = useState(activeQ);

  // URL'den gelen q değişirse input'u syncle
  useEffect(() => {
    setValue(activeQ);
  }, [activeQ]);

  const tabs = useMemo(() => {
    // "Tümü" + kategori listesi
    return [
      { key: "all", label: t("common.all", "Tümü"), uuid: "" },
      ...categories.map((c) => ({ key: c.uuid, label: c.name, uuid: c.uuid })),
    ];
  }, [categories, t]);

  function navigateWithParams(next: URLSearchParams, opts?: { replace?: boolean }) {
    const qs = next.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;

    // ✅ scroll-to-top'u kapat
    if (opts?.replace) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }

  function buildNextParams(mutator: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(sp.toString());

    // sayfa boyutu korunur
    p.set("page_size", String(pageSize));

    // her filtre/arama değişiminde sayfa reset
    p.set("page", "1");

    mutator(p);
    return p;
  }

  // Debounce: yazdıkça q güncelle
  useEffect(() => {
    const t = setTimeout(() => {
      const next = buildNextParams((p) => {
        const trimmed = value.trim();
        if (!trimmed) p.delete("q");
        else p.set("q", trimmed);
      });

      // ✅ Debounce aramada history şişmesin + scroll-to-top olmasın
      navigateWithParams(next, { replace: true });
    }, 450);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pageSize, pathname]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      {/* Kategori Tab'leri (eski tab tasarımında) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const isActive = t.uuid ? activeCategory === t.uuid : !activeCategory;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                const next = buildNextParams((p) => {
                  if (!t.uuid) p.delete("category");
                  else p.set("category", t.uuid);
                });

                // ✅ kullanıcı aksiyonu => push + scroll:false
                navigateWithParams(next);
              }}
              className={[
                "px-5 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 border-2",
                isActive
                  ? "bg-cc-cyan border-cc-cyan text-white shadow-lg"
                  : "bg-white border-gray-200 text-gray-500 hover:border-cc-cyan hover:text-cc-cyan",
              ].join(" ")}
              aria-pressed={isActive}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Arama (Enter'sız) */}
      <div className="relative w-full sm:w-72">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
          🔎
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("productList.searchPlaceholder", "Ürün ara...")}
          className="w-full pl-12 pr-6 py-3 bg-white border-2 border-gray-200 rounded-full shadow-sm outline-none focus:ring-4 focus:ring-cc-pink/20 focus:border-cc-pink transition-all text-gray-600 placeholder-gray-400"
        />
      </div>
    </div>
  );
}
