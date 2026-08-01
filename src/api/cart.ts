import { tenantApiClient } from './client';
import {
  Cart,
  AddCartItemPayload,
  UpdateCartLinePayload,
  SubmittedOrder,
} from '@/types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await tenantApiClient.get<{ cart: Cart }>('/api/end-user/cart/');
    return res.data.cart;
  },

  addCartItem: async (payload: AddCartItemPayload): Promise<Cart> => {
    const res = await tenantApiClient.post<{ cart: Cart }>('/api/end-user/cart/items/', payload);
    return res.data.cart;
  },

  replaceCartItem: async (payload: AddCartItemPayload): Promise<Cart> => {
    const res = await tenantApiClient.post<{ cart: Cart }>('/api/end-user/cart/replace/', payload);
    return res.data.cart;
  },

  updateCartLine: async (lineId: number, payload: UpdateCartLinePayload): Promise<Cart> => {
    const res = await tenantApiClient.patch<{ cart: Cart }>(`/api/end-user/cart/items/${lineId}/`, payload);
    return res.data.cart;
  },

  deleteCartLine: async (lineId: number): Promise<Cart> => {
    const res = await tenantApiClient.delete<{ cart: Cart }>(`/api/end-user/cart/items/${lineId}/`);
    return res.data.cart;
  },

  clearCart: async (): Promise<void> => {
    await tenantApiClient.delete('/api/end-user/cart/');
  },

  submitCart: async (): Promise<SubmittedOrder> => {
    const res = await tenantApiClient.post<{ request: SubmittedOrder }>('/api/end-user/cart/submit/');
    return res.data.request;
  },
};
