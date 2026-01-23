import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Octokit } from 'octokit';

const MAX_MEMBERS = 3;

// GET /api/projects/[id]/members - Get project members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Get project with members
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          orderBy: [
            { role: 'desc' }, // leader first
            { addedAt: 'asc' },
          ],
        },
        mahasiswa: {
          select: {
            id: true,
            name: true,
            email: true,
            githubUsername: true,
            image: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      projectId: project.id,
      owner: project.mahasiswa,
      members: project.members,
      maxMembers: MAX_MEMBERS,
      canAddMore: project.members.length < MAX_MEMBERS,
    });
  } catch (error) {
    console.error('Error getting project members:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil anggota tim' },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/members - Add a member to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { githubUsername, role = 'member' } = body;

    if (!githubUsername) {
      return NextResponse.json(
        { error: 'GitHub username diperlukan' },
        { status: 400 },
      );
    }

    // Get project and verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        mahasiswa: true,
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check if user is project owner
    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json(
        { error: 'Hanya pemilik proyek yang dapat menambahkan anggota' },
        { status: 403 },
      );
    }

    // Check max members limit
    if (project.members.length >= MAX_MEMBERS) {
      return NextResponse.json(
        { error: `Maksimal ${MAX_MEMBERS} anggota tim` },
        { status: 400 },
      );
    }

    // Check if member already exists
    const existingMember = project.members.find(
      (m) => m.githubUsername.toLowerCase() === githubUsername.toLowerCase(),
    );
    if (existingMember) {
      return NextResponse.json(
        { error: 'Pengguna sudah menjadi anggota tim' },
        { status: 400 },
      );
    }

    // Check if trying to add project owner as member
    if (
      project.mahasiswa.githubUsername?.toLowerCase() ===
      githubUsername.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Pemilik proyek tidak perlu ditambahkan sebagai anggota' },
        { status: 400 },
      );
    }

    // Verify GitHub user exists
    const token =
      (await prisma.user
        .findUnique({
          where: { id: session.user.id },
          select: { githubToken: true },
        })
        .then((u) => u?.githubToken)) || process.env.GITHUB_ORG_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token tidak tersedia' },
        { status: 500 },
      );
    }

    const octokit = new Octokit({ auth: token });

    let githubUser;
    try {
      const { data } = await octokit.rest.users.getByUsername({
        username: githubUsername,
      });
      githubUser = data;
    } catch {
      return NextResponse.json(
        { error: 'Pengguna GitHub tidak ditemukan' },
        { status: 404 },
      );
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        githubUsername: githubUser.login,
        githubId: githubUser.id.toString(),
        githubAvatarUrl: githubUser.avatar_url,
        name: githubUser.name,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil ditambahkan',
      member,
    });
  } catch (error) {
    console.error('Error adding project member:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan anggota' },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id]/members - Remove a member from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const githubUsername = searchParams.get('githubUsername');

    if (!memberId && !githubUsername) {
      return NextResponse.json(
        { error: 'Member ID atau GitHub username diperlukan' },
        { status: 400 },
      );
    }

    // Get project and verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        mahasiswaId: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 },
      );
    }

    // Check if user is project owner
    if (project.mahasiswaId !== session.user.id) {
      return NextResponse.json(
        { error: 'Hanya pemilik proyek yang dapat menghapus anggota' },
        { status: 403 },
      );
    }

    // Delete member
    if (memberId) {
      await prisma.projectMember.delete({
        where: {
          id: memberId,
          projectId,
        },
      });
    } else if (githubUsername) {
      await prisma.projectMember.delete({
        where: {
          projectId_githubUsername: {
            projectId,
            githubUsername,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil dihapus',
    });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus anggota' },
      { status: 500 },
    );
  }
}
