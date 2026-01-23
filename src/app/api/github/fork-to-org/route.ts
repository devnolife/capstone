import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  createGitHubOrgClient,
  parseGitHubRepoUrl,
  GitHubOrgClient,
} from '@/lib/github-org';

// POST /api/github/fork-to-org - Fork a repository to the organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is dosen or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'DOSEN_PENGUJI' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Hanya dosen atau admin yang dapat melakukan fork' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { projectId, addCollaborators = true } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID diperlukan' },
        { status: 400 },
      );
    }

    // Get project with GitHub info and members
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        mahasiswa: {
          select: {
            id: true,
            githubUsername: true,
            name: true,
          },
        },
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 },
      );
    }

    if (!project.githubRepoUrl) {
      return NextResponse.json(
        { error: 'Proyek belum memiliki repository GitHub' },
        { status: 400 },
      );
    }

    // Check if already forked
    if (project.orgRepoUrl) {
      return NextResponse.json({
        success: true,
        message: 'Repository sudah di-fork sebelumnya',
        data: {
          orgRepoUrl: project.orgRepoUrl,
          orgRepoName: project.orgRepoName,
          forkedAt: project.forkedAt,
        },
      });
    }

    // Parse the GitHub URL
    const repoInfo = parseGitHubRepoUrl(project.githubRepoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: 'URL repository GitHub tidak valid' },
        { status: 400 },
      );
    }

    // Generate new repo name for org
    const year = project.tahunAkademik.split('/')[0];
    const newRepoName = GitHubOrgClient.generateRepoName(project.title, year);

    // Create org client and fork
    const orgClient = createGitHubOrgClient();
    const forkResult = await orgClient.forkToOrg(
      repoInfo.owner,
      repoInfo.repo,
      newRepoName,
    );

    if (!forkResult.success) {
      return NextResponse.json(
        { error: forkResult.error || 'Gagal melakukan fork' },
        { status: 500 },
      );
    }

    // Add collaborators if requested
    const collaboratorResults: { username: string; success: boolean; error?: string }[] = [];
    
    if (addCollaborators && forkResult.repoName) {
      // Add project owner (mahasiswa) as collaborator
      if (project.mahasiswa.githubUsername) {
        const result = await orgClient.addCollaborator(
          forkResult.repoName,
          project.mahasiswa.githubUsername,
          'push',
        );
        collaboratorResults.push({
          username: project.mahasiswa.githubUsername,
          success: result.success,
          error: result.error,
        });
      }

      // Add team members as collaborators
      for (const member of project.members) {
        const result = await orgClient.addCollaborator(
          forkResult.repoName,
          member.githubUsername,
          'push',
        );
        collaboratorResults.push({
          username: member.githubUsername,
          success: result.success,
          error: result.error,
        });
      }
    }

    // Update project with org repo info
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        orgRepoUrl: forkResult.repoUrl,
        orgRepoName: forkResult.repoName,
        forkedAt: new Date(),
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Repository berhasil di-fork ke organisasi',
      data: {
        orgRepoUrl: updatedProject.orgRepoUrl,
        orgRepoName: updatedProject.orgRepoName,
        forkedAt: updatedProject.forkedAt,
        collaborators: collaboratorResults,
      },
    });
  } catch (error) {
    console.error('Error forking repository to org:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat melakukan fork' },
      { status: 500 },
    );
  }
}

// GET /api/github/fork-to-org?projectId=xxx - Check fork status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID diperlukan' },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        githubRepoUrl: true,
        orgRepoUrl: true,
        orgRepoName: true,
        forkedAt: true,
        approvedAt: true,
        status: true,
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
      title: project.title,
      sourceRepo: project.githubRepoUrl,
      isForked: !!project.orgRepoUrl,
      orgRepoUrl: project.orgRepoUrl,
      orgRepoName: project.orgRepoName,
      forkedAt: project.forkedAt,
      approvedAt: project.approvedAt,
      status: project.status,
    });
  } catch (error) {
    console.error('Error checking fork status:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek status fork' },
      { status: 500 },
    );
  }
}
