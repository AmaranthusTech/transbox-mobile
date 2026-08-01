import { useState, useEffect, useCallback } from 'react';
import { orderHistoryApi } from '@/api/orderHistory';
import { OrderHistoryDetail, ApiError } from '@/types';

export function useOrderHistoryDetail(requestId: number) {
  const [order, setOrder] = useState<OrderHistoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!requestId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderHistoryApi.getOrderHistoryDetail(requestId, signal);
      setOrder(data);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      const apiErr: ApiError = err?.response?.data?.error || {
        message: '注文詳細の取得に失敗しました。',
      };
      setError(apiErr);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDetail(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchDetail]);

  return {
    order,
    isLoading,
    error,
    refetch: () => fetchDetail(),
  };
}
