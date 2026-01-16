'use client';

import { useState, useEffect } from 'react';
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
import { Search, UserPlus, Edit, Trash2, Users } from 'lucide-react';
import { formatDate, getRoleLabel } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'MAHASISWA' | 'DOSEN_PENGUJI' | 'ADMIN';
  nim: string | null;
  nip: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    projects: number;
    reviews: number;
  };
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
    email: '',
    password: '',
    role: 'MAHASISWA',
    nim: '',
    nip: '',
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
      email: user.email,
      password: '',
      role: user.role,
      nim: user.nim || '',
      nip: user.nip || '',
      isActive: user.isActive,
    });
    onEditOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'MAHASISWA',
      nim: '',
      nip: '',
      isActive: true,
    });
    setSelectedUser(null);
    setError('');
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nip?.toLowerCase().includes(searchQuery.toLowerCase());

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen User</h1>
          <p className="text-default-500">Kelola semua user dalam sistem</p>
        </div>
        <Button
          color="primary"
          startContent={<UserPlus size={18} />}
          onPress={() => {
            resetForm();
            onOpen();
          }}
        >
          Tambah User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Cari nama, email, NIM/NIP..."
              startContent={<Search size={18} className="text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              placeholder="Filter Role"
              selectedKeys={[roleFilter]}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="max-w-[200px]"
            >
              <SelectItem key="all">Semua Role</SelectItem>
              <SelectItem key="MAHASISWA">Mahasiswa</SelectItem>
              <SelectItem key="DOSEN_PENGUJI">Dosen Penguji</SelectItem>
              <SelectItem key="ADMIN">Admin</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Daftar User ({filteredUsers.length})
          </h2>
        </CardHeader>
        <CardBody>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500">Tidak ada user ditemukan</p>
            </div>
          ) : (
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
                            {user.email}
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
                    <TableCell>{user.nim || user.nip || '-'}</TableCell>
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
          )}
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
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
            {formData.role === 'MAHASISWA' && (
              <Input
                label="NIM"
                value={formData.nim}
                onChange={(e) =>
                  setFormData({ ...formData, nim: e.target.value })
                }
              />
            )}
            {formData.role === 'DOSEN_PENGUJI' && (
              <Input
                label="NIP"
                value={formData.nip}
                onChange={(e) =>
                  setFormData({ ...formData, nip: e.target.value })
                }
              />
            )}
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
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
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
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
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
            {formData.role === 'MAHASISWA' && (
              <Input
                label="NIM"
                value={formData.nim}
                onChange={(e) =>
                  setFormData({ ...formData, nim: e.target.value })
                }
              />
            )}
            {formData.role === 'DOSEN_PENGUJI' && (
              <Input
                label="NIP"
                value={formData.nip}
                onChange={(e) =>
                  setFormData({ ...formData, nip: e.target.value })
                }
              />
            )}
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
    </div>
  );
}
