import { useState, useCallback, useEffect } from 'react';
import { catalogsApi } from '@/api/catalogs';
import { CatalogItem, ApiError } from '@/types';

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchCatalogs = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await catalogsApi.getCatalogs({ page: 1, page_size: 50 });
      setCatalogs(res.results || []);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  return {
    catalogs,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchCatalogs(true),
    retry: () => fetchCatalogs(false),
  };
}
