// components/Footer.tsx
"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { ComponentType } from "react";
import Logo from "./Logo";
import {
  AliExpress,
  Amazon,
  Ebay,
  Etsy,
  Hepsiburada,
  Letgo,
  N11,
  Sahibinden,
  Shopier,
  Shopify,
  Trendyol,
} from "@/components/icons/marketplace-logos";
import type { ContactResponse } from "@/lib/api/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type SocialLink = {
  id: number;
  platform: string;
  url: string;
  sort_order: number;
};

const Phone = LucideIcons.Phone;
const Mail = LucideIcons.Mail;
const MapPin = LucideIcons.MapPin;
const Instagram = LucideIcons.Instagram;
const Facebook = LucideIcons.Facebook;
const Twitter = LucideIcons.Twitter;

type PlatformRule = {
  keywords: string[];
  iconName: string;
};

const PLATFORM_ICON_RULES: PlatformRule[] = [
  { keywords: ["instagram"], iconName: "Instagram" },
  { keywords: ["facebook"], iconName: "Facebook" },
  { keywords: ["twitter", "x.com", " x "], iconName: "Twitter" },
  { keywords: ["youtube"], iconName: "Youtube" },
  { keywords: ["linkedin"], iconName: "Linkedin" },
  { keywords: ["tiktok"], iconName: "Music2" },
  { keywords: ["pinterest"], iconName: "Pin" },
  { keywords: ["snapchat"], iconName: "MessageCircle" },
  { keywords: ["telegram"], iconName: "Send" },
  { keywords: ["whatsapp"], iconName: "MessageCircle" },
  { keywords: ["discord"], iconName: "MessagesSquare" },
  { keywords: ["twitch"], iconName: "Gamepad2" },
  { keywords: ["github"], iconName: "Github" },
  { keywords: ["gitlab"], iconName: "GitBranch" },
  { keywords: ["bitbucket"], iconName: "GitFork" },
  { keywords: ["medium"], iconName: "BookOpen" },
  { keywords: ["behance"], iconName: "Palette" },
  { keywords: ["dribbble"], iconName: "CircleDot" },
  { keywords: ["figma"], iconName: "PenTool" },
  { keywords: ["notion"], iconName: "NotebookPen" },
  { keywords: ["slack"], iconName: "Briefcase" },
  { keywords: ["reddit"], iconName: "MessageSquare" },
  { keywords: ["quora"], iconName: "CircleHelp" },
  { keywords: ["vimeo"], iconName: "Video" },
  { keywords: ["spotify"], iconName: "Music" },
  { keywords: ["soundcloud"], iconName: "AudioLines" },
  { keywords: ["apple"], iconName: "Smartphone" },
  { keywords: ["appstore", "app store"], iconName: "AppWindow" },
  { keywords: ["googleplay", "google play", "playstore", "play store"], iconName: "PlayCircle" },
  { keywords: ["amazon"], iconName: "ShoppingBag" },
  { keywords: ["trendyol"], iconName: "Store" },
  { keywords: ["hepsiburada"], iconName: "Store" },
  { keywords: ["shopier"], iconName: "Store" },
  { keywords: ["n11"], iconName: "Store" },
  { keywords: ["çiçeksepeti", "ciceksepeti"], iconName: "Gift" },
  { keywords: ["etsy"], iconName: "ShoppingBag" },
  { keywords: ["ebay"], iconName: "ShoppingBag" },
  { keywords: ["aliexpress"], iconName: "ShoppingBag" },
  { keywords: ["shopify"], iconName: "ShoppingCart" },
  { keywords: ["woocommerce"], iconName: "ShoppingCart" },
  { keywords: ["magento"], iconName: "Store" },
  { keywords: ["opencart"], iconName: "Store" },
  { keywords: ["iyzico"], iconName: "CreditCard" },
  { keywords: ["stripe"], iconName: "CreditCard" },
  { keywords: ["paypal"], iconName: "Wallet" },
  { keywords: ["mastercard"], iconName: "CreditCard" },
  { keywords: ["visa"], iconName: "CreditCard" },
  { keywords: ["sahibinden"], iconName: "Store" },
  { keywords: ["letgo"], iconName: "Store" },
  { keywords: ["bionluk", "upwork", "fiverr"], iconName: "Briefcase" },
];

function resolveIcon(iconName: string): ComponentType<{ size?: number; className?: string }> {
  const icon = (LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string }> | undefined>)[iconName];
  return icon ?? LucideIcons.Globe;
}

function iconForPlatform(platform: string): ComponentType<{ size?: number; className?: string }> {
  const p = (platform || "").toLowerCase();

  if (p.includes("trendyol")) return Trendyol;
  if (p.includes("hepsiburada")) return Hepsiburada;
  if (p.includes("shopier")) return Shopier;
  if (p.includes("amazon")) return Amazon;
  if (p.includes("aliexpress")) return AliExpress;
  if (p.includes("ebay")) return Ebay;
  if (p.includes("etsy")) return Etsy;
  if (p.includes("letgo")) return Letgo;
  if (p.includes("sahibinden")) return Sahibinden;
  if (p.includes("n11")) return N11;
  if (p.includes("shopify")) return Shopify;

  const found = PLATFORM_ICON_RULES.find((rule) => rule.keywords.some((kw) => p.includes(kw)));
  return found ? resolveIcon(found.iconName) : LucideIcons.Globe;
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

const Footer = ({
  socialLinks,
  contact,
}: {
  socialLinks?: SocialLink[];
  contact?: ContactResponse | null;
}) => {
  const { t } = useLanguage();
  const sorted = (socialLinks ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const hasDynamic = sorted.length > 0;

  const phone = contact?.phone_number ?? null;
  const email = contact?.email ?? null;
  const officeAddress = contact?.office_address ?? `${t("footer.office", "Ofis / Showroom")} ${t("footer.soon", "Yakında")}.`;
  const workshopAddress = contact?.workshop_address ?? `${t("footer.workshop", "Atölye / Üretim")} ${t("footer.soon", "Yakında")}.`;

  return (
    <footer className="relative z-10 bg-gradient-to-br from-cc-pink to-cc-purple text-white pt-20 pb-10 rounded-t-[50px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white text-center p-10 rounded-[40px] shadow-2xl max-w-4xl mx-auto -mt-32 mb-16 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold mb-4 bg-gradient-to-r from-cc-pink to-cc-purple bg-clip-text text-transparent">
              {t("footer.contactTitle", "Bizimle İletişime Geçin! 💌")}
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              {t("footer.contactText", "Renkli dünyalar yaratmak için sizinle çalışmayı çok isteriz!")}
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <Phone className="text-cc-cyan" />
                {phone ? (
                  <a href={telHref(phone)} className="hover:underline">
                    {phone}
                  </a>
                ) : (
                  <span>{t("footer.soon", "Yakında")}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <Mail className="text-cc-orange" />
                {email ? (
                  <a href={`mailto:${email}`} className="hover:underline break-words">
                    {email}
                  </a>
                ) : (
                  <span>{t("footer.soon", "Yakında")}</span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full font-display font-bold text-white bg-gradient-to-r from-cc-pink to-cc-orange shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {t("footer.goToContact", "İletişim Sayfasına Git")}
              </Link>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left border-b border-white/20 pb-12">
          <div className="flex flex-col items-center md:items-start space-y-4 md:col-span-1">
            <div className="bg-white/90 p-3 rounded-2xl inline-block">
              <Link href="/" aria-label={t("nav.homeAriaLabel", "CCKids Ana Sayfa")}>
                <Logo className="h-10" />
              </Link>
            </div>
            <p className="text-white/90 text-sm font-sans max-w-xs">
              {t("footer.aboutText", "2010 yılından beri miniklerin dünyasını renklendiriyoruz. Sadece mobilya değil, mutluluk üretiyoruz.")}
            </p>
          </div>

          <div className="space-y-4 md:col-span-1">
            <h4 className="font-display font-bold text-xl text-cc-yellow">{t("footer.quickLinks", "Hızlı Linkler")}</h4>
            <div className="flex flex-col gap-2 text-white/90">
              <Link className="hover:text-white transition-colors" href="/">
                {t("nav.home", "Ana Sayfa")}
              </Link>
              <Link className="hover:text-white transition-colors" href="/products">
                {t("nav.products", "Ürünler")}
              </Link>
              <Link className="hover:text-white transition-colors" href="/projects">
                {t("nav.projects", "Projeler")}
              </Link>
              <Link className="hover:text-white transition-colors" href="/references">
                {t("nav.references", "Referanslar")}
              </Link>
              <Link className="hover:text-white transition-colors" href="/about">
                {t("nav.about", "Hakkımızda")}
              </Link>
              <Link className="hover:text-white transition-colors" href="/contact">
                {t("nav.contact", "İletişim")}
              </Link>
            </div>
          </div>

          <div className="space-y-4 md:col-span-1">
            <h4 className="font-display font-bold text-xl text-cc-yellow">{t("footer.addresses", "Adresler")}</h4>

            <div className="flex justify-center md:justify-start items-start gap-3 text-white/90">
              <MapPin className="shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <div className="text-white font-bold">{t("footer.office", "Ofis / Showroom")}</div>
                <div className="whitespace-pre-line text-white/90">{officeAddress}</div>
              </div>
            </div>

            <div className="flex justify-center md:justify-start items-start gap-3 text-white/90">
              <MapPin className="shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <div className="text-white font-bold">{t("footer.workshop", "Atölye / Üretim")}</div>
                <div className="whitespace-pre-line text-white/90">{workshopAddress}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:col-span-1">
            <h4 className="font-display font-bold text-xl text-cc-cyan">{t("footer.followUs", "Bizi Takip Edin")}</h4>
            <div className="grid grid-cols-5 gap-4 w-fit mx-auto md:mx-0">
              {hasDynamic
                ? sorted.map((l) => {
                    const Icon = iconForPlatform(l.platform) ?? Instagram;
                    const href = l.url?.startsWith("http") ? l.url : `https://${l.url}`;
                    return (
                      <a
                        key={l.id}
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noreferrer" : undefined}
                        className="w-10 h-10 bg-white/20 hover:bg-white hover:text-cc-pink rounded-full flex items-center justify-center transition-all duration-300"
                        aria-label={l.platform}
                        title={l.platform}
                      >
                        <span className="flex h-5 w-5 items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:max-w-full [&>svg]:max-h-full">
                          <Icon size={20} className="h-full w-full" />
                        </span>
                      </a>
                    );
                  })
                : [Instagram, Facebook, Twitter].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-10 h-10 bg-white/20 hover:bg-white hover:text-cc-pink rounded-full flex items-center justify-center transition-all duration-300"
                        aria-label={t("footer.social", "Sosyal medya")}
                    >
                      <span className="flex h-5 w-5 items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:max-w-full [&>svg]:max-h-full">
                        <Icon size={20} className="h-full w-full" />
                      </span>
                    </a>
                  ))}
            </div>
          </div>
        </div>

        <div className="pt-8 text-center text-white/70 text-sm font-display">
          <p>© {new Date().getFullYear()} {t("footer.copyright", "CCKids Kreş Mobilyaları | Renkli Dünyalar Yaratıyoruz 🌈")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
