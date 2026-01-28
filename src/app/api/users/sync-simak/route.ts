import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getMahasiswaFromSimak } from '@/lib/simak';

/**
 * POST /api/users/sync-simak
 * Create a new mahasiswa user by syncing data from SIMAK
 * Password is set by admin, not from SIMAK
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nim, password, isActive = true } = body;

    if (!nim || !password) {
      return NextResponse.json(
        { error: 'NIM dan password diperlukan' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: nim },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User dengan NIM ini sudah terdaftar' },
        { status: 400 }
      );
    }

    // Fetch mahasiswa data from SIMAK
    console.log(`[ADMIN] Fetching SIMAK data for NIM: ${nim}`);
    const simakData = await getMahasiswaFromSimak(nim);

    if (!simakData) {
      return NextResponse.json(
        { error: 'NIM tidak ditemukan di SIMAK. Pastikan NIM valid.' },
        { status: 404 }
      );
    }

    console.log(`[ADMIN] SIMAK data found: ${simakData.nama}`);

    // Hash password from admin input (not from SIMAK)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if email is already used by another user
    let emailToUse = simakData.email;
    if (emailToUse) {
      const emailOwner = await prisma.user.findUnique({
        where: { email: emailToUse },
      });
      if (emailOwner) {
        emailToUse = null; // Don't use this email if already taken
      }
    }

    // Create new user with SIMAK data
    const user = await prisma.user.create({
      data: {
        username: simakData.nim,
        nim: simakData.nim,
        name: simakData.nama,
        email: emailToUse,
        phone: simakData.hp,
        prodi: simakData.prodi,
        simakPhoto: simakData.foto,
        image: simakData.foto,
        password: hashedPassword, // Password from admin input
        role: 'MAHASISWA',
        simakValidated: true,
        simakLastSync: new Date(),
        isActive: isActive !== false,
      },
      select: {
        id: true,
        name: true,
        username: true,
        nim: true,
        email: true,
        phone: true,
        prodi: true,
        role: true,
        image: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log(`[ADMIN] User created successfully: ${user.username}`);

    return NextResponse.json(
      {
        message: 'User mahasiswa berhasil dibuat dengan data dari SIMAK',
        user,
        simakData: {
          nama: simakData.nama,
          prodi: simakData.prodi,
          email: simakData.email,
          phone: simakData.hp,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user from SIMAK:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/sync-simak?nim=XXX
 * Preview mahasiswa data from SIMAK without creating user
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nim = searchParams.get('nim');

    if (!nim) {
      return NextResponse.json(
        { error: 'NIM diperlukan' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: nim },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User dengan NIM ini sudah terdaftar',
          existingUser
        },
        { status: 400 }
      );
    }

    // Fetch mahasiswa data from SIMAK
    console.log(`[ADMIN] Preview SIMAK data for NIM: ${nim}`);
    const simakData = await getMahasiswaFromSimak(nim);

    if (!simakData) {
      return NextResponse.json(
        { error: 'NIM tidak ditemukan di SIMAK' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nim: simakData.nim,
        nama: simakData.nama,
        email: simakData.email,
        phone: simakData.hp,
        prodi: simakData.prodi,
        foto: simakData.foto,
      },
    });
  } catch (error) {
    console.error('Error fetching SIMAK data:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
