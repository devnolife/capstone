import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/screenshots/featured - Get all featured screenshots for landing page (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    // Get featured screenshots with project info (only from APPROVED projects)
    const screenshots = await prisma.projectScreenshot.findMany({
      where: {
        isFeatured: true,
        project: {
          status: 'APPROVED', // Only show screenshots from approved projects
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        fileUrl: true,
        mimeType: true,
        uploadedAt: true,
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
      orderBy: [
        { uploadedAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({ screenshots });
  } catch (error) {
    console.error('Error fetching featured screenshots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
