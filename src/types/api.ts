/**
 * Standard API error and response structure.
 */

export interface ApiError {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  item: T;
}

export interface ApiListResponse<T> {
  items: T[];
  count: number;
}
