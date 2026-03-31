// components/ProductTabs.tsx
'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type TabKey = 'aciklama' | 'ozellikler' | 'malzeme' | 'teslimat';

type Props = {
  productName: string;
  description?: string | null;
};

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-display font-bold transition-all duration-300 ${
        active ? 'bg-cc-pink text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProductTabs({ productName, description }: Props) {
  const { t } = useLanguage();
  const [active, setActive] = useState<TabKey>('aciklama');

  const content = useMemo(() => {
    const desc = (description ?? '').trim();

    return {
      aciklama: (
        <div className="animate-zoom-in">
          <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t('productTabs.descriptionTitle', 'Ürün Açıklaması')}</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              <strong className="text-cc-text">{productName}</strong>{' '}
              {desc ? `— ${desc}` : t('productTabs.defaultDescription', 'kreş ve anaokulu kullanımı için tasarlanmış güvenli ve dayanıklı bir üründür.')}
            </p>

            <h3 className="font-display text-xl font-bold text-cc-text mt-8 mb-4">
              {t('productTabs.whyChoose', 'Neden Bu Ürünü Seçmelisiniz?')}
            </h3>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-cc-pink/10 text-cc-pink rounded-full flex items-center justify-center shrink-0 mt-1">
                  ✓
                </span>
                <span>
                  <strong className="text-cc-text">{t('productTabs.safeDesign', 'Güvenli Tasarım')}:</strong> {t('productTabs.safeDesignText', 'Yuvarlak hatlar ve çocuk dostu yüzey.')}
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-cc-cyan/10 text-cc-cyan rounded-full flex items-center justify-center shrink-0 mt-1">
                  ✓
                </span>
                <span>
                  <strong className="text-cc-text">{t('productTabs.easyClean', 'Kolay Temizlik')}:</strong> {t('productTabs.easyCleanText', 'Leke tutmaz, silinebilir yüzey.')}
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-cc-orange/10 text-cc-orange rounded-full flex items-center justify-center shrink-0 mt-1">
                  ✓
                </span>
                <span>
                  <strong className="text-cc-text">{t('productTabs.durable', 'Dayanıklı Yapı')}:</strong> {t('productTabs.durableText', 'Yoğun kullanıma uygun üretim.')}
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-cc-lime/10 text-cc-lime rounded-full flex items-center justify-center shrink-0 mt-1">
                  ✓
                </span>
                <span>
                  <strong className="text-cc-text">{t('productTabs.longLife', 'Uzun Ömür')}:</strong> {t('productTabs.longLifeText', 'Kreş standardına uygun malzeme seçimi.')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),

      ozellikler: (
        <div className="animate-zoom-in">
          <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t('productTabs.featuresTitle', 'Teknik Özellikler')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              [t('productTabs.spec.productCode', 'Ürün Kodu'), productName.slice(0, 3).toUpperCase() + '-000'],
              [t('productTabs.spec.dimensions', 'Boyutlar'), '—'],
              [t('productTabs.spec.heightAdjust', 'Yükseklik Ayarı'), '—'],
              [t('productTabs.spec.material', 'Malzeme'), '—'],
              [t('productTabs.spec.edgeBand', 'Kenar Bandı'), '—'],
              [t('productTabs.spec.capacity', 'Taşıma Kapasitesi'), '—'],
              [t('productTabs.spec.ageGroup', 'Yaş Grubu'), '—'],
              [t('productTabs.spec.certs', 'Sertifikalar'), '—'],
              [t('productTabs.spec.warranty', 'Garanti'), t('productTabs.spec.warrantyValue', '2 yıl')],
              [t('productTabs.spec.delivery', 'Teslim Süresi'), t('productTabs.spec.deliveryValue', '7-10 iş günü')],
            ].map(([k, v], idx) => (
              <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-500">{k}</span>
                <span className="font-bold text-cc-text">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">{t('productTabs.featuresNote', 'Not: Teknik veriler backend’e eklendiğinde bu alan otomatik güncellenecek.')}</p>
        </div>
      ),

      malzeme: (
        <div className="animate-zoom-in">
          <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t('productTabs.materialTitle', 'Malzeme & Üretim')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-cc-orange/10 rounded-xl flex items-center justify-center text-xl">
                  🪵
                </span>
                {t('productTabs.topSurface', 'Üst Yüzey')}
              </h3>
              <ul className="space-y-3 text-gray-600">
                {[
                  t('productTabs.surface.i1', 'E1 sınıfı ahşap türevleri (düşük emisyon)'),
                  t('productTabs.surface.i2', 'Kolay temizlenebilir kaplama'),
                  t('productTabs.surface.i3', 'Antibakteriyel yüzey opsiyonu'),
                  t('productTabs.surface.i4', 'ABS kenar bandı'),
                ].map((x, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cc-pink">•</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-cc-cyan/10 rounded-xl flex items-center justify-center text-xl">
                  🦿
                </span>
                {t('productTabs.legs', 'Ayaklar')}
              </h3>
              <ul className="space-y-3 text-gray-600">
                {[
                  t('productTabs.legsList.i1', 'Sağlam gövde yapısı'),
                  t('productTabs.legsList.i2', 'Zemin koruyucu tabanlar'),
                  t('productTabs.legsList.i3', 'Yükseklik ayar mekanizması (ops.)'),
                  t('productTabs.legsList.i4', 'Çocuk dostu boya/vernik'),
                ].map((x, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cc-cyan">•</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-cc-lime/10 rounded-2xl">
            <h3 className="font-display text-xl font-bold text-cc-text mb-3 flex items-center gap-2">
              {t('productTabs.sustainable', '🌿 Sürdürülebilir Üretim')}
            </h3>
            <p className="text-gray-600">{t('productTabs.sustainableText', 'Üretimde çocuk sağlığına uygun malzemeler kullanılır. Sertifika ve detaylar backend’e eklendiğinde burada otomatik gösterilecektir.')}</p>
          </div>
        </div>
      ),

      teslimat: (
        <div className="animate-zoom-in">
          <h2 className="font-display text-3xl font-bold text-cc-text mb-6">{t('productTabs.deliveryTitle', 'Teslimat & Garanti')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-cc-cyan/5 p-6 rounded-2xl">
              <h3 className="font-display text-xl font-bold text-cc-text mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-cc-cyan rounded-xl flex items-center justify-center text-white text-xl">
                  🚚
                </span>
                {t('productTabs.deliveryInfo', 'Teslimat Bilgileri')}
              </h3>
              <ul className="space-y-3 text-gray-600">
                {[
                  t('productTabs.deliveryList.i1', 'Türkiye geneli sevkiyat'),
                  t('productTabs.deliveryList.i2', 'Teslimat süresi: 7-10 iş günü'),
                  t('productTabs.deliveryList.i3', 'Güvenli ambalaj'),
                  t('productTabs.deliveryList.i4', 'Toplu alımlarda destek'),
                ].map((x, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cc-cyan font-bold">•</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-cc-pink/5 p-6 rounded-2xl">
              <h3 className="font-display text-xl font-bold text-cc-text mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-cc-pink rounded-xl flex items-center justify-center text-white text-xl">
                  🛡️
                </span>
                {t('productTabs.warranty', 'Garanti Koşulları')}
              </h3>
              <ul className="space-y-3 text-gray-600">
                {[t('productTabs.warrantyList.i1', 'Üretici garantisi'), t('productTabs.warrantyList.i2', 'Yedek parça temini'), t('productTabs.warrantyList.i3', 'Teknik destek')].map((x, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cc-pink font-bold">•</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    } satisfies Record<TabKey, React.ReactNode>;
  }, [description, productName, t]);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lg">
          <TabButton active={active === 'aciklama'} onClick={() => setActive('aciklama')}>
            {t('productDetail.tabs.description', '📝 Açıklama')}
          </TabButton>
          <TabButton active={active === 'ozellikler'} onClick={() => setActive('ozellikler')}>
            {t('productDetail.tabs.features', '⚙️ Teknik Özellikler')}
          </TabButton>
          <TabButton active={active === 'malzeme'} onClick={() => setActive('malzeme')}>
            {t('productDetail.tabs.material', '🪵 Malzeme & Üretim')}
          </TabButton>
          <TabButton active={active === 'teslimat'} onClick={() => setActive('teslimat')}>
            {t('productDetail.tabs.delivery', '🚚 Teslimat & Garanti')}
          </TabButton>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl">
          {active === 'aciklama' ? content.aciklama : null}
          {active === 'ozellikler' ? content.ozellikler : null}
          {active === 'malzeme' ? content.malzeme : null}
          {active === 'teslimat' ? content.teslimat : null}
        </div>
      </div>
    </section>
  );
}
