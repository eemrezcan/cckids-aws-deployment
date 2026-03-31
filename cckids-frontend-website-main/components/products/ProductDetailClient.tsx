// components/products/ProductDetailClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildMediaUrl } from "@/lib/utils/url";
import type { ProductDetailOut, ProductListItemPublicOut } from "@/lib/api/types";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { resolveCategoryEmoji } from "@/lib/emojiPool";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function media(url?: string | null) {
  return (
    buildMediaUrl(url ?? null) ??
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1200&h=1200&fit=crop"
  );
}

function isValidHex(hex?: string | null) {
  return typeof hex === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim());
}

function sizeLabel(s: any) {
  const w = typeof s?.width === "number" ? s.width : null;
  const h = typeof s?.height === "number" ? s.height : null;
  const d = typeof s?.depth === "number" ? s.depth : null;
  const unit = typeof s?.unit === "string" ? s.unit : "";
  const parts = [w, h, d].filter((x) => x !== null);
  return parts.length ? `${parts.join("×")} ${unit}`.trim() : "";
}

function pickPhone(settings: any) {
  // Backend: SiteSettingsPublicOut.phone_number
  return settings?.phone_number || settings?.phone || settings?.contact_phone || "+908501234567";
}

function normalizePhoneToWaMe(phone: string) {
  return (phone || "").replace(/\D/g, "");
}

function pickWhatsapp(settings: any) {
  // Backend: SiteSettingsPublicOut.whatsapp_number
  const raw = settings?.whatsapp_number || settings?.whatsapp_phone || settings?.whatsapp || "905321234567";
  return normalizePhoneToWaMe(raw);
}

type GalleryItem = {
  id: number;
  url: string; // resolved url
  sortOrder: number;
  colorUuid?: string | null;
  sizeUuid?: string | null;
};

/**
 * Seçime göre "en iyi" görseli seçer.
 * Öncelik:
 * 1) color + size
 * 2) yalnız color
 * 3) yalnız size
 * 4) fallback: 0
 *
 * Birden fazla eşleşme varsa:
 * - sortOrder küçük olan
 * - eşitse id küçük olan
 */
function pickBestImageIndex(
  items: GalleryItem[],
  selectedColorUuid: string | null,
  selectedSizeUuid: string | null
) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const norm = (v: string | null | undefined) => (typeof v === "string" ? v : null);
  const c = norm(selectedColorUuid);
  const s = norm(selectedSizeUuid);

  const exact = c && s ? items.filter((x) => x.colorUuid === c && x.sizeUuid === s) : [];
  const bySize = s ? items.filter((x) => x.sizeUuid === s) : [];
  const byColor = c ? items.filter((x) => x.colorUuid === c) : [];

  let pool: GalleryItem[];

  // ✅ 1) exact match (color+size)
  if (exact.length) {
    pool = exact;
  }
  // ✅ 2) size öncelikli (size seçiliyse color'dan önce)
  else if (bySize.length) {
    pool = bySize;
  }
  // ✅ 3) color
  else if (byColor.length) {
    pool = byColor;
  }
  // ✅ 4) fallback
  else {
    pool = items;
  }

  const sorted = pool.slice().sort((a, b) => {
    const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (so !== 0) return so;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  const picked = sorted[0];
  const idx = items.findIndex((x) => x.id === picked.id);
  return idx >= 0 ? idx : 0;
}


export default function ProductDetailClient({
  product,
  related,
  settings,
}: {
  product: ProductDetailOut;
  related: ProductListItemPublicOut[];
  settings: any;
}) {
  const { t } = useLanguage();
  const colors = useMemo(() => (Array.isArray(product.colors) ? product.colors : []), [product]);
  const sizes = useMemo(() => {
    const arr = Array.isArray(product.sizes) ? product.sizes : [];
    return arr.slice().sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [product]);

  const categories = useMemo(() => (Array.isArray(product.categories) ? product.categories : []), [product]);

  // ✅ Görselleri metadata ile tutuyoruz (color/size ilişkisi için)
  const gallery = useMemo<GalleryItem[]>(() => {
    const list = Array.isArray(product.images) ? product.images : [];

    if (list.length) {
      return list
        .map((img: any) => ({
          id: typeof img?.id === "number" ? img.id : Math.floor(Math.random() * 1e9),
          url: media(img?.url ?? null),
          sortOrder: typeof img?.sort_order === "number" ? img.sort_order : 0,
          colorUuid: img?.color?.uuid ?? null,
          sizeUuid: img?.size?.uuid ?? null,
        }))
        .sort((a, b) => {
          const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          if (so !== 0) return so;
          return (a.id ?? 0) - (b.id ?? 0);
        });
    }

    // fallback: cover
    return [
      {
        id: product.id ?? 0,
        url: media(product.cover_image_url),
        sortOrder: 0,
        colorUuid: null,
        sizeUuid: null,
      },
    ];
  }, [product]);

  const imageUrls = useMemo(() => gallery.map((g) => g.url), [gallery]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [selectedColorUuid, setSelectedColorUuid] = useState<string | null>(colors[0]?.uuid ?? null);
  const [selectedSizeUuid, setSelectedSizeUuid] = useState<string | null>(sizes[0]?.uuid ?? null);

  const selectedColor = colors.find((c) => c.uuid === selectedColorUuid) ?? colors[0] ?? null;
  const selectedSize = sizes.find((s: any) => s.uuid === selectedSizeUuid) ?? sizes[0] ?? null;

  const selectedSizeText = selectedSize ? sizeLabel(selectedSize) || t("productDetail.fallbackOption", "—") : t("productDetail.fallbackOption", "—");

  const [tab, setTab] = useState<"aciklama" | "ozellikler" | "malzeme" | "teslimat">("aciklama");

  const phone = pickPhone(settings);
  const wa = pickWhatsapp(settings);

  const whatsappText = useMemo(() => {
    const parts = [
      t("quoteForm.message.subject", "Konu: {value}").replace("{value}", product.name),
      selectedColor?.name ? t("quoteForm.message.color", "Renk: {value}").replace("{value}", selectedColor.name) : "",
      selectedSize ? t("quoteForm.message.size", "Boyut: {value}").replace("{value}", sizeLabel(selectedSize) || t("productDetail.defaultSizeOption", "Seçenek")) : "",
    ].filter(Boolean);
    return encodeURIComponent(parts.join(" "));
  }, [product.name, selectedColor?.name, selectedSize, t]);

  const whatsappHref = `https://wa.me/${wa}?text=${whatsappText}`;

  function openLightbox(index: number) {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }

  function nextImage() {
    setCurrentImageIndex((i) => (i + 1) % imageUrls.length);
  }

  function prevImage() {
    setCurrentImageIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, imageUrls.length]);

  // unmount sırasında scroll lock cleanup (edge-case)
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function scrollToQuote() {
    const el = document.getElementById("teklif");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const quickFeatures = useMemo(() => {
    const api = (product.details as any)?.ozet_ozellik;
    if (Array.isArray(api) && api.length) return api.slice(0, 4);
    return [
      t("productDetail.quick.i1", "Leke Tutmaz Yüzey"),
      t("productDetail.quick.i2", "Ayarlanabilir Ayaklar"),
      t("productDetail.quick.i3", "E1 Sınıfı Ahşap"),
      t("productDetail.quick.i4", "2 Yıl Garanti"),
    ];
  }, [product.details, t]);

  /**
   * ✅ Seçili color/size değişince en uygun görseli seç.
   * - Hem color hem size seçiliyse ikisine uyan görsel öncelik.
   */
  useEffect(() => {
    const idx = pickBestImageIndex(gallery, selectedColorUuid, selectedSizeUuid);
    setCurrentImageIndex(idx);
  }, [gallery, selectedColorUuid, selectedSizeUuid]);

  /**
   * ✅ Galeri uzunluğu azaldıysa index taşmasın
   */
  useEffect(() => {
    if (currentImageIndex >= imageUrls.length) setCurrentImageIndex(0);
  }, [currentImageIndex, imageUrls.length]);

  // Aktif görsel (quote form vb için)
  const activeImageUrl = imageUrls[currentImageIndex] ?? imageUrls[0] ?? null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm font-sans text-gray-500">
          <Link href="/" className="hover:text-cc-pink transition-colors">
            {t("nav.home", "Ana Sayfa")}
          </Link>
          <span aria-hidden>›</span>
          <Link href="/products" className="hover:text-cc-pink transition-colors">
            {t("nav.products", "Ürünler")}
          </Link>

          {categories[0] ? (
            <>
              <span aria-hidden>›</span>
              <Link
                href={`/products?category=${encodeURIComponent(categories[0].uuid)}`}
                className="hover:text-cc-pink transition-colors"
              >
                {categories[0].name}
              </Link>
            </>
          ) : null}

          <span aria-hidden>›</span>
          <span className="text-cc-text font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <div className="animate-slide-right">
              <div className="relative bg-white rounded-[2.5rem] p-4 shadow-xl mb-4 overflow-hidden group">
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                  <span className="bg-gradient-to-r from-cc-orange to-cc-yellow text-white px-4 py-2 rounded-full font-display font-bold text-sm shadow-lg flex items-center gap-2">
                    ⭐ {t("productDetail.badge.featured", "Öne Çıkan")}
                  </span>
                  <span className="bg-cc-lime text-white px-4 py-2 rounded-full font-display font-bold text-sm shadow-lg">
                    {t("productDetail.badge.inProduction", "Üretimde")}
                  </span>
                </div>

                <div className="absolute top-6 right-6 z-10">
                  <button
                    onClick={() => openLightbox(currentImageIndex)}
                    className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-cc-text hover:bg-cc-pink hover:text-white transition-all duration-300 shadow-lg"
                    aria-label={t("productDetail.aria.zoom", "Büyüt")}
                  >
                    ⛶
                  </button>
                </div>

                <div
                  className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 cursor-zoom-in"
                  onClick={() => openLightbox(currentImageIndex)}
                >
                  <img
                    src={imageUrls[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {imageUrls.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    onClick={() => setCurrentImageIndex(i)}
                    className={[
                      "flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-[3px] transition-all duration-300",
                      i === currentImageIndex
                        ? "border-cc-pink shadow-[0_0_0_3px_rgba(233,30,99,0.2)]"
                        : "border-transparent hover:border-cc-pink",
                    ].join(" ")}
                    aria-label={t("productDetail.aria.image", "Görsel {index}").replace("{index}", String(i + 1))}
                  >
                    <img src={src} alt={t("productDetail.aria.image", "Görsel {index}").replace("{index}", String(i + 1))} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="animate-slide-left" style={{ animationDelay: "0.2s" }}>
              <div className="sticky top-32">
                <div className="flex items-center gap-3 mb-4">
                  {categories[0] ? (
                    <Link
                      href={`/products?category=${encodeURIComponent(categories[0].uuid)}`}
                      className="text-sm font-bold text-cc-cyan uppercase tracking-wider hover:text-cc-pink transition-colors"
                    >
                      {categories[0].name}
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-cc-cyan uppercase tracking-wider">{t("productList.title", "Ürün")}</span>
                  )}

                </div>

<h1 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4 leading-tight">
  {product.name}{" "}
  <span className="inline-block animate-wiggle ml-2">
    {resolveCategoryEmoji(categories?.[0]?.emoji, "🎨")}
  </span>
</h1>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {product.description ?? t("productDetail.contactForDetails", "Detaylı bilgi ve size özel teklif için hemen iletişime geçin.")}
                </p>

                {/* PRICE yerine TEKLİF AL bloğu */}
                <div className="bg-gradient-to-r from-cc-pink/10 to-cc-cyan/10 p-6 rounded-2xl mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display text-2xl md:text-3xl font-bold text-cc-pink">{t("nav.getQuote", "Teklif Al")}</span>
                    <span className="bg-cc-lime text-white text-sm font-bold px-3 py-1 rounded-full">{t("productDetail.specialPrice", "% Özel Fiyat")}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t("productDetail.priceInfo", "Fiyatlar; renk, ölçü ve adet bilgilerine göre değişebilir. Formu doldurun, hızlıca dönüş yapalım.")}
                  </p>
                </div>

                {/* Color Options */}
                {colors.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-cc-text mb-3">{t("productDetail.colorOptions", "Renk Seçenekleri")}</h3>
                    <div className="flex gap-3 flex-wrap">
                      {colors.map((c) => {
                        const selected = c.uuid === selectedColorUuid;
                        const bgStyle = isValidHex(c.hex)
                          ? { backgroundColor: c.hex as string }
                          : {
                              backgroundImage:
                                "linear-gradient(135deg, rgba(233,30,99,1), rgba(205,220,57,1), rgba(0,188,212,1))",
                            };

                        return (
                          <button
                            key={c.uuid}
                            onClick={() => {
                              // ✅ renk seç -> uygun görsel otomatik seçilecek (useEffect ile)
                              setSelectedColorUuid(c.uuid);
                            }}
                            className={[
                              "w-14 h-14 rounded-2xl border-2 border-white shadow-md hover:scale-110 transition-all duration-300",
                              selected ? "shadow-[0_0_0_3px_#E91E63]" : "",
                            ].join(" ")}
                            style={bgStyle}
                            title={c.name}
                            aria-label={c.name}
                          />
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {t("productDetail.selected", "Seçili")}: <span className="font-semibold text-cc-pink">{selectedColor?.name ?? t("productDetail.fallbackOption", "—")}</span>
                    </p>
                  </div>
                ) : null}

                {/* Size Options */}
                {sizes.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-cc-text mb-3">{t("productDetail.sizeOptions", "Boyut Seçenekleri")}</h3>
                    <div className="flex flex-wrap gap-3">
                      {sizes.map((s: any) => {
                        const selected = s.uuid === selectedSizeUuid;
                        return (
                          <button
                            key={s.uuid}
                            onClick={() => {
                              // ✅ ölçü seç -> uygun görsel otomatik seçilecek (useEffect ile)
                              setSelectedSizeUuid(s.uuid);
                            }}
                            className={[
                              "px-5 py-3 rounded-xl border-2 font-bold transition-all duration-300",
                              selected
                                ? "border-cc-pink bg-cc-pink/10 text-cc-pink"
                                : "border-gray-200 bg-white text-gray-600 hover:border-cc-pink hover:text-cc-pink",
                            ].join(" ")}
                          >
                            {t("productDetail.size", "Ölçü")} <span className="text-sm font-normal">({sizeLabel(s) || t("productDetail.fallbackOption", "—")})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Quick Features */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {quickFeatures.map((feat: string, i: number) => (
                    <div key={`${feat}-${i}`} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                        ✓
                      </div>
                      <span className="text-sm font-medium text-gray-700">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={scrollToQuote}
                    className="w-full py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {t("productDetail.cta.quoteForProduct", "Bu Ürün İçin Teklif Al")}
                  </button>

                  <div className="flex gap-4">
                    <a
                      href={`tel:${phone}`}
                      className="flex-1 py-4 bg-white border-2 border-cc-cyan text-cc-cyan font-display font-bold rounded-2xl hover:bg-cc-cyan hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {t("common.search", "Ara")}
                    </a>

                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-4 bg-white border-2 border-cc-lime text-cc-lime font-display font-bold rounded-2xl hover:bg-cc-lime hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {t("common.whatsapp", "WhatsApp")}
                    </a>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-cc-pink">🛡️</span>
                    <span className="text-sm font-medium">{t("productDetail.warrantyBadge", "2 Yıl Garanti")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-cc-orange">🧰</span>
                    <span className="text-sm font-medium">{t("productDetail.installation", "Montaj Desteği")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-16 px-4 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lg">
            {[
              ["aciklama", t("productDetail.tabs.description", "📝 Açıklama")],
              ["ozellikler", t("productDetail.tabs.features", "⚙️ Teknik Özellikler")],
              ["malzeme", t("productDetail.tabs.material", "🪵 Malzeme & Üretim")],
              ["teslimat", t("productDetail.tabs.delivery", "🚚 Teslimat & Garanti")],
            ].map(([k, label]) => {
              const active = tab === (k as any);
              return (
                <button
                  key={k}
                  onClick={() => setTab(k as any)}
                  className={[
                    "tab-btn flex-1 min-w-[150px] py-4 px-6 rounded-xl font-display font-bold transition-all duration-300",
                    active ? "bg-cc-pink text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl">
            {/* Açıklama */}
            {tab === "aciklama" ? (
              <div className="animate-zoom-in">
                <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t("productDetail.descriptionTitle", "Ürün Açıklaması")}</h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    {(product.details as any)?.aciklama?.aciklama_detay ??
                      t("productDetail.descriptionFallback", "Bu ürün hakkında detaylı bilgi için teklif formunu doldurabilir veya WhatsApp üzerinden yazabilirsiniz.")}
                  </p>

                  {Array.isArray((product.details as any)?.ozet_ozellik) ? (
                    <>
                      <h3 className="font-display text-xl font-bold text-cc-text mt-8">{t("productDetail.highlights", "Öne Çıkanlar")}</h3>
                      <ul className="space-y-3 mt-4">
                        {(product.details as any).ozet_ozellik.slice(0, 8).map((x: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-cc-pink/10 rounded-full flex items-center justify-center text-cc-pink shrink-0 mt-1">
                              ✓
                            </span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Teknik Özellikler */}
            {tab === "ozellikler" ? (
              <div>
                <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t("productDetail.featuresTitle", "Teknik Özellikler")}</h2>

                {Array.isArray((product.details as any)?.teknik_ozellikler) && (product.details as any).teknik_ozellikler.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(product.details as any).teknik_ozellikler.map((obj: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-6">
                        {Object.entries(obj || {}).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-gray-500">{k}</span>
                            <span className="font-bold text-cc-text">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">{t("productDetail.featuresSoon", "Teknik özellikler yakında eklenecektir.")}</p>
                )}
              </div>
            ) : null}

            {/* Malzeme & Üretim */}
            {tab === "malzeme" ? (
              <div>
                <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t("productDetail.materialTitle", "Malzeme & Üretim")}</h2>

                {Array.isArray((product.details as any)?.malzeme_uretim) && (product.details as any).malzeme_uretim.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(product.details as any).malzeme_uretim.map((block: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="font-display text-xl font-bold text-cc-text mb-4">{block?.baslik}</h3>
                        <ul className="space-y-3 text-gray-600">
                          {Array.isArray(block?.items)
                            ? block.items.map((it: string, j: number) => (
                                <li key={j} className="flex items-start gap-2">
                                  <span className="text-cc-pink">•</span>
                                  {it}
                                </li>
                              ))
                            : null}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">{t("productDetail.materialSoon", "Malzeme & üretim bilgileri yakında eklenecektir.")}</p>
                )}

                <div className="mt-8 p-6 bg-cc-lime/10 rounded-2xl">
                  <h3 className="font-display text-xl font-bold text-cc-text mb-3">{t("productDetail.sustainableTitle", "🌿 Sürdürülebilir Üretim")}</h3>
                  <p className="text-gray-600">{t("productDetail.sustainableText", "Çocuk dostu malzemeler ve çevreye duyarlı üretim yaklaşımıyla çalışıyoruz.")}</p>
                </div>
              </div>
            ) : null}

            {/* Teslimat & Garanti */}
            {tab === "teslimat" ? (
              <div>
                <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t("productDetail.deliveryTitle", "Teslimat & Garanti")}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-cc-cyan/5 p-6 rounded-2xl">
                    <h3 className="font-display text-xl font-bold text-cc-text mb-4 flex items-center gap-2">
                      <span className="w-10 h-10 bg-cc-cyan rounded-xl flex items-center justify-center text-white text-xl">
                        🚚
                      </span>
                      {t("productDetail.deliveryInfoTitle", "Teslimat Bilgileri")}
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-cc-cyan font-bold">•</span> {t("productDetail.delivery.i1", "Türkiye geneli sevkiyat")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cc-cyan font-bold">•</span> {t("productDetail.delivery.i2", "Ortalama teslim: 7-10 iş günü")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cc-cyan font-bold">•</span> {t("productDetail.delivery.i3", "Güvenli ambalaj")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cc-cyan font-bold">•</span> {t("productDetail.delivery.i4", "Toplu siparişlerde destek")}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-cc-pink/5 p-6 rounded-2xl">
                    <h3 className="font-display text-xl font-bold text-cc-text mb-4 flex items-center gap-2">
                      <span className="w-10 h-10 bg-cc-pink rounded-xl flex items-center justify-center text-white text-xl">
                        🛡️
                      </span>
                      {t("productDetail.warrantyTitle", "Garanti Koşulları")}
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-cc-pink font-bold">•</span> {t("productDetail.warranty.i1", "2 yıl üretici garantisi")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cc-pink font-bold">•</span> {t("productDetail.warranty.i2", "Yedek parça desteği")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cc-pink font-bold">•</span> {t("productDetail.warranty.i3", "Teknik destek")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cc-pink font-bold">•</span> {t("productDetail.warranty.i4", "Servis imkanı")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Quote Form Section (TEK component) */}
      <section id="teklif" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
              {t("productDetail.quoteTitle", "Bu Ürün İçin Teklif Alın")} <span className="inline-block animate-wiggle">📋</span>
            </h2>
            <p className="text-gray-500 text-lg">{t("productDetail.quoteSubtitle", "Formu doldurun, size özel fiyat teklifimizi hemen gönderelim.")}</p>
          </div>

          <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[2.5rem] shadow-2xl">
            <QuoteRequestForm
              variant="product"
              productId={product.id ?? null}
              productUuid={product.uuid}
              productName={product.name}
              selectedColorName={selectedColor?.name ?? null}
              selectedSizeLabel={selectedSizeText}
              // ✅ artık aktif görseli gönderiyoruz
              productImageUrl={activeImageUrl}
            />
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related?.length ? (
        <section className="py-16 px-4 bg-gradient-to-br from-cc-cyan/5 to-cc-purple/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-4">
                {t("productDetail.related", "Benzer Ürünler")} <span className="inline-block animate-wiggle">✨</span>
              </h2>
              <p className="text-gray-500">{t("productDetail.relatedSubtitle", "Bu ürünle birlikte tercih edilenler")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link
                  key={p.uuid}
                  href={`/products/${encodeURIComponent(p.uuid)}`}
                  className="group bg-white rounded-[2rem] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                    <img
                      src={media(p.cover_image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-cc-text mt-1 group-hover:text-cc-pink transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="font-display font-bold text-cc-pink mt-2">{t("nav.getQuote", "Teklif Al")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Lightbox */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label={t("common.close", "Kapat")}
          >
            ✕
          </button>

          {imageUrls.length > 1 ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={t("hero.previous", "Önceki")}
              >
                ‹
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={t("hero.next", "Sonraki")}
              >
                ›
              </button>
            </>
          ) : null}

          <img
            src={imageUrls[currentImageIndex]}
            alt={t("productDetail.largeImage", "Büyük Görsel")}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
