// components/ProductDetail.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Phone,
  Truck,
  ShieldCheck,
  Settings2,
  ThumbsUp,
} from 'lucide-react';

import ProductImageGallery from './ProductImageGallery';
import ProductTabs from './ProductTabs';
import QuoteForm from './QuoteForm';

type ProductImage = {
  id: number;
  url: string;
  sortOrder: number;
};

type SiteSettings = {
  whatsapp_number: string;
  whatsapp_default_message: string;
};

type RelatedProduct = {
  id: number;
  name: string;
  slug: string;
  coverImageUrl?: string | null;
};

type ProductDetailModel = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  images: ProductImage[];
};

function normalizePhoneForWa(phone: string) {
  // +90 (532) 123-45-67 => 905321234567
  return phone.replace(/[^\d]/g, '').replace(/^0/, '90');
}

function buildWaUrl(settings: SiteSettings, productName: string) {
  const num = normalizePhoneForWa(settings.whatsapp_number || '');
  const baseText = settings.whatsapp_default_message || 'Merhaba, bilgi almak istiyorum.';
  const text = `${baseText}\nÜrün: ${productName}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

function formatTRY(value: number) {
  // ₺3.500 gibi (TR)
  return `₺${value.toLocaleString('tr-TR')}`;
}

function makeProductCode(productId: number) {
  // hedefte "CCK-MSA-001" gibi; backend yok → görsel yakınlık için
  return `CCK-${String(productId).padStart(3, '0')}`;
}

export default function ProductDetail({
  product,
  settings,
  relatedProducts,
}: {
  product: ProductDetailModel;
  settings?: SiteSettings | null;
  relatedProducts?: RelatedProduct[];
}) {
  const galleryImages = product.images?.length
    ? product.images
    : product.coverImageUrl
      ? [{ id: product.id, url: product.coverImageUrl, sortOrder: 0 }]
      : [];

  const waUrl = settings?.whatsapp_number ? buildWaUrl(settings, product.name) : null;
  const telUrl = settings?.whatsapp_number ? `tel:+${normalizePhoneForWa(settings.whatsapp_number)}` : null;

  // --- UI (hedef HTML'deki gibi) ---
  const productCode = useMemo(() => makeProductCode(product.id), [product.id]);

  const colors = useMemo(
    () => [
      {
        name: 'Gökkuşağı',
        cls: 'bg-gradient-to-br from-cc-pink via-cc-yellow to-cc-cyan',
      },
      { name: 'Pembe', cls: 'bg-cc-pink' },
      { name: 'Mavi', cls: 'bg-cc-cyan' },
      { name: 'Yeşil', cls: 'bg-cc-lime' },
      { name: 'Naturel', cls: 'bg-amber-200' },
    ],
    []
  );

  const sizes = useMemo(
    () => [
      { name: '4 Kişilik', note: '(120x60cm)', price: 3500, compareAt: 4200 },
      { name: '6 Kişilik', note: '(180x60cm)', price: 4200, compareAt: 4900 },
      { name: '8 Kişilik', note: '(240x60cm)', price: 5400, compareAt: 6200 },
    ],
    []
  );

  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [selectedSize, setSelectedSize] = useState(sizes[0].name);

  const activeSize = sizes.find((s) => s.name === selectedSize) ?? sizes[0];
  const discountPct = Math.max(
    0,
    Math.round(((activeSize.compareAt - activeSize.price) / activeSize.compareAt) * 100)
  );

  return (
    <div className="relative z-10">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm font-sans text-gray-500 animate-slide-up">
          <Link href="/" className="hover:text-cc-pink transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight size={16} />
          <Link href="/#urunler" className="hover:text-cc-pink transition-colors">
            Ürünler
          </Link>
          <ChevronRight size={16} />
          {/* backend’de kategori yok → hedefe yakınlık için sabit */}
          <Link href="/#urunler" className="hover:text-cc-pink transition-colors">
            Masalar
          </Link>
          <ChevronRight size={16} />
          <span className="text-cc-text font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <div className="animate-slide-right">
              <ProductImageGallery images={galleryImages} />
            </div>

            {/* Product Info */}
            <div className="animate-slide-left" style={{ animationDelay: '0.2s' }}>
              <div className="sticky top-32">
                {/* Category & Code */}
                <div className="flex items-center gap-3 mb-4">
                  <Link
                    href="/#urunler"
                    className="text-sm font-bold text-cc-cyan uppercase tracking-wider hover:text-cc-pink transition-colors"
                  >
                    Masalar
                  </Link>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-400">Ürün Kodu: {productCode}</span>
                </div>

                {/* Title */}
                <h1 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4 leading-tight">
                  {product.name}
                  <span className="inline-block animate-wiggle ml-2">🎨</span>
                </h1>

                {/* Short Description */}
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {product.description ||
                    'Çocukların birlikte çalışabileceği, ergonomik tasarımlı ve yuvarlak kenarlı güvenli bir ürün.'}
                </p>

                {/* Price */}
                <div className="bg-gradient-to-r from-cc-pink/10 to-cc-cyan/10 p-6 rounded-2xl mb-6">
                  <div className="flex items-end gap-4 mb-2 flex-wrap">
                    <span className="font-display text-4xl font-bold text-cc-pink">
                      {formatTRY(activeSize.price)}
                    </span>
                    <span className="text-lg text-gray-400 line-through mb-1">
                      {formatTRY(activeSize.compareAt)}
                    </span>
                    {discountPct > 0 ? (
                      <span className="bg-cc-lime text-white text-sm font-bold px-3 py-1 rounded-full mb-1">
                        %{discountPct} İndirim
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-500">KDV dahil fiyattır. Kargo ücretsizdir.</p>
                </div>

                {/* Color Options */}
                <div className="mb-6">
                  <h3 className="font-display font-bold text-cc-text mb-3">Renk Seçenekleri</h3>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((c) => {
                      const selected = c.name === selectedColor;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          title={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={[
                            'w-14 h-14 rounded-2xl border-2 border-white shadow-md hover:scale-110 transition-all duration-300',
                            c.cls,
                            selected ? 'ring-4 ring-cc-pink/30' : '',
                          ].join(' ')}
                          aria-label={c.name}
                        />
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Seçili:{' '}
                    <span className="font-semibold text-cc-pink">
                      {selectedColor}
                    </span>
                  </p>
                </div>

                {/* Size Options */}
                <div className="mb-6">
                  <h3 className="font-display font-bold text-cc-text mb-3">Boyut Seçenekleri</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((s) => {
                      const active = s.name === selectedSize;
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setSelectedSize(s.name)}
                          className={[
                            'px-5 py-3 rounded-xl border-2 font-bold transition-all duration-300',
                            active
                              ? 'border-cc-pink bg-cc-pink/10 text-cc-pink'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-cc-pink hover:text-cc-pink',
                          ].join(' ')}
                        >
                          {s.name} <span className="text-sm font-normal">{s.note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Features */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    'Leke Tutmaz Yüzey',
                    'Ayarlanabilir Ayaklar',
                    'E1 Sınıfı Ahşap',
                    '2 Yıl Garanti',
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                        ✓
                      </div>
                      <span className="text-sm font-medium text-gray-700">{t}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <a
                    href="#teklif"
                    className="w-full py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <ThumbsUp size={22} />
                    Bu Ürün İçin Teklif Al
                  </a>

                  <div className="flex gap-4">
                    {telUrl ? (
                      <a
                        href={telUrl}
                        className="flex-1 py-4 bg-white border-2 border-cc-cyan text-cc-cyan font-display font-bold rounded-2xl hover:bg-cc-cyan hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Phone size={18} />
                        Ara
                      </a>
                    ) : null}

                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-4 bg-white border-2 border-cc-lime text-cc-lime font-display font-bold rounded-2xl hover:bg-cc-lime hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck className="text-cc-cyan" size={20} />
                    <span className="text-sm font-medium">Ücretsiz Kargo</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <ShieldCheck className="text-cc-pink" size={20} />
                    <span className="text-sm font-medium">2 Yıl Garanti</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Settings2 className="text-cc-orange" size={20} />
                    <span className="text-sm font-medium">Montaj Desteği</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs (zaten hedefe yakın) */}
      <ProductTabs productName={product.name} description={product.description ?? null} />

      {/* Quote Form Section (hedefteki wrapper ile) */}
      <section id="teklif" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
              Bu Ürün İçin Teklif Alın <span className="inline-block animate-wiggle">📋</span>
            </h2>
            <p className="text-gray-500 text-lg">Formu doldurun, size özel fiyat teklifimizi hemen gönderelim.</p>
          </div>

          <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[2.5rem] shadow-2xl">
            <div className="bg-white rounded-[2.3rem] p-8 md:p-12">
              {/* Product Info bar (hedef HTML’deki gibi) */}
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 mb-6">
                {product.coverImageUrl ? (
                  <img
                    src={product.coverImageUrl}
                    alt="Ürün"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-200" />
                )}
                <div>
                  <p className="font-display font-bold text-cc-text">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    Seçili: <span className="font-medium">{selectedColor}</span> -{' '}
                    <span className="font-medium">{selectedSize}</span>
                  </p>
                </div>
              </div>

              <QuoteForm productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Products (UI hedefe yakın) */}
      {relatedProducts?.length ? (
        <section className="py-16 px-4 bg-gradient-to-br from-cc-cyan/5 to-cc-purple/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-4">
                Benzer Ürünler <span className="inline-block animate-wiggle">✨</span>
              </h2>
              <p className="text-gray-500">Bu ürünle birlikte tercih edilenler</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.slug}`}
                  className="group bg-white rounded-[2rem] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                    {rp.coverImageUrl ? (
                      <img
                        src={rp.coverImageUrl}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-cc-cyan uppercase">Ürün</span>
                  <h3 className="font-display text-lg font-bold text-cc-text mt-1 group-hover:text-cc-pink transition-colors">
                    {rp.name}
                  </h3>
                  <p className="font-display font-bold text-cc-pink mt-2">Teklif Al</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* sayfa sonu mini CTA */}
      <div className="pb-10 flex justify-center">
        <Link
          href="/#urunler"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-cc-purple transition-colors"
        >
          Diğer ürünler <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
