// app/products/[slug]/not-found.tsx
import Link from 'next/link';
import { getServerLang, getServerT } from '@/lib/i18n/server';

export default async function NotFound() {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white/70 backdrop-blur rounded-[2rem] p-10 border border-gray-200 text-center">
        <div className="text-5xl mb-4">🧸</div>
        <h1 className="font-display text-3xl font-bold text-cc-text mb-3">{t('products.productNotFound', 'Ürün bulunamadı')}</h1>
        <p className="text-gray-600 mb-8">
          {t('productDetail.notFoundDesc', 'Aradığınız ürün kaldırılmış olabilir veya bağlantı hatalı olabilir.')}
        </p>
        <Link
          href="/#urunler"
          className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold bg-cc-cyan text-white shadow-lg hover:shadow-xl transition-all"
        >
          {t('productDetail.backToProducts', 'Ürünlere dön')}
        </Link>
      </div>
    </div>
  );
}
