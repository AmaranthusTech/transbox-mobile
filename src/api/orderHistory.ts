import { tenantApiClient } from './client';
import {
  OrderHistoryDetail,
  PaginatedOrderHistoryResponse,
} from '@/types';

export interface GetOrderHistoryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  catalog_id?: number;
}

export const orderHistoryApi = {
  getOrderHistory: async (
    params: GetOrderHistoryParams = {},
    signal?: AbortSignal
  ): Promise<PaginatedOrderHistoryResponse> => {
    const res = await tenantApiClient.get<PaginatedOrderHistoryResponse>(
      '/api/end-user/requests/',
      {
        params,
        signal,
      }
    );
    return res.data;
  },

  getOrderHistoryDetail: async (
    requestId: number,
    signal?: AbortSignal
  ): Promise<OrderHistoryDetail> => {
    const res = await tenantApiClient.get<{ item: OrderHistoryDetail }>(
      `/api/end-user/requests/${requestId}/`,
      { signal }
    );
    return res.data.item;
  },
};
