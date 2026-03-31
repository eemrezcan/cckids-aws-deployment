// app/about/page.tsx
import Link from "next/link";
import { sanitizeHtmlBasic } from "@/lib/utils/sanitize";
import { getAbout, getAboutImages } from "@/lib/api/endpoints";
import { buildMediaUrl } from "@/lib/utils/url";
import AboutHeroCarousel from "@/components/about/AboutHeroCarousel";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { aboutPageJsonLd, buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return buildPageMetadata({
    title: t("about.metaTitle", "Hakkımızda | CCkids Kreş Mobilyaları"),
    description: t(
      "seo.aboutDescription",
      "CCkids'in hikayesini, değerlerini ve okul öncesi mobilya üretim yaklaşımını keşfedin.",
    ),
    path: "/about",
    locale: lang,
  });
}

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=700&fit=crop";

export default async function AboutPage() {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const results = await Promise.allSettled([getAbout(lang), getAboutImages(lang)]);
  const about = results[0].status === "fulfilled" ? results[0].value : null;
  const aboutImages = results[1].status === "fulfilled" ? results[1].value : null;

  const heroImages = (aboutImages?.items ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => buildMediaUrl(item.url ?? null))
    .filter(Boolean) as string[];

  return (
    <div className="relative z-10">
      <JsonLd data={aboutPageJsonLd()} />
      <main className="flex-grow relative z-10">
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-slide-up">
              <Link href="/" className="hover:text-cc-pink transition-colors">
                {t("nav.home", "Ana Sayfa")}
              </Link>
              <span aria-hidden>›</span>
              <span className="text-cc-text font-semibold">{t("about.breadcrumb", "Hakkımızda")}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-slide-right">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cc-pink/10 to-cc-cyan/10 text-cc-pink px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
                  <span className="w-2 h-2 bg-cc-pink rounded-full animate-pulse" />
                  {t("about.since", "2010'dan Beri")}
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-cc-text">{t("about.titleTop", "Miniklerin")}</span>
                  <br />
                  <span className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan bg-clip-text text-transparent animate-gradient-text bg-[length:300%_300%]">
                    {t("about.titleMid", "Mutluluk")}
                  </span>
                  <br />
                  <span className="text-cc-text">{t("about.titleBottom", "Atölyesi")}</span>
                  <span className="inline-block animate-wiggle ml-2">🏭</span>
                </h1>

                {about?.content ? (
                  <div
                    className="text-xl text-gray-600 leading-relaxed max-w-lg prose prose-lg max-w-none prose-p:my-0 prose-strong:text-cc-text"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtmlBasic(about.content) }}
                  />
                ) : (
                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                    {t("about.fallback", "Çocukların güvenle oynayıp öğrenebileceği, renkli ve ergonomik mobilyalar üretiyoruz. Her ürünümüzde sevgi, kalite ve yaratıcılık var.")}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  <a
                    href="#hikayemiz"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {t("about.discover", "Hikayemizi Keşfet")} <span aria-hidden>↓</span>
                  </a>
                </div>
              </div>

              <div className="relative animate-slide-left" style={{ animationDelay: "0.2s" }}>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-cc-yellow/30 rounded-[999px] animate-float" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cc-cyan/30 rounded-[999px] animate-float delay-1000" />

                <div className="relative bg-gradient-to-br from-cc-pink to-cc-purple p-2 rounded-[3rem] shadow-2xl">
                  <div className="bg-white rounded-[2.7rem] p-4 relative overflow-hidden">
                    <AboutHeroCarousel
                      images={heroImages}
                      fallbackImage={FALLBACK_HERO_IMAGE}
                      alt={t("about.workshopAlt", "CCKids Atölye")}
                    />
                    <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-cc-cyan to-cc-lime rounded-xl flex items-center justify-center text-white text-2xl">
                        🎯
                      </div>
                      <div>
                        <p className="font-display font-bold text-2xl text-cc-text">15+</p>
                        <p className="text-gray-500 text-sm">{t("about.experience", "Yıllık Tecrübe")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[2.5rem] shadow-xl">
              <div className="bg-white rounded-[2.3rem] p-8 md:p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                  <div className="text-center group animate-pop-in" style={{ animationDelay: "0.1s" }}>
                    <div className="w-20 h-20 mx-auto mb-4 bg-cc-pink/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      🏫
                    </div>
                    <p className="font-display text-4xl md:text-5xl font-bold text-cc-pink mb-2">500+</p>
                    <p className="text-gray-500 font-medium">{t("about.happySchools", "Mutlu Kreş")}</p>
                  </div>

                  <div className="text-center group animate-pop-in" style={{ animationDelay: "0.2s" }}>
                    <div className="w-20 h-20 mx-auto mb-4 bg-cc-cyan/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      🪑
                    </div>
                    <p className="font-display text-4xl md:text-5xl font-bold text-cc-cyan mb-2">50K+</p>
                    <p className="text-gray-500 font-medium">{t("about.produced", "Üretilen Mobilya")}</p>
                  </div>

                  <div className="text-center group animate-pop-in" style={{ animationDelay: "0.3s" }}>
                    <div className="w-20 h-20 mx-auto mb-4 bg-cc-orange/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      👶
                    </div>
                    <p className="font-display text-4xl md:text-5xl font-bold text-cc-orange mb-2">100K+</p>
                    <p className="text-gray-500 font-medium">{t("about.happyChildren", "Mutlu Çocuk")}</p>
                  </div>

                  <div className="text-center group animate-pop-in" style={{ animationDelay: "0.4s" }}>
                    <div className="w-20 h-20 mx-auto mb-4 bg-cc-purple/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      🌍
                    </div>
                    <p className="font-display text-4xl md:text-5xl font-bold text-cc-purple mb-2">81</p>
                    <p className="text-gray-500 font-medium">{t("about.delivery", "İl'e Teslimat")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="hikayemiz"
          className="py-20 px-4 bg-gradient-to-br from-cc-pink/5 via-transparent to-cc-cyan/5 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
                {t("about.storyTitle", "Hikayemiz")} <span className="inline-block animate-wiggle">📖</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                {t("about.storySubtitle", "Çocukların güvenle kullanabileceği, dayanıklı ve fonksiyonel kreş mobilyaları üretme hedefiyle çıktığımız bu yolda, kaliteyi ve güveni her zaman ön planda tuttuk.")}
              </p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 rounded-full transform -translate-x-1/2 bg-gradient-to-b from-cc-pink via-cc-cyan via-cc-yellow to-cc-purple" />

              <div className="space-y-12 md:space-y-24">
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/2 md:pr-16 md:text-right animate-slide-right">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-300 relative group">
                      <div className="absolute top-4 right-4 md:left-4 md:right-auto bg-cc-pink text-white px-4 py-1 rounded-full font-display font-bold text-sm">
                        2010
                      </div>
                      <div className="pt-8">
                        <h3 className="font-display text-2xl font-bold text-cc-text mb-3">{t("about.timeline.2010.title", "Başlangıç")}</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t("about.timeline.2010.desc", "Ankara’da, okul öncesi eğitim kurumlarına özel çocuk kullanımına uygun mobilyalar üretmek amacıyla faaliyete başladık. Ürünlerimizi tasarlarken dayanıklılık, ergonomi ve çocuk güvenliği temel önceliğimiz oldu.")}
                        </p>
                      </div>
                      <div className="absolute -bottom-4 left-1/2 md:left-auto md:-right-4 transform -translate-x-1/2 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 w-8 h-8 bg-cc-pink rounded-full border-4 border-white shadow-lg hidden md:flex items-center justify-center text-white">
                        🏭
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>

                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="hidden md:block md:w-1/2" />
                  <div className="md:w-1/2 md:pl-16 animate-slide-left">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-300 relative group">
                      <div className="absolute top-4 right-4 bg-cc-cyan text-white px-4 py-1 rounded-full font-display font-bold text-sm">
                        2014
                      </div>
                      <div className="pt-8">
                        <h3 className="font-display text-2xl font-bold text-cc-text mb-3">{t("about.timeline.2014.title", "Üretim Gücümüz")}</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t("about.timeline.2014.desc", "Artan talepler doğrultusunda üretim kapasitemizi ve ürün çeşitliliğimizi genişlettik. Bugün farklı ölçü ve tasarımlarda, kurumlara özel üretim yapıyoruz.")}
                        </p>
                      </div>
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 md:bottom-auto md:left-0 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-8 h-8 bg-cc-orange rounded-full border-4 border-white shadow-lg hidden md:flex items-center justify-center text-white">
                        🌱
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/2 md:pr-16 md:text-right animate-slide-right">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-300 relative group">
                      <div className="absolute top-4 right-4 md:left-4 md:right-auto bg-cc-orange text-white px-4 py-1 rounded-full font-display font-bold text-sm">
                        2022
                      </div>
                      <div className="pt-8">
                        <h3 className="font-display text-2xl font-bold text-cc-text mb-3">{t("about.timeline.2022.title", "Eğitim Odaklı Tasarımlar")}</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t("about.timeline.2022.desc", "Eğitimcilerin ve kurumların ihtiyaçlarını dikkate alarak, sınıf içi kullanıma uygun, çocukların gelişimini destekleyen tasarımlar geliştirmeye başladık.")}
                        </p>
                      </div>
                      <div className="absolute -bottom-4 left-1/2 md:left-auto md:-right-4 transform -translate-x-1/2 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 w-8 h-8 bg-cc-orange rounded-full border-4 border-white shadow-lg hidden md:flex items-center justify-center text-white">
                        🧒
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>

                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="hidden md:block md:w-1/2" />
                  <div className="md:w-1/2 md:pl-16 animate-slide-left">
                    <div className="bg-gradient-to-br from-cc-pink to-cc-purple p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-300 relative group text-white">

                      <div className="pt-8">
                        <h3 className="font-display text-2xl font-bold mb-3">{t("about.today", "Bugün")}</h3>
                        <p className="text-white/90 leading-relaxed">
                          {t("about.timeline.today.desc", "Bugün Ankara’daki üretim tesisimizden, Türkiye genelinde birçok kreş ve anaokuluna hizmet veriyoruz. CCKids olarak, minik eller için büyük konfor sunmaya devam ediyoruz.")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">
                {t("about.valuesTitle", "Değerlerimiz")} <span className="inline-block animate-wiggle">💎</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                {t("about.valuesSubtitle", "Her ürettiğimiz mobilyada bu değerleri yaşatıyoruz")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🛡️",
                  title: t("about.values.items.safety.title", "Güvenlik"),
                  desc: t("about.values.items.safety.desc", "Çocukların güvenliği her şeyin önünde. Yuvarlak köşeler, atoksik boyalar ve sağlam yapı standartlarımızdır."),
                  grad: "from-cc-pink to-cc-orange",
                },
                {
                  icon: "🌿",
                  title: t("about.values.items.sustainability.title", "Sürdürülebilirlik"),
                  desc: t("about.values.items.sustainability.desc", "Doğaya saygılı üretim. FSC sertifikalı ahşap ve geri dönüştürülebilir malzemeler kullanıyoruz."),
                  grad: "from-cc-cyan to-cc-lime",
                },
                {
                  icon: "🎨",
                  title: t("about.values.items.creativity.title", "Yaratıcılık"),
                  desc: t("about.values.items.creativity.desc", "Çocukların hayal gücünü besleyen tasarımlar. Her ürün bir oyun, her renk bir macera."),
                  grad: "from-cc-yellow to-cc-orange",
                },
                {
                  icon: "❤️",
                  title: t("about.values.items.love.title", "Sevgi"),
                  desc: t("about.values.items.love.desc", "Her ürünümüz sevgiyle tasarlanır, özenle üretilir. Çocuklarımız için en iyisini yapıyoruz."),
                  grad: "from-cc-purple to-cc-pink",
                },
                {
                  icon: "🤝",
                  title: t("about.values.items.reliability.title", "Güvenilirlik"),
                  desc: t("about.values.items.reliability.desc", "Söz verdiğimiz kaliteyi sunarız. 2 yıl garanti ve ömür boyu servis desteği."),
                  grad: "from-cc-orange to-cc-yellow",
                },
                {
                  icon: "🔬",
                  title: t("about.values.items.innovation.title", "İnovasyon"),
                  desc: t("about.values.items.innovation.desc", "Sürekli gelişim ve yenilik. Eğitim trendlerini takip eder, ürünlerimizi geliştiririz."),
                  grad: "from-cc-lime to-cc-cyan",
                },
              ].map((value, idx) => (
                <div
                  key={value.title}
                  className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden animate-pop-in"
                  style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{ backgroundImage: "linear-gradient(90deg, var(--tw-gradient-stops))" }}
                  />
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${value.grad} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                  >
                    {value.icon}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-cc-text mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.8rem] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-[200px] opacity-5 font-display font-bold -translate-y-1/4 translate-x-1/4">
                  🤝
                </div>
                <span className="inline-block text-6xl mb-6 animate-bounce">👋</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-cc-text mb-4">{t("about.ctaTitle", "Birlikte Çalışalım!")}</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  {t("about.ctaSubtitle", "Kreşiniz için hayalinizdeki mobilyaları birlikte tasarlayalım. Uzman ekibimiz her adımda yanınızda.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {t("about.ctaContact", "İletişime Geç")} <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white border-2 border-cc-cyan text-cc-cyan font-display font-bold text-lg rounded-full hover:bg-cc-cyan hover:text-white transition-all duration-300"
                  >
                    {t("about.ctaProducts", "Ürünleri Keşfet")} <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
