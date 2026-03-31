// components/WhatsAppButton.tsx
"use client";

import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type WhatsAppSettings = {
  whatsapp_number: string;
  whatsapp_default_message: string;
};

function normalizePhoneToWaMe(phone: string) {
  // +90 (532) 123 45 67 -> 905321234567
  return (phone || '').replace(/\D/g, '');
}

function buildWaMeUrl(settings: WhatsAppSettings) {
  const phone = normalizePhoneToWaMe(settings.whatsapp_number);
  const text = encodeURIComponent(settings.whatsapp_default_message || '');
  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * Floating WhatsApp butonu.
 * Backend /public/home settings ile çalışır.
 */
export default function WhatsAppButton({ settings }: { settings?: WhatsAppSettings | null }) {
  const { t } = useLanguage();
  const phoneDigits = settings?.whatsapp_number ? normalizePhoneToWaMe(settings.whatsapp_number) : '';
  if (!settings || !phoneDigits) return null;

  const href = buildWaMeUrl(settings);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label={t('whatsapp.contactVia', 'WhatsApp ile iletişime geç')}
      title={t('whatsapp.contactVia', 'WhatsApp ile iletişime geç')}
    >
      <div className="flex items-center gap-3 px-5 py-4 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] bg-green-500 text-white font-bold">
        <MessageCircle className="group-hover:scale-110 transition-transform" />
        <span className="hidden sm:block">{t('common.whatsapp', 'WhatsApp')}</span>
      </div>
    </a>
  );
}
