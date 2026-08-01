/**
 * Environment variables configuration and runtime validation.
 * Expo reads process.env.EXPO_PUBLIC_* at build/runtime.
 */

export interface EnvConfig {
  resolverBaseUrl: string;
  apiBaseUrl: string;
  tenantSchema?: string;
  apiTimeoutMs: number;
}

function getEnvVariable(key: string, required = true): string {
  const value = process.env[key];
  if (required && (!value || value.trim() === '')) {
    throw new Error(
      `[EnvConfig Error] Missing required environment variable: ${key}.\n` +
      `Please check your .env file or environment setup based on .env.example.`
    );
  }
  return value || '';
}

export function loadEnvConfig(): EnvConfig {
  const apiBaseUrl = getEnvVariable('EXPO_PUBLIC_API_BASE_URL', true);
  const resolverBaseUrl = getEnvVariable('EXPO_PUBLIC_RESOLVER_BASE_URL', false) || apiBaseUrl;
  const tenantSchema = getEnvVariable('EXPO_PUBLIC_TENANT_SCHEMA', false);
  const timeoutStr = getEnvVariable('EXPO_PUBLIC_API_TIMEOUT_MS', false);

  const apiTimeoutMs = timeoutStr ? parseInt(timeoutStr, 10) : 30000;

  if (isNaN(apiTimeoutMs) || apiTimeoutMs <= 0) {
    throw new Error(
      `[EnvConfig Error] EXPO_PUBLIC_API_TIMEOUT_MS must be a positive integer.`
    );
  }

  return {
    resolverBaseUrl: resolverBaseUrl.replace(/\/+$/, ''),
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    tenantSchema: tenantSchema ? tenantSchema.trim() : undefined,
    apiTimeoutMs,
  };
}

export const env = loadEnvConfig();
