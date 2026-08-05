import { env } from '@/config/env';

/**
 * Validates user-entered tenant code without silent auto-transformations.
 *
 * Rules:
 * 1. Trim & convert to lowercase.
 * 2. Reject URLs (https://, http://), hostnames with dots (.transbox.tech), or IP addresses.
 * 3. Reject DB internal schema names containing underscores (tenant_bg_beta, tenant_e2e072738_dup).
 * 4. Reject invalid characters (/ : @ ? # _ Unicode localhost, leading/trailing hyphens, consecutive hyphens).
 * 5. Strictly match pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/
 * 6. Enforce realistic length limits (1 to 32 characters).
 */
export function normalizeTenantCode(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('テナントコードを入力してください。');
  }

  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    throw new Error('テナントコードを入力してください。');
  }

  // Explicit rejection checks to provide accurate user-facing feedback
  if (trimmed.includes('http://') || trimmed.includes('https://')) {
    throw new Error('URLではなく、テナントコードを入力してください (例: bg, e2e072738)。');
  }

  if (trimmed.includes('.')) {
    throw new Error('ドメイン名ではなく、テナントコードを入力してください (例: bg, e2e072738)。');
  }

  if (trimmed.includes('_') || trimmed.startsWith('tenant_')) {
    throw new Error('内部スキーマ名ではなく、テナントコードを入力してください (例: bg, e2e072738)。');
  }

  if (
    trimmed.includes('/') ||
    trimmed.includes(':') ||
    trimmed.includes('@') ||
    trimmed.includes('?') ||
    trimmed.includes('#') ||
    trimmed.includes('localhost')
  ) {
    throw new Error('有効なテナントコードを入力してください (例: bg, e2e072738)。');
  }

  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    throw new Error('テナントコードの先頭または末尾にハイフンを含めることはできません。');
  }

  if (trimmed.includes('--')) {
    throw new Error('テナントコードに連続したハイフンを含めることはできません。');
  }

  if (trimmed.length > 32) {
    throw new Error('テナントコードが長すぎます (32文字以内で入力してください)。');
  }

  // Strict regex: 英小文字、数字、単一ハイフンのみ許可
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!validPattern.test(trimmed)) {
    throw new Error('テナントコードは英小文字・数字・ハイフンで入力してください。');
  }

  return trimmed;
}

/**
 * Builds a validated HTTPS API Base URL from a strictly verified tenant code.
 * Attaches fixed app-side host suffix (e.g. "-beta.transbox.tech").
 *
 * Example:
 *   "bg"        -> "https://bg-beta.transbox.tech"
 *   "e2e072738" -> "https://e2e072738-beta.transbox.tech"
 */
export function buildTenantBaseUrl(tenantInput: string): {
  normalizedCode: string;
  baseUrl: string;
} {
  const normalizedCode = normalizeTenantCode(tenantInput);
  const suffix = env.tenantHostSuffix || '-beta.transbox.tech';
  const baseUrl = `https://${normalizedCode}${suffix}`;
  return {
    normalizedCode,
    baseUrl,
  };
}
