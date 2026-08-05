/**
 * Environment variables configuration and runtime validation.
 * Expo reads process.env.EXPO_PUBLIC_* at build/runtime.
 */

export interface EnvConfig {
  transboxEnv: string;
  tenantHostSuffix: string;
  resolverBaseUrl: string;
  apiBaseUrl: string;
  tenantSchema?: string;
  apiTimeoutMs: number;
}

function getEnvVariable(key: string, required = false): string {
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
  const transboxEnv = getEnvVariable('EXPO_PUBLIC_TRANSBOX_ENV', false) || 'beta';
  const tenantHostSuffix =
    getEnvVariable('EXPO_PUBLIC_TENANT_HOST_SUFFIX', false) ||
    (transboxEnv === 'beta' ? '-beta.transbox.tech' : '.transbox.tech');

  const fallbackApiBaseUrl = `https://bg${tenantHostSuffix}`;
  const apiBaseUrl = getEnvVariable('EXPO_PUBLIC_API_BASE_URL', false) || fallbackApiBaseUrl;
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
    transboxEnv,
    tenantHostSuffix,
    resolverBaseUrl: resolverBaseUrl.replace(/\/+$/, ''),
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    tenantSchema: tenantSchema ? tenantSchema.trim() : undefined,
    apiTimeoutMs,
  };
}

export const env = loadEnvConfig();
