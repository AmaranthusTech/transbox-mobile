import { tenantApiClient, setTenantClientBaseUrl } from '@/api/client';
import { buildTenantBaseUrl } from '@/api/tenantResolver';
import {
  LoginPayload,
  RefreshTokenPayload,
  TenantAuthResponse,
  TenantAuthUser,
  ApiResponse,
} from '@/types';

export const authApi = {
  /**
   * Log in with tenant code, email, and password.
   * Step 1: Normalize tenant code and safely construct tenant HTTPS API Base URL.
   * Step 2: Dynamically set Base URL on tenantApiClient.
   * Step 3: Authenticate user against endpoint POST /api/tenant/auth/login/.
   */
  async login(payload: LoginPayload): Promise<{
    authResponse: TenantAuthResponse;
    resolvedTenantCode: string;
    resolvedApiBaseUrl: string;
  }> {
    // 1. Safely normalize tenant code & build HTTPS Base URL
    const { normalizedCode, baseUrl } = buildTenantBaseUrl(payload.tenant_code);

    // 2. Set dynamic Base URL on tenantApiClient
    setTenantClientBaseUrl(baseUrl);

    // 3. Authenticate user against resolved tenant endpoint
    const response = await tenantApiClient.post<TenantAuthResponse>(
      '/api/tenant/auth/login/',
      {
        email: payload.email.trim(),
        password: payload.password,
      }
    );

    return {
      authResponse: response.data,
      resolvedTenantCode: normalizedCode,
      resolvedApiBaseUrl: baseUrl,
    };
  },

  /**
   * Refresh access and refresh tokens using current refresh token.
   */
  async refresh(payload: RefreshTokenPayload): Promise<TenantAuthResponse> {
    const response = await tenantApiClient.post<TenantAuthResponse>(
      '/api/tenant/auth/refresh/',
      payload
    );
    return response.data;
  },

  /**
   * Logout user by notifying tenant server and invalidating session.
   */
  async logout(refreshToken?: string | null): Promise<void> {
    if (!refreshToken) return;
    try {
      await tenantApiClient.post('/api/tenant/auth/logout/', {
        refresh_token: refreshToken,
      });
    } catch {
      // Ignore server logout failures during offline/cleanup
    }
  },

  /**
   * Fetch current logged in tenant user info.
   */
  async getCurrentUser(): Promise<TenantAuthUser> {
    const response = await tenantApiClient.get<ApiResponse<TenantAuthUser>>(
      '/api/tenant/auth/me/'
    );
    return response.data.item;
  },
};
