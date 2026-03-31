// app/contact/page.tsx
import Link from "next/link";

import { getContact } from "@/lib/api/endpoints";
import ContactForm from "@/components/contact/ContactForm";
import { Facebook, Instagram } from "lucide-react";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { buildPageMetadata, localBusinessJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = getServerT(lang);
  return buildPageMetadata({
    title: t("contact.metaTitle", "İletişim | CCkids Kreş Mobilyaları"),
    description: t(
      "seo.contactDescription",
      "CCkids ile iletişime geçin. Telefon, e-posta ve showroom/fabrika adres bilgilerimize buradan ulaşın.",
    ),
    path: "/contact",
    locale: lang,
  });
}

function onlyDigits(input?: string | null) {
  if (!input) return "";
  return String(input).replace(/\D/g, "");
}

function telHref(input?: string | null) {
  const d = onlyDigits(input);
  if (!d) return "";
  return `tel:+${d.startsWith("0") ? `9${d}` : d}`;
}

function waHref(input?: string | null) {
  const d = onlyDigits(input);
  if (!d) return "";
  const e164 = d.startsWith("0") ? `9${d}` : d;
  return `https://wa.me/${e164}`;
}

function buildMapQuery(officeAddress?: string | null, workshopAddress?: string | null) {
  return (officeAddress ?? workshopAddress ?? "").trim();
}

function buildGoogleMapsEmbedUrl(locationQuery?: string | null) {
  const q = String(locationQuery ?? "").trim();
  if (!q) return null;
  return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(q)}&z=17&ie=UTF8&iwloc=B&output=embed`;
}

function buildGoogleDirectionsUrl(locationQuery?: string | null) {
  const q = String(locationQuery ?? "").trim();
  if (!q) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

/**
 * ContactPage:
 * - Layout artık global: Navbar/Footer/Decorations/WhatsAppButton burada yok.
 * - Bu sayfa sadece /public/contact verisini çeker.
 * - Adresler: office_address (Showroom) ve workshop_address (Fabrika) ayrı gösterilir.
 * - Maps: maps_embed_url + maps_directions_url backend'den koşullu kullanılır.
 * - Sosyal: sadece Instagram/Facebook, sort_order ile sıralı.
 */
export default async function ContactPage() {
  const lang = await getServerLang();
  const t = getServerT(lang);
  const contactRes = await Promise.allSettled([getContact(lang)]);
  const contact = contactRes[0].status === "fulfilled" ? contactRes[0].value : null;

  const phone = contact?.phone_number ?? null;
  const whatsapp = contact?.whatsapp_number ?? null;
  const email = contact?.email ?? null;

  const officeAddress = contact?.office_address ?? null;
  const workshopAddress = contact?.workshop_address ?? null;

  const mapsEmbedUrl = contact?.maps_embed_url ?? null;
  const mapsDirectionsUrl = contact?.maps_directions_url ?? null;
  const mapQuery = buildMapQuery(officeAddress, workshopAddress);
  const resolvedMapEmbedUrl = buildGoogleMapsEmbedUrl(mapQuery) ?? mapsEmbedUrl;
  const resolvedDirectionsUrl = mapsDirectionsUrl ?? buildGoogleDirectionsUrl(mapQuery);

  const socialLinks = contact?.social_links ?? [];

  function normalizePlatform(input?: string | null) {
    return String(input ?? "").trim().toLowerCase();
  }

  const filteredSocialLinks = (socialLinks ?? [])
    .filter((s: any) => {
      const p = normalizePlatform(s?.platform);
      return p === "instagram" || p === "facebook";
    })
    .slice()
    .sort((a: any, b: any) => (Number(a?.sort_order ?? 0) || 0) - (Number(b?.sort_order ?? 0) || 0));

  return (
    <div className="relative z-10">
      <JsonLd
        data={localBusinessJsonLd({
          phone,
          email,
          officeAddress,
        })}
      />
      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-slide-up">
            <Link href="/" className="hover:text-cc-pink transition-colors">
              {t("nav.home", "Ana Sayfa")}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-cc-text font-semibold">{t("contact.breadcrumb", "İletişim")}</span>
          </div>

          <div className="text-center mb-16 animate-slide-up">
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan bg-clip-text text-transparent animate-gradient-text bg-[length:300%_300%]">
                {t("contact.heroTitle", "Bizimle İletişime Geçin")}
              </span>
              <span className="inline-block animate-wiggle ml-2">💌</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("contact.heroSubtitle", "Sorularınız, önerileriniz veya teklif talepleriniz için bize ulaşın. Size yardımcı olmaktan mutluluk duyarız!")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Phone */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center animate-pop-in">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-cc-pink/20 rounded-2xl animate-pulse-ring" />
                <div className="relative w-full h-full bg-gradient-to-br from-cc-pink to-cc-orange rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  📞
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-2">{t("contact.phone", "Telefon")}</h3>
              <p className="text-gray-500 mb-4">{t("contact.phoneHours", "Pazartesi-Cumartesi: 09:00 - 18:00")}</p>
              {phone ? (
                <a href={telHref(phone)} className="font-display text-2xl font-bold text-cc-pink hover:text-cc-orange transition-colors">
                  {phone}
                </a>
              ) : (
                <p className="text-gray-400">{t("common.comingSoon", "Yakında")}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div
              className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center animate-pop-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-cc-lime/20 rounded-2xl animate-pulse-ring" />
                <div className="relative w-full h-full bg-gradient-to-br from-cc-lime to-green-500 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  💬
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-2">{t("contact.whatsapp", "WhatsApp")}</h3>
              <p className="text-gray-500 mb-4">{t("contact.whatsappDesc", "Hızlı yanıt için mesaj atın")}</p>
              {whatsapp ? (
                <a
                  href={waHref(whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display text-2xl font-bold text-cc-lime hover:text-green-600 transition-colors"
                >
                  {whatsapp}
                </a>
              ) : (
                <p className="text-gray-400">{t("common.comingSoon", "Yakında")}</p>
              )}
            </div>

            {/* Email */}
            <div
              className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center animate-pop-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-cc-cyan/20 rounded-2xl animate-pulse-ring" />
                <div className="relative w-full h-full bg-gradient-to-br from-cc-cyan to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  ✉️
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-2">{t("contact.email", "E-posta")}</h3>
              <p className="text-gray-500 mb-4">{t("contact.emailDesc", "24 saat içinde yanıt")}</p>
              {email ? (
                <a href={`mailto:${email}`} className="font-display text-xl font-bold text-cc-cyan hover:text-blue-600 transition-colors break-words">
                  {email}
                </a>
              ) : (
                <p className="text-gray-400">{t("common.comingSoon", "Yakında")}</p>
              )}
            </div>

            {/* Showroom / Office */}
            <div
              className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center animate-pop-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-cc-purple/20 rounded-2xl animate-pulse-ring" />
                <div className="relative w-full h-full bg-gradient-to-br from-cc-purple to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  🏢
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-2">{t("contact.showroom", "Showroom")}</h3>
              <p className="text-gray-500 mb-4">{t("contact.showroomDesc", "Ofis / showroom adresi")}</p>
              <p className="font-display text-lg font-bold text-cc-purple">
                {officeAddress ?? t("common.comingSoon", "Yakında")}
              </p>
            </div>

            {/* Factory / Workshop */}
            <div
              className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center animate-pop-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-cc-orange/20 rounded-2xl animate-pulse-ring" />
                <div className="relative w-full h-full bg-gradient-to-br from-cc-orange to-cc-pink rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  🏭
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-cc-text mb-2">{t("contact.factory", "Fabrika")}</h3>
              <p className="text-gray-500 mb-4">{t("contact.factoryDesc", "Atölye / üretim adresi")}</p>
              <p className="font-display text-lg font-bold text-cc-orange">
                {workshopAddress ?? t("common.comingSoon", "Yakında")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form & Map */}
      <section id="form" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="animate-slide-right">
              <ContactForm />
            </div>

            {/* Map & Address */}
            <div className="space-y-8 animate-slide-left" style={{ animationDelay: "0.2s" }}>
              <div className="p-1 rounded-[2.5rem] shadow-xl bg-gradient-to-br from-cc-pink via-cc-purple to-cc-cyan">
                <div className="relative bg-white rounded-[2.3rem] overflow-hidden">
                  {resolvedMapEmbedUrl ? (
                    <iframe
                      src={resolvedMapEmbedUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
                      {t("contact.mapSoon", "Harita bilgisi yakında eklenecek.")}
                    </div>
                  )}

                  {resolvedDirectionsUrl ? (
                    <a
                      href={resolvedDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-cc-text shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span aria-hidden>📍</span>
                      {t("contact.getDirections", "Yol Tarifi Al")}
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="bg-gradient-to-br from-cc-cyan to-cc-purple p-1 rounded-[2rem] shadow-xl">
                <div className="bg-white rounded-[1.8rem] p-8">
                  <h3 className="font-display text-2xl font-bold text-cc-text mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-cc-cyan/10 rounded-xl flex items-center justify-center text-xl">🏭</span>
                    {t("contact.factoryShowroom", "Fabrika & Showroom")}
                  </h3>

                  <div className="space-y-4">
                    {/* Showroom */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-cc-purple/10 rounded-xl flex items-center justify-center text-cc-purple shrink-0">🏢</div>
                      <div>
                        <p className="font-semibold text-cc-text">{t("contact.showroomAddress", "Showroom Adresi")}</p>
                        <p className="text-gray-500">{officeAddress ?? t("common.comingSoon", "Yakında")}</p>
                      </div>
                    </div>

                    {/* Factory */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-cc-orange/10 rounded-xl flex items-center justify-center text-cc-orange shrink-0">🏭</div>
                      <div>
                        <p className="font-semibold text-cc-text">{t("contact.factoryAddress", "Fabrika Adresi")}</p>
                        <p className="text-gray-500">{workshopAddress ?? t("common.comingSoon", "Yakında")}</p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-cc-orange/10 rounded-xl flex items-center justify-center text-cc-orange shrink-0">⏱️</div>
                      <div>
                        <p className="font-semibold text-cc-text">{t("contact.workHours", "Çalışma Saatleri")}</p>
                        <p className="text-gray-500">{t("contact.weekday", "Pazartesi - Cuma: 08:30 - 18:00")}</p>
                        <p className="text-gray-500">{t("contact.saturday", "Cumartesi: 09:00 - 14:00")}</p>
                        <p className="text-gray-400 text-sm">{t("contact.sunday", "Pazar günleri kapalıyız")}</p>
                      </div>
                    </div>
                  </div>

                  {resolvedDirectionsUrl ? (
                    <a
                      href={resolvedDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 w-full py-4 bg-gradient-to-r from-cc-cyan to-cc-purple text-white font-display font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      {t("contact.getDirections", "Yol Tarifi Al")} <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    <div className="mt-6 w-full py-4 rounded-xl text-center bg-gray-100 text-gray-500 font-display font-bold">
                      {t("contact.directionsSoon", "Yol tarifi linki yakında eklenecek.")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="py-16 px-4 bg-gradient-to-br from-cc-pink/5 to-cc-cyan/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-4 animate-slide-up">
            {t("contact.socialTitle", "Sosyal Medyada Biz")} <span className="inline-block animate-wiggle">🎉</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {filteredSocialLinks.map((s: any, idx: number) => {
              const platform = normalizePlatform(s?.platform);
              const label = platform === "instagram" ? "Instagram" : platform === "facebook" ? "Facebook" : "Sosyal";
              return (
                <a
                  key={`${s?.id ?? idx}`}
                  href={s?.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 w-36 animate-pop-in"
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-cc-purple via-cc-pink to-cc-orange rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {platform === "instagram" ? <Instagram size={28} /> : null}
                    {platform === "facebook" ? <Facebook size={28} /> : null}
                  </div>
                  <span className="font-display font-bold text-cc-text">{label}</span>
                  <span className="text-sm text-gray-400">{t("contact.follow", "Takip Et")}</span>
                </a>
              );
            })}

            {filteredSocialLinks.length === 0 && <p className="text-gray-400">{t("contact.socialSoon", "Sosyal medya linkleri yakında eklenecek.")}</p>}
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[2rem] shadow-2xl">
            <div className="bg-white rounded-[1.8rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-cc-text mb-2">
                  {t("contact.callNow", "Hemen Arayın!")} <span className="inline-block animate-bounce">📞</span>
                </h3>
                <p className="text-gray-500">{t("contact.callNowDesc", "Uzman ekibimiz sorularınızı yanıtlamak için hazır.")}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={phone ? telHref(phone) : "#"}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {t("contact.call", "Ara")}
                </a>
                <a
                  href={whatsapp ? waHref(whatsapp) : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cc-lime to-green-500 text-white font-display font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
