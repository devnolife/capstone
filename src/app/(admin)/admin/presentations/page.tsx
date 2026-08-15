'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { addToast } from '@/lib/toast';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  GraduationCap,
  RefreshCw,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import { formatDate, getInitials, getStatusColor, getStatusLabel } from '@/lib/utils';

const statusToneClass: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-destructive/10 text-destructive',
};

interface Project {
  id: string;
  title: string;
  status: string;
  mahasiswa: {
    id: string;
    name: string;
    nim: string | null;
    username: string;
  };
  members: Array<{
    id: string;
    name: string | null;
    user: {
      name: string;
      nim: string | null;
    } | null;
  }>;
}

interface PresentationSchedule {
  id: string;
  projectId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  presentationStatus: string;
  completedAt: string | null;
  project: Project;
  scheduledBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ProjectForScheduling {
  id: string;
  title: string;
  status: string;
  mahasiswa: {
    id: string;
    name: string;
    nim: string | null;
    username: string;
  };
  members: Array<{
    id: string;
    name: string | null;
    user: {
      name: string;
      nim: string | null;
    } | null;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function PresentationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [presentations, setPresentations] = useState<PresentationSchedule[]>([]);
  const [projectsReadyForPresentation, setProjectsReadyForPresentation] = useState<ProjectForScheduling[]>([]);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [selectedProject, setSelectedProject] = useState<ProjectForScheduling | null>(null);
  const [editingPresentation, setEditingPresentation] = useState<PresentationSchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    scheduledDate: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch presentations
      const presRes = await fetch('/api/presentations');
      if (presRes.ok) {
        const presData = await presRes.json();
        setPresentations(presData.presentations || []);
      }

      // Fetch projects ready for presentation
      const projRes = await fetch('/api/projects?status=READY_FOR_PRESENTATION');
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjectsReadyForPresentation(projData.projects || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      addToast({
        title: 'Error',
        description: 'Gagal memuat data',
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openScheduleModal = (project: ProjectForScheduling) => {
    setSelectedProject(project);
    setEditingPresentation(null);
    setFormData({
      scheduledDate: '',
      startTime: '09:00',
      endTime: '',
      location: '',
      notes: '',
    });
    onOpen();
  };

  const openEditModal = (presentation: PresentationSchedule) => {
    setSelectedProject(null);
    setEditingPresentation(presentation);
    setFormData({
      scheduledDate: new Date(presentation.scheduledDate).toISOString().split('T')[0],
      startTime: presentation.startTime,
      endTime: presentation.endTime || '',
      location: presentation.location || '',
      notes: presentation.notes || '',
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.scheduledDate || !formData.startTime) {
      addToast({
        title: 'Validasi Gagal',
        description: 'Tanggal dan jam mulai wajib diisi',
        color: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      const url = editingPresentation
        ? `/api/presentations/${editingPresentation.id}`
        : '/api/presentations';

      const method = editingPresentation ? 'PUT' : 'POST';

      const body = editingPresentation
        ? formData
        : { ...formData, projectId: selectedProject?.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan jadwal');
      }

      addToast({
        title: 'Berhasil',
        description: editingPresentation
          ? 'Jadwal presentasi berhasil diubah'
          : 'Jadwal presentasi berhasil dibuat',
        color: 'success',
      });

      onClose();
      fetchData();
    } catch (error) {
      addToast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const response = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus jadwal');
      }

      addToast({
        title: 'Berhasil',
        description: 'Jadwal presentasi berhasil dihapus',
        color: 'success',
      });

      fetchData();
    } catch (error) {
      addToast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'danger',
      });
    }
  };

  const handleMarkCompleted = async (presentation: PresentationSchedule) => {
    try {
      const response = await fetch(`/api/presentations/${presentation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentationStatus: 'completed' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengubah status');
      }

      addToast({
        title: 'Berhasil',
        description: 'Presentasi telah ditandai selesai',
        color: 'success',
      });

      fetchData();
    } catch (error) {
      addToast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'danger',
      });
    }
  };

  const handleFinalizeProject = async (projectId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengubah status project');
      }

      addToast({
        title: 'Berhasil',
        description: status === 'APPROVED'
          ? 'Project telah disetujui'
          : 'Project telah ditolak',
        color: status === 'APPROVED' ? 'success' : 'warning',
      });

      fetchData();
    } catch (error) {
      addToast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'danger',
      });
    }
  };

  const scheduledPresentations = presentations.filter(p => p.presentationStatus === 'scheduled');
  const completedPresentations = presentations.filter(p => p.presentationStatus === 'completed');
  const cancelledPresentations = presentations.filter(p => p.presentationStatus === 'cancelled');

  // ---- Search + date filter helpers ----
  const matchesSearch = (text: string) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return text.toLowerCase().includes(q);
  };

  const matchesDate = (iso: string | null | undefined) => {
    if (dateFilter === 'all' || !iso) return dateFilter === 'all';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    if (dateFilter === 'today') return d >= startOfToday && d < endOfToday;
    if (dateFilter === 'upcoming') return d >= endOfToday;
    if (dateFilter === 'past') return d < startOfToday;
    return true;
  };

  const filteredPending = useMemo(() => projectsReadyForPresentation.filter(p => {
    const text = `${p.title} ${p.mahasiswa.name} ${p.mahasiswa.nim ?? ''} ${p.mahasiswa.username}`;
    return matchesSearch(text);
  }), [projectsReadyForPresentation, searchQuery]);

  const filteredScheduled = useMemo(() => scheduledPresentations.filter(p => {
    const text = `${p.project.title} ${p.project.mahasiswa.name} ${p.location ?? ''}`;
    return matchesSearch(text) && matchesDate(p.scheduledDate);
  }), [scheduledPresentations, searchQuery, dateFilter]);

  const filteredCompleted = useMemo(() => completedPresentations.filter(p => {
    const text = `${p.project.title} ${p.project.mahasiswa.name} ${p.location ?? ''}`;
    return matchesSearch(text) && matchesDate(p.scheduledDate);
  }), [completedPresentations, searchQuery, dateFilter]);

  const filteredCancelled = useMemo(() => cancelledPresentations.filter(p => {
    const text = `${p.project.title} ${p.project.mahasiswa.name} ${p.location ?? ''}`;
    return matchesSearch(text) && matchesDate(p.scheduledDate);
  }), [cancelledPresentations, searchQuery, dateFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-muted-foreground">Memuat data jadwal presentasi...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-5 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Jadwal Presentasi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola jadwal presentasi project mahasiswa
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} size="sm">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </header>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{projectsReadyForPresentation.length}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Menunggu Jadwal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{scheduledPresentations.length}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Terjadwal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{completedPresentations.length}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search + Date filter */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari judul project, nama mahasiswa, ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2"
                  aria-label="Bersihkan pencarian"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {(['all', 'today', 'upcoming', 'past'] as const).map((k) => (
                <Button
                  key={k}
                  size="sm"
                  variant={dateFilter === k ? 'default' : 'outline'}
                  onClick={() => setDateFilter(k)}
                >
                  {k === 'all' ? 'Semua' : k === 'today' ? 'Hari ini' : k === 'upcoming' ? 'Akan datang' : 'Lewat'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Card className="border">
          <CardContent className="p-0">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as string)}
              className="gap-0"
            >
              <TabsList
                variant="line"
                className="h-auto w-full flex-wrap justify-start rounded-none gap-4 px-4 pt-4 pb-2 border-b"
              >
                <TabsTrigger value="pending" className="h-10 flex-none px-0">
                  <AlertCircle size={16} />
                  <span>Menunggu Jadwal</span>
                  {projectsReadyForPresentation.length > 0 && (
                    <Badge variant="secondary" className={statusToneClass.warning}>
                      {projectsReadyForPresentation.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="h-10 flex-none px-0">
                  <Calendar size={16} />
                  <span>Terjadwal</span>
                  {scheduledPresentations.length > 0 && (
                    <Badge variant="secondary" className={statusToneClass.primary}>
                      {scheduledPresentations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="h-10 flex-none px-0">
                  <CheckCircle2 size={16} />
                  <span>Selesai</span>
                  {completedPresentations.length > 0 && (
                    <Badge variant="secondary" className={statusToneClass.success}>
                      {completedPresentations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="h-10 flex-none px-0">
                  <XCircle size={16} />
                  <span>Dibatalkan</span>
                  {cancelledPresentations.length > 0 && (
                    <Badge variant="secondary" className={statusToneClass.danger}>
                      {cancelledPresentations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="p-4 space-y-4">
                  {filteredPending.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <GraduationCap size={32} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {projectsReadyForPresentation.length === 0
                          ? 'Tidak ada project yang menunggu jadwal presentasi'
                          : 'Tidak ada hasil yang cocok dengan pencarian'}
                      </p>
                    </div>
                  ) : (
                    filteredPending.map((project) => (
                      <Card key={project.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="flex-shrink-0">
                                <AvatarFallback>{getInitials(project.mahasiswa.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{project.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {project.mahasiswa.name} ({project.mahasiswa.nim || project.mahasiswa.username})
                                </p>
                                {project.members.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Users size={12} />
                                    <span>{project.members.length + 1} anggota</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={statusToneClass[getStatusColor(project.status)]}
                              >
                                {getStatusLabel(project.status)}
                              </Badge>
                              <Button onClick={() => openScheduleModal(project)}>
                                <Plus size={16} />
                                Jadwalkan
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="scheduled">
                <div className="p-4 space-y-4">
                  {filteredScheduled.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Calendar size={32} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {scheduledPresentations.length === 0
                          ? 'Belum ada presentasi yang terjadwal'
                          : 'Tidak ada hasil yang cocok dengan pencarian'}
                      </p>
                    </div>
                  ) : (
                    filteredScheduled.map((presentation) => (
                      <Card key={presentation.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                  <Calendar size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{presentation.project.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {presentation.project.mahasiswa.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon-sm"
                                  variant="outline"
                                  aria-label="Edit jadwal"
                                  onClick={() => openEditModal(presentation)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="destructive"
                                  aria-label="Hapus jadwal"
                                  onClick={() => handleDelete(presentation.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-muted-foreground" />
                                <span>{formatDate(presentation.scheduledDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-muted-foreground" />
                                <span>
                                  {presentation.startTime}
                                  {presentation.endTime && ` - ${presentation.endTime}`}
                                </span>
                              </div>
                              {presentation.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} className="text-muted-foreground" />
                                  <span>{presentation.location}</span>
                                </div>
                              )}
                            </div>

                            <Separator />

                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-700 dark:text-emerald-400"
                                onClick={() => handleMarkCompleted(presentation)}
                              >
                                <CheckCircle2 size={16} />
                                Tandai Selesai
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="p-4 space-y-4">
                  {filteredCompleted.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {completedPresentations.length === 0
                          ? 'Belum ada presentasi yang selesai'
                          : 'Tidak ada hasil yang cocok dengan pencarian'}
                      </p>
                    </div>
                  ) : (
                    filteredCompleted.map((presentation) => (
                      <Card key={presentation.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  <CheckCircle2 size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{presentation.project.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {presentation.project.mahasiswa.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Presentasi: {formatDate(presentation.scheduledDate)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={statusToneClass[getStatusColor(presentation.project.status)]}
                              >
                                {getStatusLabel(presentation.project.status)}
                              </Badge>
                            </div>

                            {/* Show finalize buttons if project is still PRESENTATION_SCHEDULED */}
                            {presentation.project.status === 'PRESENTATION_SCHEDULED' && (
                              <>
                                <Separator />
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-muted-foreground mr-2">Hasil Presentasi:</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleFinalizeProject(presentation.project.id, 'APPROVED')}
                                  >
                                    <CheckCircle2 size={16} />
                                    Setujui Project
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleFinalizeProject(presentation.project.id, 'REJECTED')}
                                  >
                                    <XCircle size={16} />
                                    Tolak Project
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cancelled">
                <div className="p-4 space-y-4">
                  {filteredCancelled.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <XCircle size={32} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {cancelledPresentations.length === 0
                          ? 'Tidak ada presentasi yang dibatalkan'
                          : 'Tidak ada hasil yang cocok dengan pencarian'}
                      </p>
                    </div>
                  ) : (
                    filteredCancelled.map((presentation) => (
                      <Card key={presentation.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
                                  <XCircle size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{presentation.project.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {presentation.project.mahasiswa.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Jadwal sebelumnya: {formatDate(presentation.scheduledDate)} {presentation.startTime}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(presentation)}
                                >
                                  <CalendarClock size={16} />
                                  Jadwalkan Ulang
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="destructive"
                                  aria-label="Hapus jadwal"
                                  onClick={() => handleDelete(presentation.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={20} />
              <span>
                {editingPresentation ? 'Edit Jadwal Presentasi' : 'Jadwalkan Presentasi'}
              </span>
            </DialogTitle>
          </DialogHeader>
          {(selectedProject || editingPresentation) && (
            <div className="space-y-4">
              {/* Project Info */}
              <Card className="border bg-muted/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          selectedProject?.mahasiswa.name ||
                          editingPresentation?.project.mahasiswa.name ||
                          ''
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedProject?.title || editingPresentation?.project.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedProject?.mahasiswa.name ||
                          editingPresentation?.project.mahasiswa.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="presentation-date">Tanggal Presentasi</Label>
                  <Input
                    id="presentation-date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="presentation-start">Jam Mulai</Label>
                    <Input
                      id="presentation-start"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="presentation-end">Jam Selesai</Label>
                    <Input
                      id="presentation-end"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="presentation-location">Lokasi / Ruangan</Label>
                <Input
                  id="presentation-location"
                  placeholder="Contoh: Ruang Sidang Lt. 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="presentation-notes">Catatan</Label>
                <Textarea
                  id="presentation-notes"
                  placeholder="Catatan tambahan untuk mahasiswa..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={16} />}
              {editingPresentation ? 'Simpan Perubahan' : 'Jadwalkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
