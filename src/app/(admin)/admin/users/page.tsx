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
} from '@heroui/react';
import { Search, UserPlus, Edit, Trash2, Users, ChevronRight, Shield, GraduationCap, UserCog } from 'lucide-react';
import { formatDate, getRoleLabel } from '@/lib/utils';

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

// Mobile User Card Component
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
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mb-3">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar
              name={user.name}
              src={user.image || undefined}
              size="md"
              className="ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.username}</p>
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
          <div className="flex items-center justify-between text-xs text-zinc-500">
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'MAHASISWA',
    isActive: true,
  });

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

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setError('');

    try {
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

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
      alert(err instanceof Error ? err.message : 'Error');
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
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
      {/* Hero Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 md:p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="users-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#users-grid)" />
            </svg>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Manajemen User</h1>
                <p className="text-white/70 text-sm mt-1">Kelola semua user dalam sistem</p>
              </div>
            </div>
            
            <Button
              color="default"
              className="bg-white text-blue-600 font-medium"
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

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-400 to-zinc-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-500 text-white">
                <Users size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-zinc-500">Total User</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.mahasiswa}</p>
                <p className="text-xs text-zinc-500">Mahasiswa</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <UserCog size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.dosen}</p>
                <p className="text-xs text-zinc-500">Dosen</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admin}</p>
                <p className="text-xs text-zinc-500">Admin</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm col-span-2 md:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                <Users size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-zinc-500">User Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Search size={14} />
            </div>
            <h3 className="font-semibold text-sm">Filter & Pencarian</h3>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Input
              placeholder="Cari nama, email, NIM/NIP..."
              startContent={<Search size={18} className="text-zinc-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              size="sm"
              classNames={{
                inputWrapper: 'h-10 border-zinc-200 dark:border-zinc-700',
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

      {/* Users List */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Users size={14} />
              </div>
              <h2 className="font-semibold">
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
                    {filteredUsers.map((user) => (
                      <MobileUserCard
                        key={user.id}
                        user={user}
                        onEdit={openEditModal}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table aria-label="Users table" removeWrapper>
                    <TableHeader>
                      <TableColumn>USER</TableColumn>
                      <TableColumn>ROLE</TableColumn>
                      <TableColumn>NIM/NIP</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>TANGGAL DAFTAR</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
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
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <UserPlus size={18} />
            </div>
            <span>Tambah User Baru</span>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              isRequired
            />
            <Input
              label="Username (NIM/NIP)"
              description="Masukkan NIM untuk Mahasiswa, NIP untuk Dosen, atau username untuk Admin"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              isRequired
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              isRequired
            />
            <Select
              label="Role"
              selectedKeys={[formData.role]}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              isRequired
            >
              <SelectItem key="MAHASISWA">Mahasiswa</SelectItem>
              <SelectItem key="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
              <SelectItem key="ADMIN">Admin</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Batal
            </Button>
            <Button color="primary" onPress={handleCreateUser}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Edit size={18} />
            </div>
            <span>Edit User</span>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              isRequired
            />
            <Input
              label="Username (NIM/NIP)"
              description="NIM untuk Mahasiswa, NIP untuk Dosen, atau username untuk Admin"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              isRequired
            />
            <Input
              label="Password Baru (kosongkan jika tidak ingin mengubah)"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <Select
              label="Role"
              selectedKeys={[formData.role]}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              isRequired
            >
              <SelectItem key="MAHASISWA">Mahasiswa</SelectItem>
              <SelectItem key="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
              <SelectItem key="ADMIN">Admin</SelectItem>
            </Select>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-sm">Status Aktif</span>
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
            <Button color="primary" onPress={handleUpdateUser}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
