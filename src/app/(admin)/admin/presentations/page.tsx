'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Tabs,
  Tab,
  Spinner,
  Avatar,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Divider,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  GraduationCap,
  Building,
  RefreshCw,
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

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
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Memuat data jadwal presentasi...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
          <CardBody className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <CalendarClock size={28} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Jadwal Presentasi</h1>
                  <p className="text-white/70">Kelola jadwal presentasi project mahasiswa</p>
                </div>
              </div>
              <Button
                variant="flat"
                className="bg-white/20 text-white hover:bg-white/30"
                startContent={<RefreshCw size={18} />}
                onPress={fetchData}
              >
                Refresh
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{projectsReadyForPresentation.length}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Menunggu Jadwal</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{scheduledPresentations.length}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Terjadwal</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{completedPresentations.length}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Selesai</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Card className="border border-default-200 dark:border-default-100">
          <CardBody className="p-0">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              variant="underlined"
              classNames={{
                tabList: "px-4 pt-4 gap-4 border-b border-default-200",
                cursor: "bg-primary",
                tab: "h-10 px-0",
              }}
            >
              <Tab
                key="pending"
                title={
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Menunggu Jadwal</span>
                    {projectsReadyForPresentation.length > 0 && (
                      <Chip size="sm" color="warning" variant="flat">
                        {projectsReadyForPresentation.length}
                      </Chip>
                    )}
                  </div>
                }
              >
                <div className="p-4 space-y-4">
                  {projectsReadyForPresentation.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center">
                        <GraduationCap size={32} className="text-default-400" />
                      </div>
                      <p className="text-default-500">Tidak ada project yang menunggu jadwal presentasi</p>
                    </div>
                  ) : (
                    projectsReadyForPresentation.map((project) => (
                      <Card key={project.id} className="border border-default-200">
                        <CardBody className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Avatar
                                name={project.mahasiswa.name}
                                className="flex-shrink-0"
                              />
                              <div>
                                <h3 className="font-semibold">{project.title}</h3>
                                <p className="text-sm text-default-500">
                                  {project.mahasiswa.name} ({project.mahasiswa.nim || project.mahasiswa.username})
                                </p>
                                {project.members.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-default-400">
                                    <Users size={12} />
                                    <span>{project.members.length + 1} anggota</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Chip
                                color={getStatusColor(project.status)}
                                variant="flat"
                                size="sm"
                              >
                                {getStatusLabel(project.status)}
                              </Chip>
                              <Button
                                color="primary"
                                startContent={<Plus size={16} />}
                                onPress={() => openScheduleModal(project)}
                              >
                                Jadwalkan
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </div>
              </Tab>

              <Tab
                key="scheduled"
                title={
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Terjadwal</span>
                    {scheduledPresentations.length > 0 && (
                      <Chip size="sm" color="primary" variant="flat">
                        {scheduledPresentations.length}
                      </Chip>
                    )}
                  </div>
                }
              >
                <div className="p-4 space-y-4">
                  {scheduledPresentations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center">
                        <Calendar size={32} className="text-default-400" />
                      </div>
                      <p className="text-default-500">Belum ada presentasi yang terjadwal</p>
                    </div>
                  ) : (
                    scheduledPresentations.map((presentation) => (
                      <Card key={presentation.id} className="border border-default-200">
                        <CardBody className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                  <Calendar size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{presentation.project.title}</h3>
                                  <p className="text-sm text-default-500">
                                    {presentation.project.mahasiswa.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="default"
                                  isIconOnly
                                  onPress={() => openEditModal(presentation)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="danger"
                                  isIconOnly
                                  onPress={() => handleDelete(presentation.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-default-400" />
                                <span>{formatDate(presentation.scheduledDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-default-400" />
                                <span>
                                  {presentation.startTime}
                                  {presentation.endTime && ` - ${presentation.endTime}`}
                                </span>
                              </div>
                              {presentation.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} className="text-default-400" />
                                  <span>{presentation.location}</span>
                                </div>
                              )}
                            </div>
                            
                            <Divider />
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={<CheckCircle2 size={16} />}
                                onPress={() => handleMarkCompleted(presentation)}
                              >
                                Tandai Selesai
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </div>
              </Tab>

              <Tab
                key="completed"
                title={
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Selesai</span>
                    {completedPresentations.length > 0 && (
                      <Chip size="sm" color="success" variant="flat">
                        {completedPresentations.length}
                      </Chip>
                    )}
                  </div>
                }
              >
                <div className="p-4 space-y-4">
                  {completedPresentations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-default-400" />
                      </div>
                      <p className="text-default-500">Belum ada presentasi yang selesai</p>
                    </div>
                  ) : (
                    completedPresentations.map((presentation) => (
                      <Card key={presentation.id} className="border border-default-200">
                        <CardBody className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-success/10 text-success">
                                  <CheckCircle2 size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{presentation.project.title}</h3>
                                  <p className="text-sm text-default-500">
                                    {presentation.project.mahasiswa.name}
                                  </p>
                                  <p className="text-xs text-default-400 mt-1">
                                    Presentasi: {formatDate(presentation.scheduledDate)}
                                  </p>
                                </div>
                              </div>
                              <Chip
                                color={getStatusColor(presentation.project.status)}
                                variant="flat"
                              >
                                {getStatusLabel(presentation.project.status)}
                              </Chip>
                            </div>
                            
                            {/* Show finalize buttons if project is still PRESENTATION_SCHEDULED */}
                            {presentation.project.status === 'PRESENTATION_SCHEDULED' && (
                              <>
                                <Divider />
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-default-500 mr-2">Hasil Presentasi:</span>
                                  <Button
                                    size="sm"
                                    color="success"
                                    startContent={<CheckCircle2 size={16} />}
                                    onPress={() => handleFinalizeProject(presentation.project.id, 'APPROVED')}
                                  >
                                    Setujui Project
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    startContent={<XCircle size={16} />}
                                    onPress={() => handleFinalizeProject(presentation.project.id, 'REJECTED')}
                                  >
                                    Tolak Project
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </motion.div>

      {/* Schedule Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>
                {editingPresentation ? 'Edit Jadwal Presentasi' : 'Jadwalkan Presentasi'}
              </span>
            </div>
          </ModalHeader>
          <ModalBody>
            {(selectedProject || editingPresentation) && (
              <div className="space-y-4">
                {/* Project Info */}
                <Card className="border border-default-200 bg-default-50">
                  <CardBody className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={
                          selectedProject?.mahasiswa.name ||
                          editingPresentation?.project.mahasiswa.name
                        }
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {selectedProject?.title || editingPresentation?.project.title}
                        </p>
                        <p className="text-xs text-default-500">
                          {selectedProject?.mahasiswa.name ||
                            editingPresentation?.project.mahasiswa.name}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Tanggal Presentasi"
                    placeholder="Pilih tanggal"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    isRequired
                    startContent={<Calendar size={16} className="text-default-400" />}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      label="Jam Mulai"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      isRequired
                      startContent={<Clock size={16} className="text-default-400" />}
                    />
                    <Input
                      type="time"
                      label="Jam Selesai"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      startContent={<Clock size={16} className="text-default-400" />}
                    />
                  </div>
                </div>

                <Input
                  label="Lokasi / Ruangan"
                  placeholder="Contoh: Ruang Sidang Lt. 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  startContent={<MapPin size={16} className="text-default-400" />}
                />

                <Textarea
                  label="Catatan"
                  placeholder="Catatan tambahan untuk mahasiswa..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  minRows={2}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isSaving}
              startContent={!isSaving && <CheckCircle2 size={16} />}
            >
              {editingPresentation ? 'Simpan Perubahan' : 'Jadwalkan'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
