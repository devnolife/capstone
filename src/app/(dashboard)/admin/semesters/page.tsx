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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Switch,
} from '@heroui/react';
import { Plus, Edit, Trash2, GraduationCap, Calendar } from 'lucide-react';
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

export default function AdminSemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null,
  );
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
          <h1 className="text-2xl font-bold">Manajemen Semester</h1>
          <p className="text-default-500">
            Kelola periode semester untuk pengumpulan project
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
          Tambah Semester
        </Button>
      </div>

      {/* Active Semester Card */}
      {activeSemester && (
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <p className="text-sm opacity-80">Semester Aktif</p>
                  <h2 className="text-2xl font-bold">{activeSemester.name}</h2>
                  <p className="text-sm opacity-80">
                    {formatDate(activeSemester.startDate)} -{' '}
                    {formatDate(activeSemester.endDate)}
                  </p>
                </div>
              </div>
              <Chip color="success" variant="solid" className="bg-white/20">
                {activeSemester.tahunAkademik}
              </Chip>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Semesters Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Daftar Semester ({semesters.length})
          </h2>
        </CardHeader>
        <CardBody>
          {semesters.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500">Belum ada semester</p>
            </div>
          ) : (
            <Table aria-label="Semesters table" removeWrapper>
              <TableHeader>
                <TableColumn>NAMA SEMESTER</TableColumn>
                <TableColumn>TAHUN AKADEMIK</TableColumn>
                <TableColumn>PERIODE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>AKSI</TableColumn>
              </TableHeader>
              <TableBody>
                {semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${semester.isActive ? 'bg-primary-100' : 'bg-default-100'}`}
                        >
                          <GraduationCap
                            size={18}
                            className={
                              semester.isActive
                                ? 'text-primary-600'
                                : 'text-default-500'
                            }
                          />
                        </div>
                        <span className="font-medium">{semester.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{semester.tahunAkademik}</TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {formatDate(semester.startDate)} -{' '}
                        {formatDate(semester.endDate)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {semester.isActive ? (
                        <Chip size="sm" color="success" variant="flat">
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
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Semester Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Tambah Semester Baru</ModalHeader>
          <ModalBody className="space-y-4">
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
            <div className="flex items-center justify-between">
              <span>Set sebagai Semester Aktif</span>
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
              color="primary"
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
          <ModalHeader>Edit Semester</ModalHeader>
          <ModalBody className="space-y-4">
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
            <div className="flex items-center justify-between">
              <span>Semester Aktif</span>
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
              onPress={handleUpdateSemester}
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
