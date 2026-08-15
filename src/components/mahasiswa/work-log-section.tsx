'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  CalendarDays,
  ClipboardList,
  GitCommitHorizontal,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [showErrors, setShowErrors] = useState(false);
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
      setShowErrors(true);
      toast.warning('Lengkapi form', {
        description:
          'Pilih commit, isi hari ke-, tanggal, dan deskripsi pekerjaan (min 10 karakter).',
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
      setShowErrors(false);
      toast.success('Laporan pengerjaan tersimpan');
    } catch (error) {
      toast.error('Gagal menyimpan', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
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
      toast.success('Laporan dihapus');
    } else {
      const json = await res.json().catch(() => null);
      toast.error('Gagal menghapus', { description: json?.error });
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const availableCommits = commits.filter((c) => !c.used);
  const activityInvalid = showErrors && activity.trim().length < 10;

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
            <p className="text-xs text-muted-foreground">
              Setiap laporan wajib terikat commit GitHub — minimal {MIN_WORK_LOGS}{' '}
              laporan sebelum submit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={logs.length >= MIN_WORK_LOGS ? 'default' : 'secondary'}>
            {logs.length}/{MIN_WORK_LOGS} minimum
          </Badge>
          {!readOnly && (
            <Button size="sm" variant="outline" onClick={openForm}>
              <Plus />
              Tambah
            </Button>
          )}
        </div>
      </div>

      {showForm && !readOnly && (
        <div className="mb-5 p-4 rounded-xl border bg-muted/40 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="work-log-commit">Commit yang membuktikan pekerjaan</Label>
            <Select
              value={commitSha || null}
              onValueChange={(value) => {
                if (typeof value === 'string') handleCommitSelect(value);
              }}
            >
              <SelectTrigger
                id="work-log-commit"
                className="w-full"
                disabled={loadingCommits}
                aria-invalid={!!commitsError || (showErrors && !commitSha)}
              >
                <SelectValue
                  placeholder={
                    loadingCommits
                      ? 'Memuat commit dari GitHub...'
                      : 'Pilih commit dari repository project'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableCommits.map((commit) => (
                  <SelectItem key={commit.sha} value={commit.sha}>
                    <span className="font-mono text-xs text-muted-foreground">
                      {commit.sha.slice(0, 7)}
                    </span>
                    <span className="truncate">{commit.message.split('\n')[0]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(commitsError || (showErrors && !commitSha)) && (
              <p className="text-xs text-destructive">
                {commitsError ?? 'Pilih commit terlebih dahulu'}
              </p>
            )}
          </div>
          {!loadingCommits && !commitsError && availableCommits.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Tidak ada commit yang tersedia — semua commit sudah dilaporkan atau
              repository belum memiliki commit.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="work-log-day">Hari ke-</Label>
              <Input
                id="work-log-day"
                type="number"
                min={1}
                placeholder="1"
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value)}
                aria-invalid={showErrors && !dayNumber}
              />
              {showErrors && !dayNumber && (
                <p className="text-xs text-destructive">Wajib diisi</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work-log-date">Tanggal pengerjaan</Label>
              <Input
                id="work-log-date"
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                aria-invalid={showErrors && !workDate}
              />
              {showErrors && !workDate && (
                <p className="text-xs text-destructive">Wajib diisi</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="work-log-activity">
              Apa yang dikerjakan? (mis. fitur yang dibuat pada commit ini)
            </Label>
            <Textarea
              id="work-log-activity"
              placeholder="Contoh: Mengerjakan fitur login — membuat halaman login dan integrasi auth..."
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              rows={3}
              aria-invalid={activityInvalid}
            />
            {activityInvalid && (
              <p className="text-xs text-destructive">Deskripsi minimal 10 karakter</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Simpan Laporan
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat laporan...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada laporan pengerjaan. Setiap laporan harus memilih commit GitHub
          sebagai bukti pekerjaan.
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl border bg-muted/40"
            >
              <div className="flex flex-col items-center justify-center w-14 shrink-0 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <span className="text-[10px] uppercase text-indigo-500">Hari</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {log.dayNumber}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1">
                  <CalendarDays size={12} />
                  {formatDate(log.workDate)}
                  <span>·</span>
                  <Avatar size="sm" className="size-4">
                    <AvatarImage src={log.author.image || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {log.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {log.author.name}
                </div>
                <p className="text-sm whitespace-pre-wrap mb-2">{log.activity}</p>
                <a
                  href={log.commitUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors max-w-full"
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
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  aria-label="Hapus laporan"
                  onClick={() => handleDelete(log)}
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
