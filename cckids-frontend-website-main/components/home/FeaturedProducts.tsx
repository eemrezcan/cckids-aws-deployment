// components/home/FeaturedProducts.tsx
import Image from 'next/image';
import Link from 'next/link';
import { buildMediaUrl } from '@/lib/utils/url';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * FeaturedProducts:
 * - Home’da ilk 8 ürünü grid olarak gösterir
 * - Link: /products/<uuid|slug|id> (Y5’te UUID’ye sabitleyeceğiz)
 */
export default function FeaturedProducts({
  title,
  items,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  items: any[];
  ctaHref: string;
  ctaLabel: string;
}) {
  const { t } = useLanguage();
  const list = (items ?? []).slice(0, 8);

  return (
    <section className="py-16 px-4 relative z-10 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-2">{title}</h2>
            <p className="text-gray-500 text-lg">{t('home.featuredProducts.subtitle', 'En çok tercih edilen ürünlerimiz')}</p>
          </div>
          <Link href={ctaHref} className="inline-flex items-center gap-2 text-cc-pink font-bold hover:gap-3 transition-all">
            {ctaLabel} <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((p, idx) => {
            const id = String(p.uuid ?? p.slug ?? p.id ?? idx);
            const href = `/products/${encodeURIComponent(id)}`;
            const name = String(p.name ?? t('productsPage.product', 'Ürün'));
            const desc = String(p.description ?? p.short_info ?? '');
            const img = buildMediaUrl((p.cover_image_url ?? p.cover_image ?? null) as string | null);

            return (
              <Link
                key={id}
                href={href}
                className="group bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-[2rem]" />

                <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-gray-50">
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 320px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      {t('productList.imageMissing', 'Görsel yok')}
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <h3 className="font-display text-lg font-bold text-cc-text mt-1 mb-2 group-hover:text-cc-pink transition-colors">
                    {name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{desc || '—'}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center">
                  <span className="text-sm font-bold text-gray-400 group-hover:text-cc-orange transition-colors">
                    {t('projectDetail.reviewLink', 'İncele')} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
