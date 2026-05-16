import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

/**
 * Symmetric encryption helpers for sensitive secrets stored at-rest
 * (e.g. GitHub OAuth access tokens, testing credentials in project requirements).
 *
 * Algorithm: AES-256-GCM
 * Format:    enc:v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>
 *
 * Backward compatibility: any value that does NOT start with the `enc:v1:`
 * prefix is treated as legacy plaintext and returned as-is on decrypt. The
 * next write will re-encrypt it.
 */

const ENC_PREFIX = 'enc:v1:';
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw =
    process.env.SECRET_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    '';

  if (!raw) {
    throw new Error(
      'SECRET_ENCRYPTION_KEY (or NEXTAUTH_SECRET fallback) is not set. ' +
      'Refusing to encrypt/decrypt sensitive data.',
    );
  }

  // Derive a deterministic 32-byte key from whatever secret was provided.
  // Using SHA-256 lets operators provide either a raw 32-byte key (base64/hex)
  // or any high-entropy passphrase.
  cachedKey = createHash('sha256').update(raw, 'utf8').digest();
  return cachedKey;
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}

export function encryptSecret(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    ENC_PREFIX.slice(0, -1), // "enc:v1"
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

export function decryptSecret(value: string): string {
  if (!isEncrypted(value)) {
    // Legacy plaintext — return as-is so existing rows keep working until
    // the next write path re-encrypts them.
    return value;
  }

  const parts = value.split(':');
  // Expected: ["enc", "v1", iv, tag, ciphertext]
  if (parts.length !== 5) {
    throw new Error('Malformed encrypted payload');
  }
  const [, , ivB64, tagB64, ctB64] = parts;
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const plain = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plain.toString('utf8');
}

/** Convenience wrappers that tolerate null/undefined. */
export function encryptNullable(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined || value === '') return null;
  return encryptSecret(value);
}

export function decryptNullable(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined || value === '') return null;
  try {
    return decryptSecret(value);
  } catch (err) {
    console.error('[crypto] Failed to decrypt secret:', err);
    return null;
  }
}
