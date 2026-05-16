import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  pushNotifications: true,
  reviewReminders: true,
  projectUpdates: true,
  language: 'id',
  showProfile: true,
  showGithub: true,
};

type Preferences = typeof DEFAULT_PREFERENCES;

function sanitize(input: unknown): Preferences {
  const out = { ...DEFAULT_PREFERENCES };
  if (!input || typeof input !== 'object') return out;
  const obj = input as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_PREFERENCES) as (keyof Preferences)[]) {
    const value = obj[key];
    if (key === 'language') {
      if (value === 'id' || value === 'en') out.language = value;
    } else if (typeof value === 'boolean') {
      out[key] = value as never;
    }
  }
  return out;
}

// GET /api/profile/preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    return NextResponse.json(sanitize(user?.preferences));
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// PUT /api/profile/preferences
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const next = sanitize(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferences: next },
    });

    return NextResponse.json(next);
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
