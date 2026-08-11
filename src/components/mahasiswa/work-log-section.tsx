'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Chip,
  Avatar,
  addToast,
} from '@heroui/react';
import { CalendarDays, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

const MIN_WORK_LOGS = 3;

interface WorkLog {
  id: string;
  dayNumber: number;
  workDate: string;
  activity: string;
  createdAt: string;
  author: { id: string; name: string; image?: string | null };
}

interface WorkLogSectionProps {
  projectId: string;
  readOnly?: boolean;
}

export function WorkLogSection({ projectId, readOnly = false }: WorkLogSectionProps) {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dayNumber, setDayNumber] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [activity, setActivity] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/work-logs`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async () => {
    if (!dayNumber || !workDate || activity.trim().length < 10) {
      addToast({
        title: 'Lengkapi form',
        description: 'Isi hari ke-, tanggal, dan deskripsi pekerjaan (min 10 karakter).',
        color: 'warning',
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/work-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: Number(dayNumber),
          workDate,
          activity: activity.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan laporan');
      }
      setLogs((prev) =>
        [...prev, json.data].sort((a, b) => a.dayNumber - b.dayNumber),
      );
      setDayNumber('');
      setWorkDate('');
      setActivity('');
      setShowForm(false);
      addToast({ title: 'Laporan pengerjaan tersimpan', color: 'success' });
    } catch (error) {
      addToast({
        title: 'Gagal menyimpan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (log: WorkLog) => {
    const ok = await confirm({
      title: 'Hapus Laporan',
      message: `Apakah Anda yakin ingin menghapus laporan hari ke-${log.dayNumber}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/projects/${projectId}/work-logs/${log.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== log.id));
      addToast({ title: 'Laporan dihapus', color: 'success' });
    } else {
      const json = await res.json().catch(() => null);
      addToast({
        title: 'Gagal menghapus',
        description: json?.error,
        color: 'danger',
      });
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div>
      <ConfirmDialog />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <ClipboardList size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Laporan Pengerjaan</h2>
            <p className="text-xs text-default-500">
              Catat hari ke berapa mengerjakan apa — minimal {MIN_WORK_LOGS} laporan
              sebelum submit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip
            size="sm"
            color={logs.length >= MIN_WORK_LOGS ? 'success' : 'warning'}
            variant="flat"
          >
            {logs.length}/{MIN_WORK_LOGS} minimum
          </Chip>
          {!readOnly && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Plus size={14} />}
              onPress={() => setShowForm((v) => !v)}
            >
              Tambah
            </Button>
          )}
        </div>
      </div>

      {showForm && !readOnly && (
        <div className="mb-5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              min={1}
              label="Hari ke-"
              placeholder="1"
              value={dayNumber}
              onValueChange={setDayNumber}
              size="sm"
            />
            <Input
              type="date"
              label="Tanggal pengerjaan"
              value={workDate}
              onValueChange={setWorkDate}
              size="sm"
            />
          </div>
          <Textarea
            label="Apa yang dikerjakan hari itu?"
            placeholder="Contoh: Membuat desain database dan setup project Next.js..."
            value={activity}
            onValueChange={setActivity}
            minRows={2}
            size="sm"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="light" onPress={() => setShowForm(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              color="primary"
              isLoading={submitting}
              onPress={handleSubmit}
            >
              Simpan Laporan
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-default-400">Memuat laporan...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-default-400">
          Belum ada laporan pengerjaan. Tambahkan catatan harian pengerjaan project.
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="flex flex-col items-center justify-center w-14 shrink-0 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <span className="text-[10px] uppercase text-indigo-500">Hari</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {log.dayNumber}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-default-500 mb-1">
                  <CalendarDays size={12} />
                  {formatDate(log.workDate)}
                  <span>·</span>
                  <Avatar
                    src={log.author.image || undefined}
                    name={log.author.name}
                    className="w-4 h-4 text-[8px]"
                  />
                  {log.author.name}
                </div>
                <p className="text-sm text-default-700 whitespace-pre-wrap">
                  {log.activity}
                </p>
              </div>
              {!readOnly && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleDelete(log)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
