'use client';

import { ShieldCheck, Smile, Heart, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const Features = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: ShieldCheck,
      title: t('features.items.safeMaterial.title', 'Güvenli Malzeme'),
      desc: t('features.items.safeMaterial.desc', 'Tüm ürünlerimiz sertifikalı, çocuk sağlığına uygun malzemelerden üretilir.'),
      color: 'text-cc-pink',
      delay: 'delay-100',
    },
    {
      icon: Smile,
      title: t('features.items.colorfulDesign.title', 'Renkli Tasarım'),
      desc: t('features.items.colorfulDesign.desc', 'Çocukların hayal gücünü geliştiren, canlı ve neşeli renkler.'),
      color: 'text-cc-cyan',
      delay: 'delay-200',
    },
    {
      icon: Heart,
      title: t('features.items.ergonomic.title', 'Ergonomik'),
      desc: t('features.items.ergonomic.desc', 'Minik bedenlere tam uyum sağlayan konforlu yapılar.'),
      color: 'text-cc-yellow',
      delay: 'delay-300',
    },
    {
      icon: Zap,
      title: t('features.items.fastDelivery.title', 'Hızlı Teslimat'),
      desc: t('features.items.fastDelivery.desc', 'Türkiye geneli hızlı ve güvenli teslimat hizmeti.'),
      color: 'text-cc-purple',
      delay: 'delay-400',
    },
  ];

  return (
    <section id="hakkimizda" className="py-20 relative z-10 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-cc-text">{t('features.title', 'Neden Biz?')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, index) => (
            <div key={index} className={`flex flex-col items-center text-center group animate-pop-in ${f.delay}`}>
              <div
                className="w-24 h-24 bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center mb-6 transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
              >
                <f.icon className={f.color} size={48} strokeWidth={2} />
              </div>

              <h3 className="font-display text-xl font-bold text-cc-text mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
