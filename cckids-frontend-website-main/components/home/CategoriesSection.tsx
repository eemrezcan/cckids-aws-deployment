// components/home/CategoriesSection.tsx
"use client";

import Link from "next/link";
import { resolveCategoryEmoji } from "@/lib/emojiPool";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * CategoriesSection:
 * - Backend’den categories listesi gelir
 * - Kartlar /products/categories/<uuid> ile kategori sayfasına gider
 */
export default function CategoriesSection({ categories }: { categories: any[] }) {
  const { t } = useLanguage();
  const gradients = [
    "from-cc-pink to-pink-400",
    "from-cc-cyan to-cyan-400",
    "from-cc-orange to-orange-400",
    "from-cc-purple to-purple-400",
    "from-cc-yellow to-yellow-400",
    "from-cc-lime to-green-400",
  ];

  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
            {t("home.categories.title", "Kategoriler")} <span className="inline-block animate-wiggle">📦</span>
          </h2>
          <p className="text-gray-500 text-lg">{t("home.categories.subtitle", "İhtiyacınıza uygun mobilyaları keşfedin")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, idx) => {
            const uuid = c.uuid ? String(c.uuid) : null;
            const name = String(c.name ?? t("home.categories.defaultName", "Kategori"));

            // Backend emoji alanı key (string) olarak gelirse buradan çözeriz.
            const emoji = resolveCategoryEmoji(c.emoji, "✨");

            // ✅ SEO route
            const href = uuid ? `/products/categories/${encodeURIComponent(uuid)}` : "/products";

            return (
              <Link
                key={uuid ?? `${name}-${idx}`}
                href={href}
                className="group bg-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div
                  className={[
                    "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-md",
                    "group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 bg-gradient-to-br",
                    gradients[idx % gradients.length],
                  ].join(" ")}
                >
                  {emoji}
                </div>
                <h3 className="font-display font-bold text-cc-text group-hover:text-cc-pink transition-colors">
                  {name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
