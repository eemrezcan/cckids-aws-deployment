// components/projects/ProjectsFilterBar.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Cat = { uuid: string; name: string };

export default function ProjectsFilterBar({
  categories,
  activeCategoryUuid,
}: {
  categories: Cat[];
  activeCategoryUuid?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function setCategory(uuid?: string) {
    const params = new URLSearchParams(sp.toString());

    // kategori değişince sayfayı 1'e alalım
    params.set("page", "1");

    if (!uuid) params.delete("category_uuid");
    else params.set("category_uuid", uuid);

    router.push(`${pathname}?${params.toString()}`);
  }

  const btnBase =
    "px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 border-2";
  const btnActive = "bg-cc-pink border-cc-pink text-white shadow-lg";
  const btnPassive =
    "bg-white border-gray-200 text-gray-500 hover:border-cc-pink hover:text-cc-pink";

  return (
    <section className="py-4 px-4 sticky top-20 z-40 bg-cc-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full pb-2">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`${btnBase} ${!activeCategoryUuid ? btnActive : btnPassive}`}
          >
            {t("common.all", "Tümü")}
          </button>

          {categories.map((c) => {
            const active = activeCategoryUuid === c.uuid;
            return (
              <button
                key={c.uuid}
                type="button"
                onClick={() => setCategory(c.uuid)}
                className={`${btnBase} ${active ? btnActive : btnPassive}`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
