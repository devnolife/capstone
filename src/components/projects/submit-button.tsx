'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LoaderCircle,
  ChevronRight,
} from 'lucide-react';

interface SubmissionBlocker {
  code: string;
  label: string;
  description: string;
  href: string;
}

interface SubmissionReadiness {
  canSubmit: boolean;
  blockers: SubmissionBlocker[];
  completedChecks: number;
  totalChecks: number;
  submissionDeadline: string | null;
  isOwner: boolean;
}

interface SubmitProjectButtonProps {
  projectId: string;
  currentStatus: string;
}

export function SubmitProjectButton({
  projectId,
  currentStatus,
}: SubmitProjectButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [readiness, setReadiness] = useState<SubmissionReadiness | null>(null);

  // Draft projects and projects returned for revision can be submitted.
  const canOpenSubmission =
    currentStatus === 'DRAFT' || currentStatus === 'REVISION_NEEDED';

  const handleOpen = async () => {
    setError(null);
    setSuccess(false);
    setReadiness(null);
    setIsOpen(true);
    setIsChecking(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/submission-readiness`,
        { cache: 'no-store' },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memeriksa kelengkapan project');
      }

      setReadiness(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memeriksa kelengkapan project',
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!canOpenSubmission || !readiness?.canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        if (Array.isArray(data.blockers)) {
          setReadiness((current) =>
            current
              ? { ...current, canSubmit: false, blockers: data.blockers }
              : current,
          );
        }
        throw new Error(data.error || 'Gagal mengsubmit project');
      }

      setSuccess(true);

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canOpenSubmission) {
    return null;
  }

  return (
    <>
      <Button onClick={handleOpen}>
        <Send size={18} />
        {currentStatus === 'REVISION_NEEDED'
          ? 'Kirim Ulang Revisi'
          : 'Submit untuk Review'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {success ? 'Berhasil!' : 'Konfirmasi Submit Project'}
            </DialogTitle>
          </DialogHeader>

          <div>
            {success ? (
              <div className="text-center py-4">
                <CheckCircle
                  size={48}
                  className="mx-auto text-emerald-600 dark:text-emerald-400 mb-4"
                />
                <p className="text-lg font-medium">
                  Project berhasil disubmit!
                </p>
                <p className="text-muted-foreground mt-2">
                  Project Anda akan direview oleh dosen penguji.
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm mb-4">
                    {error}
                  </div>
                )}

                {isChecking ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                    <LoaderCircle size={32} className="animate-spin text-primary" />
                    <p>Memeriksa kelengkapan project...</p>
                  </div>
                ) : readiness ? (
                  <div className="space-y-4">
                    <div
                      className={`flex items-start gap-3 rounded-xl border p-4 ${readiness.canSubmit
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                        : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                        }`}
                    >
                      {readiness.canSubmit ? (
                        <CheckCircle className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={20} />
                      ) : (
                        <AlertTriangle className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" size={20} />
                      )}
                      <div>
                        <p className="font-medium">
                          {readiness.canSubmit
                            ? 'Project siap disubmit'
                            : `${readiness.blockers.length} hal perlu diselesaikan`}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {readiness.completedChecks}/{readiness.totalChecks} pemeriksaan kelengkapan terpenuhi.
                        </p>
                      </div>
                    </div>

                    {readiness.submissionDeadline && (
                      <p className="text-sm text-muted-foreground">
                        Batas submission:{' '}
                        <span className="font-medium text-foreground">
                          {new Intl.DateTimeFormat('id-ID', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                            timeZone: 'Asia/Makassar',
                          }).format(new Date(readiness.submissionDeadline))}
                          {' WITA'}
                        </span>
                      </p>
                    )}

                    {readiness.blockers.length > 0 && (
                      <div className="space-y-2">
                        {readiness.blockers.map((blocker, index) => (
                          <div
                            key={`${blocker.code}-${blocker.label}-${index}`}
                            className="flex items-start gap-3 rounded-xl border p-3"
                          >
                            <XCircle size={18} className="mt-0.5 shrink-0 text-destructive" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{blocker.label}</p>
                              <p className="text-xs text-muted-foreground">{blocker.description}</p>
                            </div>
                            <Button
                              render={<Link href={blocker.href} />}
                              size="icon-sm"
                              variant="ghost"
                              aria-label={`Perbaiki ${blocker.label}`}
                            >
                              <ChevronRight size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {readiness.canSubmit && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <AlertTriangle
                            className="text-amber-600 dark:text-amber-400 mt-0.5"
                            size={20}
                          />
                          <div>
                            <p className="font-medium text-amber-700 dark:text-amber-300">
                              Perhatian
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              Setelah disubmit, project hanya dapat diubah jika dosen meminta revisi.
                            </p>
                          </div>
                        </div>

                        <p>Apakah Anda yakin ingin mengsubmit project ini?</p>
                      </div>
                    )}
                  </div>
                ) : !error ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Data kelengkapan belum tersedia.
                  </div>
                ) : null}
              </>
            )}
          </div>

          <DialogFooter>
            {success ? (
              <Button onClick={() => setIsOpen(false)}>Tutup</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isChecking || !readiness?.canSubmit}
                >
                  {isSubmitting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {currentStatus === 'REVISION_NEEDED'
                    ? 'Ya, Kirim Ulang'
                    : 'Ya, Submit Project'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
