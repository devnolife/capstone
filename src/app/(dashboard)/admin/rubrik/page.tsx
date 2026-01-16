'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
} from '@heroui/react';
import { Plus, Edit, Trash2, BookOpen, GripVertical } from 'lucide-react';

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

export default function AdminRubrikPage() {
  const [rubriks, setRubriks] = useState<Rubrik[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRubrik, setSelectedRubrik] = useState<Rubrik | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

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
    if (!confirm('Apakah Anda yakin ingin menghapus rubrik ini?')) return;

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
      alert(err instanceof Error ? err.message : 'Error');
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
          <h1 className="text-2xl font-bold">Rubrik Penilaian</h1>
          <p className="text-default-500">
            Kelola kriteria penilaian untuk review project
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => {
            resetForm();
            onOpen();
          }}
        >
          Tambah Rubrik
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-100">
              <BookOpen className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Rubrik</p>
              <p className="text-2xl font-bold">{rubriks.length}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 rounded-xl bg-success-100">
              <BookOpen className="text-success-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-default-500">Rubrik Aktif</p>
              <p className="text-2xl font-bold">
                {rubriks.filter((r) => r.isActive).length}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div
              className={`p-3 rounded-xl ${totalBobot === 100 ? 'bg-success-100' : 'bg-warning-100'}`}
            >
              <BookOpen
                className={
                  totalBobot === 100 ? 'text-success-600' : 'text-warning-600'
                }
                size={24}
              />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Bobot Aktif</p>
              <p className="text-2xl font-bold">{totalBobot}/100</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Rubriks Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Daftar Rubrik Penilaian</h2>
        </CardHeader>
        <CardBody>
          {rubriks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={64} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500">Belum ada rubrik penilaian</p>
            </div>
          ) : (
            <Table aria-label="Rubriks table" removeWrapper>
              <TableHeader>
                <TableColumn width={50}>URUTAN</TableColumn>
                <TableColumn>NAMA</TableColumn>
                <TableColumn>KATEGORI</TableColumn>
                <TableColumn>BOBOT MAX</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>AKSI</TableColumn>
              </TableHeader>
              <TableBody>
                {rubriks.map((rubrik) => (
                  <TableRow key={rubrik.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical
                          size={16}
                          className="text-default-400 cursor-grab"
                        />
                        <span>{rubrik.urutan + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rubrik.name}</p>
                        {rubrik.description && (
                          <p className="text-xs text-default-500 line-clamp-1">
                            {rubrik.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {rubrik.kategori}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{rubrik.bobotMax}</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={rubrik.isActive ? 'success' : 'default'}
                        variant="flat"
                      >
                        {rubrik.isActive ? 'Aktif' : 'Nonaktif'}
                      </Chip>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Rubrik Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Tambah Rubrik Baru</ModalHeader>
          <ModalBody className="space-y-4">
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
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Batal
            </Button>
            <Button
              color="primary"
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
          <ModalHeader>Edit Rubrik</ModalHeader>
          <ModalBody className="space-y-4">
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
            <Button
              color="primary"
              onPress={handleUpdateRubrik}
              isLoading={isSubmitting}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
