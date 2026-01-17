'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import {
  Search,
  FolderGit2,
  ExternalLink,
  MoreVertical,
  UserPlus,
  Eye,
  FileText,
  Github,
  Calendar,
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  githubRepoUrl: string | null;
  semester: string;
  tahunAkademik: string;
  submittedAt: string | null;
  createdAt: string;
  mahasiswa: {
    id: string;
    name: string;
    email: string;
    nim: string | null;
  };
  _count: {
    documents: number;
    reviews: number;
    assignments: number;
  };
}

interface DropdownItemData {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';
  href?: string;
  onPress?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Mobile Project Card Component
function MobileProjectCard({
  project,
  onStatusChange,
}: {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* Project Title */}
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                <FolderGit2 className="text-primary" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-2">
                  {project.title}
                </p>
                {project.githubRepoUrl && (
                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 mt-1"
                  >
                    <Github size={10} />
                    <span>GitHub</span>
                    <ExternalLink size={8} />
                  </a>
                )}
              </div>
            </div>

            {/* Mahasiswa Info */}
            <div className="flex items-center gap-2">
              <Avatar name={project.mahasiswa.name} size="sm" className="w-6 h-6" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {project.mahasiswa.name}
                </p>
                <p className="text-[10px] text-default-500">
                  {project.mahasiswa.nim || '-'}
                </p>
              </div>
            </div>

            {/* Status & Info */}
            <div className="flex flex-wrap gap-2">
              <Chip
                size="sm"
                color={getStatusColor(project.status)}
                variant="flat"
                className="h-5 text-[10px]"
              >
                {getStatusLabel(project.status)}
              </Chip>
              {project._count.assignments > 0 ? (
                <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px]">
                  {project._count.assignments} Dosen
                </Chip>
              ) : (
                <Chip size="sm" variant="flat" color="warning" className="h-5 text-[10px]">
                  Belum Assign
                </Chip>
              )}
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-3 text-xs text-default-500">
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{project.semester}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={10} />
                <span>{project._count.documents} dok</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                as={Link}
                href={`/mahasiswa/projects/${project.id}`}
                size="sm"
                variant="flat"
                className="flex-1 h-8"
                startContent={<Eye size={14} />}
              >
                Detail
              </Button>
              {project._count.assignments === 0 && (
                <Button
                  as={Link}
                  href="/admin/assignments"
                  size="sm"
                  variant="flat"
                  color="warning"
                  className="flex-1 h-8"
                  startContent={<UserPlus size={14} />}
                >
                  Assign
                </Button>
              )}
            </div>

            {/* Status Change Actions */}
            {project.status === 'SUBMITTED' && (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                className="w-full h-8"
                onPress={() => onStatusChange(project.id, 'IN_REVIEW')}
              >
                Mulai Review
              </Button>
            )}
            {project.status === 'IN_REVIEW' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  className="flex-1 h-8"
                  onPress={() => onStatusChange(project.id, 'APPROVED')}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="flex-1 h-8"
                  onPress={() => onStatusChange(project.id, 'REVISION_NEEDED')}
                >
                  Revisi
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?all=true');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getDropdownItems = (project: Project): DropdownItemData[] => {
    const items: DropdownItemData[] = [
      {
        key: 'view',
        label: 'Lihat Detail',
        icon: <Eye size={16} />,
        href: `/mahasiswa/projects/${project.id}`,
      },
      {
        key: 'assign',
        label: 'Assign Dosen',
        icon: <UserPlus size={16} />,
        href: '/admin/assignments',
      },
    ];

    if (project.githubRepoUrl) {
      items.push({
        key: 'github',
        label: 'Buka GitHub',
        icon: <ExternalLink size={16} />,
        href: project.githubRepoUrl,
      });
    }

    if (project.status === 'SUBMITTED') {
      items.push({
        key: 'start-review',
        label: 'Mulai Review',
        color: 'primary',
        onPress: () => handleStatusChange(project.id, 'IN_REVIEW'),
      });
    }

    if (project.status === 'IN_REVIEW') {
      items.push(
        {
          key: 'approve',
          label: 'Approve',
          color: 'success',
          onPress: () => handleStatusChange(project.id, 'APPROVED'),
        },
        {
          key: 'revision',
          label: 'Perlu Revisi',
          color: 'warning',
          onPress: () => handleStatusChange(project.id, 'REVISION_NEEDED'),
        },
        {
          key: 'reject',
          label: 'Reject',
          color: 'danger',
          onPress: () => handleStatusChange(project.id, 'REJECTED'),
        },
      );
    }

    return items;
  };

  // Get unique semesters for filter
  const semesters = [...new Set(projects.map((p) => p.semester))];

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      project.title.toLowerCase().includes(searchLower) ||
      project.mahasiswa.name.toLowerCase().includes(searchLower) ||
      project.mahasiswa.nim?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    const matchesSemester =
      semesterFilter === 'all' || project.semester === semesterFilter;

    return matchesSearch && matchesStatus && matchesSemester;
  });

  // Stats
  const stats = {
    total: projects.length,
    draft: projects.filter((p) => p.status === 'DRAFT').length,
    submitted: projects.filter((p) => p.status === 'SUBMITTED').length,
    inReview: projects.filter((p) => p.status === 'IN_REVIEW').length,
    approved: projects.filter((p) => p.status === 'APPROVED').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl font-bold">Semua Project</h1>
        <p className="text-sm md:text-base text-default-500">
          Kelola semua project capstone mahasiswa
        </p>
      </motion.div>

      {/* Stats - Scrollable on mobile */}
      <motion.div
        variants={itemVariants}
        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible"
      >
        <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 min-w-max md:min-w-0">
          <Card className="w-[100px] md:w-auto shrink-0">
            <CardBody className="text-center p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
              <p className="text-[10px] md:text-xs text-default-500">Total</p>
            </CardBody>
          </Card>
          <Card className="w-[100px] md:w-auto shrink-0">
            <CardBody className="text-center p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold text-default-500">
                {stats.draft}
              </p>
              <p className="text-[10px] md:text-xs text-default-500">Draft</p>
            </CardBody>
          </Card>
          <Card className="w-[100px] md:w-auto shrink-0">
            <CardBody className="text-center p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold text-primary">
                {stats.submitted}
              </p>
              <p className="text-[10px] md:text-xs text-default-500">Submit</p>
            </CardBody>
          </Card>
          <Card className="w-[100px] md:w-auto shrink-0">
            <CardBody className="text-center p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold text-warning">
                {stats.inReview}
              </p>
              <p className="text-[10px] md:text-xs text-default-500">Review</p>
            </CardBody>
          </Card>
          <Card className="w-[100px] md:w-auto shrink-0">
            <CardBody className="text-center p-3 md:p-4">
              <p className="text-xl md:text-2xl font-bold text-success">
                {stats.approved}
              </p>
              <p className="text-[10px] md:text-xs text-default-500">Approved</p>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardBody className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <Input
                placeholder="Cari judul, nama, atau NIM..."
                startContent={<Search size={18} className="text-default-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                size="sm"
                classNames={{
                  inputWrapper: 'h-10',
                }}
              />
              <div className="flex gap-2">
                <Select
                  placeholder="Status"
                  selectedKeys={[statusFilter]}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 md:w-[150px]"
                  size="sm"
                >
                  <SelectItem key="all">Semua Status</SelectItem>
                  <SelectItem key="DRAFT">Draft</SelectItem>
                  <SelectItem key="SUBMITTED">Submitted</SelectItem>
                  <SelectItem key="IN_REVIEW">In Review</SelectItem>
                  <SelectItem key="REVISION_NEEDED">Revisi</SelectItem>
                  <SelectItem key="APPROVED">Approved</SelectItem>
                  <SelectItem key="REJECTED">Rejected</SelectItem>
                </Select>
                <Select
                  placeholder="Semester"
                  selectedKeys={[semesterFilter]}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="flex-1 md:w-[150px]"
                  size="sm"
                  items={[
                    { key: 'all', label: 'Semua' },
                    ...semesters.map((sem) => ({ key: sem, label: sem })),
                  ]}
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Projects List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="px-4 py-3">
            <h2 className="text-base md:text-lg font-semibold">
              Daftar Project ({filteredProjects.length})
            </h2>
          </CardHeader>
          <CardBody className="pt-0">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderGit2 size={64} className="mx-auto text-default-300 mb-4" />
                <p className="text-default-500 text-sm md:text-base">
                  Tidak ada project ditemukan
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden">
                  <motion.div variants={containerVariants}>
                    {filteredProjects.map((project) => (
                      <MobileProjectCard
                        key={project.id}
                        project={project}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table aria-label="Projects table" removeWrapper>
                    <TableHeader>
                      <TableColumn>PROJECT</TableColumn>
                      <TableColumn>MAHASISWA</TableColumn>
                      <TableColumn>SEMESTER</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>PENGUJI</TableColumn>
                      <TableColumn>DOKUMEN</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary-100">
                                <FolderGit2 size={18} className="text-primary-600" />
                              </div>
                              <div className="max-w-[200px]">
                                <p className="font-medium text-sm truncate">
                                  {project.title}
                                </p>
                                {project.githubRepoUrl && (
                                  <a
                                    href={project.githubRepoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                                  >
                                    <Github size={12} />
                                    <span className="truncate">GitHub</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar name={project.mahasiswa.name} size="sm" />
                              <div>
                                <p className="text-sm font-medium">
                                  {project.mahasiswa.name}
                                </p>
                                <p className="text-xs text-default-500">
                                  {project.mahasiswa.nim || '-'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{project.semester}</p>
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
                          <TableCell>
                            {project._count.assignments > 0 ? (
                              <Chip size="sm" variant="flat" color="success">
                                {project._count.assignments} Dosen
                              </Chip>
                            ) : (
                              <Link href="/admin/assignments">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  startContent={<UserPlus size={14} />}
                                >
                                  Assign
                                </Button>
                              </Link>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat">
                              <FileText size={12} className="mr-1" />
                              {project._count.documents}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu<DropdownItemData>
                                aria-label="Project actions"
                                items={getDropdownItems(project)}
                              >
                                {(item: DropdownItemData) => (
                                  <DropdownItem
                                    key={item.key}
                                    startContent={item.icon}
                                    color={item.color}
                                    href={item.href}
                                    onPress={item.onPress}
                                  >
                                    {item.label}
                                  </DropdownItem>
                                )}
                              </DropdownMenu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
