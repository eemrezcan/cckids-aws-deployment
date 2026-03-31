// components/Navbar.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { getHome } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type WhatsAppSettings = {
  whatsapp_number: string;
  whatsapp_default_message: string;
};

/**
 * +90 (532) 123 45 67 -> 905321234567
 */
function normalizePhoneToWaMe(phone: string) {
  return (phone || '').replace(/\D/g, '');
}

/**
 * WhatsApp wa.me linki üretir
 */
function buildWaMeUrl(settings: WhatsAppSettings) {
  const phone = normalizePhoneToWaMe(settings.whatsapp_number);
  const text = encodeURIComponent(settings.whatsapp_default_message || '');
  return phone ? `https://wa.me/${phone}?text=${text}` : '';
}

/**
 * Navbar:
 * - Anchor (#...) yerine route bazlı navigation (/products, /projects, ...)
 * - Aktif sayfa vurgusu (usePathname)
 * - Mobil menü (mevcut mantık korunur)
 * - Teklif Al: WhatsApp’a yönlendir (numara backend’den)
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const navItems = useMemo(
    () => [
      { label: t('nav.home', 'Ana Sayfa'), href: '/' },
      { label: t('nav.products', 'Ürünler'), href: '/products' },
      { label: t('nav.projects', 'Projeler'), href: '/projects' },
      { label: t('nav.references', 'Referanslar'), href: '/references' },
      { label: t('nav.about', 'Hakkımızda'), href: '/about' },
      { label: t('nav.contact', 'İletişim'), href: '/contact' },
    ],
    [t],
  );

  // WhatsApp hedefi backend'den gelecek
  const [waHref, setWaHref] = useState<string>('');
  const [waLoading, setWaLoading] = useState<boolean>(false);

  const activeHref = useMemo(() => {
    // alt route’larda da aktif kalsın (örn /products/xxx => /products)
    if (!pathname) return '/';
    const match = navItems
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((i) => i.href !== '/' && pathname.startsWith(i.href));
    return match?.href ?? (pathname === '/' ? '/' : '/');
  }, [pathname]);

  // Sayfa açılınca arkaplanda WhatsApp linkini hazırlamaya çalış
  useEffect(() => {
    let cancelled = false;

    async function preloadWa() {
      try {
        setWaLoading(true);
        const home = await getHome(lang);
        const s = home?.settings as any;

        const next = buildWaMeUrl({
          whatsapp_number: String(s?.whatsapp_number ?? ''),
          whatsapp_default_message: String(s?.whatsapp_default_message ?? ''),
        });

        if (!cancelled) setWaHref(next);
      } catch {
        // sessiz geç: fallback /contact
      } finally {
        if (!cancelled) setWaLoading(false);
      }
    }

    preloadWa();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  async function handleTeklifAlClick(e: React.MouseEvent) {
    // Eğer hazır link varsa normal davranış (aç)
    if (waHref) return;

    // İlk tıklamada link yoksa fetch edip WhatsApp açmayı dene
    e.preventDefault();
    setIsOpen(false);

    try {
      setWaLoading(true);
      const home = await getHome(lang);
      const s = home?.settings as any;

      const next = buildWaMeUrl({
        whatsapp_number: String(s?.whatsapp_number ?? ''),
        whatsapp_default_message: String(s?.whatsapp_default_message ?? ''),
      });

      if (next) {
        setWaHref(next);
        window.open(next, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch {
      // ignore
    } finally {
      setWaLoading(false);
    }

    // fallback
    window.location.href = '/contact';
  }

  return (
    <nav className="sticky top-0 z-50 py-4 px-4 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="animate-bounce-in">
          <Link href="/" aria-label={t('nav.homeAriaLabel', 'CCKids Ana Sayfa')}>
            <Logo className="h-12 md:h-16" />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-display font-semibold text-lg text-cc-text">
          {navItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'relative group transition-colors duration-300',
                  isActive ? 'text-cc-pink' : 'hover:text-cc-pink',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                <span
                  className={[
                    'absolute -bottom-1 left-0 h-[3px] rounded-full transition-all duration-300 bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full',
                  ].join(' ')}
                />
              </Link>
            );
          })}

          {/* ✅ Teklif Al -> WhatsApp (backend settings) */}
          <button
            type="button"
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="px-3 py-2 rounded-full border border-cc-cyan/30 text-sm font-bold hover:bg-cc-cyan/10 transition-colors"
            aria-label={t('nav.langSwitch', 'Dil değiştir')}
          >
            {lang.toUpperCase()}
          </button>

          <a
            href={waHref || '/contact'}
            target={waHref ? '_blank' : undefined}
            rel={waHref ? 'noreferrer' : undefined}
            onClick={handleTeklifAlClick}
            className={[
              'px-6 py-2 bg-gradient-to-r from-cc-pink to-cc-orange text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300',
              waLoading ? 'opacity-80 cursor-wait' : '',
            ].join(' ')}
            aria-label={`${t('nav.getQuote', 'Teklif Al')} (WhatsApp)`}
            title={`${t('nav.getQuote', 'Teklif Al')} (WhatsApp)`}
          >
            {t('nav.getQuote', 'Teklif Al')}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-cc-cyan p-2"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={t('nav.menuToggle', 'Menüyü aç/kapat')}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl p-6 border-t-4 border-cc-yellow md:hidden flex flex-col gap-4 text-center font-display font-bold text-xl text-cc-text animate-slide-in-from-top-5">
          {navItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={['py-2 transition-colors', isActive ? 'text-cc-pink' : 'hover:text-cc-pink'].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="mx-auto px-3 py-2 rounded-full border border-cc-cyan/30 text-sm font-bold hover:bg-cc-cyan/10 transition-colors"
            aria-label={t('nav.langSwitch', 'Dil değiştir')}
          >
            {lang.toUpperCase()}
          </button>

          {/* ✅ Teklif Al -> WhatsApp (backend settings) */}
          <a
            href={waHref || '/contact'}
            target={waHref ? '_blank' : undefined}
            rel={waHref ? 'noreferrer' : undefined}
            onClick={handleTeklifAlClick}
            className={[
              'mt-2 px-6 py-3 bg-gradient-to-r from-cc-pink to-cc-orange text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300',
              waLoading ? 'opacity-80 cursor-wait' : '',
            ].join(' ')}
          >
            {t('nav.getQuote', 'Teklif Al')}
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
