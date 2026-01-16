import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { Search, FolderGit2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default async function DosenProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'DOSEN_PENGUJI' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch assigned projects
  const assignedProjects = await prisma.projectAssignment.findMany({
    where: { dosenId: session.user.id },
    include: {
      project: {
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
            where: { reviewerId: session.user.id },
          },
          _count: {
            select: {
              documents: true,
              reviews: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  const projects = assignedProjects.map((a) => a.project);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Project Mahasiswa</h1>
        <p className="text-default-500">
          Daftar project yang ditugaskan untuk Anda review
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Cari project atau mahasiswa..."
              startContent={<Search size={18} className="text-default-400" />}
              className="flex-1"
            />
            <Select placeholder="Filter Status" className="max-w-[200px]">
              <SelectItem key="all">Semua Status</SelectItem>
              <SelectItem key="SUBMITTED">Disubmit</SelectItem>
              <SelectItem key="IN_REVIEW">Dalam Review</SelectItem>
              <SelectItem key="APPROVED">Disetujui</SelectItem>
              <SelectItem key="REVISION_NEEDED">Perlu Revisi</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Project Ditugaskan ({projects.length})
          </h2>
        </CardHeader>
        <CardBody>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderGit2 size={64} className="mx-auto text-default-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Project</h3>
              <p className="text-default-500">
                Belum ada project yang ditugaskan kepada Anda
              </p>
            </div>
          ) : (
            <Table aria-label="Projects table" removeWrapper>
              <TableHeader>
                <TableColumn>MAHASISWA</TableColumn>
                <TableColumn>PROJECT</TableColumn>
                <TableColumn>SEMESTER</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DOKUMEN</TableColumn>
                <TableColumn>REVIEW STATUS</TableColumn>
                <TableColumn>AKSI</TableColumn>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const myReview = project.reviews.find(
                    (r) => r.reviewerId === session.user.id,
                  );

                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={project.mahasiswa.name}
                            src={project.mahasiswa.avatarUrl || undefined}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {project.mahasiswa.name}
                            </p>
                            <p className="text-xs text-default-500">
                              {project.mahasiswa.nim}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/dosen/projects/${project.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {project.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{project.semester}</p>
                        <p className="text-xs text-default-500">
                          {project.tahunAkademik}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={getStatusColor(project.status)}
                          variant="flat"
                        >
                          {getStatusLabel(project.status)}
                        </Chip>
                      </TableCell>
                      <TableCell>{project._count.documents} file</TableCell>
                      <TableCell>
                        {myReview ? (
                          <Chip
                            size="sm"
                            color={getStatusColor(myReview.status)}
                            variant="flat"
                          >
                            {getStatusLabel(myReview.status)}
                          </Chip>
                        ) : (
                          <Chip size="sm" variant="flat">
                            Belum Direview
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            as={Link}
                            href={`/dashboard/dosen/projects/${project.id}`}
                            size="sm"
                            variant="flat"
                          >
                            Detail
                          </Button>
                          <Button
                            as={Link}
                            href={`/dashboard/dosen/projects/${project.id}/review`}
                            size="sm"
                            color="primary"
                            variant="flat"
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
