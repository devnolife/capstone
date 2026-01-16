'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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
        href: `/dashboard/mahasiswa/projects/${project.id}`,
      },
      {
        key: 'assign',
        label: 'Assign Dosen',
        icon: <UserPlus size={16} />,
        href: '/dashboard/admin/assignments',
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Semua Project</h1>
        <p className="text-default-500">
          Kelola semua project capstone mahasiswa
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-default-500">Total Project</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-default-500">{stats.draft}</p>
            <p className="text-xs text-default-500">Draft</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.submitted}</p>
            <p className="text-xs text-default-500">Submitted</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-warning">{stats.inReview}</p>
            <p className="text-xs text-default-500">In Review</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-success">{stats.approved}</p>
            <p className="text-xs text-default-500">Approved</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Cari judul, nama mahasiswa, atau NIM..."
              startContent={<Search size={18} className="text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              placeholder="Status"
              selectedKeys={[statusFilter]}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="max-w-[180px]"
            >
              <SelectItem key="all">Semua Status</SelectItem>
              <SelectItem key="DRAFT">Draft</SelectItem>
              <SelectItem key="SUBMITTED">Submitted</SelectItem>
              <SelectItem key="IN_REVIEW">In Review</SelectItem>
              <SelectItem key="REVISION_NEEDED">Perlu Revisi</SelectItem>
              <SelectItem key="APPROVED">Approved</SelectItem>
              <SelectItem key="REJECTED">Rejected</SelectItem>
            </Select>
            <Select
              placeholder="Semester"
              selectedKeys={[semesterFilter]}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="max-w-[200px]"
              items={[
                { key: 'all', label: 'Semua Semester' },
                ...semesters.map((sem) => ({ key: sem, label: sem })),
              ]}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Daftar Project ({filteredProjects.length})
          </h2>
        </CardHeader>
        <CardBody>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderGit2 size={64} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500">Tidak ada project ditemukan</p>
            </div>
          ) : (
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
                        <Link href="/dashboard/admin/assignments">
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}
