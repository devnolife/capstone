import { describe, expect, it } from 'vitest';
import {
  extractSsoRoles,
  hasReadableSsoRoles,
  mapSsoRolesToAppRole,
  resolveRoleFromAccessToken,
} from './sso';

/** Bangun access token palsu (header.payload.signature) untuk pengujian. */
function makeAccessToken(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('mapSsoRolesToAppRole', () => {
  it('maps dosen to DOSEN_PENGUJI', () => {
    expect(mapSsoRolesToAppRole(['dosen'])).toBe('DOSEN_PENGUJI');
  });

  it('maps mahasiswa to MAHASISWA', () => {
    expect(mapSsoRolesToAppRole(['mahasiswa'])).toBe('MAHASISWA');
  });

  it('maps admin-akademik and pimpinan to ADMIN', () => {
    expect(mapSsoRolesToAppRole(['admin-akademik'])).toBe('ADMIN');
    expect(mapSsoRolesToAppRole(['pimpinan'])).toBe('ADMIN');
  });

  it('defaults unknown or empty roles to MAHASISWA', () => {
    expect(mapSsoRolesToAppRole([])).toBe('MAHASISWA');
    expect(mapSsoRolesToAppRole(['perpustakaan', 'laboran'])).toBe('MAHASISWA');
  });

  it('grants the highest privilege when several roles are present', () => {
    expect(mapSsoRolesToAppRole(['mahasiswa', 'dosen'])).toBe('DOSEN_PENGUJI');
    expect(mapSsoRolesToAppRole(['dosen', 'admin-akademik'])).toBe('ADMIN');
  });
});

describe('extractSsoRoles', () => {
  it('reads realm roles from the access token', () => {
    const token = makeAccessToken({
      realm_access: { roles: ['dosen', 'offline_access'] },
    });
    expect(extractSsoRoles(token)).toEqual(['dosen', 'offline_access']);
  });

  it('also reads client roles for the configured client', () => {
    const token = makeAccessToken({
      azp: 'capstone',
      resource_access: { capstone: { roles: ['dosen'] } },
    });
    expect(extractSsoRoles(token, 'capstone')).toContain('dosen');
  });

  it('ignores client roles belonging to another client', () => {
    const token = makeAccessToken({
      resource_access: { 'app-lain': { roles: ['admin-akademik'] } },
    });
    expect(extractSsoRoles(token, 'capstone')).toEqual([]);
  });

  it('returns an empty array when the token has no role claims', () => {
    expect(extractSsoRoles(makeAccessToken({ sub: 'abc' }))).toEqual([]);
  });

  it('returns an empty array for missing or malformed tokens', () => {
    expect(extractSsoRoles(null)).toEqual([]);
    expect(extractSsoRoles(undefined)).toEqual([]);
    expect(extractSsoRoles('')).toEqual([]);
    expect(extractSsoRoles('not-a-jwt')).toEqual([]);
    expect(extractSsoRoles('aaa.bukan-base64-json.ccc')).toEqual([]);
  });

  it('ignores non-string entries in the roles claim', () => {
    const token = makeAccessToken({
      realm_access: { roles: ['dosen', 42, null] },
    });
    expect(extractSsoRoles(token)).toEqual(['dosen']);
  });
});

describe('hasReadableSsoRoles', () => {
  it('treats an empty list as unreadable so existing roles are kept', () => {
    expect(hasReadableSsoRoles([])).toBe(false);
  });

  it('treats any role, even a default one, as readable', () => {
    expect(hasReadableSsoRoles(['default-roles-unismuh'])).toBe(true);
    expect(hasReadableSsoRoles(['mahasiswa'])).toBe(true);
  });

  it('reports a malformed token as unreadable', () => {
    expect(hasReadableSsoRoles(extractSsoRoles('not-a-jwt'))).toBe(false);
  });

  it('reports a real dosen token as readable', () => {
    const token = makeAccessToken({ realm_access: { roles: ['dosen'] } });
    expect(hasReadableSsoRoles(extractSsoRoles(token))).toBe(true);
  });
});

describe('resolveRoleFromAccessToken', () => {  it('resolves a dosen access token to DOSEN_PENGUJI', () => {
    const token = makeAccessToken({
      realm_access: { roles: ['default-roles-unismuh', 'dosen'] },
    });
    expect(resolveRoleFromAccessToken(token)).toBe('DOSEN_PENGUJI');
  });

  it('falls back to MAHASISWA when the token cannot be read', () => {
    expect(resolveRoleFromAccessToken(null)).toBe('MAHASISWA');
  });
});
