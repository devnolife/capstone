'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Search, UserPlus, Edit, Trash2, Users, Shield, GraduationCap, UserCog, RefreshCw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { formatDate, getInitials, getRoleLabel } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

const roleToneClass: Record<User['role'], string> = {
  ADMIN: 'bg-destructive/10 text-destructive',
  DOSEN_PENGUJI: 'bg-secondary text-secondary-foreground',
  MAHASISWA: 'bg-primary/10 text-primary',
};

const activeToneClass = (isActive: boolean) =>
  isActive
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-muted text-muted-foreground';

function PaginationControls({
  page,
  total,
  onChange,
  size = 'default',
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
  size?: 'sm' | 'default';
}) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const buttonSize = size === 'sm' ? 'icon-sm' : 'icon';
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <Button
        size={buttonSize}
        variant="outline"
        aria-label="Halaman sebelumnya"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size={buttonSize}
          variant={p === page ? 'default' : 'outline'}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        size={buttonSize}
        variant="outline"
        aria-label="Halaman berikutnya"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}

interface User {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  nim?: string | null;
  nip?: string | null;
  prodi?: string | null;
  role: 'MAHASISWA' | 'DOSEN_PENGUJI' | 'ADMIN';
  image: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    projects: number;
    reviews: number;
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Mobile User Card Component - Clean Design
function MobileUserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="p-4 rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 mb-3 hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-2 ring-slate-200/60 dark:ring-zinc-700/50">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user.username}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={`h-5 text-[10px] ${roleToneClass[user.role]}`}
            >
              {getRoleLabel(user.role)}
            </Badge>
            <Badge
              variant="secondary"
              className={`h-5 text-[10px] ${activeToneClass(user.isActive)}`}
            >
              {user.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>

          {/* Info Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Username: {user.username}</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8"
              onClick={() => onEdit(user)}
            >
              <Edit size={14} />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 h-8"
              onClick={() => onDelete(user.id)}
            >
              <Trash2 size={14} />
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Spinner className="size-8" /></div>}>
      <AdminUsersPageInner />
    </Suspense>
  );
}

function AdminUsersPageInner() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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
    username: '',
    password: '',
    role: 'MAHASISWA',
    isActive: true,
  });

  // SIMAK sync state
  const [syncMode, setSyncMode] = useState(false);
  const [simakLoading, setSimakLoading] = useState(false);
  const [simakData, setSimakData] = useState<{
    nim: string;
    nama: string;
    email: string | null;
    phone: string | null;
    prodi: string | null;
    foto: string | null;
  } | null>(null);
  const [simakError, setSimakError] = useState('');

  // Edit sync state
  const [editSyncMode, setEditSyncMode] = useState(false);
  const [editSimakLoading, setEditSimakLoading] = useState(false);
  const [editSimakData, setEditSimakData] = useState<{
    nim: string;
    nama: string;
    email: string | null;
    phone: string | null;
    prodi: string | null;
    foto: string | null;
  } | null>(null);
  const [editSimakError, setEditSimakError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  // React to ?action=add and ?id=... from dashboard quick links
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const initialSearch = searchParams.get('q') || searchParams.get('search');
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
    if (action === 'add') {
      onOpen();
      // strip param from URL so refreshing doesn't reopen
      router.replace('/admin/users', { scroll: false });
      return;
    }
    if (id && users.length > 0) {
      const target = users.find((u) => u.id === id);
      if (target) {
        openEditModal(target);
        router.replace('/admin/users', { scroll: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, users.length]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setError('');
    try {
      // If sync mode and SIMAK data is available, use sync-simak endpoint
      if (syncMode && simakData) {
        const response = await fetch('/api/users/sync-simak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nim: simakData.nim,
            password: formData.password,
            isActive: formData.isActive,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal membuat user dari SIMAK');
        }

        await fetchUsers();
        onClose();
        resetForm();
        return;
      }

      // Normal user creation
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat user');
      }

      await fetchUsers();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  // Fetch data from SIMAK
  const handleFetchSimak = async () => {
    if (!formData.username) {
      setSimakError('Masukkan NIM terlebih dahulu');
      return;
    }

    setSimakLoading(true);
    setSimakError('');
    setSimakData(null);

    try {
      const response = await fetch(`/api/users/sync-simak?nim=${formData.username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data dari SIMAK');
      }

      setSimakData(data.data);
      // Auto-fill name from SIMAK
      setFormData(prev => ({
        ...prev,
        name: data.data.nama,
        role: 'MAHASISWA',
      }));
    } catch (err) {
      setSimakError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSimakLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setError('');

    try {
      // If edit sync mode and SIMAK data is available, include SIMAK data
      if (editSyncMode && editSimakData) {
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            syncSimak: true,
            simakData: editSimakData,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal update user dari SIMAK');
        }

        await fetchUsers();
        onEditClose();
        resetForm();
        return;
      }

      // Normal update
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal update user');
      }

      await fetchUsers();
      onEditClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  // Fetch data from SIMAK for edit mode
  const handleFetchSimakForEdit = async () => {
    if (!formData.username) {
      setEditSimakError('NIM diperlukan untuk sinkronisasi');
      return;
    }

    setEditSimakLoading(true);
    setEditSimakError('');
    setEditSimakData(null);

    try {
      // Use different endpoint that allows existing user
      const response = await fetch(`/api/users/sync-simak/preview?nim=${formData.username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data dari SIMAK');
      }

      setEditSimakData(data.data);
      // Auto-fill name from SIMAK
      setFormData(prev => ({
        ...prev,
        name: data.data.nama,
      }));
    } catch (err) {
      setEditSimakError(err instanceof Error ? err.message : 'Error');
    } finally {
      setEditSimakLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Hapus User',
      message: 'Apakah Anda yakin ingin menghapus user ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus user');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    // Reset edit sync state
    setEditSyncMode(false);
    setEditSimakData(null);
    setEditSimakError('');
    onEditOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'MAHASISWA',
      isActive: true,
    });
    setSelectedUser(null);
    setError('');
    setSyncMode(false);
    setSimakData(null);
    setSimakError('');
    setEditSyncMode(false);
    setEditSimakData(null);
    setEditSimakError('');
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      (user.email?.toLowerCase().includes(q) ?? false) ||
      (user.nim?.toLowerCase().includes(q) ?? false) ||
      (user.nip?.toLowerCase().includes(q) ?? false) ||
      (user.prodi?.toLowerCase().includes(q) ?? false);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // Stats
  const stats = {
    total: users.length,
    mahasiswa: users.filter((u) => u.role === 'MAHASISWA').length,
    dosen: users.filter((u) => u.role === 'DOSEN_PENGUJI').length,
    admin: users.filter((u) => u.role === 'ADMIN').length,
    active: users.filter((u) => u.isActive).length,
  };

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
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manajemen User</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola mahasiswa, dosen, dan admin
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            onOpen();
          }}
        >
          <UserPlus size={16} />
          Tambah User
        </Button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, cls: 'bg-muted text-foreground' },
          { label: 'Mahasiswa', value: stats.mahasiswa, icon: GraduationCap, cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' },
          { label: 'Dosen', value: stats.dosen, icon: UserCog, cls: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300' },
          { label: 'Admin', value: stats.admin, icon: Shield, cls: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300' },
          { label: 'Aktif', value: stats.active, icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl border bg-card p-3.5"
            >
              <div className={`p-2 rounded-lg ${s.cls}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground tabular-nums leading-tight">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email, NIM/NIP, prodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Bersihkan pencarian"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </Button>
          )}
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            if (typeof value === 'string') setRoleFilter(value);
          }}
        >
          <SelectTrigger aria-label="Filter role" className="w-full md:w-48">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
            <SelectItem value="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Users List */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Daftar User
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredUsers.length} hasil
            </span>
          </div>
          <div className="p-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex p-3 rounded-full bg-muted mb-3">
                  <Users size={32} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tidak ada user ditemukan
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden">
                  <motion.div variants={containerVariants}>
                    {paginatedUsers.map((user) => (
                      <MobileUserCard
                        key={user.id}
                        user={user}
                        onEdit={openEditModal}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </motion.div>
                  {/* Mobile Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <PaginationControls
                        total={totalPages}
                        page={currentPage}
                        onChange={setCurrentPage}
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table aria-label="Users table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>USER</TableHead>
                        <TableHead>ROLE</TableHead>
                        <TableHead>NIM/USERNAME</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>TANGGAL DAFTAR</TableHead>
                        <TableHead>AKSI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                                <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {user.username}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={roleToneClass[user.role]}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={activeToneClass(user.isActive)}>
                              {user.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon-sm"
                                variant="outline"
                                aria-label="Edit user"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="destructive"
                                aria-label="Hapus user"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Desktop Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Menampilkan {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredUsers.length)} dari {filteredUsers.length} user
                      </span>
                      <PaginationControls
                        total={totalPages}
                        page={currentPage}
                        onChange={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create User Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-3xl p-0 gap-0">
          {/* Gradient Header */}
          <div className="relative overflow-hidden rounded-t-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>
            <DialogHeader className="relative flex flex-row items-center gap-4 py-6 px-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <UserPlus size={24} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Tambah User Baru</DialogTitle>
                <p className="text-sm text-white/70">Buat akun pengguna baru atau sinkronkan dari SIMAK</p>
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/30"
              >
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
              </motion.div>
            )}

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSyncMode(false);
                  setSimakData(null);
                  setSimakError('');
                }}
                className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 text-left ${!syncMode
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
              >
                {!syncMode && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 rounded-full bg-blue-500">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                )}
                <div className={`p-2.5 rounded-xl w-fit mb-3 ${!syncMode ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'}`}>
                  <Edit size={20} />
                </div>
                <h3 className={`font-semibold ${!syncMode ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-zinc-300'}`}>
                  Input Manual
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Isi data user secara manual
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSyncMode(true)}
                className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 text-left ${syncMode
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
              >
                {syncMode && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 rounded-full bg-emerald-500">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                )}
                <div className={`p-2.5 rounded-xl w-fit mb-3 ${syncMode ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'}`}>
                  <RefreshCw size={20} />
                </div>
                <h3 className={`font-semibold ${syncMode ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-zinc-300'}`}>
                  Sinkron SIMAK
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Ambil data otomatis dari SIMAK
                </p>
              </motion.button>
            </div>

            {syncMode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* NIM Search */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-20 blur" />
                  <div className="relative p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Search size={14} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Cari Data Mahasiswa</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <GraduationCap size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="Masukkan NIM mahasiswa..."
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                          }
                          className="pl-10 h-11 bg-slate-50 dark:bg-zinc-900"
                        />
                      </div>
                      <Button
                        size="lg"
                        disabled={simakLoading}
                        onClick={handleFetchSimak}
                        className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                      >
                        {simakLoading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                        <span className="ml-1">Cari</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {simakError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-800/30"
                  >
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300 text-sm">{simakError}</p>
                      <p className="text-xs text-red-500/70 mt-0.5">Pastikan NIM valid dan terdaftar di SIMAK</p>
                    </div>
                  </motion.div>
                )}

                {simakData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl opacity-30 blur" />
                    <div className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                          <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-800 dark:text-emerald-200">Data Ditemukan!</h4>
                          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">Data mahasiswa berhasil diambil dari SIMAK</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Nama Lengkap</p>
                          <p className="font-semibold text-slate-800 dark:text-white">{simakData.nama}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">NIM</p>
                          <p className="font-semibold text-slate-800 dark:text-white font-mono">{simakData.nim}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Program Studi</p>
                          <p className="font-semibold text-slate-800 dark:text-white">{simakData.prodi || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Email</p>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{simakData.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Password Field */}
                <div className="relative">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Shield size={14} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Password Login</span>
                    </div>
                    <Input
                      placeholder="Buat password untuk user ini..."
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-11 bg-white dark:bg-zinc-900"
                    />
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Password ini berbeda dengan password SIMAK
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="user-name">Nama Lengkap</Label>
                  <Input
                    id="user-name"
                    placeholder="Masukkan nama lengkap..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="h-11 bg-slate-50 dark:bg-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="user-username">Username (NIM/Username)</Label>
                  <Input
                    id="user-username"
                    placeholder="NIM untuk Mahasiswa atau username untuk lainnya"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className="h-11 bg-slate-50 dark:bg-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="user-password">Password</Label>
                  <Input
                    id="user-password"
                    placeholder="Buat password..."
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="h-11 bg-slate-50 dark:bg-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="user-role">Role Pengguna</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => {
                      if (typeof value === 'string') setFormData({ ...formData, role: value });
                    }}
                  >
                    <SelectTrigger id="user-role" className="w-full h-11 bg-slate-50 dark:bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAHASISWA">
                        <GraduationCap size={16} className="text-blue-500" />
                        Mahasiswa
                      </SelectItem>
                      <SelectItem value="DOSEN_PENGUJI">
                        <UserCog size={16} className="text-violet-500" />
                        Dosen Penguji
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <Shield size={16} className="text-rose-500" />
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl">
            <Button
              variant="outline"
              onClick={onClose}
              className="font-medium"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={syncMode && !simakData}
              className={`font-semibold shadow-lg ${syncMode
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/25'
                }`}
            >
              {syncMode ? <RefreshCw size={18} /> : <UserPlus size={18} />}
              {syncMode ? 'Buat dari SIMAK' : 'Buat User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) onEditClose(); }}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0">
          <DialogHeader className="flex flex-row items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-xl p-4">
            <div className="p-2 rounded-xl bg-white/20">
              <Edit size={20} />
            </div>
            <div>
              <DialogTitle className="text-white">Edit User</DialogTitle>
              <p className="text-xs text-white/70 font-normal">Perbarui informasi pengguna</p>
            </div>
          </DialogHeader>

          <div className="space-y-4 p-6">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* User Info */}
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                <Avatar className="size-10">
                  {selectedUser.image ? <AvatarImage src={selectedUser.image} alt={selectedUser.name} /> : null}
                  <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.username}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`ml-auto ${roleToneClass[selectedUser.role]}`}
                >
                  {getRoleLabel(selectedUser.role)}
                </Badge>
              </div>
            )}

            {/* SIMAK Sync - Only for Mahasiswa */}
            {formData.role === 'MAHASISWA' && (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Sinkronisasi SIMAK</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={editSimakLoading}
                    onClick={handleFetchSimakForEdit}
                  >
                    {editSimakLoading ? <Loader2 className="animate-spin" /> : <RefreshCw size={14} />}
                    Ambil Data
                  </Button>
                </div>

                {editSimakError && (
                  <div className="text-sm text-destructive flex items-center gap-2 mt-2">
                    <AlertCircle size={14} />
                    {editSimakError}
                  </div>
                )}

                {editSimakData && (
                  <div className="mt-3 p-3 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Data Ditemukan</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Nama:</span>
                        <p className="font-medium text-slate-800 dark:text-white">{editSimakData.nama}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Prodi:</span>
                        <p className="font-medium text-slate-800 dark:text-white">{editSimakData.prodi || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-1.5">
              <Label htmlFor="user-edit-name">Nama Lengkap</Label>
              <Input
                id="user-edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={editSimakData !== null}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-edit-username">Username (NIM/Username)</Label>
              <Input
                id="user-edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-edit-password">Password Baru</Label>
              <Input
                id="user-edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Kosongkan jika tidak ingin mengubah</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => {
                  if (typeof value === 'string') setFormData({ ...formData, role: value });
                }}
              >
                <SelectTrigger id="user-edit-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
                  <SelectItem value="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
              <span className="text-sm text-foreground">Status Aktif</span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(value) => setFormData({ ...formData, isActive: value })}
              />
            </div>
          </div>

          <DialogFooter className="border-t p-6 pt-4">
            <Button variant="outline" onClick={onEditClose}>
              Batal
            </Button>
            <Button onClick={handleUpdateUser}>
              {editSimakData ? <RefreshCw size={16} /> : <Edit size={16} />}
              {editSimakData ? 'Update dari SIMAK' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
