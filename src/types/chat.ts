import { AssetImage } from './catalog';

export interface CatalogRagSource {
  catalog_item_listing_id: number;
  item_id: number;
  item_code: string;
  display_name: string;
  brand_name: string | null;
  category_name: string | null;
  similarity: number;
  distance: number;
  primary_image: AssetImage | null;
  sku_count: number;
  min_price: string | null;
  max_price: string | null;
  has_price_missing: boolean;
}

export interface CatalogRagResponse {
  query: string;
  answer: string;
  model_name: string;
  answer_mode: 'structured' | 'llm' | 'fallback' | 'clarification';
  intent?: string;
  filters?: Record<string, any>;
  catalog_id: number;
  catalog_name: string;
  source_count: number;
  sources: CatalogRagSource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: CatalogRagSource[];
  answerMode?: 'structured' | 'llm' | 'fallback' | 'clarification';
  intent?: string;
  filters?: Record<string, any>;
  createdAt: string;
  status?: 'sending' | 'sent' | 'error';
}
