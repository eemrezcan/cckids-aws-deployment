// components/projects/ProjectsPagination.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ProjectsPagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const totalPages = useMemo(() => {
    if (!total || total <= 0) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function go(nextPage: number) {
    const next = clamp(nextPage, 1, totalPages);
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => go(page - 1)}
        disabled={!canPrev}
        className="px-5 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:border-cc-pink hover:text-cc-pink transition-all"
      >
        {t("productsPage.previous", "← Önceki")}
      </button>

      <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold">
        {page} / {totalPages}
      </div>

      <button
        onClick={() => go(page + 1)}
        disabled={!canNext}
        className="px-5 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:border-cc-pink hover:text-cc-pink transition-all"
      >
        {t("productsPage.next", "Sonraki →")}
      </button>
    </div>
  );
}
