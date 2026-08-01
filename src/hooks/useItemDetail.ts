import { useState, useCallback, useEffect } from 'react';
import { catalogsApi } from '@/api/catalogs';
import { ProductDetail, ApiError } from '@/types';

export function useItemDetail(catalogId: number, itemId: number) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogsApi.getItemDetail(catalogId, itemId);
      setProduct(data);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [catalogId, itemId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    product,
    isLoading,
    error,
    retry: fetchDetail,
  };
}
