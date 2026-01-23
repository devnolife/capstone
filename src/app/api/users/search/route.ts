import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users/search?q={query} - Search mahasiswa by NIM or name
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query minimal 2 karakter' },
        { status: 400 }
      );
    }

    // Search mahasiswa by NIM (username) or name
    const users = await prisma.user.findMany({
      where: {
        role: 'MAHASISWA',
        isActive: true,
        id: { not: session.user.id }, // Exclude current user
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { nim: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        nim: true,
        name: true,
        prodi: true,
        image: true,
        simakPhoto: true,
        githubUsername: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
