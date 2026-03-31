// app/products/categories/[uuid]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategories, getProductsByCategory } from "@/lib/api/endpoints";
import { buildCategoryUrl, buildMediaUrl } from "@/lib/utils/url";
import type { CategoryPublicOut, ProductListItemPublicOut } from "@/lib/api/types";

import CategorySearchInput from "@/components/products/CategorySearchInput";
import { resolveCategoryEmoji } from "@/lib/emojiPool"; // ✅ eklendi
import { getServerLang, getServerT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ page?: string; page_size?: string; q?: string }>;
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  const lang = await getServerLang();
  const t = getServerT(lang);

  try {
    const categoriesRes = await getCategories({ page: 1, page_size: 50, lang });
    const categories = Array.isArray(categoriesRes?.items) ? categoriesRes.items : [];
    const category = categories.find((c) => c.uuid === uuid);

    if (!category) {
      return buildPageMetadata({
        title: t("categoryPage.metaDefault", "Kategori | CCKids"),
        description: t(
          "seo.productsDescription",
          "Kreş ve anaokulları için masa, sandalye, dolap ve daha fazlasını ürün kategorilerimizde keşfedin.",
        ),
        path: `/products/categories/${encodeURIComponent(uuid)}`,
        locale: lang,
      });
    }

    return buildPageMetadata({
      title: `${category.name} | CCKids`,
      description: t(
        "seo.productsDescription",
        "Kreş ve anaokulları için masa, sandalye, dolap ve daha fazlasını ürün kategorilerimizde keşfedin.",
      ),
      path: `/products/categories/${encodeURIComponent(uuid)}`,
      ogImage: buildMediaUrl(category.image_url ?? null) ?? "/Logo.png",
      locale: lang,
    });
  } catch {
    return buildPageMetadata({
      title: t("categoryPage.metaDefault", "Kategori | CCKids"),
      description: t(
        "seo.productsDescription",
        "Kreş ve anaokulları için masa, sandalye, dolap ve daha fazlasını ürün kategorilerimizde keşfedin.",
      ),
      path: `/products/categories/${encodeURIComponent(uuid)}`,
      locale: lang,
    });
  }
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const { uuid } = await params;
  const sp = await searchParams;

  const page = Math.max(1, toInt(sp.page, 1));
  const pageSize = clamp(toInt(sp.page_size, 12), 1, 100);
  const q = (sp.q ?? "").trim();

  const categoriesRes = await getCategories({ page: 1, page_size: 50, lang });
  const categories: CategoryPublicOut[] = Array.isArray(categoriesRes?.items) ? categoriesRes.items : [];

  const category = categories.find((c) => c.uuid === uuid);
  if (!category) notFound();

  const productsRes = await getProductsByCategory(uuid, page, pageSize, q || undefined, lang);
  const products: ProductListItemPublicOut[] = Array.isArray(productsRes?.items) ? productsRes.items : [];
  const total = typeof productsRes?.total === "number" ? productsRes.total : products.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clamp(page, 1, totalPages);

  const otherCategories = categories.filter((c) => c.uuid !== uuid);

  return (
    <div className="relative z-10">
      <main className="flex-grow relative z-10">
        {/* HERO */}
        <section className="relative px-4 py-10 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cc-pink/10 via-transparent to-cc-cyan/10" />
          <div className="pointer-events-none absolute left-10 top-10 h-20 w-20 rounded-full bg-cc-pink/15" />
          <div className="pointer-events-none absolute right-20 top-14 h-16 w-16 rounded-full bg-cc-yellow/20 blur-sm" />

          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm font-sans text-gray-500 animate-slide-up">
              <Link href="/" className="hover:text-cc-pink transition-colors">
                {t("nav.home", "Ana Sayfa")}
              </Link>
              <span aria-hidden>›</span>
              <Link href="/products" className="hover:text-cc-pink transition-colors">
                {t("nav.products", "Ürünler")}
              </Link>
              <span aria-hidden>›</span>
              <span className="text-cc-text font-semibold">{category.name}</span>
            </div>

            <div className="mt-6 flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/55 px-6 py-6 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-cc-pink to-pink-400 flex items-center justify-center text-3xl shadow-lg">
                  {resolveCategoryEmoji(category.emoji, "🎨")}
                </div>
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-cc-text leading-tight">
                  {category.name}
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg mt-1">
                    {t("categoryPage.productFound", "{count} ürün bulundu").replace("{count}", String(total))}
                  </p>
                </div>
              </div>

              <a
                href="#products-search"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {t("categoryPage.exploreProducts", "Ürünleri İncele")} <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* SEARCH (Sticky, auto) */}
        <section id="products-search" className="py-6 px-4 sticky top-20 z-40 bg-cc-bg/90 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <CategorySearchInput placeholder={t("categoryPage.searchIn", "{category} içinde ara...").replace("{category}", category.name)} />
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {products.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-10 shadow-lg text-center">
                <p className="text-gray-500 mb-6">{t("categoryPage.empty", "Bu kategoride ürün bulunamadı.")}</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cc-pink to-cc-orange text-white rounded-full font-bold"
                >
                  {t("categoryPage.backAll", "Tüm Ürünlere Dön")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p, idx) => (
                  <Link
                    key={p.uuid}
                    href={`/products/${encodeURIComponent(p.uuid)}`}
                    className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-pop-in"
                    style={{ animationDelay: `${0.05 * idx}s` }}
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-50">
                      <img
                        src={productImage(p.cover_image_url)}
                        alt={p.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-cc-pink uppercase">{category.name}</span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-cc-text mb-2 group-hover:text-cc-pink transition-colors line-clamp-1">
                        {p.name}
                      </h3>

                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {p.description ?? t("common.detailsForReview", "Detaylar için inceleyin.")}
                      </p>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="font-display font-bold text-cc-cyan">{t("common.viewDetail", "Detayı Gör")}</span>
                        <span className="text-sm font-bold text-gray-400 group-hover:text-cc-orange transition-colors flex items-center gap-1">
                          {t("projectDetail.reviewLink", "İncele")} →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination aynı */}
            {totalPages > 1 ? (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Link
                  href={buildCategoryUrl(uuid, {
                    page: Math.max(1, safePage - 1),
                    q: q || undefined,
                    page_size: pageSize,
                  })}
                  aria-disabled={safePage <= 1}
                  className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    safePage <= 1
                      ? "bg-gray-100 text-gray-300 pointer-events-none"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                >
                  ‹
                </Link>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (safePage <= 3) pageNum = i + 1;
                  else if (safePage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = safePage - 2 + i;

                  return (
                    <Link
                      key={pageNum}
                      href={buildCategoryUrl(uuid, { page: pageNum, q: q || undefined, page_size: pageSize })}
                      className={[
                        "w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-colors",
                        pageNum === safePage ? "bg-cc-pink text-white shadow-lg" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                <Link
                  href={buildCategoryUrl(uuid, {
                    page: Math.min(totalPages, safePage + 1),
                    q: q || undefined,
                    page_size: pageSize,
                  })}
                  aria-disabled={safePage >= totalPages}
                  className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    safePage >= totalPages
                      ? "bg-gray-100 text-gray-300 pointer-events-none"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                >
                  ›
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* Other Categories */}
        {otherCategories.length > 0 ? (
          <section className="py-16 px-4 bg-gradient-to-br from-cc-cyan/5 to-cc-purple/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-2">
                  {t("categoryPage.otherCategories", "Diğer Kategoriler")} <span className="inline-block animate-wiggle">📦</span>
                </h2>
                <p className="text-gray-500">{t("categoryPage.otherSubtitle", "İhtiyacınıza uygun diğer mobilyaları keşfedin")}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {otherCategories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.uuid}
                    href={buildCategoryUrl(cat.uuid, { page: 1, page_size: pageSize })}
                    className="group bg-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
                  >
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-cc-pink to-pink-400 rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {/* ✅ emoji key->emoji */}
                      {resolveCategoryEmoji(cat.emoji, "✨")}
                    </div>
                    <h3 className="font-display font-bold text-cc-text group-hover:text-cc-pink transition-colors text-sm">
                      {cat.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA aynı */}
      </main>
    </div>
  );
}
