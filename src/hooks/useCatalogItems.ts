import { useState, useCallback, useEffect, useRef } from 'react';
import { catalogsApi } from '@/api/catalogs';
import { CatalogDetail, CatalogProductItem, ApiError } from '@/types';

export function useCatalogItems(catalogId: number) {
  const [catalog, setCatalog] = useState<CatalogDetail | null>(null);
  const [items, setItems] = useState<CatalogProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Synchronous request in-flight lock to prevent React state update async race conditions
  const loadMoreInFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch catalog info once
  const fetchCatalogInfo = useCallback(async () => {
    try {
      const detail = await catalogsApi.getCatalogDetail(catalogId);
      setCatalog(detail);
    } catch {
      // Ignore info error; main items fetch will handle error display
    }
  }, [catalogId]);

  // Main items fetch method
  const fetchItems = useCallback(
    async (targetPage: number, query: string, refresh = false) => {
      // Cancel pending request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Acquire synchronous lock
      loadMoreInFlightRef.current = true;

      if (refresh) {
        setIsRefreshing(true);
      } else if (targetPage === 1) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      setError(null);

      try {
        const res = await catalogsApi.getCatalogItems(
          catalogId,
          {
            page: targetPage,
            page_size: 20,
            search: query,
          },
          controller.signal
        );

        const newResults = res.results || [];
        const nextUrlExists = Boolean(res.next);

        if (targetPage === 1) {
          setItems(newResults);
        } else {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.catalog_item_listing_id));
            const filteredNew = newResults.filter(
              (i) => !existingIds.has(i.catalog_item_listing_id)
            );
            return [...prev, ...filteredNew];
          });
        }

        // Update page state and hasMore strictly based on next URL
        setHasMore(nextUrlExists);
        setPage(targetPage);
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }

        setError(err as ApiError);

        // On failure (page 1 or page 2+), immediately shut down further pagination
        setHasMore(false);

        if (targetPage === 1) {
          setItems([]);
          setPage(1);
        }
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
        setIsRefreshing(false);

        // Release synchronous lock
        loadMoreInFlightRef.current = false;
      }
    },
    [catalogId]
  );

  // Trigger fetch when debounced search or catalogId changes
  useEffect(() => {
    fetchCatalogInfo();
    fetchItems(1, debouncedSearch, false);
  }, [catalogId, debouncedSearch, fetchCatalogInfo, fetchItems]);

  const loadMore = useCallback(() => {
    // 1. Check synchronous lock first
    if (loadMoreInFlightRef.current) {
      return;
    }

    // 2. Check state guards
    if (
      isLoading ||
      isFetchingMore ||
      isRefreshing ||
      Boolean(error) ||
      !hasMore ||
      items.length === 0
    ) {
      return;
    }

    fetchItems(page + 1, debouncedSearch, false);
  }, [
    fetchItems,
    hasMore,
    isFetchingMore,
    isLoading,
    isRefreshing,
    error,
    items.length,
    page,
    debouncedSearch,
  ]);

  const refresh = useCallback(() => {
    fetchCatalogInfo();
    fetchItems(1, debouncedSearch, true);
  }, [fetchCatalogInfo, fetchItems, debouncedSearch]);

  return {
    catalog,
    items,
    searchQuery,
    setSearchQuery,
    isLoading,
    isFetchingMore,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
