// app/products/page.tsx
import Link from "next/link";

import { getCategories, getProducts, getProductsByCategory } from "@/lib/api/endpoints";
import { buildCategoryUrl, buildMediaUrl } from "@/lib/utils/url";
import type { CategoryPublicOut, PaginatedResponse, ProductListItemPublicOut } from "@/lib/api/types";

import ProductsCategoryTabsAndSearch from "@/components/products/ProductsCategoryTabsAndSearch";
import { resolveCategoryEmoji } from "@/lib/emojiPool"; // ✅ eklendi
import { getServerLang, getServerT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

type SearchParams = {
  q?: string;
  page?: string;
  page_size?: string;
  category?: string; // category uuid
};

function toInt(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function productImage(url?: string | null) {
  return (
    buildMediaUrl(url ?? null) ??
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=900&h=900&fit=crop"
  );
}

function categoryImage(url?: string | null) {
  return (
    buildMediaUrl(url ?? null) ??
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&h=900&fit=crop"
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return buildPageMetadata({
    title: t("productsPage.metaTitle", "Ürünler | CCkids Kreş Mobilyaları"),
    description: t(
      "seo.productsDescription",
      "Kreş ve anaokulları için masa, sandalye, dolap ve daha fazlasını ürün kategorilerimizde keşfedin.",
    ),
    path: "/products",
    locale: lang,
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const page = toInt(sp.page, 1);
  const pageSize = clamp(toInt(sp.page_size, 20), 1, 100);
  const categoryUuid = (sp.category ?? "").trim() || undefined;

  // Categories
  const categoriesRes = await getCategories({ page: 1, page_size: 50, lang });
  const categories: CategoryPublicOut[] = Array.isArray(categoriesRes?.items) ? categoriesRes.items : [];

  let productsRes: PaginatedResponse<ProductListItemPublicOut>;
  if (categoryUuid) {
    productsRes = await getProductsByCategory(categoryUuid, page, pageSize, q || undefined, lang);
  } else {
    productsRes = await getProducts({ lang, q: q || undefined, page, page_size: pageSize });
  }

  const items = Array.isArray(productsRes?.items) ? productsRes.items : [];
  const total = typeof productsRes?.total === "number" ? productsRes.total : items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clamp(page, 1, totalPages);

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (categoryUuid) baseParams.set("category", categoryUuid);
  baseParams.set("page_size", String(pageSize));

  const selectedCategory = categoryUuid ? categories.find((c) => c.uuid === categoryUuid) : null;

  return (
    <div className="relative z-10">
      <main className="flex-grow relative z-10">
        {/* HERO */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(233,30,99,0.10) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-cc-pink transition-colors">
                {t("nav.home", "Ana Sayfa")}
              </Link>
              <span aria-hidden>›</span>
              <span className="text-cc-text font-semibold">{t("nav.products", "Ürünler")}</span>
            </div>

            <div className="text-center space-y-6">
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-cc-pink">{t("productsPage.title", "Renkli Koleksiyonlar")}</span>{" "}
                <span className="inline-block animate-wiggle">🎨</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {t("productsPage.subtitle", "Kreşinizi hayallerdeki oyun cennetine dönüştürecek tüm ürün kategorilerimizi keşfedin!")}
              </p>
            </div>
          </div>
        </section>

        {/* CATEGORY CARDS */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {categories.slice(0, 6).map((cat, idx) => {
                const href = buildCategoryUrl(cat.uuid, {
                  page: 1,
                  q: q || undefined,
                  page_size: pageSize,
                });

                return (
                  <Link
                    key={cat.uuid}
                    href={href}
                    className="group relative h-[360px] rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    style={{ animationDelay: `${0.08 * (idx + 1)}s` }}
                  >
                    <img
                      src={categoryImage(cat.image_url)}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          {/* ✅ emoji key->emoji */}
                          {resolveCategoryEmoji(cat.emoji, "✨")}
                        </span>
                        <div>
                          <h3 className="font-display text-3xl font-bold text-white drop-shadow-lg">{cat.name}</h3>
                          <p className="text-white/80 text-sm">{t("productsPage.exploreCollection", "Koleksiyonu Keşfet")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0">
                        <span className="font-semibold">{t("productsPage.viewProducts", "Ürünleri Gör")}</span>
                        <span aria-hidden className="transition-transform group-hover:translate-x-2">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ALL PRODUCTS */}
        <section className="py-16 px-4 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
              <div>
                <h2 className="font-display text-4xl font-bold text-cc-text mb-2">
                  {selectedCategory ? selectedCategory.name : t("productsPage.allProducts", "Tüm Ürünler")}
                </h2>
                {q ? <p className="text-gray-500">{t("productsPage.search", "Arama: \"{q}\"").replace("{q}", q)}</p> : null}
              </div>

              <div className="w-full md:w-auto">
                <ProductsCategoryTabsAndSearch categories={categories} pageSize={pageSize} />
              </div>
            </div>

            {/* ... devamı aynı (grid, pagination, CTA) */}
            {/* (Senin paylaştığın dosyanın devamını burada değiştirmedim; sadece emoji kısmına dokundum.) */}
            {items.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-10 shadow-lg text-center">
                <p className="text-gray-500">{t("productsPage.empty", "Ürün bulunamadı.")}</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Link
                    href="/products"
                    className="px-6 py-3 bg-gradient-to-r from-cc-pink to-cc-orange text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {t("productsPage.clearFilters", "Filtreleri Temizle")}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((p, idx) => (
                  <Link
                    key={p.uuid}
                    href={`/products/${encodeURIComponent(p.uuid)}`}
                    className="group relative bg-white rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-400 overflow-hidden flex flex-col"
                    style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <div className="h-44 mb-4 overflow-hidden rounded-2xl relative bg-gray-50">
                      <img
                        src={productImage(p.cover_image_url)}
                        alt={p.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-display text-xl font-bold text-cc-text mb-2 group-hover:text-cc-pink transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {p.description ?? t("common.detailsForReview", "Detaylar için inceleyin.")}
                    </p>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="font-display font-bold text-cc-cyan">{t("common.viewDetail", "Detayı Gör")}</span>
                      <span className="w-10 h-10 bg-cc-pink/10 group-hover:bg-cc-pink text-cc-pink group-hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                {t("productsPage.page", "Sayfa")} <span className="font-bold text-cc-text">{safePage}</span> /{" "}
                <span className="font-bold text-cc-text">{totalPages}</span>
              </div>

              <div className="flex items-center gap-3">
                {(() => {
                  const prev = Math.max(1, safePage - 1);
                  const next = Math.min(totalPages, safePage + 1);

                  const prevParams = new URLSearchParams(baseParams);
                  prevParams.set("page", String(prev));

                  const nextParams = new URLSearchParams(baseParams);
                  nextParams.set("page", String(next));

                  return (
                    <>
                      <Link
                        aria-disabled={safePage <= 1}
                        className={[
                          "px-6 py-3 rounded-full font-bold border-2 transition-all duration-300",
                          safePage <= 1
                            ? "bg-gray-100 border-gray-200 text-gray-400 pointer-events-none"
                            : "bg-white border-cc-cyan text-cc-cyan hover:bg-cc-cyan hover:text-white shadow-md",
                        ].join(" ")}
                        href={`/products?${prevParams.toString()}`}
                      >
                        {t("productsPage.previous", "← Önceki")}
                      </Link>

                      <Link
                        aria-disabled={safePage >= totalPages}
                        className={[
                          "px-6 py-3 rounded-full font-bold border-2 transition-all duration-300",
                          safePage >= totalPages
                            ? "bg-gray-100 border-gray-200 text-gray-400 pointer-events-none"
                            : "bg-white border-cc-cyan text-cc-cyan hover:bg-cc-cyan hover:text-white shadow-md",
                        ].join(" ")}
                        href={`/products?${nextParams.toString()}`}
                      >
                        {t("productsPage.next", "Sonraki →")}
                      </Link>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* CTA bloğu aynı */}
          </div>
        </section>
      </main>
    </div>
  );
}
