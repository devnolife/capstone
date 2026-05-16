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
    const search = (searchParams.get('search') || searchParams.get('q') || '').trim();
    const MAX_LIMIT = 100;
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(
      Math.max(Number.isFinite(rawLimit) ? rawLimit : 50, 1),
      MAX_LIMIT,
    );
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1);
    const skip = (page - 1) * limit;

    // Build base filters from role
    const baseFilters: Record<string, unknown>[] = [];

    if (session.user.role === 'MAHASISWA') {
      baseFilters.push({
        OR: [
          { mahasiswaId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      });
    } else if (session.user.role === 'DOSEN_PENGUJI') {
      baseFilters.push({
        assignments: { some: { dosenId: session.user.id } },
      });
    }
    // ADMIN can see all projects

    if (status) {
      baseFilters.push({ status });
    }

    // Search filter (case-insensitive across title, description, owner info,
    // and requirements.judulProyek). Skipped if `search` is empty.
    if (search) {
      baseFilters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { githubRepoName: { contains: search, mode: 'insensitive' } },
          {
            requirements: {
              is: {
                judulProyek: { contains: search, mode: 'insensitive' },
              },
            },
          },
          {
            mahasiswa: {
              is: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                  { nim: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    const whereClause =
      baseFilters.length === 0
        ? {}
        : baseFilters.length === 1
          ? baseFilters[0]
          : { AND: baseFilters };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          mahasiswa: {
            select: {
              id: true,
              name: true,
              username: true,
              nim: true,
              prodi: true,
              image: true,
              githubUsername: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  nim: true,
                  prodi: true,
                  image: true,
                  githubUsername: true,
                },
              },
            },
          },
          invitations: {
            include: {
              invitee: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  nim: true,
                  prodi: true,
                  image: true,
                  githubUsername: true,
                },
              },
            },
          },
          documents: true,
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  username: true,
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
                  username: true,
                },
              },
            },
          },
          _count: {
            select: {
              documents: true,
              reviews: true,
              assignments: true,
              members: true,
              invitations: true,
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

    const { title, description, githubRepoUrl, githubRepoName: providedRepoName, semester, tahunAkademik } =
      validatedData.data;

    // Extract additional fields from body (not in schema but sent from frontend)
    const {
      pendingTeamMembers,
      technologies,
      category,
      objectives,
      methodology,
      expectedOutcome,
      isPublic,
      productionUrl,
      testingUsername,
      testingPassword,
      testingNotes,
      consentDocument,
    } = body;

    // Use provided repo name or extract from URL
    let githubRepoName = providedRepoName || null;
    if (!githubRepoName && githubRepoUrl) {
      const match = githubRepoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        githubRepoName = match[1];
      }
    }

    // Create project with transaction to ensure all related data is saved
    const project = await prisma.$transaction(async (tx) => {
      // 1. Create the project
      const newProject = await tx.project.create({
        data: {
          title,
          description,
          githubRepoUrl: githubRepoUrl || null,
          githubRepoName,
          semester,
          tahunAkademik,
          mahasiswaId: session.user.id,
        },
      });

      // 2. Add owner as a project member (ketua)
      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId: session.user.id,
          role: 'leader',
          name: session.user.name,
          githubUsername: session.user.githubUsername || null,
        },
      });

      // 3. Create team invitations for pending members
      if (pendingTeamMembers && Array.isArray(pendingTeamMembers) && pendingTeamMembers.length > 0) {
        // Default expiration: 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Validate that all member IDs are actual users
        const memberIds = pendingTeamMembers
          .map((member: { id: string }) => member.id)
          .filter(Boolean);

        const validUsers = await tx.user.findMany({
          where: { id: { in: memberIds } },
          select: { id: true },
        });
        const validUserIds = new Set(validUsers.map(u => u.id));

        const validMembers = pendingTeamMembers.filter(
          (member: { id: string }) => validUserIds.has(member.id)
        );

        if (validMembers.length > 0) {
          const invitationsData = validMembers.map((member: { id: string }) => ({
            projectId: newProject.id,
            inviterId: session.user.id,
            inviteeId: member.id,
            status: 'pending',
            expiresAt,
          }));

          await tx.teamInvitation.createMany({
            data: invitationsData,
            skipDuplicates: true,
          });

          // 4. Create notifications for invited members
          const notificationsData = validMembers.map((member: { id: string; name: string }) => ({
            userId: member.id,
            title: 'Undangan Tim Project',
            message: `${session.user.name} mengundang Anda untuk bergabung dalam project "${title}"`,
            type: 'invitation',
            link: `/mahasiswa/invitations`,
          }));

          await tx.notification.createMany({
            data: notificationsData,
          });
        }
      }

      // 5. Create project requirements if additional fields are provided
      if (objectives || methodology || expectedOutcome || technologies || category || productionUrl || testingUsername || testingPassword) {
        await tx.projectRequirements.create({
          data: {
            projectId: newProject.id,
            judulProyek: title,
            tujuanProyek: objectives || null,
            metodologi: methodology || null,
            teknologi: technologies ? (Array.isArray(technologies) ? technologies.join(', ') : technologies) : null,
            ruangLingkup: category || null,
            productionUrl: productionUrl || null,
            testingUsername: testingUsername || null,
            testingPassword: testingPassword || null,
            testingNotes: testingNotes || null,
          },
        });
      }

      // 6. Create consent document if provided
      if (consentDocument && consentDocument.fileUrl) {
        await tx.document.create({
          data: {
            projectId: newProject.id,
            type: 'CONSENT_AGREEMENT',
            fileName: consentDocument.fileName,
            filePath: consentDocument.fileUrl,
            fileSize: consentDocument.fileSize,
            mimeType: consentDocument.mimeType || null,
          },
        });
      }

      return newProject;
    });

    // Fetch the complete project with relations
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        mahasiswa: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            image: true,
            githubUsername: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                image: true,
                githubUsername: true,
              },
            },
          },
        },
        invitations: {
          include: {
            invitee: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                image: true,
                githubUsername: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Project berhasil dibuat',
        project: completeProject,
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
