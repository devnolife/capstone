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
  Switch,
  Pagination,
} from '@heroui/react';
import { Search, UserPlus, Edit, Trash2, Users, ChevronRight, Shield, GraduationCap, UserCog, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate, getRoleLabel } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface User {
  id: string;
  name: string;
  username: string;
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
            <Avatar
              name={user.name}
              src={user.image || undefined}
              size="md"
              className="ring-2 ring-slate-200/60 dark:ring-zinc-700/50"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user.username}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Chip
              size="sm"
              color={
                user.role === 'ADMIN'
                  ? 'danger'
                  : user.role === 'DOSEN_PENGUJI'
                    ? 'secondary'
                    : 'primary'
              }
              variant="flat"
              className="h-5 text-[10px]"
            >
              {getRoleLabel(user.role)}
            </Chip>
            <Chip
              size="sm"
              color={user.isActive ? 'success' : 'default'}
              variant="flat"
              className="h-5 text-[10px]"
            >
              {user.isActive ? 'Aktif' : 'Nonaktif'}
            </Chip>
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
              variant="flat"
              className="flex-1 h-8"
              startContent={<Edit size={14} />}
              onPress={() => onEdit(user)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              className="flex-1 h-8"
              startContent={<Trash2 size={14} />}
              onPress={() => onDelete(user.id)}
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

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
      {/* Hero Header - Soft Blue/Cyan */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-sky-950/40 border border-blue-200/50 dark:border-blue-800/30 p-6 md:p-8">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-400/15 to-blue-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Manajemen User</h1>
                <p className="text-blue-600/70 dark:text-blue-400/60 text-sm mt-1">Kelola semua user dalam sistem</p>
              </div>
            </div>

            <Button
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
              startContent={<UserPlus size={18} />}
              onPress={() => {
                resetForm();
                onOpen();
              }}
            >
              Tambah User
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Clean Design */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <Users size={18} className="text-slate-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total User</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <GraduationCap size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.mahasiswa}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Mahasiswa</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30">
                <UserCog size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.dosen}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Dosen</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30">
                <Shield size={18} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.admin}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Admin</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">User Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters - Clean Design */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
              <Search size={14} className="text-slate-600 dark:text-zinc-400" />
            </div>
            <h3 className="font-medium text-sm text-slate-700 dark:text-zinc-300">Filter & Pencarian</h3>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Input
              placeholder="Cari nama, email, NIM/Username..."
              startContent={<Search size={18} className="text-slate-400 dark:text-zinc-500" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              size="sm"
              classNames={{
                inputWrapper: 'h-10 bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/50 hover:bg-slate-100 dark:hover:bg-zinc-700/50',
              }}
            />
            <Select
              placeholder="Filter Role"
              selectedKeys={[roleFilter]}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:max-w-[200px]"
              size="sm"
            >
              <SelectItem key="all">Semua Role</SelectItem>
              <SelectItem key="MAHASISWA">Mahasiswa</SelectItem>
              <SelectItem key="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
              <SelectItem key="ADMIN">Admin</SelectItem>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Users List - Clean Container */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-zinc-700/50 bg-slate-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <Users size={14} className="text-slate-600 dark:text-zinc-400" />
              </div>
              <h2 className="font-medium text-slate-700 dark:text-zinc-300">
                Daftar User ({filteredUsers.length})
              </h2>
            </div>
          </div>
          <div className="p-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <Users size={48} className="text-zinc-400" />
                </div>
                <p className="text-zinc-500">
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
                      <Pagination
                        total={totalPages}
                        page={currentPage}
                        onChange={setCurrentPage}
                        size="sm"
                        showControls
                      />
                    </div>
                  )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table aria-label="Users table" removeWrapper>
                    <TableHeader>
                      <TableColumn>USER</TableColumn>
                      <TableColumn>ROLE</TableColumn>
                      <TableColumn>NIM/USERNAME</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>TANGGAL DAFTAR</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={user.name}
                                src={user.image || undefined}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-zinc-500">
                                  {user.username}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={
                                user.role === 'ADMIN'
                                  ? 'danger'
                                  : user.role === 'DOSEN_PENGUJI'
                                    ? 'secondary'
                                    : 'primary'
                              }
                              variant="flat"
                            >
                              {getRoleLabel(user.role)}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={user.isActive ? 'success' : 'default'}
                              variant="flat"
                            >
                              {user.isActive ? 'Aktif' : 'Nonaktif'}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-zinc-500 text-sm">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={() => openEditModal(user)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="danger"
                                onPress={() => handleDeleteUser(user.id)}
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
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/60 dark:border-zinc-700/50">
                      <span className="text-sm text-slate-500 dark:text-zinc-400">
                        Menampilkan {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredUsers.length)} dari {filteredUsers.length} user
                      </span>
                      <Pagination
                        total={totalPages}
                        page={currentPage}
                        onChange={setCurrentPage}
                        showControls
                        color="primary"
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: 'bg-gradient-to-br from-blue-900/20 via-black/50 to-cyan-900/20 backdrop-blur-md',
          base: 'border-0 bg-white dark:bg-zinc-900 shadow-2xl',
          header: 'border-b-0',
          body: 'p-0',
          footer: 'border-t-0',
        }}
      >
        <ModalContent>
          {/* Gradient Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>
            <ModalHeader className="relative flex items-center gap-4 py-6 px-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <UserPlus size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tambah User Baru</h2>
                <p className="text-sm text-white/70">Buat akun pengguna baru atau sinkronkan dari SIMAK</p>
              </div>
            </ModalHeader>
          </div>

          <ModalBody className="px-6 py-5 space-y-5">
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
                      <Input
                        placeholder="Masukkan NIM mahasiswa..."
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="flex-1"
                        size="lg"
                        classNames={{
                          inputWrapper: 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700',
                        }}
                        startContent={
                          <GraduationCap size={18} className="text-slate-400" />
                        }
                      />
                      <Button
                        color="success"
                        size="lg"
                        isLoading={simakLoading}
                        onPress={handleFetchSimak}
                        className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25"
                      >
                        {!simakLoading && <Search size={18} />}
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
                      size="lg"
                      classNames={{
                        inputWrapper: 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700',
                      }}
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
                <Input
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                  size="lg"
                  classNames={{
                    inputWrapper: 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
                  }}
                />
                <Input
                  label="Username (NIM/Username)"
                  placeholder="NIM untuk Mahasiswa atau username untuk lainnya"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  isRequired
                  size="lg"
                  classNames={{
                    inputWrapper: 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
                  }}
                />
                <Input
                  label="Password"
                  placeholder="Buat password..."
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  isRequired
                  size="lg"
                  classNames={{
                    inputWrapper: 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
                  }}
                />
                <Select
                  label="Role Pengguna"
                  selectedKeys={[formData.role]}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  isRequired
                  size="lg"
                  classNames={{
                    trigger: 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
                  }}
                >
                  <SelectItem key="MAHASISWA" startContent={<GraduationCap size={16} className="text-blue-500" />}>
                    Mahasiswa
                  </SelectItem>
                  <SelectItem key="DOSEN_PENGUJI" startContent={<UserCog size={16} className="text-violet-500" />}>
                    Dosen Penguji
                  </SelectItem>
                  <SelectItem key="ADMIN" startContent={<Shield size={16} className="text-rose-500" />}>
                    Admin
                  </SelectItem>
                </Select>
              </motion.div>
            )}
          </ModalBody>

          <ModalFooter className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50">
            <Button
              variant="flat"
              onPress={onClose}
              className="font-medium"
            >
              Batal
            </Button>
            <Button
              onPress={handleCreateUser}
              isDisabled={syncMode && !simakData}
              className={`font-semibold shadow-lg ${syncMode
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/25'
                }`}
              startContent={syncMode ? <RefreshCw size={18} /> : <UserPlus size={18} />}
            >
              {syncMode ? 'Buat dari SIMAK' : 'Buat User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          backdrop: 'bg-black/50 backdrop-blur-sm',
          base: 'border border-slate-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-900',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 border-b border-slate-200/60 dark:border-zinc-700/50 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
            <div className="p-2 rounded-xl bg-white/20">
              <Edit size={20} />
            </div>
            <div>
              <span className="font-semibold">Edit User</span>
              <p className="text-xs text-white/70 font-normal">Perbarui informasi pengguna</p>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4 py-5">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* User Info */}
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50">
                <Avatar
                  name={selectedUser.name}
                  src={selectedUser.image || undefined}
                  size="md"
                />
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedUser.name}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedUser.username}</p>
                </div>
                <Chip
                  size="sm"
                  color={selectedUser.role === 'ADMIN' ? 'danger' : selectedUser.role === 'DOSEN_PENGUJI' ? 'secondary' : 'primary'}
                  variant="flat"
                  className="ml-auto"
                >
                  {getRoleLabel(selectedUser.role)}
                </Chip>
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
                    color="success"
                    variant="flat"
                    isLoading={editSimakLoading}
                    onPress={handleFetchSimakForEdit}
                    startContent={!editSimakLoading && <RefreshCw size={14} />}
                  >
                    Ambil Data
                  </Button>
                </div>

                {editSimakError && (
                  <div className="text-sm text-danger flex items-center gap-2 mt-2">
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
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              isRequired
              isDisabled={editSimakData !== null}
            />

            <Input
              label="Username (NIM/Username)"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              isRequired
            />

            <Input
              label="Password Baru"
              description="Kosongkan jika tidak ingin mengubah"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Select
              label="Role"
              selectedKeys={[formData.role]}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              isRequired
            >
              <SelectItem key="MAHASISWA">Mahasiswa</SelectItem>
              <SelectItem key="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
              <SelectItem key="ADMIN">Admin</SelectItem>
            </Select>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/40 dark:border-zinc-700/30">
              <span className="text-sm text-slate-700 dark:text-zinc-300">Status Aktif</span>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                color="success"
              />
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-slate-200/60 dark:border-zinc-700/50">
            <Button variant="flat" onPress={onEditClose}>
              Batal
            </Button>
            <Button
              color={editSimakData ? "success" : "warning"}
              onPress={handleUpdateUser}
              startContent={editSimakData ? <RefreshCw size={16} /> : <Edit size={16} />}
            >
              {editSimakData ? 'Update dari SIMAK' : 'Update'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </motion.div>
  );
}
