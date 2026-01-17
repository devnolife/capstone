import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, requirements } = body;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        mahasiswaId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete existing requirements
    await prisma.projectRequirement.deleteMany({
      where: { projectId },
    });

    // Create new requirements
    await prisma.projectRequirement.createMany({
      data: requirements.map((req: any) => ({
        projectId,
        category: req.category,
        content: req.content,
        isCompleted: req.isCompleted,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save requirements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    const requirements = await prisma.projectRequirement.findMany({
      where: {
        projectId,
        project: {
          mahasiswaId: session.user.id,
        },
      },
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error('Get requirements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
