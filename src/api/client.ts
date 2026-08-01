import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { storage } from '@/api/secureStore';
import { ApiError, TenantAuthResponse } from '@/types';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Clean public client strictly dedicated to tenant code resolution.
 * NO authorization tokens, NO credentials, and NO X-Tenant-Schema headers are attached.
 */
export const resolverClient = axios.create({
  baseURL: env.resolverBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Tenant API client used for authenticating and communicating with resolved tenant endpoints.
 */
export const tenantApiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Strictly validates whether a returned domain is permitted under system security policy.
 */
export function isAllowedTenantDomain(rawDomain: string): boolean {
  if (!rawDomain || typeof rawDomain !== 'string') return false;

  let trimmed = rawDomain.trim();

  // Reject URL containing username/password, query string, or fragment
  if (trimmed.includes('@') || trimmed.includes('?') || trimmed.includes('#')) {
    return false;
  }

  // Prepend protocol if missing for URL parsing
  let urlString = trimmed;
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    urlString = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    // Production rules
    if (!__DEV__) {
      // Must be https
      if (parsed.protocol !== 'https:') return false;
      // Must not specify explicit port in production
      if (parsed.port) return false;

      // Exact match for transbox.tech or valid subdomains *.transbox.tech
      const isOfficialDomain =
        hostname === 'transbox.tech' || hostname.endsWith('.transbox.tech');

      return isOfficialDomain;
    }

    // Development (__DEV__) rules: Allow localhost, 127.0.0.1, local IP range, and transbox.tech
    const isDevHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname === 'transbox.tech' ||
      hostname.endsWith('.transbox.tech');

    return isDevHost;
  } catch {
    return false;
  }
}

/**
 * Safely constructs a validated HTTPS API Base URL from a resolved domain.
 */
export function buildSafeTenantApiBaseUrl(domain: string): string {
  if (!isAllowedTenantDomain(domain)) {
    throw new Error('指定されたテナントドメインはセキュリティポリシーにより許可されていません。');
  }

  let cleaned = domain.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const parsed = new URL(cleaned);
    return `${parsed.protocol}//${parsed.host}`;
  }

  return `https://${cleaned}`;
}

/**
 * Dynamically updates the tenant API client's Base URL.
 */
export function setTenantClientBaseUrl(newBaseUrl: string): void {
  const safeBaseUrl = buildSafeTenantApiBaseUrl(newBaseUrl);
  tenantApiClient.defaults.baseURL = safeBaseUrl;
}

export function getTenantClientBaseUrl(): string {
  return tenantApiClient.defaults.baseURL || env.apiBaseUrl;
}

let onUnauthorizedCallback: (() => void) | null = null;

export function registerOnUnauthorizedHandler(handler: () => void) {
  onUnauthorizedCallback = handler;
}

// Request Interceptor for tenantApiClient: Attach Token & Optional Dev Tenant Schema Header
tenantApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await storage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Only attach X-Tenant-Schema in development if explicitly set as fallback/debugging
    if (__DEV__ && env.tenantSchema) {
      config.headers['X-Tenant-Schema'] = env.tenantSchema;
    }

    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// Single-flight refresh token queue variables
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for tenantApiClient: 401 Handling with Refresh Token Queue
tenantApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(normalizeError(error));
    }

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/api/tenant/auth/login/') ||
      requestUrl.includes('/api/tenant/auth/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return tenantApiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const currentBaseUrl = getTenantClientBaseUrl();
        const refreshHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (__DEV__ && env.tenantSchema) {
          refreshHeaders['X-Tenant-Schema'] = env.tenantSchema;
        }

        const refreshResponse = await axios.post<TenantAuthResponse>(
          `${currentBaseUrl}/api/tenant/auth/refresh/`,
          { refresh_token: refreshToken },
          { headers: refreshHeaders, timeout: env.apiTimeoutMs }
        );

        const newTokens = refreshResponse.data.tokens;
        const tenantCode = (await storage.getResolvedTenantCode()) || '';
        await storage.setSessionData(
          newTokens.access_token,
          newTokens.refresh_token,
          tenantCode,
          currentBaseUrl
        );

        tenantApiClient.defaults.headers.common.Authorization = `Bearer ${newTokens.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;

        processQueue(null, newTokens.access_token);
        return tenantApiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await storage.clearTokens();
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        return Promise.reject(normalizeError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

/**
 * Normalizes Axios and Network errors into standard ApiError format.
 */
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; detail?: string; code?: string } | undefined;

    const message =
      data?.message ||
      data?.detail ||
      (status === 404
        ? '対象のデータが見つからないか、指定されたテナントコードが無効です。'
        : status === 401
        ? '認証エラーが発生しました。再度ログインしてください。'
        : status === 403
        ? 'アクセス権限がありません。'
        : status && status >= 500
        ? 'サーバーエラーが発生しました。時間を置いて再度お試しください。'
        : error.message || '通信エラーが発生しました。');

    return {
      status,
      code: data?.code,
      message,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: '予期せぬエラーが発生しました。',
  };
}
