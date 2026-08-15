'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ListOrdered,
  Users,
  UsersRound,
  Loader2,
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
  tipe: string;
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
  const [activeTab, setActiveTab] = useState<string>('kelompok');

  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const onEditOpen = () => setIsEditOpen(true);
  const onEditClose = () => setIsEditOpen(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    kategori: '',
    bobotMax: 20,
    urutan: 0,
    isActive: true,
    tipe: 'kelompok',
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

    const bobotMax = Number(formData.bobotMax);
    if (Number.isNaN(bobotMax) || bobotMax <= 0) {
      setError('Bobot maksimal harus angka positif');
      return;
    }

    const tipe = formData.tipe;
    const currentTotal = activeRubriks
      .filter((r) => r.tipe === tipe)
      .reduce((sum, r) => sum + r.bobotMax, 0);
    if (formData.isActive && currentTotal + bobotMax > 100) {
      setError(
        `Total bobot ${tipe} akan menjadi ${currentTotal + bobotMax} (maksimal 100). Kurangi bobot atau nonaktifkan rubrik lain.`,
      );
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

    const bobotMax = Number(formData.bobotMax);
    if (Number.isNaN(bobotMax) || bobotMax <= 0) {
      setError('Bobot maksimal harus angka positif');
      return;
    }

    const tipe = formData.tipe;
    const otherTotal = activeRubriks
      .filter((r) => r.tipe === tipe && r.id !== selectedRubrik.id)
      .reduce((sum, r) => sum + r.bobotMax, 0);
    if (formData.isActive && otherTotal + bobotMax > 100) {
      setError(
        `Total bobot ${tipe} akan menjadi ${otherTotal + bobotMax} (maksimal 100). Kurangi bobot atau nonaktifkan rubrik lain.`,
      );
      return;
    }

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
      tipe: rubrik.tipe || 'kelompok',
    });
    onEditOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      kategori: '',
      bobotMax: 20,
      urutan: rubriks.filter((r) => r.tipe === activeTab).length,
      isActive: true,
      tipe: activeTab,
    });
    setSelectedRubrik(null);
    setError('');
  };

  // Calculate total bobot per tipe
  const activeRubriks = rubriks.filter((r) => r.isActive);
  const totalBobotKelompok = activeRubriks
    .filter((r) => r.tipe === 'kelompok')
    .reduce((sum, r) => sum + r.bobotMax, 0);
  const totalBobotIndividu = activeRubriks
    .filter((r) => r.tipe === 'individu')
    .reduce((sum, r) => sum + r.bobotMax, 0);

  // Group by kategori
  const kategoris = [...new Set(rubriks.map((r) => r.kategori))];

  const countKelompok = rubriks.filter((r) => r.tipe === 'kelompok').length;
  const countIndividu = rubriks.filter((r) => r.tipe === 'individu').length;

  // Filter rubriks by active tab and search
  const filteredRubriks = rubriks.filter(
    (r) =>
      r.tipe === activeTab &&
      (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.kategori.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const currentTotalBobot = activeTab === 'kelompok' ? totalBobotKelompok : totalBobotIndividu;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Rubrik Penilaian</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola kriteria penilaian untuk review project
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setFormData((prev) => ({ ...prev, tipe: activeTab }));
              onOpen();
            }}
          >
            <Plus size={16} />
            Tambah Rubrik {activeTab === 'individu' ? 'Individu' : 'Kelompok'}
          </Button>
        </header>
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
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30">
                <UsersRound size={18} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{countKelompok}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Rubrik Kelompok</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30">
                <Users size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{countIndividu}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Rubrik Individu</p>
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
        </div>
      </motion.div>

      {/* Tabs + Content */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as string)}
            className="gap-0"
          >
            <TabsList
              variant="line"
              className="h-auto w-full justify-start rounded-none px-4 pt-3 pb-2 border-b border-slate-200/60 dark:border-zinc-700/50"
            >
              <TabsTrigger value="kelompok" className="h-10 flex-none">
                <UsersRound size={16} />
                <span>Penilaian Kelompok</span>
                <Badge variant="secondary" className={totalBobotKelompok === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
                  {totalBobotKelompok}/100
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="individu" className="h-10 flex-none">
                <Users size={16} />
                <span>Penilaian Individu</span>
                <Badge variant="secondary" className={totalBobotIndividu === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
                  {totalBobotIndividu}/100
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Progress Bar for Active Tab */}
          <div className="px-4 pt-4">
            <div className="rounded-lg border border-slate-200/60 dark:border-zinc-700/50 bg-slate-50/50 dark:bg-zinc-800/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Total Bobot {activeTab === 'kelompok' ? 'Kelompok' : 'Individu'} Aktif
                </span>
                <span
                  className={`text-xs font-semibold ${currentTotalBobot === 100
                    ? 'text-emerald-600'
                    : currentTotalBobot > 100
                      ? 'text-red-600'
                      : 'text-amber-600'
                    }`}
                >
                  {currentTotalBobot}/100
                </span>
              </div>
              <Progress
                value={Math.min(currentTotalBobot, 100)}
                className={`[&_[data-slot=progress-track]]:bg-zinc-200 dark:[&_[data-slot=progress-track]]:bg-zinc-700 ${currentTotalBobot === 100
                  ? '[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-emerald-500 [&_[data-slot=progress-indicator]]:to-green-500'
                  : currentTotalBobot > 100
                    ? '[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-red-500 [&_[data-slot=progress-indicator]]:to-orange-500'
                    : '[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-amber-500 [&_[data-slot=progress-indicator]]:to-yellow-500'
                  }`}
              />
              {currentTotalBobot !== 100 && (
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  {currentTotalBobot < 100
                    ? `Kurang ${100 - currentTotalBobot} poin untuk mencapai 100`
                    : `Kelebihan ${currentTotalBobot - 100} poin dari target 100`}
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pt-3">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <Input
                placeholder={`Cari rubrik ${activeTab === 'kelompok' ? 'kelompok' : 'individu'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 dark:bg-zinc-800"
              />
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
                      <Badge
                        variant="secondary"
                        className={
                          rubrik.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {rubrik.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {rubrik.kategori}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                      >
                        Bobot: {rubrik.bobotMax}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditModal(rubrik)}
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteRubrik(rubrik.id)}
                      >
                        <Trash2 size={14} />
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
                          <Badge variant="secondary">
                            {rubrik.kategori}
                          </Badge>
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
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                >
                                  Aktif
                                </Badge>
                              </>
                            ) : (
                              <>
                                <XCircle size={16} className="text-zinc-400" />
                                <Badge
                                  variant="secondary"
                                  className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                >
                                  Nonaktif
                                </Badge>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="icon-sm"
                              variant="outline"
                              aria-label="Edit rubrik"
                              onClick={() => openEditModal(rubrik)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              aria-label="Hapus rubrik"
                              onClick={() => handleDeleteRubrik(rubrik.id)}
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
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0">
          <DialogHeader className="flex flex-row items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-xl p-4">
            <div className="p-2 rounded-lg bg-white/20">
              <Plus size={20} />
            </div>
            <DialogTitle className="text-white">Tambah Rubrik Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-name">Nama Rubrik</Label>
              <Input
                id="rubrik-name"
                placeholder="Contoh: Kualitas Kode"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-description">Deskripsi</Label>
              <Textarea
                id="rubrik-description"
                placeholder="Deskripsi kriteria penilaian..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-kategori">Kategori</Label>
              <Input
                id="rubrik-kategori"
                placeholder="Contoh: Teknis, Dokumentasi, Presentasi"
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
                required
                list="kategori-list"
              />
            </div>
            <datalist id="kategori-list">
              {kategoris.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-tipe">Tipe Penilaian</Label>
              <Select
                value={formData.tipe}
                onValueChange={(value) => {
                  setFormData({ ...formData, tipe: (value as string) || 'kelompok' });
                }}
              >
                <SelectTrigger id="rubrik-tipe" className="w-full">
                  <SelectValue placeholder="Pilih tipe penilaian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kelompok">
                    <UsersRound size={16} />
                    Kelompok
                  </SelectItem>
                  <SelectItem value="individu">
                    <Users size={16} />
                    Individu
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Kelompok = penilaian untuk project, Individu = penilaian per anggota
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rubrik-bobot">Bobot Maksimal</Label>
                <Input
                  id="rubrik-bobot"
                  type="number"
                  placeholder="20"
                  value={formData.bobotMax.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bobotMax: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min={1}
                  max={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rubrik-urutan">Urutan</Label>
                <Input
                  id="rubrik-urutan"
                  type="number"
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
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm font-medium">Status Aktif</span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
              onClick={handleCreateRubrik}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rubrik Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) onEditClose(); }}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0">
          <DialogHeader className="flex flex-row items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-xl p-4">
            <div className="p-2 rounded-lg bg-white/20">
              <Edit size={20} />
            </div>
            <DialogTitle className="text-white">Edit Rubrik</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-edit-name">Nama Rubrik</Label>
              <Input
                id="rubrik-edit-name"
                placeholder="Contoh: Kualitas Kode"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-edit-description">Deskripsi</Label>
              <Textarea
                id="rubrik-edit-description"
                placeholder="Deskripsi kriteria penilaian..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-edit-kategori">Kategori</Label>
              <Input
                id="rubrik-edit-kategori"
                placeholder="Contoh: Teknis, Dokumentasi, Presentasi"
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
                required
                list="kategori-list-edit"
              />
            </div>
            <datalist id="kategori-list-edit">
              {kategoris.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
            <div className="space-y-1.5">
              <Label htmlFor="rubrik-edit-tipe">Tipe Penilaian</Label>
              <Select
                value={formData.tipe}
                onValueChange={(value) => {
                  setFormData({ ...formData, tipe: (value as string) || 'kelompok' });
                }}
              >
                <SelectTrigger id="rubrik-edit-tipe" className="w-full">
                  <SelectValue placeholder="Pilih tipe penilaian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kelompok">
                    <UsersRound size={16} />
                    Kelompok
                  </SelectItem>
                  <SelectItem value="individu">
                    <Users size={16} />
                    Individu
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Kelompok = penilaian untuk project, Individu = penilaian per anggota
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rubrik-edit-bobot">Bobot Maksimal</Label>
                <Input
                  id="rubrik-edit-bobot"
                  type="number"
                  placeholder="20"
                  value={formData.bobotMax.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bobotMax: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min={1}
                  max={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rubrik-edit-urutan">Urutan</Label>
                <Input
                  id="rubrik-edit-urutan"
                  type="number"
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
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm font-medium">Status Aktif</span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={onEditClose}>
              Batal
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
              onClick={handleUpdateRubrik}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
