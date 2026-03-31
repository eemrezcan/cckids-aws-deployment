// lib/types.ts
/**
 * Backend uyumlu ürün tipleri.
 * Not: Mock dönemdeki category/price/features/color alanları backend'de yok.
 */

export type ProductListItem = {
  id: number;
  name: string;
  uuid: string;
  description?: string | null;
  coverImageUrl?: string | null;
  sortOrder?: number;
  categories?: Array<{
    uuid: string;
    name: string;
    emoji?: string | null; // backend "emoji key"
    image_url?: string | null;
  }>;
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date | string;
}
