import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Role } from '@/generated/prisma';

// GET /api/users - Get all users (Admin only)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const active = searchParams.get('active');
    const search = (searchParams.get('search') ?? searchParams.get('q') ?? '').trim();

    const MAX_LIMIT = 200;
    const rawLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : MAX_LIMIT;
    const rawPage = Number(searchParams.get('page'));
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const andFilters: Record<string, unknown>[] = [];
    if (role) andFilters.push({ role });
    if (active !== null) andFilters.push({ isActive: active === 'true' });
    if (search) {
      andFilters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { nim: { contains: search, mode: 'insensitive' } },
          { nip: { contains: search, mode: 'insensitive' } },
          { prodi: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const whereClause = andFilters.length ? { AND: andFilters } : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          nim: true,
          nip: true,
          prodi: true,
          role: true,
          image: true,
          githubUsername: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Backward compatible: return array if no pagination params were sent
    const hasPaginationParams =
      searchParams.has('page') || searchParams.has('limit') || searchParams.has('search') || searchParams.has('q');

    if (!hasPaginationParams) {
      return NextResponse.json(users);
    }

    return NextResponse.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/users - Create user (Admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, password, role, isActive } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Nama, username (NIM/Username), password, dan role diperlukan' },
        { status: 400 },
      );
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username (NIM/Username) sudah terdaftar' },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: role as Role,
        isActive: isActive !== false,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
