import { tenantApiClient } from '@/api/client';
import {
  CatalogItem,
  CatalogDetail,
  CatalogProductItem,
  ProductDetail,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const catalogsApi = {
  /**
   * Fetch visible catalogs for logged-in user's customer.
   */
  async getCatalogs(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<CatalogItem>> {
    const response = await tenantApiClient.get<PaginatedResponse<CatalogItem>>(
      '/api/end-user/catalogs/',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch catalog detail by catalog ID.
   */
  async getCatalogDetail(catalogId: number): Promise<CatalogDetail> {
    const response = await tenantApiClient.get<ApiResponse<CatalogDetail>>(
      `/api/end-user/catalogs/${catalogId}/`
    );
    return response.data.item;
  },

  /**
   * Fetch catalog items with pagination and search query.
   * Supports AbortSignal for search request cancellation.
   */
  async getCatalogItems(
    catalogId: number,
    params?: {
      page?: number;
      page_size?: number;
      search?: string;
    },
    signal?: AbortSignal
  ): Promise<PaginatedResponse<CatalogProductItem>> {
    const response = await tenantApiClient.get<PaginatedResponse<CatalogProductItem>>(
      `/api/end-user/catalogs/${catalogId}/items/`,
      { params, signal }
    );
    return response.data;
  },

  /**
   * Fetch product detail and listed SKUs for a specific catalog item.
   */
  async getItemDetail(catalogId: number, itemId: number): Promise<ProductDetail> {
    const response = await tenantApiClient.get<ApiResponse<ProductDetail>>(
      `/api/end-user/catalogs/${catalogId}/items/${itemId}/`
    );
    return response.data.item;
  },
};
