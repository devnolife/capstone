'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Avatar,
  addToast,
} from '@heroui/react';
import {
  CalendarDays,
  ClipboardList,
  GitCommitHorizontal,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

const MIN_WORK_LOGS = 3;

interface WorkLog {
  id: string;
  dayNumber: number;
  workDate: string;
  activity: string;
  commitSha: string;
  commitMessage: string | null;
  commitUrl: string | null;
  commitDate: string | null;
  createdAt: string;
  author: { id: string; name: string; image?: string | null };
}

interface CommitOption {
  sha: string;
  message: string;
  authorName: string;
  date: string;
  htmlUrl: string;
  used: boolean;
}

interface WorkLogSectionProps {
  projectId: string;
  readOnly?: boolean;
}

export function WorkLogSection({ projectId, readOnly = false }: WorkLogSectionProps) {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [commits, setCommits] = useState<CommitOption[]>([]);
  const [commitsError, setCommitsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dayNumber, setDayNumber] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [activity, setActivity] = useState('');
  const [commitSha, setCommitSha] = useState('');
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

  const fetchCommits = useCallback(async () => {
    setLoadingCommits(true);
    setCommitsError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/commits`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal memuat commit');
      }
      setCommits(json.data ?? []);
    } catch (error) {
      setCommitsError(
        error instanceof Error ? error.message : 'Gagal memuat commit dari GitHub',
      );
    } finally {
      setLoadingCommits(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const openForm = () => {
    setShowForm((v) => !v);
    if (!showForm && commits.length === 0) {
      fetchCommits();
    }
  };

  const handleCommitSelect = (sha: string) => {
    setCommitSha(sha);
    const commit = commits.find((c) => c.sha === sha);
    if (commit?.date && !workDate) {
      setWorkDate(commit.date.slice(0, 10));
    }
  };

  const handleSubmit = async () => {
    if (!dayNumber || !workDate || activity.trim().length < 10 || !commitSha) {
      addToast({
        title: 'Lengkapi form',
        description:
          'Pilih commit, isi hari ke-, tanggal, dan deskripsi pekerjaan (min 10 karakter).',
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
          commitSha,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan laporan');
      }
      setLogs((prev) =>
        [...prev, json.data].sort((a, b) => a.dayNumber - b.dayNumber),
      );
      setCommits((prev) =>
        prev.map((c) => (c.sha === commitSha ? { ...c, used: true } : c)),
      );
      setDayNumber('');
      setWorkDate('');
      setActivity('');
      setCommitSha('');
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
      setCommits((prev) =>
        prev.map((c) => (c.sha === log.commitSha ? { ...c, used: false } : c)),
      );
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

  const availableCommits = commits.filter((c) => !c.used);

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
              Setiap laporan wajib terikat commit GitHub — minimal {MIN_WORK_LOGS}{' '}
              laporan sebelum submit
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
              onPress={openForm}
            >
              Tambah
            </Button>
          )}
        </div>
      </div>

      {showForm && !readOnly && (
        <div className="mb-5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
          <Select
            size="sm"
            label="Commit yang membuktikan pekerjaan"
            placeholder={
              loadingCommits
                ? 'Memuat commit dari GitHub...'
                : 'Pilih commit dari repository project'
            }
            isLoading={loadingCommits}
            selectedKeys={commitSha ? [commitSha] : []}
            onSelectionChange={(keys) => {
              const sha = Array.from(keys)[0];
              if (typeof sha === 'string') handleCommitSelect(sha);
            }}
            errorMessage={commitsError ?? undefined}
            isInvalid={!!commitsError}
          >
            {availableCommits.map((commit) => (
              <SelectItem
                key={commit.sha}
                textValue={`${commit.sha.slice(0, 7)} — ${commit.message.split('\n')[0]}`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-default-500">
                    {commit.sha.slice(0, 7)} ·{' '}
                    {new Date(commit.date).toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-sm truncate max-w-md">
                    {commit.message.split('\n')[0]}
                  </span>
                </div>
              </SelectItem>
            ))}
          </Select>
          {!loadingCommits && !commitsError && availableCommits.length === 0 && (
            <p className="text-xs text-warning-600">
              Tidak ada commit yang tersedia — semua commit sudah dilaporkan atau
              repository belum memiliki commit.
            </p>
          )}
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
            label="Apa yang dikerjakan? (mis. fitur yang dibuat pada commit ini)"
            placeholder="Contoh: Mengerjakan fitur login — membuat halaman login dan integrasi auth..."
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
          Belum ada laporan pengerjaan. Setiap laporan harus memilih commit GitHub
          sebagai bukti pekerjaan.
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
                <div className="flex flex-wrap items-center gap-2 text-xs text-default-500 mb-1">
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
                <p className="text-sm text-default-700 whitespace-pre-wrap mb-2">
                  {log.activity}
                </p>
                <a
                  href={log.commitUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-700/60 border border-zinc-200 dark:border-zinc-600 text-xs text-default-600 hover:text-primary transition-colors max-w-full"
                >
                  <GitCommitHorizontal size={12} className="shrink-0 text-emerald-600" />
                  <span className="font-mono shrink-0">{log.commitSha.slice(0, 7)}</span>
                  <span className="truncate">
                    {log.commitMessage?.split('\n')[0] ?? 'Lihat commit'}
                  </span>
                  <ExternalLink size={10} className="shrink-0" />
                </a>
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
