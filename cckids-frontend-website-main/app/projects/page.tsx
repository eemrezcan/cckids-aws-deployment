// app/projects/page.tsx
import Link from "next/link";
import { formatMonthYearTR } from "@/lib/utils/date";
import type { Metadata } from "next";

import { buildMediaUrl } from "@/lib/utils/url";
import { getProjects, getProjectReviews } from "@/lib/api/endpoints";
import type { ProjectListItemPublicOut } from "@/lib/api/types";

import ProjectsSearchInput from "@/components/projects/ProjectsSearchInput";
import ProjectCardImage from "@/components/projects/ProjectCardImage";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getCategoryKey(p: ProjectListItemPublicOut) {
  return p.category?.uuid ?? "";
}

function getCategoryName(p: ProjectListItemPublicOut) {
  return p.category?.name ?? "Category";
}

function safeString(x: unknown) {
  return typeof x === "string" ? x : "";
}

function matchesQuery(p: ProjectListItemPublicOut, q: string) {
  const qq = q.trim().toLowerCase();
  if (!qq) return true;
  const name = (p.name ?? "").toLowerCase();
  const short = (p.short_info ?? "").toLowerCase();
  const loc = (p.location ?? "").toLowerCase();
  const cat = (p.category?.name ?? "").toLowerCase();
  return name.includes(qq) || short.includes(qq) || loc.includes(qq) || cat.includes(qq);
}

function buildProjectsUrl(params: { page?: number; category_uuid?: string; q?: string }) {
  const sp = new URLSearchParams();
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.category_uuid) sp.set("category_uuid", params.category_uuid);
  if (params.q) sp.set("q", params.q);
  const qs = sp.toString();
  return qs ? `/projects?${qs}` : "/projects";
}

function ProjectCard({
  p,
  lang,
  t,
}: {
  p: ProjectListItemPublicOut;
  lang: "tr" | "en";
  t: (key: string, fallback?: string) => string;
}) {
  const img = buildMediaUrl(p.featured_image_url ?? null) ?? "";
  const completed = formatMonthYearTR(p.completed_at, lang);
  const location = p.location ?? null;

  return (
    <article className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <Link href={`/projects/${encodeURIComponent(p.uuid)}`} className="block">
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {img ? (
            <ProjectCardImage src={img} alt={p.name} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100" />
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {p.category?.name ? (
              <span className="bg-[#00BCD4] text-white px-3 py-1 rounded-full text-xs font-bold">
                {p.category.name}
              </span>
            ) : null}
          </div>

          <div className="absolute top-4 right-4">
            {location ? (
              <span className="bg-white/90 backdrop-blur-sm text-[#2C3E50] px-3 py-1 rounded-full text-xs font-bold">
                📍 {location}
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <span>📅</span>
            <span>{completed ?? "—"}</span>
          </div>

          <h3 className="font-bold text-xl text-[#2C3E50] mb-2 group-hover:text-[#E91E63] transition-colors">
            {p.name}
          </h3>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{p.short_info ?? ""}</p>

          <span className="inline-flex items-center gap-2 text-[#E91E63] font-bold text-sm hover:gap-3 transition-all duration-300">
            {t("common.viewDetail", "Detayı Gör")} <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

// ✅ project-reviews endpoint'inin gerçek response'una uygun küçük tip
type ProjectReviewApiItem = {
  customer_name?: string | null;
  project_name?: string | null;
  comment: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return buildPageMetadata({
    title: t("projectsPage.metaTitle", "Projeler | CCkids Kreş Mobilyaları"),
    description: t(
      "seo.projectsDescription",
      "CCkids'in tamamladığı kreş ve anaokulu projelerini inceleyin, ilham alın.",
    ),
    path: "/projects",
    locale: lang,
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  // ✅ Next 15+ sync-dynamic-apis uyarısını kesmek için Promise olarak alıp await ediyoruz.
  searchParams?: Promise<{ page?: string; category_uuid?: string; q?: string }>;
}) {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const sp = (await searchParams) ?? {};

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const pageSize = 9;

  const categoryUuid = safeString(sp.category_uuid || "");
  const q = safeString(sp.q || "");

  const results = await Promise.allSettled([
    getProjects(1, 60, undefined, undefined, lang), // kategori options için geniş liste (q istemiyoruz)
    getProjects(page, pageSize, categoryUuid || undefined, q || undefined, lang),
    getProjectReviews(1, 4, lang), // ✅ toplam 4 yorum iste
  ]);

  const forCategories = results[0].status === "fulfilled" ? results[0].value : null;
  const projectsRes = results[1].status === "fulfilled" ? results[1].value : null;
  const reviewsRes = results[2].status === "fulfilled" ? results[2].value : null;

  const allForCategory: ProjectListItemPublicOut[] = Array.isArray(forCategories?.items) ? forCategories!.items : [];
  const categoryOptions = Array.from(
    new Map(
      allForCategory
        .filter((p) => p.category?.uuid && p.category?.name)
        .map((p) => [getCategoryKey(p), { uuid: p.category!.uuid, name: getCategoryName(p) }]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, lang === "en" ? "en" : "tr"));

  const rawItems: ProjectListItemPublicOut[] = Array.isArray(projectsRes?.items) ? projectsRes!.items : [];
  const total = typeof projectsRes?.total === "number" ? projectsRes.total : rawItems.length;

  // backend q desteklemiyorsa diye local fallback; destekliyorsa da aynı sonucu verir
  const items = q ? rawItems.filter((p) => matchesQuery(p, q)) : rawItems;

  const hasNext = page * pageSize < total;

  // ✅ reviews endpoint uyumu
  const reviews: ProjectReviewApiItem[] = Array.isArray(reviewsRes?.items) ? (reviewsRes!.items as any) : [];

  return (
    <div className="relative z-10">
      <main className="flex-grow relative z-10">
        {/* Hero */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-[#E91E63] transition-colors">
                {t("nav.home", "Ana Sayfa")}
              </Link>
              <span aria-hidden>›</span>
              <span className="text-[#2C3E50] font-semibold">{t("projectsPage.breadcrumb", "Projeler")}</span>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                <span className="bg-gradient-to-r from-[#E91E63] via-[#9C27B0] to-[#00BCD4] bg-clip-text text-transparent">
                  {t("projectsPage.title", "Projelerimiz")}
                </span>
                <span className="inline-block ml-2">🏫</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("projectsPage.subtitle", "Türkiye'nin dört bir yanındaki kreş ve anaokullarına hayat verdik. İşte tamamladığımız projeler.")}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-[#E91E63] mb-1">500+</p>
                <p className="text-gray-500 text-sm">{t("projectsPage.completed", "Tamamlanan Proje")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-[#00BCD4] mb-1">81</p>
                <p className="text-gray-500 text-sm">{t("projectsPage.cities", "İl'de Hizmet")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-[#FF9800] mb-1">%98</p>
                <p className="text-gray-500 text-sm">{t("projectsPage.satisfaction", "Müşteri Memnuniyeti")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-[#9C27B0] mb-1">15+</p>
                <p className="text-gray-500 text-sm">{t("projectsPage.experience", "Yıllık Tecrübe")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <section className="py-4 px-4 sticky top-20 z-40 bg-[#FFF9F0]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <Link
                  href={buildProjectsUrl({ page: 1, q })}
                  className={cn(
                    "px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 border-2",
                    !categoryUuid
                      ? "bg-[#E91E63] border-[#E91E63] text-white shadow-lg"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#E91E63] hover:text-[#E91E63]",
                  )}
                >
                  {t("common.all", "Tümü")}
                </Link>

                {categoryOptions.map((c) => {
                  const active = categoryUuid === c.uuid;
                  return (
                    <Link
                      key={c.uuid}
                      href={buildProjectsUrl({ page: 1, category_uuid: c.uuid, q })}
                      className={cn(
                        "px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 border-2",
                        active
                          ? "bg-[#E91E63] border-[#E91E63] text-white shadow-lg"
                          : "bg-white border-gray-200 text-gray-500 hover:border-[#E91E63] hover:text-[#E91E63]",
                      )}
                      title={c.name}
                    >
                      {c.name}
                    </Link>
                  );
                })}
              </div>

              {/* Search (auto, debounce) */}
              <div className="relative w-full md:w-80">
                <ProjectsSearchInput />
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto">
            {items.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((p) => (
                  <ProjectCard key={p.uuid} p={p} lang={lang} t={t} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 shadow-lg text-center text-gray-600">
                {t("projectsPage.empty", "Bu filtrelerde proje bulunamadı.")}
              </div>
            )}

            {/* Load more */}
            <div className="text-center mt-12">
              {hasNext ? (
                <Link
                  href={buildProjectsUrl({
                    page: page + 1,
                    category_uuid: categoryUuid || undefined,
                    q: q || undefined,
                  })}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-white border-2 border-[#E91E63] text-[#E91E63] font-bold text-lg rounded-full shadow-lg hover:bg-[#E91E63] hover:text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {t("projectsPage.loadMore", "Daha Fazla Proje")} <span aria-hidden>↓</span>
                </Link>
              ) : (
                <div className="text-gray-500">{t("projectsPage.noMore", "Gösterilecek başka proje yok.")}</div>
              )}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#E91E63]/5 via-transparent to-[#00BCD4]/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#2C3E50] mb-4">
                {t("projectsPage.reviewsTitle", "Müşteri Yorumları")} <span className="inline-block">💬</span>
              </h2>
              <p className="text-gray-500 text-lg">{t("projectsPage.reviewsSubtitle", "Birlikte çalıştığımız kurumların değerli görüşleri")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.length ? (
                reviews.map((r, idx) => (
                  <div key={`${r.customer_name ?? "c"}-${r.project_name ?? "p"}-${idx}`} className="bg-white p-8 rounded-[2rem] shadow-lg relative">
                    <div
                      className={cn(
                        "absolute -top-4 left-8 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl",
                        idx % 3 === 0 && "bg-[#E91E63]",
                        idx % 3 === 1 && "bg-[#00BCD4]",
                        idx % 3 === 2 && "bg-[#FF9800]",
                      )}
                    >
                      &quot;
                    </div>

                    <div className="pt-4">
                      {/* rating yok -> sabit 5 yıldız (istersen kaldırırız) */}
                      <div className="flex mb-4">
                        <span className="text-[#CDDC39] text-xl">★★★★★</span>
                      </div>

                      <p className="text-gray-600 mb-6 leading-relaxed">{r.comment}</p>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">🙂</div>
                        <div>
                          <p className="font-bold text-[#2C3E50]">{r.customer_name ?? t("projectDetail.defaultCustomer", "Müşterimiz")}</p>
                          <p className="text-sm text-gray-400">{r.project_name ?? ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500">{t("projectsPage.noReviews", "Henüz yorum bulunmuyor.")}</div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#E91E63] via-[#9C27B0] to-[#00BCD4] p-1 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.8rem] p-12 text-center relative overflow-hidden">
                <span className="inline-block text-6xl mb-6">🎨</span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#2C3E50] mb-4">
                  {t("projectsPage.ctaTitle", "Projenizi Hayata Geçirelim!")}
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  {t("projectsPage.ctaDesc", "Kreşiniz veya anaokulunuz için ücretsiz keşif ve proje danışmanlığı hizmeti alın.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[#E91E63] to-[#FF9800] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {t("projectsPage.ctaPrimary", "Ücretsiz Keşif Randevusu")}
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white border-2 border-[#00BCD4] text-[#00BCD4] font-bold text-lg rounded-full hover:bg-[#00BCD4] hover:text-white transition-all duration-300"
                  >
                    {t("projectsPage.ctaSecondary", "Ürünleri İncele")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
