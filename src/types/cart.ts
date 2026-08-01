import { AssetImage } from './catalog';

export interface CartLine {
  id: number;
  catalog_item_listing_id: number;
  catalog_sku_listing_id: number | null;
  item_id: number;
  item_sku_id: number;
  item_name: string;
  sku_name: string;
  sku_code: string;
  jan_code: string;
  primary_image: AssetImage | null;
  unit_price: string | null;
  quantity: number;
  line_amount: string | null;
}

export interface CartCatalog {
  id: number;
  code: string;
  name: string;
  order_available: boolean;
  order_unavailable_reason: string | null;
}

export interface Cart {
  id: number | null;
  status: 'active' | 'empty';
  customer_name?: string;
  requester_name?: string;
  requester_email?: string;
  catalog: CartCatalog | null;
  lines: CartLine[];
  line_count: number;
  total_quantity: number;
  subtotal: string | null;
  order_available: boolean;
  order_unavailable_reason: string | null;
  updated_at: string | null;
}

export interface AddCartItemPayload {
  catalog_id: number;
  item_sku_id: number;
  quantity: number;
}

export interface UpdateCartLinePayload {
  quantity: number;
}

export interface CartCatalogConflictError {
  code: 'cart_catalog_conflict';
  detail: string;
  current_catalog: {
    id: number;
    name: string;
  };
  requested_catalog: {
    id: number;
    name: string;
  };
}
