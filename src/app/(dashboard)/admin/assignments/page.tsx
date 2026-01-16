'use client';

import { useState, useEffect } from 'react';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from '@heroui/react';
import { Search, UserPlus, Trash2, UserCog, FolderGit2 } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Assignment {
  id: string;
  projectId: string;
  dosenId: string;
  assignedAt: string;
  project: {
    id: string;
    title: string;
    status: string;
    mahasiswa: {
      id: string;
      name: string;
      email: string;
      nim: string | null;
    };
  };
  dosen: {
    id: string;
    name: string;
    email: string;
    nip: string | null;
  };
}

interface Project {
  id: string;
  title: string;
  status: string;
  mahasiswa: {
    id: string;
    name: string;
    nim: string | null;
  };
}

interface Dosen {
  id: string;
  name: string;
  email: string;
  nip: string | null;
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDosen, setSelectedDosen] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, projectsRes, usersRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/projects'),
        fetch('/api/users?role=DOSEN_PENGUJI'),
      ]);

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setDosenList(
          data.filter(
            (u: Dosen & { role: string }) => u.role === 'DOSEN_PENGUJI',
          ),
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedProject || !selectedDosen) {
      setError('Pilih project dan dosen');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          dosenId: selectedDosen,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat penugasan');
      }

      await fetchData();
      onClose();
      setSelectedProject('');
      setSelectedDosen('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penugasan ini?')) return;

    try {
      const response = await fetch(`/api/assignments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus penugasan');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      assignment.project.title.toLowerCase().includes(searchLower) ||
      assignment.project.mahasiswa.name.toLowerCase().includes(searchLower) ||
      assignment.dosen.name.toLowerCase().includes(searchLower)
    );
  });

  // Get projects that don't have any assignment yet (or allow multiple assignments)
  const availableProjects = projects.filter((p) => p.status !== 'DRAFT');

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Penugasan Dosen</h1>
          <p className="text-default-500">
            Kelola penugasan dosen penguji ke project mahasiswa
          </p>
        </div>
        <Button
          color="primary"
          startContent={<UserPlus size={18} />}
          onPress={onOpen}
        >
          Tambah Penugasan
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Cari project, mahasiswa, atau dosen..."
            startContent={<Search size={18} className="text-default-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Daftar Penugasan ({filteredAssignments.length})
          </h2>
        </CardHeader>
        <CardBody>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <UserCog size={64} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500">Tidak ada penugasan ditemukan</p>
            </div>
          ) : (
            <Table aria-label="Assignments table" removeWrapper>
              <TableHeader>
                <TableColumn>PROJECT</TableColumn>
                <TableColumn>MAHASISWA</TableColumn>
                <TableColumn>DOSEN PENGUJI</TableColumn>
                <TableColumn>STATUS PROJECT</TableColumn>
                <TableColumn>TANGGAL PENUGASAN</TableColumn>
                <TableColumn>AKSI</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-100">
                          <FolderGit2 size={18} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {assignment.project.title}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={assignment.project.mahasiswa.name}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.project.mahasiswa.name}
                          </p>
                          <p className="text-xs text-default-500">
                            {assignment.project.mahasiswa.nim || '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name={assignment.dosen.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.dosen.name}
                          </p>
                          <p className="text-xs text-default-500">
                            {assignment.dosen.nip || '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={getStatusColor(assignment.project.status)}
                        variant="flat"
                      >
                        {getStatusLabel(assignment.project.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>{formatDate(assignment.assignedAt)}</TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handleDeleteAssignment(assignment.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Tambah Penugasan Baru</ModalHeader>
          <ModalBody className="space-y-4">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Select
              label="Pilih Project"
              placeholder="Pilih project mahasiswa"
              selectedKeys={selectedProject ? [selectedProject] : []}
              onChange={(e) => setSelectedProject(e.target.value)}
              isRequired
            >
              {availableProjects.map((project) => (
                <SelectItem key={project.id} textValue={project.title}>
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-default-500">
                      {project.mahasiswa.name} ({project.mahasiswa.nim || '-'})
                    </p>
                  </div>
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Pilih Dosen Penguji"
              placeholder="Pilih dosen penguji"
              selectedKeys={selectedDosen ? [selectedDosen] : []}
              onChange={(e) => setSelectedDosen(e.target.value)}
              isRequired
            >
              {dosenList.map((dosen) => (
                <SelectItem key={dosen.id} textValue={dosen.name}>
                  <div>
                    <p className="font-medium">{dosen.name}</p>
                    <p className="text-xs text-default-500">
                      {dosen.nip || dosen.email}
                    </p>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleCreateAssignment}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
