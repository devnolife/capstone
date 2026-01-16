import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/semesters - Get all semesters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const whereClause = activeOnly ? { isActive: true } : {};

    const semesters = await prisma.semester.findMany({
      where: whereClause,
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/semesters - Create new semester (Admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, tahunAkademik, startDate, endDate, isActive } = body;

    // If setting as active, deactivate other semesters
    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const semester = await prisma.semester.create({
      data: {
        name,
        tahunAkademik,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    });

    return NextResponse.json(
      {
        message: 'Semester berhasil dibuat',
        semester,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
