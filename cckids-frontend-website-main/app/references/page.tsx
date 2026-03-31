import Link from "next/link";
import type { Metadata } from "next";

import { getReferences } from "@/lib/api/endpoints";
import type { ReferenceLogoPublicOut } from "@/lib/api/types";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { buildMediaUrl } from "@/lib/utils/url";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

const ACCENT_COLORS = ["bg-cc-pink", "bg-cc-cyan", "bg-cc-purple", "bg-cc-orange", "bg-cc-yellow"] as const;

function normalizeWebsiteUrl(input?: string | null) {
  if (!input) return null;
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  return `https://${input}`;
}

function normalizeReferences(items: ReferenceLogoPublicOut[]) {
  return items
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item, index) => {
      const logo = buildMediaUrl(item.logo_url ?? null);
      if (!logo) return null;
      return {
        key: item.uuid ?? item.id ?? `reference-${index}`,
        logo,
        website: normalizeWebsiteUrl(item.website_url),
      };
    })
    .filter(Boolean) as Array<{ key: string | number; logo: string; website: string | null }>;
}

async function loadReferences(lang: "tr" | "en") {
  const attempts = await Promise.allSettled([getReferences(100, lang), getReferences(24, lang), getReferences(12, lang)]);
  const fulfilled = attempts
    .filter((x): x is PromiseFulfilledResult<ReferenceLogoPublicOut[]> => x.status === "fulfilled")
    .map((x) => x.value);

  const nonEmpty = fulfilled.find((x) => Array.isArray(x) && x.length > 0);
  if (nonEmpty) return nonEmpty;
  return fulfilled[0] ?? [];
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return buildPageMetadata({
    title: t("referencesPage.metaTitle", "Referanslar | CCkids Kreş Mobilyaları"),
    description: t(
      "seo.referencesDescription",
      "CCkids'e güvenen kurumları ve referanslarımızı inceleyin.",
    ),
    path: "/references",
    locale: lang,
  });
}

export default async function ReferencesPage() {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const refs = await loadReferences(lang);
  const items = normalizeReferences(refs);

  return (
    <div className="relative z-10">
      <main className="flex-grow relative z-10">
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-slide-up">
              <Link href="/" className="hover:text-cc-pink transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span aria-hidden>›</span>
              <span className="text-cc-text font-semibold">{t("referencesPage.breadcrumb", "References")}</span>
            </div>

            <div className="text-center mb-12 animate-slide-up">
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan bg-clip-text text-transparent animate-gradient-text bg-[length:300%_300%]">
                  {t("referencesPage.title", "Referanslarımız")}
                </span>
                <span className="inline-block ml-2">🤝</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("referencesPage.subtitle", "Leading institutions across Turkey trust us")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-cc-pink mb-1">{items.length}+</p>
                <p className="text-gray-500 text-sm">{t("referencesPage.trustedBy", "Trusted Institutions")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-cc-cyan mb-1">81</p>
                <p className="text-gray-500 text-sm">{t("projectsPage.cities", "Cities Served")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-4xl font-extrabold text-cc-purple mb-1">15+</p>
                <p className="text-gray-500 text-sm">{t("projectsPage.experience", "Years of Experience")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto">
            {items.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {items.map((item, index) => {
                  const referenceLabel = `${t("referencesPage.breadcrumb", "References")} ${index + 1}`;
                  const card = (
                    <article
                      className="group relative bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-6 animate-pop-in"
                      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-[2rem] ${ACCENT_COLORS[index % ACCENT_COLORS.length]}`} />
                      <div className="w-32 h-32 mx-auto mb-5 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.logo}
                          alt={referenceLabel}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      {item.website ? (
                        <p className="text-center text-xs mt-3 text-cc-cyan font-semibold">{t("referencesPage.visitWebsite", "Visit Website")}</p>
                      ) : null}
                    </article>
                  );

                  if (!item.website) return <div key={item.key}>{card}</div>;

                  return (
                    <a key={item.key} href={item.website} target="_blank" rel="noreferrer" aria-label={referenceLabel} title={referenceLabel}>
                      {card}
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 shadow-lg text-center text-gray-600">
                {t("referencesPage.empty", "No references found yet.")}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.8rem] p-12 text-center relative overflow-hidden">
                <span className="inline-block text-6xl mb-6">🚀</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
                  {t("referencesPage.ctaTitle", "Join Our References!")}
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  {t("referencesPage.ctaDesc", "We provide quality furniture solutions for your preschool or kindergarten. Contact us, let's work together.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {t("referencesPage.ctaPrimary", "Contact Us")}
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white border-2 border-cc-cyan text-cc-cyan font-display font-bold text-lg rounded-full hover:bg-cc-cyan hover:text-white transition-all duration-300"
                  >
                    {t("referencesPage.ctaSecondary", "View Products")}
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
