
// Auth Types
export interface TokenResponse {
  access_token: string;
}

export interface AdminUser {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
}

// Product Detail Sub-types
export interface ProductDetailsDescription {
  aciklama_detay: string;
}

export interface ProductMaterialItem {
  baslik: string;
  items: string[];
}

export interface ProductDetails {
  ozet_ozellik: string[]; // Fixed length: 4 items
  aciklama: ProductDetailsDescription;
  teknik_ozellikler: Record<string, string>[]; // List of single-key objects
  malzeme_uretim: ProductMaterialItem[];
}

// Category & Color Types (for selection)
export interface Category {
  id: number;
  uuid: string;
  name: string;
  name_en?: string;
  emoji?: string;
  image_url?: string;
  image_uuid?: string;
}

export interface CategoryListOut {
  items: Category[];
  page: number;
  page_size: number;
  total: number;
}

export interface Color {
  id: number;
  uuid: string;
  name: string;
  hex: string;
}

export interface ColorListOut {
  items: Color[];
  page: number;
  page_size: number;
  total: number;
}

// Product Payloads
export interface ProductCreatePayload {
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  has_size: boolean;
  details?: ProductDetails;
  details_en?: ProductDetails | null;
  cover_image_url?: string;
  cover_image_uuid?: string;
  sort_order: number;
  is_active: boolean;
  category_ids: number[];
  color_ids: number[];
}

export interface ProductUpdatePayload {
  name?: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  has_size?: boolean;
  details?: ProductDetails;
  details_en?: ProductDetails | null;
  cover_image_url?: string;
  cover_image_uuid?: string;
  sort_order?: number;
  is_active?: boolean;
  category_ids?: number[];
  color_ids?: number[];
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  has_size: boolean;
  cover_image_url?: string;
  cover_image_uuid?: string;
  sort_order: number;
  is_active: boolean;
  category_name?: string; 
  created_at?: string; 
}

// Product Size
export interface ProductSize {
  id: number;
  uuid: string;
  product_id: number;
  width: number;
  height: number;
  depth: number;
  unit: string;
  sort_order: number;
}

export interface ProductImage {
  id: number;
  uuid: string;
  url: string;
  sort_order: number;
  size_id?: number | null;
  color_id?: number | null;
}

export interface ProductDetailOut extends Product {
  details?: ProductDetails;
  details_en?: ProductDetails | null;
  categories?: Category[];
  colors?: Color[];
  sizes?: ProductSize[];
  images?: ProductImage[];
}

export interface ProductListOut {
  items: Product[];
  page: number;
  page_size: number;
  total: number;
}

// --- PROJECT TYPES ---

export interface ProjectCategory {
  id: number;
  uuid: string;
  name: string;
  name_en?: string;
}

export interface ProjectReview {
  id: number;
  uuid: string;
  project_id: number;
  customer_name: string;
  comment: string;
}

export interface ProjectReviewUpsert {
  customer_name: string;
  comment: string;
}

export interface ProjectImage {
  id: number;
  uuid: string;
  project_id: number;
  kind: string;
  url: string;
  file_uuid?: string;
  sort_order: number;
}

export interface ProjectCreatePayload {
  name: string;
  name_en?: string;
  short_info?: string;
  short_info_en?: string;
  about_text?: string;
  about_text_en?: string;
  featured_image_url?: string;
  featured_image_uuid?: string;
  location?: string;
  location_en?: string;
  completed_at?: string;
  duration?: string;
  capacity?: string;
  total_products?: string;
  general_info: Record<string, string>[]; // Max 4 items
  general_info_en?: Record<string, string>[];
  category_id?: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface Project extends ProjectCreatePayload {
  id: number;
  uuid: string;
}

export interface ProjectDetailOut extends Project {
  category?: ProjectCategory;
  images: ProjectImage[];
  review?: ProjectReview;
}

// Upload Response
export interface UploadOut {
  uuid: string;
  url: string;
}

// Quote Request Types
export enum QuoteStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESPONDED = 'RESPONDED',
  ARCHIVED = 'ARCHIVED',
}

export interface QuoteRequest {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  status: string; // Backend uses simple str now
  product_id?: number;
  created_at: string;
}

export interface QuoteRequestListOut {
  items: QuoteRequest[];
  page: number;
  page_size: number;
  total: number;
}

// Site Settings
export interface SiteSettings {
  id?: number;
  phone_number?: string;
  email?: string;
  whatsapp_number?: string;
  whatsapp_default_message?: string;
  whatsapp_default_message_en?: string;
  office_address?: string;
  office_address_en?: string;
  workshop_address?: string;
  workshop_address_en?: string;
}

export interface ContactMaps {
  maps_embed_url?: string;
  maps_directions_url?: string;
}

// Generic Types
export interface PaginationParams {
  page: number;
  page_size: number;
  q?: string;
}

// --- CONTENT MANAGEMENT TYPES ---

export interface HomeSection {
  id: number;
  kind: string;
  title?: string;
  title_en?: string;
  body?: string;
  body_en?: string;
  media_url?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomeSectionCreatePayload {
  kind: string;
  title?: string;
  title_en?: string;
  body?: string;
  body_en?: string;
  media_url?: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface ReferenceLogo {
  id: number;
  uuid: string;
  url: string;
  sort_order: number;
}

export interface About {
  id: number;
  content?: string;
  content_en?: string;
}

export interface AboutImage {
  id: number;
  uuid: string;
  url: string;
  sort_order: number;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomeProjectImage {
  id: number;
  project_image_id: number;
  sort_order: number;
}
