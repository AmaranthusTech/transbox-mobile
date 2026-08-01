import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const hydrate = useAuthStore((state) => state.hydrate);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isAuthenticated,
    isHydrated,
    isLoading,
    error,
    login,
    logout,
    hydrate,
    clearError,
  };
}
