import { timingSafeEqual } from 'crypto';

/**
 * Gerbang kode akses admin.
 *
 * Halaman login admin hanya muncul setelah kode ini dimasukkan dengan benar,
 * dan kode yang sama ikut dikirim saat submit kredensial (dicek ulang di server).
 * Kode disimpan di env `ADMIN_ACCESS_CODE` — jangan pernah diekspos ke client.
 */
export function isAdminAccessCodeValid(input: unknown): boolean {
  const expected = process.env.ADMIN_ACCESS_CODE;
  if (!expected || typeof input !== 'string' || input.length === 0) return false;

  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
