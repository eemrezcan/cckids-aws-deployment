import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://www.cckkids.com";
const DEFAULT_OG_IMAGE = "/Logo.png";
const SITE_NAME = "CCkids";

type Locale = "tr" | "en";

type JsonLd = Record<string, unknown>;

function stripTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function siteUrl() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
}

function toOgLocale(locale: Locale) {
  return locale === "en" ? "en_US" : "tr_TR";
}

function resolveImageUrl(image?: string) {
  const value = image?.trim() || DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return canonicalUrl(value);
}

export function canonicalUrl(path = "/") {
  return `${siteUrl()}${normalizePath(path)}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  locale?: Locale;
}): Metadata {
  const locale = input.locale ?? "tr";
  const url = canonicalUrl(input.path);
  const imageUrl = resolveImageUrl(input.ogImage);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: toOgLocale(locale),
      url,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd(): JsonLd {
  const url = canonicalUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: canonicalUrl(DEFAULT_OG_IMAGE),
  };
}

export function localBusinessJsonLd(input: {
  phone?: string | null;
  email?: string | null;
  officeAddress?: string | null;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: canonicalUrl("/contact"),
    image: canonicalUrl(DEFAULT_OG_IMAGE),
    telephone: input.phone ?? undefined,
    email: input.email ?? undefined,
    address: input.officeAddress
      ? {
          "@type": "PostalAddress",
          streetAddress: input.officeAddress,
          addressCountry: "TR",
        }
      : undefined,
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  image?: string | null;
  uuid: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: resolveImageUrl(input.image ?? undefined),
    url: canonicalUrl(`/products/${encodeURIComponent(input.uuid)}`),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };
}

export function projectJsonLd(input: {
  name: string;
  description: string;
  image?: string | null;
  uuid: string;
  location?: string | null;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    description: input.description,
    image: resolveImageUrl(input.image ?? undefined),
    url: canonicalUrl(`/projects/${encodeURIComponent(input.uuid)}`),
    locationCreated: input.location ?? undefined,
  };
}

export function aboutPageJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Hakkımızda",
    url: canonicalUrl("/about"),
    image: canonicalUrl(DEFAULT_OG_IMAGE),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: canonicalUrl("/"),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
