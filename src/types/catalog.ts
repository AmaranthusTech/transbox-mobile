/**
 * Catalog and Product type definitions for Phase 1-B
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AssetImage {
  asset_id?: number | null;
  file_name?: string | null;
  content_type?: string | null;
  url?: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
}

export interface CatalogItem {
  id: number;
  code: string;
  name: string;
  catalog_type: string;
  sales_mode: string;
  starts_at: string | null;
  ends_at: string | null;
  reservation_starts_at: string | null;
  reservation_ends_at: string | null;
  cover_image: AssetImage | null;
  items_count: number;
  order_available: boolean;
  order_unavailable_reason: string | null;
}

export interface CatalogDetail extends CatalogItem {
  description: string | null;
}

export interface CatalogProductItem {
  catalog_item_listing_id: number;
  item_id: number;
  item_code: string;
  display_name: string;
  brand_name: string | null;
  category_name: string | null;
  primary_image: AssetImage | null;
  sku_count: number;
  min_price: string | null;
  max_price: string | null;
  has_price_missing: boolean;
}

export interface SkuItem {
  catalog_sku_listing_id: number | null;
  sku_id: number;
  sku_code: string;
  jan_code: string | null;
  display_name: string;
  color: string | null;
  size: string | null;
  order_number: string | null;
  image: AssetImage | null;
  master_price: string | null;
  catalog_price: string | null;
  effective_price: string | null;
  has_price_missing: boolean;
  is_orderable: boolean;
}

export interface ProductDetail {
  catalog_item_listing_id: number;
  item_id: number;
  item_code: string;
  display_name: string;
  description: string | null;
  specification: string | null;
  brand_name: string | null;
  category_name: string | null;
  images: AssetImage[];
  skus: SkuItem[];
}
