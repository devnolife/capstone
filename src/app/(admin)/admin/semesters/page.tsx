'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Switch,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Search,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface Semester {
  id: string;
  name: string;
  tahunAkademik: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

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

export default function AdminSemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null,
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tahunAkademik: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/semesters');
      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSemester = async () => {
    if (
      !formData.name ||
      !formData.tahunAkademik ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError('Semua field diperlukan');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat semester');
      }

      await fetchSemesters();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSemester = async () => {
    if (!selectedSemester) return;

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/semesters/${selectedSemester.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal update semester');
      }

      await fetchSemesters();
      onEditClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSemester = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Semester',
      message: 'Apakah Anda yakin ingin menghapus semester ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/semesters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus semester');
      }

      await fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleSetActive = async (semester: Semester) => {
    try {
      const response = await fetch(`/api/semesters/${semester.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...semester, isActive: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengaktifkan semester');
      }

      await fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const openEditModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name,
      tahunAkademik: semester.tahunAkademik,
      startDate: semester.startDate.split('T')[0],
      endDate: semester.endDate.split('T')[0],
      isActive: semester.isActive,
    });
    onEditOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tahunAkademik: '',
      startDate: '',
      endDate: '',
      isActive: false,
    });
    setSelectedSemester(null);
    setError('');
  };

  // Get current year for suggestions
  const currentYear = new Date().getFullYear();
  const tahunAkademikOptions = [
    `${currentYear}/${currentYear + 1}`,
    `${currentYear - 1}/${currentYear}`,
    `${currentYear + 1}/${currentYear + 2}`,
  ];

  const activeSemester = semesters.find((s) => s.isActive);
  const filteredSemesters = semesters.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tahunAkademik.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header - Soft Emerald/Teal */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-800/30 p-6 md:p-8">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/15 to-emerald-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <Calendar size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                  Manajemen Semester
                </h1>
                <p className="text-emerald-600/70 dark:text-emerald-400/60 text-sm mt-1">
                  Kelola periode semester untuk pengumpulan project
                </p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25"
              startContent={<Plus size={18} />}
              onPress={() => {
                resetForm();
                onOpen();
              }}
            >
              Tambah Semester
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Active Semester Card - Softer */}
      {activeSemester && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 p-5">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-400/15 blur-xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Semester Aktif
                    </p>
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                    {activeSemester.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-zinc-400">
                    <Clock size={14} />
                    <span>
                      {formatDate(activeSemester.startDate)} -{' '}
                      {formatDate(activeSemester.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              <Chip
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-4"
              >
                {activeSemester.tahunAkademik}
              </Chip>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards - Softer Design */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{semesters.length}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Semester</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                <CalendarCheck size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {semesters.filter((s) => s.isActive).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Aktif</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <CalendarClock size={18} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {semesters.filter((s) => !s.isActive).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Tidak Aktif</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30">
                <GraduationCap size={18} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {[...new Set(semesters.map((s) => s.tahunAkademik))].length}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Tahun Akademik</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Card - Softer */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <Input
            placeholder="Cari semester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-slate-400 dark:text-zinc-500" />}
            classNames={{
              inputWrapper:
                'bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/50',
            }}
          />
        </div>
      </motion.div>

      {/* Semesters List - Softer Container */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-zinc-700/50 bg-slate-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="font-medium text-slate-700 dark:text-zinc-300">
                Daftar Semester ({filteredSemesters.length})
              </h2>
            </div>
          </div>

          {filteredSemesters.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500">
                {searchQuery ? 'Semester tidak ditemukan' : 'Belum ada semester'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredSemesters.map((semester) => (
                  <div key={semester.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${semester.isActive
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800'
                            }`}
                        >
                          <GraduationCap
                            size={18}
                            className={
                              semester.isActive ? '' : 'text-zinc-500'
                            }
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{semester.name}</p>
                          <p className="text-sm text-zinc-500">
                            {semester.tahunAkademik}
                          </p>
                        </div>
                      </div>
                      {semester.isActive ? (
                        <Chip
                          size="sm"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        >
                          Aktif
                        </Chip>
                      ) : (
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => handleSetActive(semester)}
                        >
                          Set Aktif
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Clock size={14} />
                      <span>
                        {formatDate(semester.startDate)} -{' '}
                        {formatDate(semester.endDate)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        startContent={<Edit size={14} />}
                        onPress={() => openEditModal(semester)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="flex-1"
                        startContent={<Trash2 size={14} />}
                        onPress={() => handleDeleteSemester(semester.id)}
                        isDisabled={semester.isActive}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Nama Semester
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Tahun Akademik
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Periode
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredSemesters.map((semester) => (
                      <tr
                        key={semester.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${semester.isActive
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                                  : 'bg-zinc-100 dark:bg-zinc-800'
                                }`}
                            >
                              <GraduationCap
                                size={18}
                                className={
                                  semester.isActive ? '' : 'text-zinc-500'
                                }
                              />
                            </div>
                            <span className="font-medium">{semester.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Chip size="sm" variant="flat">
                            {semester.tahunAkademik}
                          </Chip>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <Clock size={14} />
                            <span>
                              {formatDate(semester.startDate)} -{' '}
                              {formatDate(semester.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {semester.isActive ? (
                            <Chip
                              size="sm"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            >
                              Aktif
                            </Chip>
                          ) : (
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              onPress={() => handleSetActive(semester)}
                            >
                              Set Aktif
                            </Button>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              onPress={() => openEditModal(semester)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => handleDeleteSemester(semester.id)}
                              isDisabled={semester.isActive}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Create Semester Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <div className="p-2 rounded-lg bg-white/20">
              <Plus size={20} />
            </div>
            <span>Tambah Semester Baru</span>
          </ModalHeader>
          <ModalBody className="space-y-4 pt-6">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nama Semester"
              placeholder="Contoh: Ganjil 2024/2025"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              isRequired
            />
            <Input
              label="Tahun Akademik"
              placeholder="Contoh: 2024/2025"
              value={formData.tahunAkademik}
              onChange={(e) =>
                setFormData({ ...formData, tahunAkademik: e.target.value })
              }
              isRequired
              list="tahun-akademik-list"
            />
            <datalist id="tahun-akademik-list">
              {tahunAkademikOptions.map((ta) => (
                <option key={ta} value={ta} />
              ))}
            </datalist>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Tanggal Mulai"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                isRequired
              />
              <Input
                type="date"
                label="Tanggal Selesai"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                isRequired
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm font-medium">
                Set sebagai Semester Aktif
              </span>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Batal
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
              onPress={handleCreateSemester}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Semester Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <div className="p-2 rounded-lg bg-white/20">
              <Edit size={20} />
            </div>
            <span>Edit Semester</span>
          </ModalHeader>
          <ModalBody className="space-y-4 pt-6">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nama Semester"
              placeholder="Contoh: Ganjil 2024/2025"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              isRequired
            />
            <Input
              label="Tahun Akademik"
              placeholder="Contoh: 2024/2025"
              value={formData.tahunAkademik}
              onChange={(e) =>
                setFormData({ ...formData, tahunAkademik: e.target.value })
              }
              isRequired
              list="tahun-akademik-list-edit"
            />
            <datalist id="tahun-akademik-list-edit">
              {tahunAkademikOptions.map((ta) => (
                <option key={ta} value={ta} />
              ))}
            </datalist>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Tanggal Mulai"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                isRequired
              />
              <Input
                type="date"
                label="Tanggal Selesai"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                isRequired
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm font-medium">Semester Aktif</span>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onEditClose}>
              Batal
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
              onPress={handleUpdateSemester}
              isLoading={isSubmitting}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
