// app/page.tsx
import Hero from "@/components/Hero";
import ProductList from "@/components/ProductList";
import Features from "@/components/Features";
import ReferencesSection from "@/components/home/ReferencesSection";
import { getHome, getReferences } from "@/lib/api/endpoints";
import { buildMediaUrl } from "@/lib/utils/url";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return buildPageMetadata({
    title: lang === "en" ? "CCkids | Preschool Furniture" : "CCkids | Kreş Mobilyaları",
    description: t(
      "seo.homeDescription",
      "CCkids, kreş ve anaokulları için güvenli, ergonomik ve renkli mobilya çözümleri sunar.",
    ),
    path: "/",
    locale: lang,
  });
}

type ProjectImage = {
  imageUrl: string;
  title?: string | null;
  projectUuid?: string | null;
  linkUrl?: string | null;
};

export default async function HomePage() {
  const lang = await getServerLang();
  const homeRes = await Promise.allSettled([getHome(lang), getReferences(12, lang)]);
  const home = homeRes[0].status === "fulfilled" ? homeRes[0].value : null;
  const references = homeRes[1].status === "fulfilled" ? homeRes[1].value : [];

  const sections = Array.isArray(home?.sections) ? home.sections : [];
  const projectImages: ProjectImage[] = sections
    .filter((x: any) => (x?.kind ?? "").toLowerCase() === "hero")
    .map((x: any) => ({
      imageUrl: buildMediaUrl((x.media_url ?? x.image_url ?? x.url ?? null) as string | null) ?? "",
      title: (x.title ?? x.name ?? "") as string,
      projectUuid: (x.project_uuid ?? x.projectUuid ?? null) as string | null,
      linkUrl: (x.link_url ?? x.linkUrl ?? null) as string | null,
    }))
    .filter((x) => Boolean(x.imageUrl));

  return (
    <>
      <Hero projectImages={projectImages} />
      <ProductList />
      <Features />
      <ReferencesSection items={references} />
    </>
  );
}
