'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Divider,
} from '@heroui/react';
import { ArrowLeft, Github, Save } from 'lucide-react';
import Link from 'next/link';

interface Semester {
  id: string;
  name: string;
  tahunAkademik: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubRepoUrl: '',
    semester: '',
    tahunAkademik: '',
  });

  useEffect(() => {
    // Fetch available semesters
    const fetchSemesters = async () => {
      try {
        const response = await fetch('/api/semesters?active=true');
        if (response.ok) {
          const data = await response.json();
          setSemesters(data);

          // Auto-select active semester
          const activeSemester = data.find(
            (s: Semester & { isActive: boolean }) => s.isActive,
          );
          if (activeSemester) {
            setFormData((prev) => ({
              ...prev,
              semester: activeSemester.name,
              tahunAkademik: activeSemester.tahunAkademik,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
      }
    };

    fetchSemesters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat project');
      }

      router.push(`/mahasiswa/projects/${data.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  // Default semester options if no semesters from API
  const defaultSemesters = [
    { name: 'Ganjil 2024/2025', tahunAkademik: '2024/2025' },
    { name: 'Genap 2024/2025', tahunAkademik: '2024/2025' },
    { name: 'Ganjil 2025/2026', tahunAkademik: '2025/2026' },
  ];

  const semesterOptions = semesters.length > 0 ? semesters : defaultSemesters;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          href="/mahasiswa/projects"
          variant="light"
          isIconOnly
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Project Baru</h1>
          <p className="text-default-500">
            Isi informasi project capstone Anda
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Informasi Project</h2>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Judul Project"
              placeholder="Contoh: Sistem Informasi Perpustakaan Berbasis Web"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              isRequired
              description="Judul harus menjelaskan project Anda dengan jelas"
            />

            <Textarea
              label="Deskripsi Project"
              placeholder="Jelaskan tentang project Anda, tujuan, dan fitur utama..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              minRows={4}
              description="Deskripsi singkat tentang project capstone Anda"
            />

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Semester"
                placeholder="Pilih semester"
                selectedKeys={formData.semester ? [formData.semester] : []}
                onChange={(e) => {
                  const selected = semesterOptions.find(
                    (s) => s.name === e.target.value,
                  );
                  setFormData({
                    ...formData,
                    semester: e.target.value,
                    tahunAkademik: selected?.tahunAkademik || '',
                  });
                }}
                isRequired
              >
                {semesterOptions.map((sem) => (
                  <SelectItem key={sem.name}>{sem.name}</SelectItem>
                ))}
              </Select>

              <Input
                label="Tahun Akademik"
                placeholder="2024/2025"
                value={formData.tahunAkademik}
                onChange={(e) =>
                  setFormData({ ...formData, tahunAkademik: e.target.value })
                }
                isRequired
                isReadOnly
              />
            </div>

            <Divider />

            <Input
              label="Repository GitHub (Opsional)"
              placeholder="https://github.com/username/repo"
              value={formData.githubRepoUrl}
              onChange={(e) =>
                setFormData({ ...formData, githubRepoUrl: e.target.value })
              }
              startContent={<Github size={18} className="text-default-400" />}
              description="Link repository GitHub project Anda. Bisa ditambahkan nanti."
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                as={Link}
                href="/mahasiswa/projects"
                variant="flat"
              >
                Batal
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                startContent={!isLoading && <Save size={18} />}
              >
                Simpan Project
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
