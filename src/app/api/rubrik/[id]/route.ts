import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/rubrik/[id] - Get single rubrik
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rubrik = await prisma.rubrikPenilaian.findUnique({
      where: { id },
    });

    if (!rubrik) {
      return NextResponse.json(
        { error: 'Rubrik tidak ditemukan' },
        { status: 404 },
      );
    }

    return NextResponse.json(rubrik);
  } catch (error) {
    console.error('Error fetching rubrik:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// PUT /api/rubrik/[id] - Update rubrik
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
    const { name, description, kategori, bobotMax, urutan, isActive, tipe } = body;

    // Validate tipe if provided
    const validTipe = tipe === 'individu' ? 'individu' : tipe === 'kelompok' ? 'kelompok' : undefined;

    const rubrik = await prisma.rubrikPenilaian.update({
      where: { id },
      data: {
        name,
        description,
        kategori,
        bobotMax,
        urutan,
        isActive,
        ...(validTipe && { tipe: validTipe }),
      },
    });

    return NextResponse.json({
      message: 'Rubrik berhasil diupdate',
      rubrik,
    });
  } catch (error) {
    console.error('Error updating rubrik:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// DELETE /api/rubrik/[id] - Delete rubrik
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

    // Check if rubrik has scores (both group and individual)
    const scoresCount = await prisma.reviewScore.count({
      where: { rubrikId: id },
    });

    const memberScoresCount = await prisma.memberReviewScore.count({
      where: { rubrikId: id },
    });

    if (scoresCount > 0 || memberScoresCount > 0) {
      return NextResponse.json(
        {
          error:
            'Rubrik tidak dapat dihapus karena sudah digunakan untuk penilaian. Nonaktifkan saja.',
        },
        { status: 400 },
      );
    }

    await prisma.rubrikPenilaian.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Rubrik berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting rubrik:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
