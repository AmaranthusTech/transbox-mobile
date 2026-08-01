import {
  resolverClient,
  tenantApiClient,
  setTenantClientBaseUrl,
  buildSafeTenantApiBaseUrl,
} from '@/api/client';
import {
  LoginPayload,
  RefreshTokenPayload,
  TenantAuthResponse,
  TenantAuthUser,
  TenantResolveResponse,
  ApiResponse,
} from '@/types';

export const authApi = {
  /**
   * Resolve tenant domain by tenant code.
   * Calls public schema endpoint on resolverClient (NO authorization header / credentials sent).
   */
  async resolveTenant(code: string): Promise<TenantResolveResponse> {
    const response = await resolverClient.post<TenantResolveResponse>(
      '/api/public/tenant-resolve/',
      { code: code.trim() }
    );
    return response.data;
  },

  /**
   * Log in with tenant code, email, and password.
   * Step 1: Resolve tenant domain via resolverClient.
   * Step 2: Validate domain security rules & build safe HTTPS API Base URL.
   * Step 3: Set dynamic Base URL on tenantApiClient.
   * Step 4: Authenticate user against resolved tenant endpoint.
   */
  async login(payload: LoginPayload): Promise<{
    authResponse: TenantAuthResponse;
    resolvedTenantCode: string;
    resolvedApiBaseUrl: string;
  }> {
    const trimmedCode = payload.tenant_code.trim();

    // 1. Resolve Tenant Domain via resolverClient
    const resolveResult = await this.resolveTenant(trimmedCode);
    const domain = resolveResult.domain ? resolveResult.domain.trim() : '';

    if (!domain) {
      throw new Error('指定されたテナントの接続ドメインが未設定です。');
    }

    // 2. Validate domain security rules & build safe HTTPS Base URL
    const resolvedApiBaseUrl = buildSafeTenantApiBaseUrl(domain);

    // 3. Set dynamic Base URL on tenantApiClient
    setTenantClientBaseUrl(resolvedApiBaseUrl);

    // 4. Authenticate User on tenantApiClient
    const response = await tenantApiClient.post<TenantAuthResponse>(
      '/api/tenant/auth/login/',
      {
        email: payload.email.trim(),
        password: payload.password,
      }
    );

    return {
      authResponse: response.data,
      resolvedTenantCode: resolveResult.code,
      resolvedApiBaseUrl,
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
   * Fetch current logged in tenant user info.
   */
  async getCurrentUser(): Promise<TenantAuthUser> {
    const response = await tenantApiClient.get<ApiResponse<TenantAuthUser>>(
      '/api/tenant/auth/me/'
    );
    return response.data.item;
  },
};
