import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { buildStudentJourney } from '@/lib/student-journey';
import { resolveProjectSubmissionDeadline } from '@/lib/semester';
import { ProjectWorkspace } from '@/components/mahasiswa/workspace/project-workspace';

export const metadata = {
  title: 'Project Saya | Capstone',
  description: 'Workspace project capstone — semua dalam satu halaman',
};

const FINAL_STATUSES = ['APPROVED', 'REJECTED'];

export default async function ProjectWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { project: requestedProjectId } = await searchParams;

  type ProjectListItem = { id: string; title: string; status: string };
  let projectList: ProjectListItem[] = [];
  let user: { githubUsername: string | null; githubToken: string | null } | null =
    null;

  try {
    [projectList, user] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { mahasiswaId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
        select: { id: true, title: true, status: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { githubUsername: true, githubToken: true },
      }),
    ]);
  } catch (error) {
    console.warn(
      '[mahasiswa/project] DB tidak tersedia:',
      error instanceof Error ? error.message : error,
    );
  }

  const hasGitHubConnected = !!(user?.githubUsername && user?.githubToken);

  // Pilih project: ?project= jika valid, kalau tidak project aktif (non-final) terbaru
  const selectedId =
    (requestedProjectId &&
      projectList.find((p) => p.id === requestedProjectId)?.id) ||
    projectList.find((p) => !FINAL_STATUSES.includes(p.status))?.id ||
    projectList[0]?.id ||
    null;

  if (!selectedId) {
    // Belum punya project — workspace menampilkan panel create inline
    return (
      <ProjectWorkspace
        projects={[]}
        project={null}
        journey={buildStudentJourney({
          hasGitHubConnected,
          project: null,
          submissionDeadline: null,
        })}
        reviews={[]}
        reviewStats={{
          totalReviews: 0,
          completedReviews: 0,
          pendingReviews: 0,
          averageScore: null,
        }}
        canEdit={false}
        isOwner={false}
        hasGitHubConnected={hasGitHubConnected}
        currentUserId={session.user.id}
      />
    );
  }

  const [project, activeSemesters, reviews] = await Promise.all([
    prisma.project.findUnique({
      where: { id: selectedId },
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
          orderBy: { joinedAt: 'asc' },
        },
        requirements: true,
        documents: { select: { id: true, type: true, fileName: true, uploadedAt: true } },
        stakeholderDocuments: { orderBy: { uploadedAt: 'desc' } },
        presentationSchedule: {
          include: { scheduledBy: { select: { id: true, name: true } } },
        },
        assignments: {
          include: {
            dosen: { select: { id: true, name: true, username: true, image: true } },
          },
        },
        _count: {
          select: {
            workLogs: true,
            userPhotos: { where: { verificationStatus: { not: 'REJECTED' } } },
          },
        },
      },
    }),
    prisma.semester.findMany({
      where: { isActive: true },
      select: {
        name: true,
        tahunAkademik: true,
        isActive: true,
        submissionDeadline: true,
      },
    }),
    prisma.review.findMany({
      where: { projectId: selectedId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            members: {
              select: {
                id: true,
                name: true,
                role: true,
                user: { select: { id: true, name: true, username: true } },
              },
            },
          },
        },
        reviewer: { select: { id: true, name: true, username: true } },
        scores: { include: { rubrik: true } },
        comments: { orderBy: { createdAt: 'desc' }, take: 5 },
        memberScores: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                role: true,
                user: { select: { id: true, name: true, username: true } },
              },
            },
            rubrik: {
              select: {
                id: true,
                name: true,
                kategori: true,
                bobotMax: true,
                tipe: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  if (!project) {
    redirect('/mahasiswa/project');
  }

  const isOwner = project.mahasiswaId === session.user.id;
  const isTeamMember = project.members.some((m) => m.userId === session.user.id);
  if (!isOwner && !isTeamMember && session.user.role !== 'ADMIN') {
    redirect('/mahasiswa/dashboard');
  }

  const canEdit =
    (project.status === 'DRAFT' || project.status === 'REVISION_NEEDED') && isOwner;

  const submissionDeadline = resolveProjectSubmissionDeadline(
    { semester: project.semester, tahunAkademik: project.tahunAkademik },
    activeSemesters,
  );

  const journey = buildStudentJourney({
    hasGitHubConnected,
    submissionDeadline,
    project: {
      id: project.id,
      title: project.title,
      status: project.status,
      githubRepoUrl: project.githubRepoUrl,
      requirements: project.requirements,
      documentTypes: project.documents.map((d) => d.type),
      stakeholderDocumentCount: project.stakeholderDocuments.length,
      workLogCount: project._count.workLogs,
      userPhotoCount: project._count.userPhotos,
      reviews: reviews.map((r) => ({ status: r.status })),
      presentationSchedule: project.presentationSchedule
        ? {
            scheduledDate: project.presentationSchedule.scheduledDate.toISOString(),
            startTime: project.presentationSchedule.startTime,
            endTime: project.presentationSchedule.endTime,
            location: project.presentationSchedule.location,
            presentationStatus: project.presentationSchedule.presentationStatus,
          }
        : null,
      memberCount: new Set([
        project.mahasiswaId,
        ...project.members
          .map((m) => m.userId)
          .filter((id): id is string => !!id),
      ]).size,
      isOwner,
    },
  });

  const reviewStats = {
    totalReviews: reviews.length,
    completedReviews: reviews.filter((r) => r.status === 'COMPLETED').length,
    pendingReviews: reviews.filter(
      (r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS',
    ).length,
    averageScore:
      reviews.filter((r) => r.overallScore !== null).length > 0
        ? Math.round(
            reviews
              .filter((r) => r.overallScore !== null)
              .reduce((acc, r) => acc + (r.overallScore || 0), 0) /
              reviews.filter((r) => r.overallScore !== null).length,
          )
        : null,
  };

  return (
    <ProjectWorkspace
      projects={projectList}
      project={project}
      journey={journey}
      reviews={reviews}
      reviewStats={reviewStats}
      canEdit={canEdit}
      isOwner={isOwner}
      hasGitHubConnected={hasGitHubConnected}
      currentUserId={session.user.id}
    />
  );
}
