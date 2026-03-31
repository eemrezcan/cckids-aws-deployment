// app/projects/[uuid]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

import { getHome, getProjectDetail, getProjects } from "@/lib/api/endpoints";
import { buildMediaUrl } from "@/lib/utils/url";
import type { ProjectDetailPublicOut, ProjectListItemPublicOut } from "@/lib/api/types";

import ProjectGallery from "@/components/projects/ProjectGallery";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { buildPageMetadata, projectJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const revalidate = 300;
type PageProps = {
  params: Promise<{ uuid: string }>;
};
function formatMonthYearTR(iso?: string | null, lang: "tr" | "en" = "tr") {
  if (!iso) return null;

  // ISO parse dene
  const d = new Date(iso);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(lang === "en" ? "en-US" : "tr-TR", { year: "numeric", month: "long" }); // "Ocak 2025"
  }

  // backend bazen garip format dönebiliyor (örn: "222026") => şimdilik ham döndür
  return iso;
}

function toText(html?: string | null) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getGalleryImages(p: ProjectDetailPublicOut) {
  // öncelik: gallery_images -> images -> featured
  const raw =
    (p.gallery_images?.length ? p.gallery_images : null) ??
    (p.images?.length ? p.images : null) ??
    [];

  const urls = raw.map((x) => buildMediaUrl(x.url ?? null)).filter(Boolean) as string[];
  if (urls.length) return urls;

  const featured = buildMediaUrl(p.featured_image_url ?? null);
  return featured ? [featured] : [];
}

/**
 * Backend general_info bazen şu formatta gelebiliyor:
 *  - [{ key: "Sınıf", value: "8" }, ...]  (beklenen)
 *  - [{ "Etiket": "ffgdgfd" }, { "Sınıf": "8" }, ...] (alternatif)
 *
 * Bu fonksiyon hepsini normalize eder.
 */
function normalizeGeneralInfo(
  p: ProjectDetailPublicOut,
): Array<{ key: string; value: string }> {
  const raw: unknown[] = Array.isArray((p as any).general_info) ? ((p as any).general_info as unknown[]) : [];

  const out: Array<{ key: string; value: string }> = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    // { key, value } modeli
    const maybeKey = (item as any).key;
    const maybeValue = (item as any).value;
    if (typeof maybeKey === "string" && (typeof maybeValue === "string" || typeof maybeValue === "number")) {
      out.push({ key: maybeKey, value: String(maybeValue) });
      continue;
    }

    // { "Etiket": "..." } gibi tek/multi property model
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (!k) continue;
      if (v === null || v === undefined) continue;
      if (typeof v === "object") continue;
      out.push({ key: String(k), value: String(v) });
    }
  }

  return out;
}

function isNumericish(s: string) {
  // "8", "150", "320 Parça", "%98", "45 Gün" gibi
  return /\d/.test(s);
}

function pickStats(p: ProjectDetailPublicOut) {
  // HTML’deki 4 küçük stat gibi — general_info içinden "kısa + sayısal" olanları seç
  const rows = normalizeGeneralInfo(p)
    .map((r) => ({ key: r.key.trim(), value: r.value.trim() }))
    .filter((x) => x.key && x.value);

  // çok uzun cümleleri stat'e sokma
  const shortish = rows.filter((x) => x.key.length <= 24 && x.value.length <= 24);

  // sayısal içerenleri öne al
  const sorted = shortish.sort((a, b) => {
    const an = isNumericish(a.value) ? 1 : 0;
    const bn = isNumericish(b.value) ? 1 : 0;
    return bn - an;
  });

  // unique key (ilk görülen kalsın)
  const seen = new Set<string>();
  const uniq: Array<{ key: string; value: string }> = [];
  for (const r of sorted) {
    const k = r.key.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(r);
    if (uniq.length >= 4) break;
  }

  return uniq;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const { uuid } = await params;

  try {
    const project = await getProjectDetail(uuid, lang);
    return buildPageMetadata({
      title: `${project.name} | ${t("projectDetail.metaSuffix", "CCkids Projeler")}`,
      description: project.short_info ?? toText(project.about_text) ?? "CCkids proje detayı",
      path: `/projects/${encodeURIComponent(uuid)}`,
      ogImage: buildMediaUrl(project.featured_image_url ?? null) ?? "/Logo.png",
      locale: lang,
    });
  } catch {
    return buildPageMetadata({
      title: t("projectDetail.metaDefault", "Proje Detayı | CCkids Projeler"),
      description: t("seo.projectsDescription", "CCkids'in tamamladığı kreş ve anaokulu projelerini inceleyin."),
      path: `/projects/${encodeURIComponent(uuid)}`,
      locale: lang,
    });
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const { uuid } = await params;

  const results = await Promise.allSettled([getProjectDetail(uuid, lang), getHome(lang)]);
  const project = results[0].status === "fulfilled" ? results[0].value : null;
  const home = results[1].status === "fulfilled" ? results[1].value : null;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-extrabold text-cc-text mb-4">{t("projectDetail.notFound", "Proje bulunamadı")}</h1>
        <p className="text-gray-600 mb-8">{t("projectDetail.notFoundDesc", "Aradığınız proje kaldırılmış olabilir veya bağlantı hatalı.")}</p>
        <Link href="/projects" className="text-cc-pink font-bold hover:underline">
          {t("projectDetail.backToProjects", "Projelere dön")} →
        </Link>
      </div>
    );
  }

  const galleryUrls = getGalleryImages(project);
  const gallery = galleryUrls.map((u, i) => ({ url: u, alt: `${project.name} - ${i + 1}` }));

  const location = project.location ?? null;
  const completed = formatMonthYearTR(project.completed_at, lang);
  const categoryName = project.category?.name ?? null;

  const badges = [
    categoryName ? { text: categoryName, tone: "pink" as const } : null,
    location ? { text: `📍 ${location}`, tone: "white" as const } : null,
  ].filter(Boolean) as Array<{ text: string; tone?: "pink" | "white" }>;

  const before = (project.before_images ?? [])
    .map((x) => buildMediaUrl(x.url ?? null))
    .filter(Boolean) as string[];

  const after = (project.after_images ?? [])
    .map((x) => buildMediaUrl(x.url ?? null))
    .filter(Boolean) as string[];

  // Similar projects
  let similar: ProjectListItemPublicOut[] = [];
  try {
    const catUuid = project.category?.uuid ?? "";
    if (catUuid) {
      const simRes = await getProjects(1, 6, catUuid, undefined, lang);
      similar = (simRes.items ?? []).filter((x) => x.uuid !== project.uuid).slice(0, 3);
    }
  } catch {
    similar = [];
  }

  const waNumber = home?.settings?.whatsapp_number ?? null;
  const waMsg =
    home?.settings?.whatsapp_default_message ??
    t("projectDetail.whatsappDefault", `Merhaba, "${project.name}" projesine benzer bir proje için bilgi almak istiyorum.`).replace("{project}", project.name);

  const waHref =
    waNumber && String(waNumber).trim()
      ? `https://wa.me/${String(waNumber).replace(/\D/g, "").replace(/^0/, "90")}?text=${encodeURIComponent(waMsg)}`
      : null;

  const stats = pickStats(project);

  return (
    <div className="relative z-10">
      <JsonLd
        data={projectJsonLd({
          name: project.name,
          description: project.short_info ?? toText(project.about_text) ?? "",
          image: buildMediaUrl(project.featured_image_url ?? null),
          uuid: project.uuid,
          location: project.location,
        })}
      />
      <main className="flex-grow relative z-10">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm font-sans text-gray-500 animate-slide-up">
            <Link href="/" className="hover:text-cc-pink transition-colors">
              {t("nav.home", "Ana Sayfa")}
            </Link>
            <span aria-hidden>›</span>
            <Link href="/projects" className="hover:text-cc-pink transition-colors">
              {t("nav.projects", "Projeler")}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-cc-text font-semibold">{project.name}</span>
          </div>
        </div>

        {/* Hero Gallery */}
        <ProjectGallery images={gallery} badges={badges} title={project.name} />

        {/* Info */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main */}
              <div className="lg:col-span-2 space-y-12">
                {/* About */}
                <div className="animate-slide-up">
                  <h2 className="font-display text-3xl font-bold text-cc-text mb-6 flex items-center gap-3">
                    <span className="w-12 h-12 bg-cc-pink/10 rounded-xl flex items-center justify-center text-2xl">
                      📋
                    </span>
                    {t("projectDetail.about", "Proje Hakkında")}
                  </h2>

                  {project.about_text ? (
                    <div
                      className="prose prose-lg max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: project.about_text }}
                    />
                  ) : (
                    <div className="prose prose-lg max-w-none text-gray-600">
                      <p>{project.short_info ?? t("projectDetail.aboutSoon", "Bu proje hakkında detay yakında eklenecek.")}</p>
                    </div>
                  )}
                </div>

                {/* Before / After */}
                {before.length && after.length ? (
                  <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <h2 className="font-display text-3xl font-bold text-cc-text mb-6 flex items-center gap-3">
                      <span className="w-12 h-12 bg-cc-cyan/10 rounded-xl flex items-center justify-center text-2xl">
                        🔄
                      </span>
                      {t("projectDetail.beforeAfter", "Önce & Sonra")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={before[0]} alt={t("projectDetail.before", "Önce")} className="w-full h-64 object-cover" />
                        <div className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full font-bold text-sm">
                          {t("projectDetail.before", "Önce")}
                        </div>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={after[0]} alt={t("projectDetail.after", "Sonra")} className="w-full h-64 object-cover" />
                        <div className="absolute top-4 left-4 bg-cc-pink text-white px-4 py-2 rounded-full font-bold text-sm">
                          {t("projectDetail.after", "Sonra")} ✨
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Review */}
                {project.review ? (
                  <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                    <h2 className="font-display text-3xl font-bold text-cc-text mb-6 flex items-center gap-3">
                      <span className="w-12 h-12 bg-cc-yellow/10 rounded-xl flex items-center justify-center text-2xl">
                        💬
                      </span>
                      {t("projectDetail.review", "Müşteri Yorumu")}
                    </h2>

                    <div className="bg-gradient-to-br from-cc-pink to-cc-purple p-1 rounded-[2rem]">
                      <div className="bg-white rounded-[1.8rem] p-8 md:p-10">
                        <blockquote className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                          “{(project.review as any).body ?? (project.review as any).comment ?? ""}”
                        </blockquote>

                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-cc-pink/10 flex items-center justify-center text-2xl">
                            🙂
                          </div>
                          <div>
                            <p className="font-display text-xl font-bold text-cc-text">
                              {(project.review as any).author_name ??
                                (project.review as any).customer_name ??
                                t("projectDetail.defaultCustomer", "Müşterimiz")}
                            </p>
                            <p className="text-gray-500">
                              {(project.review as any).author_title ?? ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl sticky top-32 animate-slide-left">
                  <h3 className="font-display text-2xl font-bold text-cc-text mb-6 pb-4 border-b border-gray-100">
                    {t("projectDetail.info", "Proje Bilgileri")}
                  </h3>

                  <div className="space-y-5">
                    {location ? (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cc-pink/10 rounded-xl flex items-center justify-center text-cc-pink shrink-0">
                          📍
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{t("projectDetail.location", "Konum")}</p>
                          <p className="font-bold text-cc-text">{location}</p>
                        </div>
                      </div>
                    ) : null}

                    {completed ? (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cc-cyan/10 rounded-xl flex items-center justify-center text-cc-cyan shrink-0">
                          📅
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{t("projectDetail.date", "Tamamlanma Tarihi")}</p>
                          <p className="font-bold text-cc-text">{completed}</p>
                        </div>
                      </div>
                    ) : null}

                    {project.duration ? (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cc-orange/10 rounded-xl flex items-center justify-center text-cc-orange shrink-0">
                          ⏱️
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{t("projectDetail.duration", "Proje Süresi")}</p>
                          <p className="font-bold text-cc-text">{project.duration}</p>
                        </div>
                      </div>
                    ) : null}

                    {project.capacity ? (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cc-purple/10 rounded-xl flex items-center justify-center text-cc-purple shrink-0">
                          👥
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{t("projectDetail.capacity", "Kapasite")}</p>
                          <p className="font-bold text-cc-text">{project.capacity}</p>
                        </div>
                      </div>
                    ) : null}

                    {typeof project.total_products === "number" ? (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cc-lime/10 rounded-xl flex items-center justify-center text-cc-lime shrink-0">
                          📦
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{t("projectDetail.totalProducts", "Toplam Ürün")}</p>
                          <p className="font-bold text-cc-text">{project.total_products} {t("projectDetail.piece", "Parça")}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* mini stats */}
                  {stats.length ? (
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                      {stats.slice(0, 4).map((s, i) => (
                        <div key={`${s.key}-${i}`} className="text-center p-4 bg-cc-pink/5 rounded-xl">
                          <p className="font-display text-2xl font-bold text-cc-pink">{s.value}</p>
                          <p className="text-xs text-gray-500">{s.key}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* CTA */}
                  <div className="mt-8 space-y-3">
                    <Link
                      href="/contact#form"
                      className="w-full py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {t("projectDetail.requestSimilar", "Benzer Proje İstiyorum")} →
                    </Link>

                    {waHref ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 bg-cc-lime text-white font-display font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {t("projectDetail.askWhatsapp", "WhatsApp ile Sor")}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar */}
        {similar.length ? (
          <section className="py-16 px-4 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-2">
                    {t("projectDetail.similar", "Benzer Projeler")} <span className="inline-block animate-wiggle">✨</span>
                  </h2>
                  <p className="text-gray-500">{t("projectDetail.similarSubtitle", "İlginizi çekebilecek diğer projeler")}</p>
                </div>

                <Link
                  href="/projects"
                  className="hidden md:inline-flex items-center gap-2 text-cc-pink font-bold hover:gap-3 transition-all"
                >
                  {t("projectDetail.allProjects", "Tüm Projeler")} →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similar.map((sp) => {
                  const img = buildMediaUrl(sp.featured_image_url ?? null);
                  return (
                    <Link
                      key={sp.uuid}
                      href={`/projects/${encodeURIComponent(sp.uuid)}`}
                      className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={sp.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cc-pink/10 via-cc-purple/10 to-cc-cyan/10" />
                        )}

                        {sp.category?.name ? (
                          <div className="absolute top-4 left-4">
                            <span className="bg-cc-cyan text-white px-3 py-1 rounded-full text-xs font-bold">
                              {sp.category.name}
                            </span>
                          </div>
                        ) : null}

                        {sp.location ? (
                          <div className="absolute bottom-4 right-4">
                            <span className="bg-white/90 text-cc-text px-3 py-1 rounded-full text-xs font-bold">
                              📍 {sp.location}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-6">
                        <h3 className="font-display text-xl font-bold text-cc-text mb-2 group-hover:text-cc-pink transition-colors">
                          {sp.name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">{sp.short_info ?? ""}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formatMonthYearTR(sp.completed_at, lang) ?? ""}</span>
                          <span className="text-cc-pink font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            {t("projectDetail.reviewLink", "İncele")} →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-10 md:hidden">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-cc-pink text-white font-display font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  {t("projectDetail.allProjectsMobile", "Tüm Projeleri Gör")} →
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.8rem] p-12 text-center relative overflow-hidden">
                <span className="inline-block text-6xl mb-6 animate-bounce">🎨</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
                  {t("projectDetail.ctaTitle", "Sizin Projeniz Bir Sonraki Olsun!")}
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  {t("projectDetail.ctaDesc", "Kreşiniz veya anaokulunuz için ücretsiz keşif ve proje danışmanlığı hizmeti alın.")}
                </p>
                <Link
                  href="/contact#form"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {t("projectDetail.ctaButton", "Ücretsiz Keşif Randevusu")} →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
