// lib/api/endpoints.ts
import { apiFetch } from "./client";
import { buildApiUrl } from "../utils/url";
import { type Lang } from "@/lib/i18n/shared";
import type {
  AboutResponse,
  AboutImageListResponse,
  CategoryPublicOut,
  ContactResponse,
  HomeProjectImagePublicOut,
  HomeResponse,
  PaginatedResponse,
  ProductDetailOut,
  ProductDetailResponse,
  ProductListItemPublicOut,
  ProjectDetailPublicOut,
  ProjectListItemPublicOut,
  ProjectReviewPublicOut,
  QuoteRequestCreate,
  QuoteRequestCreated,
  ReferenceLogoPublicOut,
} from "./types";

/**
 * GET /public/home
 */
export function getHome(lang: Lang = "tr"): Promise<HomeResponse> {
  const url = buildApiUrl("/public/home", { lang });
  return apiFetch<HomeResponse>(url, { method: "GET" });
}

/**
 * GET /public/products (UUID roadmap için list item tipi eklendi)
 * Not: Backend halen legacy response dönüyorsa, çağıran yerde adaptasyon gerekebilir.
 */
export function getProducts(params?: {
  q?: string;
  page?: number;
  page_size?: number;
  lang?: Lang;
}): Promise<PaginatedResponse<ProductListItemPublicOut>> {
  const url = buildApiUrl("/public/products", {
    lang: params?.lang ?? "tr",
    q: params?.q,
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  });

  return apiFetch<PaginatedResponse<ProductListItemPublicOut>>(url, { method: "GET" });
}

/**
 * GET /public/products/{uuid}
 * YASA: UUID kullanımı
 */
export function getProductDetail(productUuid: string, lang: Lang = "tr"): Promise<ProductDetailOut> {
  const url = buildApiUrl(`/public/products/${encodeURIComponent(productUuid)}`, { lang });
  return apiFetch<ProductDetailOut>(url, { method: "GET" });
}

/**
 * LEGACY: GET /public/products/{slug}
 * Not: Backend slug’ı kaldırdıysa bu fonksiyon 404 alabilir.
 */
export function getProductBySlug(slug: string, lang: Lang = "tr"): Promise<ProductDetailResponse> {
  const url = buildApiUrl(`/public/products/${encodeURIComponent(slug)}`, { lang });
  return apiFetch<ProductDetailResponse>(url, { method: "GET" });
}

/**
 * GET /public/categories
 */
export function getCategories(params?: {
  page?: number;
  page_size?: number;
  lang?: Lang;
}): Promise<PaginatedResponse<CategoryPublicOut>> {
  const url = buildApiUrl("/public/categories", {
    lang: params?.lang ?? "tr",
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 50,
  });
  return apiFetch<PaginatedResponse<CategoryPublicOut>>(url, { method: "GET" });
}

/**
 * GET /public/categories/{uuid}/products
 * ✅ q param eklendi (kategori içi arama)
 */
export function getProductsByCategory(
  categoryUuid: string,
  page = 1,
  page_size = 12,
  q?: string,
  lang: Lang = "tr",
): Promise<PaginatedResponse<ProductListItemPublicOut>> {
  const url = buildApiUrl(`/public/categories/${encodeURIComponent(categoryUuid)}/products`, {
    lang,
    page,
    page_size,
    q,
  });
  return apiFetch<PaginatedResponse<ProductListItemPublicOut>>(url, { method: "GET" });
}

/**
 * GET /public/projects?page=&page_size=&category_uuid=
 */
export function getProjects(
  page = 1,
  page_size = 9,
  category_uuid?: string,
  q?: string,
  lang: Lang = "tr",
): Promise<PaginatedResponse<ProjectListItemPublicOut>> {
  const url = buildApiUrl("/public/projects", {
    lang,
    page,
    page_size,
    category_uuid,
    q, // ✅ backend destekliyorsa otomatik filtreler
  });

  return apiFetch<PaginatedResponse<ProjectListItemPublicOut>>(url, { method: "GET" });
}

/**
 * GET /public/projects/{uuid}
 */
export function getProjectDetail(uuid: string, lang: Lang = "tr"): Promise<ProjectDetailPublicOut> {
  const url = buildApiUrl(`/public/projects/${encodeURIComponent(uuid)}`, { lang });
  return apiFetch<ProjectDetailPublicOut>(url, { method: "GET" });
}

/**
 * GET /public/project-reviews?page=&page_size=
 */
export function getProjectReviews(page = 1, page_size = 3, lang: Lang = "tr"): Promise<PaginatedResponse<ProjectReviewPublicOut>> {
  const url = buildApiUrl("/public/project-reviews", { lang, page, page_size });
  return apiFetch<PaginatedResponse<ProjectReviewPublicOut>>(url, { method: "GET" });
}

/**
 * GET /public/references?limit=
 * ✅ Backend bazen { items: [{ uuid, url, sort_order }] } döndürüyor.
 * Bu fonksiyon UI'ın beklediği shape'e normalize eder (url -> logo_url).
 */
export async function getReferences(limit = 6, lang: Lang = "tr"): Promise<ReferenceLogoPublicOut[]> {
  const url = buildApiUrl("/public/references", { lang, limit });

  // Response iki şekilde gelebilir:
  // 1) ReferenceLogoPublicOut[]
  // 2) { items: { uuid, url, sort_order }[] }
  const raw = await apiFetch<
    | ReferenceLogoPublicOut[]
    | { items: Array<{ uuid: string; url: string; sort_order?: number | null }> }
  >(url, { method: "GET" });

  if (Array.isArray(raw)) {
    return raw;
  }

  const items = Array.isArray(raw?.items) ? raw.items : [];
  return items.map((it) => ({
    uuid: it.uuid,
    logo_url: it.url,
    sort_order: it.sort_order ?? null,
    // name / website_url backend'de yoksa undefined kalır
  }));
}

/**
 * GET /public/contact
 */
export function getContact(lang: Lang = "tr"): Promise<ContactResponse> {
  const url = buildApiUrl("/public/contact", { lang });
  return apiFetch<ContactResponse>(url, { method: "GET" });
}

/**
 * GET /public/about
 */
export function getAbout(lang: Lang = "tr"): Promise<AboutResponse> {
  const url = buildApiUrl("/public/about", { lang });
  return apiFetch<AboutResponse>(url, { method: "GET" });
}

/**
 * GET /public/about/images
 * Backend schema: { items: AboutImagePublicOut[] }
 */
export function getAboutImages(lang: Lang = "tr"): Promise<AboutImageListResponse> {
  const url = buildApiUrl("/public/about/images", { lang });
  return apiFetch<AboutImageListResponse>(url, { method: "GET" });
}

/**
 * GET /public/home/project-images?limit=
 */
export function getHomeProjectImages(limit = 12, lang: Lang = "tr"): Promise<HomeProjectImagePublicOut[]> {
  const url = buildApiUrl("/public/home/project-images", { lang, limit });
  return apiFetch<HomeProjectImagePublicOut[]>(url, { method: "GET" });
}

/**
 * POST /public/quote-requests
 */
export function createQuoteRequest(payload: QuoteRequestCreate): Promise<QuoteRequestCreated> {
  const url = buildApiUrl("/public/quote-requests");
  return apiFetch<QuoteRequestCreated>(url, { method: "POST", body: payload });
}
