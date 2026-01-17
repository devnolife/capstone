import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';

// GET /api/projects - Get projects based on user role
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let whereClause = {};

    // Filter based on role
    if (session.user.role === 'MAHASISWA') {
      whereClause = { mahasiswaId: session.user.id };
    } else if (session.user.role === 'DOSEN_PENGUJI') {
      whereClause = {
        assignments: {
          some: { dosenId: session.user.id },
        },
      };
    }
    // ADMIN can see all projects

    // Add status filter if provided
    if (status) {
      whereClause = { ...whereClause, status };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          mahasiswa: {
            select: {
              id: true,
              name: true,
              email: true,
              nim: true,
              avatarUrl: true,
            },
          },
          documents: true,
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          assignments: {
            include: {
              dosen: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              documents: true,
              reviews: true,
              assignments: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Hanya mahasiswa yang dapat membuat project' },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = projectSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 },
      );
    }

    const { title, description, githubRepoUrl, semester, tahunAkademik } =
      validatedData.data;

    // Extract GitHub repo name if URL provided
    let githubRepoName = null;
    if (githubRepoUrl) {
      const match = githubRepoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        githubRepoName = match[1];
      }
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        githubRepoUrl: githubRepoUrl || null,
        githubRepoName,
        semester,
        tahunAkademik,
        mahasiswaId: session.user.id,
      },
      include: {
        mahasiswa: {
          select: {
            id: true,
            name: true,
            email: true,
            nim: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Project berhasil dibuat',
        project,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 },
    );
  }
}
