'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
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
import { Search, UserPlus, Trash2, UserCog, FolderGit2, Users, ClipboardCheck, Link2 } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// Mobile Assignment Card
function MobileAssignmentCard({
  assignment,
  onDelete,
}: {
  assignment: Assignment;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mb-3">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shrink-0">
              <FolderGit2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-2">{assignment.project.title}</p>
              <Chip size="sm" color={getStatusColor(assignment.project.status)} variant="flat" className="h-5 text-[10px] mt-1">
                {getStatusLabel(assignment.project.status)}
              </Chip>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mb-1">Mahasiswa</p>
              <div className="flex items-center gap-2">
                <Avatar name={assignment.project.mahasiswa.name} size="sm" className="w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{assignment.project.mahasiswa.name}</p>
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20">
              <p className="text-[10px] text-violet-600 dark:text-violet-400 mb-1">Dosen</p>
              <div className="flex items-center gap-2">
                <Avatar name={assignment.dosen.name} size="sm" className="w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{assignment.dosen.name}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Ditugaskan: {formatDate(assignment.assignedAt)}</span>
            <Button size="sm" variant="flat" color="danger" startContent={<Trash2 size={14} />} onPress={() => onDelete(assignment.id)}>
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface Assignment {
  id: string;
  projectId: string;
  dosenId: string;
  assignedAt: string;
  project: {
    id: string;
    title: string;
    status: string;
    mahasiswa: { id: string; name: string; email: string; nim: string | null; };
  };
  dosen: { id: string; name: string; email: string; nip: string | null; };
}

interface Project {
  id: string;
  title: string;
  status: string;
  mahasiswa: { id: string; name: string; nim: string | null; };
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
  const { confirm, ConfirmDialog } = useConfirmDialog();

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
        // Handle both array and object response
        setAssignments(Array.isArray(data) ? data : data.assignments || []);
      } else {
        setAssignments([]);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        // Handle both array and object response
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } else {
        setProjects([]);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        // Handle both array and object response
        const users = Array.isArray(data) ? data : data.users || [];
        setDosenList(
          users.filter(
            (u: Dosen & { role: string }) => u.role === 'DOSEN_PENGUJI',
          ),
        );
      } else {
        setDosenList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAssignments([]);
      setProjects([]);
      setDosenList([]);
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
    const confirmed = await confirm({
      title: 'Hapus Penugasan',
      message: 'Apakah Anda yakin ingin menghapus penugasan ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

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
      setError(err instanceof Error ? err.message : 'Error');
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

  const availableProjects = projects.filter((p) => p.status !== 'DRAFT');

  const stats = {
    total: assignments.length,
    projects: new Set(assignments.map(a => a.projectId)).size,
    dosen: new Set(assignments.map(a => a.dosenId)).size,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* Hero Header - Soft Amber/Orange */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border border-amber-200/50 dark:border-amber-800/30 p-6 md:p-8">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-400/15 to-amber-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                <Link2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Penugasan Dosen</h1>
                <p className="text-amber-600/70 dark:text-amber-400/60 text-sm mt-1">Kelola penugasan dosen penguji ke project mahasiswa</p>
              </div>
            </div>
            <Button color="warning" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25" startContent={<UserPlus size={18} />} onPress={onOpen}>
              Tambah Penugasan
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Softer Design */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <ClipboardCheck size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Penugasan</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30">
                <FolderGit2 size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.projects}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Project Ter-assign</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <Users size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.dosen}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Dosen Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search - Cleaner Design */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
              <Search size={14} className="text-slate-600 dark:text-zinc-400" />
            </div>
            <h3 className="font-medium text-sm text-slate-700 dark:text-zinc-300">Pencarian</h3>
          </div>
          <Input placeholder="Cari project, mahasiswa, atau dosen..." startContent={<Search size={18} className="text-slate-400 dark:text-zinc-500" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} classNames={{ inputWrapper: 'bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/50' }} />
        </div>
      </motion.div>

      {/* Assignments List - Clean Container */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-zinc-700/50 bg-slate-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <Link2 size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-medium text-slate-700 dark:text-zinc-300">Daftar Penugasan ({filteredAssignments.length})</h2>
            </div>
          </div>
          <div className="p-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <UserCog size={48} className="text-zinc-400" />
                </div>
                <p className="text-zinc-500">Tidak ada penugasan ditemukan</p>
              </div>
            ) : (
              <>
                <div className="md:hidden">
                  <motion.div variants={containerVariants}>
                    {filteredAssignments.map((assignment) => (
                      <MobileAssignmentCard key={assignment.id} assignment={assignment} onDelete={handleDeleteAssignment} />
                    ))}
                  </motion.div>
                </div>
                <div className="hidden md:block">
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
                              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                                <FolderGit2 size={16} />
                              </div>
                              <p className="font-medium text-sm">{assignment.project.title}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar name={assignment.project.mahasiswa.name} size="sm" />
                              <div>
                                <p className="text-sm font-medium">{assignment.project.mahasiswa.name}</p>
                                <p className="text-xs text-zinc-500">{assignment.project.mahasiswa.nim || '-'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar name={assignment.dosen.name} size="sm" />
                              <div>
                                <p className="text-sm font-medium">{assignment.dosen.name}</p>
                                <p className="text-xs text-zinc-500">{assignment.dosen.nip || '-'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" color={getStatusColor(assignment.project.status)} variant="flat">
                              {getStatusLabel(assignment.project.status)}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-zinc-500 text-sm">{formatDate(assignment.assignedAt)}</TableCell>
                          <TableCell>
                            <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => handleDeleteAssignment(assignment.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <UserPlus size={18} />
            </div>
            <span>Tambah Penugasan Baru</span>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">{error}</div>
            )}
            <Select label="Pilih Project" placeholder="Pilih project mahasiswa" selectedKeys={selectedProject ? [selectedProject] : []} onChange={(e) => setSelectedProject(e.target.value)} isRequired>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} textValue={project.title}>
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-zinc-500">{project.mahasiswa.name} ({project.mahasiswa.nim || '-'})</p>
                  </div>
                </SelectItem>
              ))}
            </Select>
            <Select label="Pilih Dosen Penguji" placeholder="Pilih dosen penguji" selectedKeys={selectedDosen ? [selectedDosen] : []} onChange={(e) => setSelectedDosen(e.target.value)} isRequired>
              {dosenList.map((dosen) => (
                <SelectItem key={dosen.id} textValue={dosen.name}>
                  <div>
                    <p className="font-medium">{dosen.name}</p>
                    <p className="text-xs text-zinc-500">{dosen.nip || dosen.email}</p>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>Batal</Button>
            <Button color="primary" onPress={handleCreateAssignment} isLoading={isSubmitting}>Simpan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
