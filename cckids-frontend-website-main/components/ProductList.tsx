// components/ProductList.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getProducts } from '@/lib/api/endpoints';
import { buildMediaUrl } from '@/lib/utils/url';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { ProductListItem } from '@/lib/types';
import { resolveCategoryEmoji } from '@/lib/emojiPool';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PAGE_SIZE = 12;

const ProductList = () => {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = items.length < total;

  const normalizedItems = useMemo(() => {
    return items.map((p) => ({
      ...p,
      coverImageUrl: p.coverImageUrl ? buildMediaUrl(p.coverImageUrl) : null,
    }));
  }, [items]);

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-cc-pink to-pink-400',
      'from-cc-cyan to-cyan-400',
      'from-cc-orange to-orange-400',
      'from-cc-purple to-purple-400',
      'from-cc-yellow to-yellow-400',
      'from-cc-lime to-green-400',
    ];
    return gradients[index % gradients.length];
  };

  /**
   * Backend'den ürünleri çeker.
   * - reset=true ise listeyi sıfırlar (arama değişince)
   */
  const fetchPage = async (nextPage: number, reset = false) => {
    try {
      setError(null);

      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await getProducts({
        lang,
        q: debouncedSearch.trim() || undefined,
        page: nextPage,
        page_size: PAGE_SIZE,
      });

      const mapped: ProductListItem[] = res.items.map((x) => ({
        id: x.id,
        name: x.name,
        uuid: x.uuid,
        description: x.description ?? null,
        coverImageUrl: x.cover_image_url ?? null,
        sortOrder: x.sort_order ?? undefined,
        categories: Array.isArray((x as any).categories) ? (x as any).categories : [],
      }));


      setTotal(res.total);

      if (reset) {
        setItems(mapped);
        setPage(nextPage);
      } else {
        setItems((prev) => [...prev, ...mapped]);
        setPage(nextPage);
      }
    } catch (e: any) {
      setError(e?.message || t('productList.unexpectedError', 'Bir sorun oluştu. Lütfen tekrar deneyin.'));
      if (reset) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // İlk yükleme + arama değişince reset
  useEffect(() => {
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, lang]);

  return (
    <section id="urunler" className="py-20 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-5xl font-bold text-center mb-16">
          {t('productList.title', 'Ürünler')}
        </h2>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('productList.searchPlaceholder', 'Ürün ara...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-none rounded-full shadow-md outline-none focus:ring-4 focus:ring-cc-pink/20 transition-all text-gray-600 placeholder-gray-400 font-sans"
            />
          </div>

          <div className="text-sm text-gray-500 font-sans">
            {loading ? t('common.loading', 'Yükleniyor…') : `${total.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')} ${t('productList.productCount', 'ürün')}`}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-10 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            <div className="font-bold mb-1">{t('common.error', 'Hata')}</div>
            <div className="text-sm">{error}</div>
            <button
              onClick={() => fetchPage(1, true)}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              {t('common.retry', 'Tekrar dene')}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[30px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] animate-pulse"
              >
                <div className="w-20 h-20 rounded-[20px] mb-6 bg-gray-200" />
                <div className="h-48 mb-6 rounded-2xl bg-gray-200" />
                <div className="h-6 w-2/3 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : normalizedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {normalizedItems.map((product, idx) => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-[30px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  {/* Top Hover Border */}
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                  {/* Accent */}
                  <div
                    className={`w-20 h-20 rounded-[20px] mb-6 flex items-center justify-center text-4xl shadow-md bg-gradient-to-br ${getGradientClass(
                      idx
                    )} text-white animate-wiggle`}
                  >
                    {resolveCategoryEmoji(product.categories?.[0]?.emoji, "🌟")}
                  </div>


                  {/* Image */}
                  <div className="h-48 mb-6 overflow-hidden rounded-2xl relative bg-white">
                    {product.coverImageUrl ? (
                      <img
                        src={product.coverImageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                        {t('productList.imageMissing', 'Görsel yok')}
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-bold text-cc-text mb-3 group-hover:text-cc-pink transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                    {product.description || '—'}
                  </p>

                  <div className="mt-auto flex justify-end items-center pt-4 border-t border-gray-100">
                    <Link
                      href={`/products/${product.uuid}`}
                      className="text-sm font-bold text-gray-400 group-hover:text-cc-orange transition-colors"
                    >
                      {t('common.viewDetail', 'Detayı Gör')} &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            <div className="mt-12 flex justify-center">
              {canLoadMore ? (
                <button
                  onClick={() => fetchPage(page + 1, false)}
                  disabled={loadingMore}
                  className="px-8 py-4 rounded-full font-bold bg-cc-cyan text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {loadingMore ? t('common.loading', 'Yükleniyor…') : t('productList.loadMore', 'Daha fazla yükle')}
                </button>
              ) : (
                <div className="text-sm text-gray-400">{t('productList.thatsAll', 'Hepsi bu kadar 🎉')}</div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-[30px] border-2 border-dashed border-gray-300">
            <span className="text-4xl block mb-4">🔍</span>
            <p className="text-xl text-gray-500 font-display">{t('productList.empty', 'Aradığınız kriterlere uygun ürün bulunamadı.')}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
