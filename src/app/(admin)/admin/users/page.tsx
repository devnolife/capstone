'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
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
import { Search, UserPlus, Edit, Trash2, Users, ChevronRight } from 'lucide-react';
import { formatDate, getRoleLabel } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'MAHASISWA' | 'DOSEN_PENGUJI' | 'ADMIN';
  avatarUrl: string | null;
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
      <Card className="mb-3">
        <CardBody className="p-4">
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar
                name={user.name}
                src={user.avatarUrl || undefined}
                size="md"
                className="ring-2 ring-default-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-default-500 truncate">{user.username}</p>
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
            <div className="flex items-center justify-between text-xs text-default-500">
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
        </CardBody>
      </Card>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Manajemen User</h1>
          <p className="text-sm md:text-base text-default-500">
            Kelola semua user dalam sistem
          </p>
        </div>
        <Button
          color="primary"
          startContent={<UserPlus size={18} />}
          onPress={() => {
            resetForm();
            onOpen();
          }}
          className="w-full md:w-auto"
        >
          Tambah User
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardBody className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <Input
                placeholder="Cari nama, email, NIM/NIP..."
                startContent={<Search size={18} className="text-default-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                size="sm"
                classNames={{
                  inputWrapper: 'h-10',
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
          </CardBody>
        </Card>
      </motion.div>

      {/* Users List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="px-4 py-3">
            <h2 className="text-base md:text-lg font-semibold">
              Daftar User ({filteredUsers.length})
            </h2>
          </CardHeader>
          <CardBody className="pt-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users size={64} className="mx-auto text-default-300 mb-4" />
                <p className="text-default-500 text-sm md:text-base">
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
                                src={user.avatarUrl || undefined}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-default-500">
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
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={user.isActive ? 'success' : 'default'}
                              variant="flat"
                            >
                              {user.isActive ? 'Aktif' : 'Nonaktif'}
                            </Chip>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
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
          </CardBody>
        </Card>
      </motion.div>

      {/* Create User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Tambah User Baru</ModalHeader>
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
          <ModalHeader>Edit User</ModalHeader>
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
            <div className="flex items-center justify-between">
              <span>Status Aktif</span>
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
