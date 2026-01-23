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
    if (!confirm('Apakah Anda yakin ingin menghapus semester ini?')) return;

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
      alert(err instanceof Error ? err.message : 'Error');
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
      alert(err instanceof Error ? err.message : 'Error');
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
      {/* Hero Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-6 md:p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Calendar size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Manajemen Semester
                </h1>
                <p className="text-white/80 mt-1">
                  Kelola periode semester untuk pengumpulan project
                </p>
              </div>
            </div>
            <Button
              className="bg-white text-emerald-600 font-semibold shadow-lg"
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

      {/* Active Semester Card */}
      {activeSemester && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                  <CalendarCheck size={28} />
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
                  <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
                    {activeSemester.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{semesters.length}</p>
                <p className="text-xs text-zinc-500">Total Semester</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-teal-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white">
                <CalendarCheck size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {semesters.filter((s) => s.isActive).length}
                </p>
                <p className="text-xs text-zinc-500">Aktif</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                <CalendarClock size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {semesters.filter((s) => !s.isActive).length}
                </p>
                <p className="text-xs text-zinc-500">Tidak Aktif</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {[...new Set(semesters.map((s) => s.tahunAkademik))].length}
                </p>
                <p className="text-xs text-zinc-500">Tahun Akademik</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Card */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
          <Input
            placeholder="Cari semester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-zinc-400" />}
            classNames={{
              inputWrapper:
                'bg-zinc-100 dark:bg-zinc-800 border-none shadow-none',
            }}
          />
        </div>
      </motion.div>

      {/* Semesters List */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">
              Daftar Semester ({filteredSemesters.length})
            </h2>
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
                          className={`p-2 rounded-lg ${
                            semester.isActive
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
                              className={`p-2 rounded-lg ${
                                semester.isActive
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
    </motion.div>
  );
}
