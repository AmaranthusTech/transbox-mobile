import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'transbox_mobile_access_token';
const REFRESH_TOKEN_KEY = 'transbox_mobile_refresh_token';
const RESOLVED_TENANT_CODE_KEY = 'transbox_mobile_resolved_tenant_code';
const RESOLVED_API_BASE_URL_KEY = 'transbox_mobile_resolved_api_base_url';

export const storage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async getResolvedTenantCode(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(RESOLVED_TENANT_CODE_KEY);
    } catch {
      return null;
    }
  },

  async setResolvedTenantCode(code: string): Promise<void> {
    await SecureStore.setItemAsync(RESOLVED_TENANT_CODE_KEY, code);
  },

  async getResolvedApiBaseUrl(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(RESOLVED_API_BASE_URL_KEY);
    } catch {
      return null;
    }
  },

  async setResolvedApiBaseUrl(url: string): Promise<void> {
    await SecureStore.setItemAsync(RESOLVED_API_BASE_URL_KEY, url);
  },

  async setSessionData(
    accessToken: string,
    refreshToken: string,
    tenantCode: string,
    apiBaseUrl: string
  ): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(RESOLVED_TENANT_CODE_KEY, tenantCode),
      SecureStore.setItemAsync(RESOLVED_API_BASE_URL_KEY, apiBaseUrl),
    ]);
  },

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(RESOLVED_TENANT_CODE_KEY),
        SecureStore.deleteItemAsync(RESOLVED_API_BASE_URL_KEY),
      ]);
    } catch {
      // Ignore cleanup errors
    }
  },
};
