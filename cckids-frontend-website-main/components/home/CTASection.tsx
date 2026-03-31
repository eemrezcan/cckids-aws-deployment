'use client';

// components/home/CTASection.tsx
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type WhatsAppSettings = {
  whatsapp_number: string;
  whatsapp_default_message: string;
};

function normalizePhoneToWaMe(phone: string) {
  return (phone || '').replace(/\D/g, '');
}

function buildWaMeUrl(settings: WhatsAppSettings) {
  const phone = normalizePhoneToWaMe(settings.whatsapp_number);
  const text = encodeURIComponent(settings.whatsapp_default_message || '');
  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * CTASection:
 * - index.html’deki büyük “Bize Ulaşın” bloğu
 * - WhatsApp linki backend settings varsa dinamikleşir
 */
export default function CTASection({
  whatsappSettings,
  contactHref,
}: {
  whatsappSettings?: WhatsAppSettings | null;
  contactHref: string;
}) {
  const { t } = useLanguage();
  const waHref = whatsappSettings?.whatsapp_number ? buildWaMeUrl(whatsappSettings) : null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-cc-pink via-cc-purple to-cc-cyan p-1 rounded-[3rem] shadow-2xl">
          <div className="bg-white rounded-[2.8rem] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[150px] opacity-5 font-display font-bold -translate-y-1/4 translate-x-1/4">
              🎨
            </div>
            <span className="inline-block text-5xl mb-4 animate-bounce">📞</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-4">
              {t('home.cta.title', 'Projeniz İçin Bize Ulaşın!')}
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              {t('home.cta.description', 'Kreşiniz veya anaokulunuz için ücretsiz keşif ve proje danışmanlığı hizmeti alın.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={contactHref}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Phone /> {t('home.cta.contact', 'İletişime Geç')}
              </Link>

              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-cc-lime text-white font-display font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
