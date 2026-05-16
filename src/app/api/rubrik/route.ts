import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/rubrik - Get all rubrik penilaian
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    const tipe = searchParams.get('tipe'); // "kelompok" atau "individu"

    const whereClause: Record<string, unknown> = {};

    if (activeOnly) {
      whereClause.isActive = true;
    }

    // Filter by tipe if provided
    if (tipe && (tipe === 'kelompok' || tipe === 'individu')) {
      whereClause.tipe = tipe;
    }

    const rubriks = await prisma.rubrikPenilaian.findMany({
      where: whereClause,
      orderBy: { urutan: 'asc' },
    });

    return NextResponse.json(rubriks);
  } catch (error) {
    console.error('Error fetching rubriks:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/rubrik - Create rubrik (Admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, kategori, bobotMax, urutan, isActive, tipe } = body;

    if (!name || !kategori || !bobotMax) {
      return NextResponse.json(
        { error: 'Nama, kategori, dan bobot maksimal diperlukan' },
        { status: 400 },
      );
    }

    // Validate tipe
    const validTipe = tipe === 'individu' ? 'individu' : 'kelompok';

    const numericBobot = Number(bobotMax);
    if (!Number.isFinite(numericBobot) || numericBobot <= 0) {
      return NextResponse.json(
        { error: 'Bobot maksimal harus angka positif' },
        { status: 400 },
      );
    }

    // Enforce total bobot per tipe <= 100 when active
    if (isActive !== false) {
      const aggregate = await prisma.rubrikPenilaian.aggregate({
        where: { tipe: validTipe, isActive: true },
        _sum: { bobotMax: true },
      });
      const currentTotal = aggregate._sum.bobotMax ?? 0;
      if (currentTotal + numericBobot > 100) {
        return NextResponse.json(
          {
            error: `Total bobot ${validTipe} akan menjadi ${currentTotal + numericBobot} (maksimal 100).`,
          },
          { status: 400 },
        );
      }
    }

    const rubrik = await prisma.rubrikPenilaian.create({
      data: {
        name,
        description,
        kategori,
        bobotMax: numericBobot,
        urutan: urutan || 0,
        isActive: isActive !== false,
        tipe: validTipe,
      },
    });

    return NextResponse.json(
      {
        message: 'Rubrik berhasil dibuat',
        rubrik,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating rubrik:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
