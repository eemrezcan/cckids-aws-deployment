// app/products/[uuid]/page.tsx
import type { Metadata } from "next";
import { getHome, getProductDetail, getProductsByCategory } from "@/lib/api/endpoints";
import type { ProductDetailOut, ProductListItemPublicOut } from "@/lib/api/types";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata, productJsonLd } from "@/lib/seo";
import { buildMediaUrl } from "@/lib/utils/url";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ uuid: string }>;
};

function toPlainText(value?: string | null) {
  if (!value) return "";
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const { uuid } = await params;

  try {
    const product = await getProductDetail(uuid, lang);
    return buildPageMetadata({
      title: `${product.name} | ${t("productsPage.metaTitle", "Ürünler | CCkids Kreş Mobilyaları")}`,
      description:
        toPlainText(product.description) ||
        t("seo.productsDescription", "Kreş ve anaokulları için masa, sandalye, dolap ve daha fazlasını keşfedin."),
      path: `/products/${encodeURIComponent(uuid)}`,
      ogImage: buildMediaUrl(product.cover_image_url ?? null) ?? "/Logo.png",
      locale: lang,
    });
  } catch {
    return buildPageMetadata({
      title: t("products.productNotFound", "Ürün bulunamadı"),
      description: t("productDetail.notFoundDesc", "Bağlantı hatalı olabilir veya ürün kaldırılmış olabilir."),
      path: `/products/${encodeURIComponent(uuid)}`,
      locale: lang,
    });
  }
}

/**
 * Ürün Detay Sayfası:
 * - Layout artık global: Navbar/Footer/Decorations/WhatsAppButton burada yok.
 * - Bu sayfada getHome() şimdilik ProductDetailClient -> settings için tutuldu.
 *   (Sonraki adımda settings'i context veya hook ile tekilleştirebiliriz.)
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const { uuid } = await params;

  const [homeRes, productRes] = await Promise.allSettled([getHome(lang), getProductDetail(uuid, lang)]);
  const home = homeRes.status === "fulfilled" ? homeRes.value : null;

  if (productRes.status !== "fulfilled") {
    return (
      <div className="relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto bg-white rounded-[2rem] p-10 shadow-lg text-center">
          <h1 className="font-display text-4xl font-bold text-cc-text mb-3">{t("products.productNotFound", "Ürün bulunamadı")}</h1>
          <p className="text-gray-500 mb-8">{t("productDetail.notFoundDesc", "Bağlantı hatalı olabilir veya ürün kaldırılmış olabilir.")}</p>
          <a
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {t("productDetail.backToProducts", "Ürünlere Dön")} →
          </a>
        </div>
      </div>
    );
  }

  const product: ProductDetailOut = productRes.value;

  // Related products: ilk kategoriye göre 4 ürün
  let related: ProductListItemPublicOut[] = [];
  const firstCategory = Array.isArray(product.categories) ? product.categories[0] : null;

  if (firstCategory?.uuid) {
    const relRes = await getProductsByCategory(firstCategory.uuid, 1, 12, undefined, lang);
    const relItems = Array.isArray(relRes?.items) ? relRes.items : [];
    related = relItems.filter((x) => x.uuid !== product.uuid).slice(0, 4);
  }

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: toPlainText(product.description) || t("common.detailsForReview", "Detaylar için inceleyin."),
          image: buildMediaUrl(product.cover_image_url ?? null),
          uuid: product.uuid,
        })}
      />
      <ProductDetailClient product={product} related={related} settings={home?.settings ?? null} />
    </>
  );
}
