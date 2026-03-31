// lib/utils/url.ts
type QueryValue = string | number | boolean | null | undefined;

function stripTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function stripLeadingSlash(path: string) {
  return path.startsWith("/") ? path.slice(1) : path;
}

/**
 * Build an absolute API URL using NEXT_PUBLIC_API_BASE_URL.
 * Example: buildApiUrl("/public/products", { page: 1 })
 */
export function buildApiUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL. Define it in .env.local");
  }

  const cleanBase = stripTrailingSlash(base);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${cleanBase}${cleanPath}`);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  return url.toString();
}

/**
 * Convert backend media URLs to absolute URLs.
 * - If URL already absolute (http/https), returns as-is.
 * - If relative like "/media/..", prefixes with API base.
 */
export function buildMediaUrl(urlOrPath?: string | null): string | null {
  if (!urlOrPath) return null;
  const normalized = urlOrPath.trim();
  if (!normalized) return null;

  // Some backend records may send placeholder schema values.
  if (["string", "null", "undefined"].includes(normalized.toLowerCase())) return null;

  if (/^https?:\/\//i.test(normalized)) return normalized;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL. Define it in .env.local");
  }

  const cleanBase = stripTrailingSlash(base);
  const cleanPath = stripLeadingSlash(normalized);
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Roadmap helper:
 * /products/categories/[uuid] sayfası için URL builder
 *
 * Örnek:
 * buildCategoryUrl("uuid") => "/products/categories/uuid"
 * buildCategoryUrl("uuid", { page: 2, q: "masa" })
 * => "/products/categories/uuid?page=2&q=masa"
 */
export function buildCategoryUrl(
  categoryUuid: string,
  params?: { page?: number; q?: string; page_size?: number },
): string {
  const base = `/products/categories/${encodeURIComponent(categoryUuid)}`;
  const sp = new URLSearchParams();

  if (params?.page && params.page > 1) sp.set("page", String(params.page));
  if (params?.page_size && params.page_size > 0) sp.set("page_size", String(params.page_size));
  if (params?.q) sp.set("q", params.q);

  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
