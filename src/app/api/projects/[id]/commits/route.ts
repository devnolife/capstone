import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decryptNullable } from '@/lib/crypto';
import { createGitHubClient, parseGitHubUrl } from '@/lib/github';

// GET /api/projects/[id]/commits - Daftar commit repo GitHub project
// Dipakai form laporan pengerjaan agar setiap laporan terikat satu commit.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        mahasiswaId: true,
        githubRepoUrl: true,
        orgRepoUrl: true,
        members: { select: { userId: true } },
        assignments: { select: { dosenId: true } },
        mahasiswa: { select: { githubToken: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    const isOwner = project.mahasiswaId === session.user.id;
    const isMember = project.members.some((m) => m.userId === session.user.id);
    const isAssignedDosen = project.assignments.some(
      (a) => a.dosenId === session.user.id,
    );
    const isAdmin = session.user.role === 'ADMIN';
    const isDosen = session.user.role === 'DOSEN_PENGUJI';
    if (!isOwner && !isMember && !isAssignedDosen && !isAdmin && !isDosen) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const repoUrl = project.githubRepoUrl || project.orgRepoUrl;
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Project belum terhubung dengan repository GitHub' },
        { status: 400 },
      );
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'URL repository GitHub tidak valid' },
        { status: 400 },
      );
    }

    // Pakai token user yang sedang login, fallback ke token pemilik project
    const requester = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubToken: true },
    });
    const token =
      decryptNullable(requester?.githubToken ?? null) ||
      decryptNullable(project.mahasiswa.githubToken ?? null);

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub tidak terhubung. Hubungkan akun GitHub terlebih dahulu.' },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const perPage = Math.min(Number(searchParams.get('per_page')) || 50, 100);

    const github = createGitHubClient(token);
    const commits = await github.getCommits(parsed.owner, parsed.repo, {
      per_page: perPage,
    });

    // Tandai commit yang sudah dipakai laporan lain
    const usedLogs = await prisma.projectWorkLog.findMany({
      where: { projectId: id },
      select: { commitSha: true },
    });
    const usedShas = new Set(usedLogs.map((l) => l.commitSha));

    return NextResponse.json({
      data: commits.map((commit) => ({
        sha: commit.sha,
        message: commit.message,
        authorName: commit.author.name,
        date: commit.author.date,
        htmlUrl: commit.html_url,
        used: usedShas.has(commit.sha),
      })),
    });
  } catch (error) {
    console.error('Get project commits error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar commit dari GitHub' },
      { status: 500 },
    );
  }
}
