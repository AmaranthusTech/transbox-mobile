import { create } from 'zustand';
import { authApi } from '@/api/auth';
import { storage } from '@/api/secureStore';
import {
  registerOnUnauthorizedHandler,
  setTenantClientBaseUrl,
  isAllowedTenantDomain,
} from '@/api/client';
import { env } from '@/config/env';
import { ApiError, TenantAuthUser, LoginPayload } from '@/types';

export interface AuthState {
  user: TenantAuthUser | null;
  tenantCode: string | null;
  apiBaseUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: ApiError | null;

  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  loadCurrentUser: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  registerOnUnauthorizedHandler(() => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: { message: 'セッションの期限が切れました。再度ログインしてください。' },
    });
  });

  return {
    user: null,
    tenantCode: null,
    apiBaseUrl: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isHydrated: false,
    isLoading: false,
    error: null,

    hydrate: async () => {
      set({ isLoading: true, error: null });
      try {
        const storedAccessToken = await storage.getAccessToken();
        const storedRefreshToken = await storage.getRefreshToken();
        const storedTenantCode = await storage.getResolvedTenantCode();
        const storedApiBaseUrl = await storage.getResolvedApiBaseUrl();

        if (!storedAccessToken && !storedRefreshToken) {
          set({
            user: null,
            tenantCode: null,
            apiBaseUrl: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrated: true,
            isLoading: false,
          });
          return;
        }

        // Restore dynamic API Base URL if permitted by domain whitelist policy
        if (storedApiBaseUrl && isAllowedTenantDomain(storedApiBaseUrl)) {
          try {
            setTenantClientBaseUrl(storedApiBaseUrl);
          } catch {
            setTenantClientBaseUrl(env.apiBaseUrl);
          }
        }

        set({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          tenantCode: storedTenantCode,
          apiBaseUrl: storedApiBaseUrl,
        });

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
          });
        } catch (meError: any) {
          if (meError?.status === 401 && storedRefreshToken) {
            const refreshSuccess = await get().refreshSession();
            if (refreshSuccess) {
              const retryUserSuccess = await get().loadCurrentUser();
              if (retryUserSuccess) {
                set({ isHydrated: true, isLoading: false });
                return;
              }
            }
          }

          await get().logout();
          set({
            isHydrated: true,
            isLoading: false,
          });
        }
      } catch (err: any) {
        await get().logout();
        set({
          isHydrated: true,
          isLoading: false,
        });
      }
    },

    login: async (payload: LoginPayload) => {
      set({ isLoading: true, error: null });
      try {
        const res = await authApi.login(payload);

        await storage.setSessionData(
          res.authResponse.tokens.access_token,
          res.authResponse.tokens.refresh_token,
          res.resolvedTenantCode,
          res.resolvedApiBaseUrl
        );

        set({
          user: res.authResponse.item,
          tenantCode: res.resolvedTenantCode,
          apiBaseUrl: res.resolvedApiBaseUrl,
          accessToken: res.authResponse.tokens.access_token,
          refreshToken: res.authResponse.tokens.refresh_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (err: any) {
        set({
          isLoading: false,
          error: err as ApiError,
        });
        return false;
      }
    },

    refreshSession: async () => {
      const currentRefresh = get().refreshToken || (await storage.getRefreshToken());
      if (!currentRefresh) {
        await get().logout();
        return false;
      }

      try {
        const res = await authApi.refresh({ refresh_token: currentRefresh });
        const currentTenantCode = get().tenantCode || (await storage.getResolvedTenantCode()) || '';
        const currentApiBaseUrl = get().apiBaseUrl || (await storage.getResolvedApiBaseUrl()) || env.apiBaseUrl;

        await storage.setSessionData(
          res.tokens.access_token,
          res.tokens.refresh_token,
          currentTenantCode,
          currentApiBaseUrl
        );

        set({
          user: res.item,
          accessToken: res.tokens.access_token,
          refreshToken: res.tokens.refresh_token,
          isAuthenticated: true,
        });
        return true;
      } catch {
        await get().logout();
        return false;
      }
    },

    loadCurrentUser: async () => {
      try {
        const user = await authApi.getCurrentUser();
        set({ user, isAuthenticated: true });
        return true;
      } catch (err: any) {
        set({ error: err as ApiError });
        return false;
      }
    },

    logout: async () => {
      await storage.clearTokens();
      try {
        setTenantClientBaseUrl(env.apiBaseUrl);
      } catch {
        // Ignore reset errors
      }
      set({
        user: null,
        tenantCode: null,
        apiBaseUrl: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});
