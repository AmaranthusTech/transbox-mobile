import { AssetImage } from './catalog';

export interface OrderHistoryLine {
  id: number;
  item_id: number;
  sku_id: number | null;
  sku_code: string;
  jan_code: string;
  item_name_snapshot: string;
  sku_name_snapshot: string;
  unit_price_snapshot: string | null;
  quantity: number;
  line_amount: string | null;
  status: string;
  status_label: string;
  primary_image: AssetImage | null;
}

export interface OrderHistoryListItem {
  id: number;
  request_number: string;
  status: string;
  status_label: string;
  submitted_at: string | null;
  catalog_id: number;
  catalog_name: string;
  sales_mode: string;
  customer_name: string;
  requester_name: string;
  requester_email: string;
  total_quantity: number;
  total_amount: string | null;
  representative_item_label: string;
  representative_image: AssetImage | null;
  created_at: string;
  updated_at: string;
}

export interface OrderHistoryDetail extends OrderHistoryListItem {
  note: string;
  lines: OrderHistoryLine[];
}

export interface PaginatedOrderHistoryResponse {
  items: OrderHistoryListItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
