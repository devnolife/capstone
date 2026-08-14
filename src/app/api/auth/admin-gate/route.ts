import { NextResponse } from 'next/server';
import { isAdminAccessCodeValid } from '@/lib/admin-access-code';

/** Throttle sederhana per-IP untuk menahan brute force kode akses. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { ok: false, message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
      { status: 429 },
    );
  }

  let code: unknown;
  try {
    code = (await request.json())?.code;
  } catch {
    code = undefined;
  }

  if (!isAdminAccessCodeValid(code)) {
    return NextResponse.json(
      { ok: false, message: 'Kode akses tidak valid.' },
      { status: 401 },
    );
  }

  attempts.delete(ip);
  return NextResponse.json({ ok: true });
}
