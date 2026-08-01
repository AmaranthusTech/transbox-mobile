import { tenantApiClient } from '@/api/client';
import { CatalogRagResponse } from '@/types';

export const aiAssistantApi = {
  /**
   * Search catalog items semantically using RAG API for a specific catalog.
   */
  async searchCatalogItems(
    params: {
      catalogId: number;
      query: string;
      searchLimit?: number;
      minSimilarity?: number;
    },
    signal?: AbortSignal
  ): Promise<CatalogRagResponse> {
    const { catalogId, query, searchLimit = 5, minSimilarity = 0.45 } = params;
    const response = await tenantApiClient.post<CatalogRagResponse>(
      `/api/end-user/catalogs/${catalogId}/ai-search/`,
      {
        query,
        search_limit: searchLimit,
        min_similarity: minSimilarity,
      },
      { signal }
    );
    return response.data;
  },
};
