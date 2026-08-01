import { create } from 'zustand';
import { cartApi } from '@/api/cart';
import {
  Cart,
  AddCartItemPayload,
  UpdateCartLinePayload,
  ApiError,
  CartCatalogConflictError,
} from '@/types';
import { isAxiosError } from 'axios';

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: ApiError | null;

  fetchCart: () => Promise<void>;
  addItem: (payload: AddCartItemPayload) => Promise<{ success: boolean; conflict?: CartCatalogConflictError }>;
  replaceItem: (payload: AddCartItemPayload) => Promise<boolean>;
  updateLine: (lineId: number, payload: UpdateCartLinePayload) => Promise<boolean>;
  removeLine: (lineId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  reset: () => void;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data?.error || { message: 'カート情報の取得に失敗しました。' };
      set({ error: apiErr, isLoading: false });
    }
  },

  addItem: async (payload: AddCartItemPayload) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartApi.addCartItem(payload);
      set({ cart, isMutating: false });
      return { success: true };
    } catch (err: any) {
      set({ isMutating: false });
      if (isAxiosError(err) && err.response?.status === 409) {
        const conflictData = err.response.data as CartCatalogConflictError;
        if (conflictData.code === 'cart_catalog_conflict') {
          return { success: false, conflict: conflictData };
        }
      }
      const apiErr: ApiError = err.response?.data?.error || { message: err.response?.data?.detail || 'カートへの追加に失敗しました。' };
      set({ error: apiErr });
      return { success: false };
    }
  },

  replaceItem: async (payload: AddCartItemPayload) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartApi.replaceCartItem(payload);
      set({ cart, isMutating: false });
      return true;
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data?.error || { message: 'カートの置き換えに失敗しました。' };
      set({ error: apiErr, isMutating: false });
      return false;
    }
  },

  updateLine: async (lineId: number, payload: UpdateCartLinePayload) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartApi.updateCartLine(lineId, payload);
      set({ cart, isMutating: false });
      return true;
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data?.error || { message: '数量の更新に失敗しました。' };
      set({ error: apiErr, isMutating: false });
      return false;
    }
  },

  removeLine: async (lineId: number) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartApi.deleteCartLine(lineId);
      set({ cart, isMutating: false });
      return true;
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data?.error || { message: '明細の削除に失敗しました。' };
      set({ error: apiErr, isMutating: false });
      return false;
    }
  },

  clearCart: async () => {
    set({ isMutating: true, error: null });
    try {
      await cartApi.clearCart();
      set({
        cart: {
          id: null,
          status: 'empty',
          catalog: null,
          lines: [],
          line_count: 0,
          total_quantity: 0,
          subtotal: '0.00',
          order_available: false,
          order_unavailable_reason: null,
          updated_at: null,
        },
        isMutating: false,
      });
      return true;
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data?.error || { message: 'カートの全削除に失敗しました。' };
      set({ error: apiErr, isMutating: false });
      return false;
    }
  },

  reset: () => {
    set({ cart: null, isLoading: false, isMutating: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
