// lib/api/types.ts
// Generic pagination (backend: { items, page, page_size, total })
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

/**
 * =========================
 * LEGACY (mevcut projede kullanılanlar)
 * Not: Backend UUID’ye geçtiği için aşağıdaki slug/id bazlı tipler ileride kaldırılabilir.
 * =========================
 */

// --- /public/products (legacy) ---
export interface ProductListItemResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  sort_order: number;
}

export interface PaginatedProductsResponse {
  items: ProductListItemResponse[];
  page: number;
  page_size: number;
  total: number;
}

export interface SiteSettings {
  whatsapp_number: string;
  whatsapp_default_message: string;
}

export interface HomeSection {
  id: number;
  kind: string;
  title?: string | null;
  body?: string | null;
  media_url?: string | null;
  link_url?: string | null;
  sort_order: number;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  sort_order: number;
}

export interface HomeResponse {
  settings: SiteSettings;
  sections: HomeSection[];
  social_links: SocialLink[];
}

export interface ProductImageResponse {
  id: number;
  url: string;
  sort_order: number;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  sort_order: number;
  images: ProductImageResponse[];
}

export interface AboutResponse {
  content?: string | null;
}

export interface QuoteRequestCreate {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
  product_id?: number | null;
  product_uuid?: string | null;
}

export interface QuoteRequestCreated {
  id: number;
  status: string;
  created_at: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
  product_id?: number | null;
}

/**
 * =========================
 * NEW PUBLIC API TYPES (UUID)
 * =========================
 */

export interface CategoryPublicOut {
  uuid: string;
  name: string;
  emoji?: string | null;
  image_url?: string | null;
  slug?: string | null;
  sort_order?: number | null;
}

export interface ProductImagePublicOut {
  id: number;
  uuid: string;
  url: string;
  sort_order?: number | null;
  color?: ProductColorPublicOut | null;
  size?: ProductSizePublicOut | null;
}

export interface ProductColorPublicOut {
  uuid: string;
  name: string;
  hex?: string | null;
}

export interface ProductSizePublicOut {
  uuid: string;
  width: number;
  height: number;
  depth: number;
  unit: string;
  sort_order?: number | null;
}

export type ProductDetailsJson = {
  ozet_ozellik?: string[];
  aciklama?: { aciklama_detay?: string };
  teknik_ozellikler?: Array<Record<string, string>>;
  malzeme_uretim?: Array<{ baslik: string; items: string[] }>;
  [k: string]: unknown;
};

export interface ProductListItemPublicOut {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  cover_image_url?: string | null;
  sort_order?: number | null;
}

export interface ProductDetailOut {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  cover_image_url?: string | null;
  sort_order?: number | null;
  has_size?: boolean;
  details?: ProductDetailsJson;
  categories?: CategoryPublicOut[];
  colors?: ProductColorPublicOut[];
  sizes?: ProductSizePublicOut[];
  images?: ProductImagePublicOut[];
}

export interface ProjectCategoryPublicOut {
  uuid: string;
  name: string;
  sort_order?: number | null;
}

export interface ProjectImagePublicOut {
  uuid?: string;
  id?: number;
  url: string;
  sort_order?: number | null;
}

export interface ProjectReviewPublicOut {
  uuid?: string;
  id?: number;
  author_name?: string | null;
  author_title?: string | null;
  rating?: number | null;
  body: string;
  created_at?: string;
  project_uuid?: string | null;
}

export interface ProjectListItemPublicOut {
  uuid: string;
  name: string;
  short_info?: string | null;
  featured_image_url?: string | null;
  location?: string | null;
  completed_at?: string | null;
  category?: ProjectCategoryPublicOut | null;
}

export interface ProjectDetailPublicOut {
  uuid: string;
  name: string;
  short_info?: string | null;
  about_text?: string | null;
  featured_image_url?: string | null;
  location?: string | null;
  completed_at?: string | null;
  duration?: string | null;
  capacity?: string | null;
  total_products?: number | null;
  general_info?: Array<{ key: string; value: string }>;
  category?: ProjectCategoryPublicOut | null;
  images?: ProjectImagePublicOut[];
  before_images?: ProjectImagePublicOut[];
  after_images?: ProjectImagePublicOut[];
  gallery_images?: ProjectImagePublicOut[];
  review?: ProjectReviewPublicOut | null;
}

export interface ReferenceLogoPublicOut {
  uuid?: string;
  id?: number;

  /**
   * UI tarafında kullanılan alan.
   * Backend bazı ortamlarda bunu "url" olarak döndürebiliyor.
   */
  logo_url?: string;

  /**
   * Backend'in yeni response'unda gelen alan (örn: { items: [{ url: ... }] }).
   * Not: UI tarafında doğrudan kullanmıyoruz; getReferences() normalize ediyor.
   */
  url?: string;

  name?: string | null;
  website_url?: string | null;
  sort_order?: number | null;
}

export interface AboutImagePublicOut {
  uuid?: string;
  id?: number;
  url: string;
  sort_order?: number | null;
  title?: string | null;
}

/**
 * About images endpoint response
 * Backend schema: { items: AboutImagePublicOut[] }
 */
export interface AboutImageListResponse {
  items: AboutImagePublicOut[];
}

export interface HomeProjectImagePublicOut {
  uuid?: string;
  id?: number;
  image_url: string;
  title?: string | null;
  sort_order?: number | null;
  project_uuid?: string | null;
}

export interface ContactResponse {
  phone_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  office_address?: string | null;
  workshop_address?: string | null;
  social_links?: SocialLink[];
  maps_embed_url?: string | null;
  maps_directions_url?: string | null;
}
