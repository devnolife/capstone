import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateSemesterPeriod } from '@/lib/semester';

// GET /api/semesters/[id] - Get single semester
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const semester = await prisma.semester.findUnique({
      where: { id },
    });

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 },
      );
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error('Error fetching semester:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// PUT /api/semesters/[id] - Update semester
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      tahunAkademik,
      startDate,
      endDate,
      submissionDeadline,
      isActive,
    } = body;

    const existing = await prisma.semester.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 },
      );
    }

    const period = validateSemesterPeriod({
      startDate: startDate ?? existing.startDate,
      endDate: endDate ?? existing.endDate,
      submissionDeadline:
        submissionDeadline === undefined
          ? existing.submissionDeadline
          : submissionDeadline,
    });

    if (!period.ok) {
      return NextResponse.json({ error: period.error }, { status: 400 });
    }

    // If setting as active, deactivate other semesters
    if (isActive) {
      await prisma.semester.updateMany({
        where: {
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    const semester = await prisma.semester.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        tahunAkademik: tahunAkademik ?? existing.tahunAkademik,
        startDate: period.startDate,
        endDate: period.endDate,
        submissionDeadline: period.submissionDeadline,
        isActive: isActive ?? existing.isActive,
      },
    });

    return NextResponse.json({
      message: 'Semester berhasil diupdate',
      semester,
    });
  } catch (error) {
    console.error('Error updating semester:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/semesters/[id] - Delete semester
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if semester is being used by projects
    const projectsCount = await prisma.project.count({
      where: { semester: { contains: id } },
    });

    if (projectsCount > 0) {
      return NextResponse.json(
        {
          error:
            'Semester tidak dapat dihapus karena sudah digunakan oleh project',
        },
        { status: 400 },
      );
    }

    await prisma.semester.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Semester berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
