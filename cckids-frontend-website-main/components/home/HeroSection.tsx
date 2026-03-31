'use client';

// components/home/HeroSection.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, CheckCircle, ShieldCheck, Truck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * HeroSection:
 * - index.html’deki üst hero metni + featured ürün kartı
 * - Linkler route bazlı (contact/products)
 */
export default function HeroSection({
  featuredProduct,
}: {
  featuredProduct?: {
    name: string;
    description?: string | null;
    coverImageUrl?: string | null;
    href?: string | null;
  };
}) {
  const { t } = useLanguage();
  const benefits = [
    t('home.hero.b1', 'Güvenli yuvarlak kenarlar'),
    t('home.hero.b2', 'Kolay temizlenir yüzey'),
    t('home.hero.b3', 'Uzun ömürlü ve dayanıklı malzeme'),
  ];

  const title = featuredProduct?.name ?? t('home.hero.defaultTitle', 'CCKids Kreş Mobilyaları');
  const desc =
    featuredProduct?.description ??
    t('hero.subtitle', 'Çocuklarınızın hayal gücünü besleyen, güvenli ve eğlenceli kreş mobilyaları ile tanışın.');

  return (
    <section className="relative pt-24 pb-16 px-4 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        {/* Text */}
        <div className="text-center space-y-8 relative z-20 max-w-5xl animate-fade-in-up">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/50 blur-3xl -z-10 rounded-full" />

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight animate-gradient-text bg-gradient-to-r from-cc-pink via-cc-purple to-cc-yellow bg-[length:300%_300%] bg-clip-text text-transparent pb-2 drop-shadow-sm">
            {t('hero.title', 'Renkli Dünyalar Yaratıyoruz! 🌈')}
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 font-sans leading-relaxed">
            {t('hero.subtitle', 'Çocuklarınızın hayal gücünü besleyen, güvenli ve eğlenceli kreş mobilyaları ile tanışın.')}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white text-xl font-display font-bold rounded-full shadow-[0_10px_30px_rgba(233,30,99,0.3)] hover:shadow-[0_15px_40px_rgba(233,30,99,0.4)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">{t('hero.contactNow', 'Hemen İletişime Geç')}</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-cc-purple border-2 border-cc-purple/20 text-xl font-display font-bold rounded-full hover:bg-purple-50 hover:border-cc-purple hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {t('hero.exploreProducts', 'Ürünleri İncele')}
            </Link>
          </div>
        </div>

        {/* Featured Product Card */}
        <div className="w-full relative group perspective-1000 animate-fade-in-up delay-300">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cc-pink/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cc-cyan/20 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="relative transform transition-transform duration-500 hover:scale-[1.005]">
            <div className="absolute inset-0 bg-gradient-to-r from-cc-yellow to-cc-orange rounded-[3rem] rotate-1 translate-y-2 opacity-100 shadow-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-cc-cyan to-cc-purple rounded-[3rem] -rotate-1 translate-y-1 opacity-100 shadow-lg -z-10" />

            <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border-4 border-white z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative group/image h-full min-h-[360px]">
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner border-4 border-gray-100">
                  {featuredProduct?.coverImageUrl ? (
                    <Image
                      src={featuredProduct.coverImageUrl}
                      alt={title}
                      fill
                      className="object-cover mix-blend-multiply group-hover/image:scale-110 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 520px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                      {t('common.loading', 'Yükleniyor…')}
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur font-display font-bold px-4 py-2 rounded-xl text-sm text-cc-text shadow-lg z-10">
                    {t('home.hero.featured', 'Öne Çıkan Ürün')}
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-yellow-400 text-white p-3 rounded-full shadow-lg animate-bounce hidden md:block z-20">
                  <Star size={32} fill="currentColor" />
                </div>
              </div>

              {/* Content */}
              <div className="text-left space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cc-orange to-yellow-400 text-white px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-4 shadow-md">
                    <Star size={16} fill="currentColor" className="animate-spin-slow" /> {t('home.hero.star', 'Haftanın Yıldızı')}
                  </div>

                  <h3 className="font-display text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                    {title}
                  </h3>

                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{desc}</p>
                </div>

                <ul className="space-y-4">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium text-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={18} />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-100 px-5 py-3 rounded-2xl">
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-100 px-5 py-3 rounded-2xl">
                    <ShieldCheck size={20} className="text-cc-pink" /> {t('home.hero.warranty', '2 Yıl Garanti')}
                  </div>

                  {featuredProduct?.href ? (
                    <Link
                      href={featuredProduct.href}
                      className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-cc-purple hover:text-cc-orange transition-colors"
                    >
                      {t('home.hero.viewProduct', 'Ürünü Gör')} <ArrowRight size={18} />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating emojis */}
        <div className="hidden md:block absolute top-10 right-[5%] text-7xl animate-float delay-0 opacity-40 rotate-12 -z-10">
          🎨
        </div>
        <div className="hidden md:block absolute bottom-20 left-[5%] text-5xl text-cc-cyan animate-wiggle -z-10 opacity-60">
          🚀
        </div>
      </div>
    </section>
  );
}
