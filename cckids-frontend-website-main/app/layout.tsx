// app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Fredoka } from "next/font/google";
import "./globals.css";

import BackgroundDecorations from "@/components/BackgroundDecorations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

import { getHome, getContact } from "@/lib/api/endpoints";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { getServerLang } from "@/lib/i18n/server";
import JsonLd from "@/components/JsonLd";
import { canonicalUrl, organizationJsonLd } from "@/lib/seo";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-sans",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cckkids.com";
  const title = lang === "en" ? "CCkids | Preschool Furniture" : "CCkids | Kreş Mobilyaları";
  const description =
    lang === "en"
      ? "Colorful, safe, and ergonomic solutions for preschool furniture."
      : "Kreş mobilyalarında renkli, güvenli ve ergonomik çözümler.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s",
    },
    description,
    openGraph: {
      type: "website",
      url: canonicalUrl("/"),
      title,
      description,
      siteName: "CCkids",
      images: [{ url: canonicalUrl("/Logo.png") }],
      locale: lang === "en" ? "en_US" : "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl("/Logo.png")],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLang();
  let home: any = null;
  let contact: any = null;

  try {
    home = await getHome(lang);
  } catch {
    home = null;
  }

  try {
    contact = await getContact(lang);
  } catch {
    contact = null;
  }

  return (
    <html lang={lang} className={`${poppins.variable} ${fredoka.variable}`}>
      <body className="font-sans antialiased text-cc-text selection:bg-cc-pink selection:text-white min-h-screen">
        <JsonLd data={organizationJsonLd()} />
        <LanguageProvider initialLang={lang}>
          <div className="min-h-screen flex flex-col relative">
            <BackgroundDecorations />
            <Navbar />

            <main className="flex-grow relative z-10">{children}</main>

            <Footer socialLinks={home?.social_links} contact={contact ?? null} />
            <WhatsAppButton settings={home?.settings ?? null} />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
