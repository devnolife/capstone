'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Chip,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Switch,
  Progress,
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  GripVertical,
  Search,
  CheckCircle2,
  XCircle,
  Scale,
  ListOrdered,
} from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface Rubrik {
  id: string;
  name: string;
  description: string | null;
  kategori: string;
  bobotMax: number;
  urutan: number;
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

export default function AdminRubrikPage() {
  const [rubriks, setRubriks] = useState<Rubrik[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRubrik, setSelectedRubrik] = useState<Rubrik | null>(null);
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
    description: '',
    kategori: '',
    bobotMax: 20,
    urutan: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchRubriks();
  }, []);

  const fetchRubriks = async () => {
    try {
      const response = await fetch('/api/rubrik?active=false');
      if (response.ok) {
        const data = await response.json();
        setRubriks(data);
      }
    } catch (error) {
      console.error('Error fetching rubriks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRubrik = async () => {
    if (!formData.name || !formData.kategori || !formData.bobotMax) {
      setError('Nama, kategori, dan bobot maksimal diperlukan');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rubrik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat rubrik');
      }

      await fetchRubriks();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRubrik = async () => {
    if (!selectedRubrik) return;

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rubrik/${selectedRubrik.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal update rubrik');
      }

      await fetchRubriks();
      onEditClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRubrik = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Rubrik',
      message: 'Apakah Anda yakin ingin menghapus rubrik ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/rubrik/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus rubrik');
      }

      await fetchRubriks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const openEditModal = (rubrik: Rubrik) => {
    setSelectedRubrik(rubrik);
    setFormData({
      name: rubrik.name,
      description: rubrik.description || '',
      kategori: rubrik.kategori,
      bobotMax: rubrik.bobotMax,
      urutan: rubrik.urutan,
      isActive: rubrik.isActive,
    });
    onEditOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      kategori: '',
      bobotMax: 20,
      urutan: rubriks.length,
      isActive: true,
    });
    setSelectedRubrik(null);
    setError('');
  };

  // Calculate total bobot
  const totalBobot = rubriks
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.bobotMax, 0);

  // Group by kategori
  const kategoris = [...new Set(rubriks.map((r) => r.kategori))];

  // Filter rubriks
  const filteredRubriks = rubriks.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kategori.toLowerCase().includes(searchQuery.toLowerCase()),
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
      {/* Hero Header - Soft Indigo/Blue */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-cyan-950/40 border border-indigo-200/50 dark:border-indigo-800/30 p-6 md:p-8">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                  Rubrik Penilaian
                </h1>
                <p className="text-indigo-600/70 dark:text-indigo-400/60 text-sm mt-1">
                  Kelola kriteria penilaian untuk review project
                </p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium shadow-lg shadow-indigo-500/25"
              startContent={<Plus size={18} />}
              onPress={() => {
                resetForm();
                onOpen();
              }}
            >
              Tambah Rubrik
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Softer Design */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{rubriks.length}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Rubrik</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {rubriks.filter((r) => r.isActive).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Rubrik Aktif</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30">
                <ListOrdered size={18} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{kategoris.length}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Kategori</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${totalBobot === 100
                  ? 'bg-emerald-50 dark:bg-emerald-900/30'
                  : totalBobot > 100
                    ? 'bg-red-50 dark:bg-red-900/30'
                    : 'bg-amber-50 dark:bg-amber-900/30'
                  }`}
              >
                <Scale size={18} className={
                  totalBobot === 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : totalBobot > 100
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                } />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalBobot === 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : totalBobot > 100
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                  }`}>{totalBobot}/100</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Bobot</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Total Bobot Progress - Softer */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Total Bobot Rubrik Aktif</span>
            <span
              className={`text-sm font-semibold ${totalBobot === 100
                ? 'text-emerald-600'
                : totalBobot > 100
                  ? 'text-red-600'
                  : 'text-amber-600'
                }`}
            >
              {totalBobot}%
            </span>
          </div>
          <Progress
            value={Math.min(totalBobot, 100)}
            classNames={{
              indicator:
                totalBobot === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                  : totalBobot > 100
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500',
              track: 'bg-zinc-200 dark:bg-zinc-700',
            }}
          />
          {totalBobot !== 100 && (
            <p className="text-xs text-zinc-500 mt-2">
              {totalBobot < 100
                ? `Kurang ${100 - totalBobot}% untuk mencapai 100%`
                : `Kelebihan ${totalBobot - 100}% dari total 100%`}
            </p>
          )}
        </div>
      </motion.div>

      {/* Search Card - Softer */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <Input
            placeholder="Cari rubrik berdasarkan nama atau kategori..."
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

      {/* Rubriks List - Softer Container */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-zinc-700/50 bg-slate-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-medium text-slate-700 dark:text-zinc-300">
                Daftar Rubrik Penilaian ({filteredRubriks.length})
              </h2>
            </div>
          </div>

          {filteredRubriks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={64} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500">
                {searchQuery
                  ? 'Rubrik tidak ditemukan'
                  : 'Belum ada rubrik penilaian'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredRubriks.map((rubrik) => (
                  <div key={rubrik.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 text-zinc-400">
                          <GripVertical size={16} className="cursor-grab" />
                          <span className="text-sm font-medium">
                            {rubrik.urutan + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{rubrik.name}</p>
                          {rubrik.description && (
                            <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                              {rubrik.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        className={
                          rubrik.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {rubrik.isActive ? 'Aktif' : 'Nonaktif'}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat">
                        {rubrik.kategori}
                      </Chip>
                      <Chip
                        size="sm"
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                      >
                        Bobot: {rubrik.bobotMax}
                      </Chip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        startContent={<Edit size={14} />}
                        onPress={() => openEditModal(rubrik)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="flex-1"
                        startContent={<Trash2 size={14} />}
                        onPress={() => handleDeleteRubrik(rubrik.id)}
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
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-16">
                        Urutan
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Bobot Max
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
                    {filteredRubriks.map((rubrik) => (
                      <tr
                        key={rubrik.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <GripVertical
                              size={16}
                              className="text-zinc-400 cursor-grab"
                            />
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">
                              {rubrik.urutan + 1}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{rubrik.name}</p>
                            {rubrik.description && (
                              <p className="text-xs text-zinc-500 line-clamp-1 mt-1">
                                {rubrik.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Chip size="sm" variant="flat">
                            {rubrik.kategori}
                          </Chip>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                                style={{ width: `${rubrik.bobotMax}%` }}
                              />
                            </div>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {rubrik.bobotMax}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {rubrik.isActive ? (
                              <>
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-500"
                                />
                                <Chip
                                  size="sm"
                                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                >
                                  Aktif
                                </Chip>
                              </>
                            ) : (
                              <>
                                <XCircle size={16} className="text-zinc-400" />
                                <Chip
                                  size="sm"
                                  className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                >
                                  Nonaktif
                                </Chip>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              onPress={() => openEditModal(rubrik)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => handleDeleteRubrik(rubrik.id)}
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

      {/* Create Rubrik Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
            <div className="p-2 rounded-lg bg-white/20">
              <Plus size={20} />
            </div>
            <span>Tambah Rubrik Baru</span>
          </ModalHeader>
          <ModalBody className="space-y-4 pt-6">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nama Rubrik"
              placeholder="Contoh: Kualitas Kode"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              isRequired
            />
            <Textarea
              label="Deskripsi"
              placeholder="Deskripsi kriteria penilaian..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Input
              label="Kategori"
              placeholder="Contoh: Teknis, Dokumentasi, Presentasi"
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              isRequired
              list="kategori-list"
            />
            <datalist id="kategori-list">
              {kategoris.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Bobot Maksimal"
                placeholder="20"
                value={formData.bobotMax.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bobotMax: parseInt(e.target.value) || 0,
                  })
                }
                isRequired
                min={1}
                max={100}
              />
              <Input
                type="number"
                label="Urutan"
                placeholder="0"
                value={formData.urutan.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urutan: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm font-medium">Status Aktif</span>
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
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
              onPress={handleCreateRubrik}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Rubrik Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
            <div className="p-2 rounded-lg bg-white/20">
              <Edit size={20} />
            </div>
            <span>Edit Rubrik</span>
          </ModalHeader>
          <ModalBody className="space-y-4 pt-6">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nama Rubrik"
              placeholder="Contoh: Kualitas Kode"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              isRequired
            />
            <Textarea
              label="Deskripsi"
              placeholder="Deskripsi kriteria penilaian..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Input
              label="Kategori"
              placeholder="Contoh: Teknis, Dokumentasi, Presentasi"
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              isRequired
              list="kategori-list-edit"
            />
            <datalist id="kategori-list-edit">
              {kategoris.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Bobot Maksimal"
                placeholder="20"
                value={formData.bobotMax.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bobotMax: parseInt(e.target.value) || 0,
                  })
                }
                isRequired
                min={1}
                max={100}
              />
              <Input
                type="number"
                label="Urutan"
                placeholder="0"
                value={formData.urutan.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urutan: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm font-medium">Status Aktif</span>
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
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
              onPress={handleUpdateRubrik}
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
