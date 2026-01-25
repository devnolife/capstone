import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/screenshots/[id] - Toggle featured status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Admin can toggle featured status
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id: screenshotId } = await params;
    const body = await request.json();
    const { isFeatured } = body;

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: 'isFeatured must be a boolean' },
        { status: 400 }
      );
    }

    // Verify screenshot exists
    const existingScreenshot = await prisma.projectScreenshot.findUnique({
      where: { id: screenshotId },
    });

    if (!existingScreenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Update featured status
    const screenshot = await prisma.projectScreenshot.update({
      where: { id: screenshotId },
      data: { isFeatured },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            mahasiswa: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ screenshot });
  } catch (error) {
    console.error('Error updating screenshot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/screenshots/[id] - Get single screenshot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: screenshotId } = await params;

    const screenshot = await prisma.projectScreenshot.findUnique({
      where: { id: screenshotId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            mahasiswa: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ screenshot });
  } catch (error) {
    console.error('Error fetching screenshot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
