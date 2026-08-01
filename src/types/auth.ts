/**
 * Authentication related type definitions.
 * Aligned with TRANSBOX backend TenantAuth API specs.
 */

export interface TerminologyResolution {
  term?: string;
  plural_term?: string;
  [key: string]: unknown;
}

export interface CustomerMembership {
  customer_id: number;
  customer_name: string;
  customer_code: string;
  is_primary_contact: boolean;
  is_active: boolean;
}

export interface TenantAuthUser {
  id: number;
  email: string;
  display_name: string;
  role: string; // e.g. "customer_end_user"
  is_tenant_admin: boolean;
  is_active: boolean;
  has_customer_link: boolean;
  has_supplier_link: boolean;
  customer_membership: CustomerMembership | null;
  supplier_membership: unknown | null;
  terminology?: {
    customer?: TerminologyResolution;
    supplier?: TerminologyResolution;
    item?: TerminologyResolution;
  };
}

export interface TenantAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_expires_in: number;
  refresh_expires_in: number;
}

export interface TenantAuthResponse {
  item: TenantAuthUser;
  tokens: TenantAuthTokens;
}

export interface TenantResolvePayload {
  code: string;
}

export interface TenantResolveResponse {
  code: string;
  name: string;
  domain: string;
}

export interface LoginPayload {
  tenant_code: string;
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}
