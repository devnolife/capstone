/**
 * SSO Unismuh (Keycloak OIDC) — pemetaan peran.
 *
 * Dokumentasi: https://sso.if.unismuh.ac.id/docs/
 *
 * Klaim `realm_access.roles` HANYA ada di **access token**, bukan di ID token.
 * Karena itu peran tidak bisa dibaca dari `profile` milik Auth.js (yang berisi
 * klaim ID token) dan harus diambil dari `account.access_token`.
 */

import type { Role } from '@/generated/prisma';

/** Realm role SSO yang memberi hak ADMIN di aplikasi ini. */
const ADMIN_REALM_ROLES = ['admin-akademik', 'pimpinan'];
/** Realm role SSO yang memberi hak dosen penguji. */
const DOSEN_REALM_ROLES = ['dosen'];

interface AccessTokenPayload {
  realm_access?: { roles?: unknown };
  resource_access?: Record<string, { roles?: unknown }>;
  azp?: string;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * Decode payload access token tanpa memverifikasi tanda tangan.
 *
 * Aman karena token diterima langsung dari token endpoint SSO melalui TLS
 * (bukan dari input pengguna), dan Auth.js sudah memverifikasi ID token.
 */
function decodeAccessTokenPayload(accessToken: string): AccessTokenPayload | null {
  const segments = accessToken.split('.');
  if (segments.length < 2) return null;

  try {
    const json = Buffer.from(segments[1], 'base64url').toString('utf8');
    const payload: unknown = JSON.parse(json);
    if (!payload || typeof payload !== 'object') return null;
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Ambil daftar realm role dari access token SSO.
 *
 * Mengembalikan array kosong bila token tidak valid atau tanpa klaim peran.
 */
export function extractSsoRoles(
  accessToken: string | null | undefined,
  clientId?: string | null,
): string[] {
  if (!accessToken) return [];

  const payload = decodeAccessTokenPayload(accessToken);
  if (!payload) return [];

  const realmRoles = toStringArray(payload.realm_access?.roles);

  // Fallback: sebagian client dikonfigurasi memakai client role, bukan realm role.
  const clientKey = clientId || payload.azp;
  const clientRoles = clientKey
    ? toStringArray(payload.resource_access?.[clientKey]?.roles)
    : [];

  return [...realmRoles, ...clientRoles];
}

/**
 * Petakan realm role SSO ke Role aplikasi.
 *
 * Hak tertinggi menang: ADMIN > DOSEN_PENGUJI > MAHASISWA.
 */
export function mapSsoRolesToAppRole(roles: string[]): Role {
  if (roles.some((role) => ADMIN_REALM_ROLES.includes(role))) {
    return 'ADMIN' as Role;
  }
  if (roles.some((role) => DOSEN_REALM_ROLES.includes(role))) {
    return 'DOSEN_PENGUJI' as Role;
  }
  return 'MAHASISWA' as Role;
}

/** Jalan pintas: access token SSO → Role aplikasi. */
export function resolveRoleFromAccessToken(
  accessToken: string | null | undefined,
  clientId?: string | null,
): Role {
  return mapSsoRolesToAppRole(extractSsoRoles(accessToken, clientId));
}
