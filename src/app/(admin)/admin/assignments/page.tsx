'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Chip,
  Avatar,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  addToast,
} from '@heroui/react';
import { Search, UserPlus, Trash2, UserCog, FolderGit2, Users, ClipboardCheck, Link2, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
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

interface Assignment {
  id: string;
  projectId: string;
  dosenId: string;
  assignedAt: string;
  project: {
    id: string;
    title: string;
    status: string;
    mahasiswa: { id: string; name: string; email: string; nim: string | null };
  };
  dosen: { id: string; name: string; email: string; nip: string | null };
}

interface ProjectWithAssignments {
  id: string;
  title: string;
  status: string;
  mahasiswa: { id: string; name: string; nim: string | null };
  assignments: {
    id: string;
    dosen: { id: string; name: string; username: string };
  }[];
  _count?: { assignments: number };
}

interface Dosen {
  id: string;
  name: string;
  email: string;
  nip: string | null;
}

// Project card for assignment management
function ProjectAssignmentCard({
  project,
  dosenList,
  onAssign,
  onRemoveAssignment,
  isAssigning,
}: {
  project: ProjectWithAssignments;
  dosenList: Dosen[];
  onAssign: (projectId: string, dosenId: string) => Promise<void>;
  onRemoveAssignment: (assignmentId: string) => void;
  isAssigning: boolean;
}) {
  const [selectedDosen, setSelectedDosen] = useState('');
  const [localAssigning, setLocalAssigning] = useState(false);

  // Filter out already-assigned dosen
  const assignedDosenIds = new Set(project.assignments.map((a) => a.dosen.id));
  const availableDosen = dosenList.filter((d) => !assignedDosenIds.has(d.id));

  const handleAssign = async () => {
    if (!selectedDosen) return;
    setLocalAssigning(true);
    try {
      await onAssign(project.id, selectedDosen);
      setSelectedDosen('');
    } finally {
      setLocalAssigning(false);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
        {/* Project Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shrink-0">
            <FolderGit2 size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm line-clamp-2">{project.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Chip size="sm" color={getStatusColor(project.status)} variant="flat" className="h-5 text-[10px]">
                {getStatusLabel(project.status)}
              </Chip>
              <span className="text-xs text-zinc-500">
                {project.mahasiswa.name}
                {project.mahasiswa.nim ? ` (${project.mahasiswa.nim})` : ''}
              </span>
            </div>
          </div>
          {project.assignments.length === 0 ? (
            <Chip size="sm" color="warning" variant="flat" startContent={<AlertTriangle size={12} />} className="shrink-0">
              Belum ada
            </Chip>
          ) : (
            <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 size={12} />} className="shrink-0">
              {project.assignments.length} dosen
            </Chip>
          )}
        </div>

        {/* Assigned Dosen List */}
        {project.assignments.length > 0 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Dosen Penguji:</p>
            <div className="space-y-1.5">
              {project.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={assignment.dosen.name} size="sm" className="w-6 h-6" />
                    <span className="text-sm">{assignment.dosen.name}</span>
                  </div>
                  <Tooltip content="Hapus penugasan">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      className="min-w-6 w-6 h-6"
                      onPress={() => onRemoveAssignment(assignment.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Assign */}
        <div className="flex items-center gap-2">
          <Select
            size="sm"
            placeholder={availableDosen.length === 0 ? 'Semua dosen sudah ditugaskan' : 'Pilih dosen...'}
            selectedKeys={selectedDosen ? [selectedDosen] : []}
            onChange={(e) => setSelectedDosen(e.target.value)}
            isDisabled={availableDosen.length === 0}
            classNames={{
              trigger: 'bg-zinc-50 dark:bg-zinc-800 min-h-9 h-9',
            }}
            className="flex-1"
            aria-label="Pilih dosen penguji"
          >
            {availableDosen.map((dosen) => (
              <SelectItem key={dosen.id} textValue={dosen.name}>
                <div className="flex items-center gap-2">
                  <Avatar name={dosen.name} size="sm" className="w-5 h-5" />
                  <div>
                    <p className="text-sm">{dosen.name}</p>
                    {dosen.nip && <p className="text-[10px] text-zinc-400">{dosen.nip}</p>}
                  </div>
                </div>
              </SelectItem>
            ))}
          </Select>
          <Button
            size="sm"
            color="primary"
            isDisabled={!selectedDosen || isAssigning}
            isLoading={localAssigning}
            onPress={handleAssign}
            startContent={!localAssigning && <UserPlus size={14} />}
            className="shrink-0"
          >
            Assign
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<ProjectWithAssignments[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('unassigned');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { confirm, ConfirmDialog } = useConfirmDialog();

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
        setAssignments(Array.isArray(data) ? data : data.assignments || []);
      } else {
        setAssignments([]);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        const projectList = Array.isArray(data) ? data : data.projects || [];
        setProjects(projectList);
      } else {
        setProjects([]);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = Array.isArray(data) ? data : data.users || [];
        setDosenList(
          users.filter((u: Dosen & { role: string }) => u.role === 'DOSEN_PENGUJI'),
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

  // Separate projects not in DRAFT (eligible for assignment)
  const eligibleProjects = useMemo(() => {
    return projects.filter((p) => p.status !== 'DRAFT');
  }, [projects]);

  // Split into unassigned vs assigned
  const { unassignedProjects, assignedProjects } = useMemo(() => {
    const unassigned: ProjectWithAssignments[] = [];
    const assigned: ProjectWithAssignments[] = [];

    for (const project of eligibleProjects) {
      const assignmentCount = project.assignments?.length ?? project._count?.assignments ?? 0;
      if (assignmentCount === 0) {
        unassigned.push(project);
      } else {
        assigned.push(project);
      }
    }

    return { unassignedProjects: unassigned, assignedProjects: assigned };
  }, [eligibleProjects]);

  // Apply search & status filter
  const filterProjects = (list: ProjectWithAssignments[]) => {
    return list.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mahasiswa.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUnassigned = filterProjects(unassignedProjects);
  const filteredAssigned = filterProjects(assignedProjects);

  const handleAssign = async (projectId: string, dosenId: string) => {
    setIsAssigning(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, dosenId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat penugasan');
      }

      addToast({
        title: 'Berhasil',
        description: 'Dosen berhasil ditugaskan',
        color: 'success',
      });

      await fetchData();
    } catch (err) {
      addToast({
        title: 'Gagal',
        description: err instanceof Error ? err.message : 'Error',
        color: 'danger',
      });
    } finally {
      setIsAssigning(false);
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

      addToast({
        title: 'Berhasil',
        description: 'Penugasan berhasil dihapus',
        color: 'success',
      });

      await fetchData();
    } catch (err) {
      addToast({
        title: 'Gagal',
        description: err instanceof Error ? err.message : 'Error',
        color: 'danger',
      });
    }
  };

  const stats = {
    total: assignments.length,
    unassigned: unassignedProjects.length,
    assigned: assignedProjects.length,
    dosen: new Set(assignments.map((a) => a.dosenId)).size,
  };

  // Collect unique statuses for filter
  const availableStatuses = useMemo(() => {
    const statuses = new Set(eligibleProjects.map((p) => p.status));
    return Array.from(statuses).sort();
  }, [eligibleProjects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* Hero Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border border-amber-200/50 dark:border-amber-800/30 p-6 md:p-8">
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
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
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
          <div className="rounded-xl border border-red-200/60 dark:border-red-800/30 bg-red-50/30 dark:bg-red-950/20 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30">
                <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.unassigned}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Belum Ditugaskan</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.assigned}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Sudah Ditugaskan</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
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

      {/* Search & Filter */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Cari project atau mahasiswa..."
              startContent={<Search size={18} className="text-slate-400 dark:text-zinc-500" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{ inputWrapper: 'bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/50' }}
              className="flex-1"
            />
            <Select
              size="md"
              placeholder="Semua Status"
              selectedKeys={statusFilter !== 'all' ? [statusFilter] : []}
              onChange={(e) => setStatusFilter(e.target.value || 'all')}
              startContent={<Filter size={16} className="text-slate-400" />}
              classNames={{ trigger: 'bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/50' }}
              className="w-full sm:w-52"
              aria-label="Filter status"
            >
              {availableStatuses.map((status) => (
                <SelectItem key={status} textValue={getStatusLabel(status)}>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color={getStatusColor(status)} variant="dot" className="border-none">
                      {getStatusLabel(status)}
                    </Chip>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Tabs: Belum Ditugaskan / Sudah Ditugaskan */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: 'px-4 pt-3 border-b border-slate-200/60 dark:border-zinc-700/50',
              tab: 'h-10',
            }}
          >
            <Tab
              key="unassigned"
              title={
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>Belum Ditugaskan</span>
                  {unassignedProjects.length > 0 && (
                    <Badge color="danger" content={unassignedProjects.length} size="sm">
                      <span />
                    </Badge>
                  )}
                </div>
              }
            />
            <Tab
              key="assigned"
              title={
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Sudah Ditugaskan</span>
                  <span className="text-xs text-zinc-400">({assignedProjects.length})</span>
                </div>
              }
            />
          </Tabs>

          <div className="p-4">
            {activeTab === 'unassigned' && (
              <>
                {filteredUnassigned.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <CheckCircle2 size={48} className="text-green-500" />
                    </div>
                    <p className="text-zinc-500 font-medium">Semua project sudah ditugaskan!</p>
                    <p className="text-zinc-400 text-sm mt-1">Tidak ada project yang menunggu penugasan dosen.</p>
                  </div>
                ) : (
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
                    {filteredUnassigned.map((project) => (
                      <ProjectAssignmentCard
                        key={project.id}
                        project={project}
                        dosenList={dosenList}
                        onAssign={handleAssign}
                        onRemoveAssignment={handleDeleteAssignment}
                        isAssigning={isAssigning}
                      />
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {activeTab === 'assigned' && (
              <>
                {filteredAssigned.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                      <UserCog size={48} className="text-zinc-400" />
                    </div>
                    <p className="text-zinc-500">Belum ada project yang ditugaskan</p>
                  </div>
                ) : (
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
                    {filteredAssigned.map((project) => (
                      <ProjectAssignmentCard
                        key={project.id}
                        project={project}
                        dosenList={dosenList}
                        onAssign={handleAssign}
                        onRemoveAssignment={handleDeleteAssignment}
                        isAssigning={isAssigning}
                      />
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
