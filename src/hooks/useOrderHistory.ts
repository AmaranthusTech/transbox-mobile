import { useState, useEffect, useCallback, useRef } from 'react';
import { orderHistoryApi, GetOrderHistoryParams } from '@/api/orderHistory';
import { OrderHistoryListItem, ApiError } from '@/types';

export function useOrderHistory(initialParams: GetOrderHistoryParams = {}) {
  const [items, setItems] = useState<OrderHistoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchLockRef = useRef<boolean>(false);

  const fetchHistory = useCallback(
    async (
      pageNum: number,
      isRefresh = false,
      signal?: AbortSignal
    ) => {
      if (fetchLockRef.current) return;
      fetchLockRef.current = true;

      if (isRefresh) {
        setIsRefreshing(true);
      } else if (pageNum > 1) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await orderHistoryApi.getOrderHistory(
          { ...initialParams, page: pageNum, page_size: 20 },
          signal
        );

        if (isRefresh || pageNum === 1) {
          setItems(res.items);
        } else {
          setItems((prev) => [...prev, ...res.items]);
        }

        setPage(res.page);
        setHasMore(res.page < res.total_pages);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }
        const apiErr: ApiError = err?.response?.data?.error || {
          message: '注文履歴の取得に失敗しました。',
        };
        setError(apiErr);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsFetchingMore(false);
        fetchLockRef.current = false;
      }
    },
    [initialParams.search, initialParams.status, initialParams.catalog_id]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchHistory(1, false, controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchHistory]);

  const refresh = useCallback(() => {
    return fetchHistory(1, true);
  }, [fetchHistory]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isRefreshing && !isFetchingMore && !fetchLockRef.current) {
      fetchHistory(page + 1, false);
    }
  }, [hasMore, isLoading, isRefreshing, isFetchingMore, page, fetchHistory]);

  return {
    items,
    isLoading,
    isRefreshing,
    isFetchingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    retry: () => fetchHistory(1, false),
  };
}
