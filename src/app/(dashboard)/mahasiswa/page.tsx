import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ProjectCard } from '@/components/projects/project-card';
import { FolderGit2, FileText, ClipboardCheck, Clock } from 'lucide-react';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import Link from 'next/link';

export default async function MahasiswaDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      documents: true,
      reviews: {
        include: {
          reviewer: true,
        },
      },
      _count: {
        select: {
          documents: true,
          reviews: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  // Calculate stats
  const totalProjects = projects.length;
  const submittedProjects = projects.filter((p) => p.status !== 'DRAFT').length;
  const reviewedProjects = projects.filter(
    (p) => p.status === 'APPROVED' || p.status === 'REJECTED',
  ).length;
  const pendingReviews = projects.filter(
    (p) => p.status === 'IN_REVIEW' || p.status === 'SUBMITTED',
  ).length;

  // Get total documents
  const totalDocuments = projects.reduce(
    (acc, p) => acc + p._count.documents,
    0,
  );

  // Create activity list from projects and reviews
  const activities = projects.slice(0, 5).map((project) => ({
    id: project.id,
    type: 'submission' as const,
    title: project.title,
    description: `Project ${project.status === 'DRAFT' ? 'dibuat' : 'disubmit'}`,
    user: {
      name: session.user.name || 'User',
      avatar: session.user.image || undefined,
    },
    timestamp: project.updatedAt,
    status: project.status,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-default-500">Kelola project capstone Anda di sini</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Project"
          value={totalProjects}
          icon={FolderGit2}
          color="primary"
          description={`${submittedProjects} sudah disubmit`}
        />
        <StatsCard
          title="Dokumen Terupload"
          value={totalDocuments}
          icon={FileText}
          color="secondary"
          description="Total semua dokumen"
        />
        <StatsCard
          title="Review Selesai"
          value={reviewedProjects}
          icon={ClipboardCheck}
          color="success"
          description="Project yang sudah direview"
        />
        <StatsCard
          title="Menunggu Review"
          value={pendingReviews}
          icon={Clock}
          color="warning"
          description="Project dalam antrian"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Project Saya</h2>
              <Button
                as={Link}
                href="/dashboard/mahasiswa/projects/new"
                color="primary"
                size="sm"
              >
                Buat Project Baru
              </Button>
            </CardHeader>
            <CardBody>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderGit2
                    size={48}
                    className="mx-auto text-default-300 mb-4"
                  />
                  <p className="text-default-500 mb-4">
                    Belum ada project. Buat project pertama Anda!
                  </p>
                  <Button
                    as={Link}
                    href="/dashboard/mahasiswa/projects/new"
                    color="primary"
                  >
                    Buat Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {projects.length > 3 && (
                    <div className="text-center">
                      <Button
                        as={Link}
                        href="/dashboard/mahasiswa/projects"
                        variant="light"
                        color="primary"
                      >
                        Lihat Semua Project
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Activity Section */}
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}
