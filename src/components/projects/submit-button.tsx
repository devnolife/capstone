'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
    onOpen();
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
        onOpenChange();
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
      <Button
        color="primary"
        startContent={<Send size={18} />}
        onPress={handleOpen}
      >
        {currentStatus === 'REVISION_NEEDED'
          ? 'Kirim Ulang Revisi'
          : 'Submit untuk Review'}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {success ? 'Berhasil!' : 'Konfirmasi Submit Project'}
              </ModalHeader>
              <ModalBody>
                {success ? (
                  <div className="text-center py-4">
                    <CheckCircle
                      size={48}
                      className="mx-auto text-success mb-4"
                    />
                    <p className="text-lg font-medium">
                      Project berhasil disubmit!
                    </p>
                    <p className="text-default-500 mt-2">
                      Project Anda akan direview oleh dosen penguji.
                    </p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm mb-4">
                        {error}
                      </div>
                    )}

                    {isChecking ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10 text-default-500">
                        <LoaderCircle size={32} className="animate-spin text-primary" />
                        <p>Memeriksa kelengkapan project...</p>
                      </div>
                    ) : readiness ? (
                      <div className="space-y-4">
                        <div
                          className={`flex items-start gap-3 rounded-xl border p-4 ${readiness.canSubmit
                              ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                              : 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20'
                            }`}
                        >
                          {readiness.canSubmit ? (
                            <CheckCircle className="mt-0.5 shrink-0 text-success" size={20} />
                          ) : (
                            <AlertTriangle className="mt-0.5 shrink-0 text-warning" size={20} />
                          )}
                          <div>
                            <p className="font-medium">
                              {readiness.canSubmit
                                ? 'Project siap disubmit'
                                : `${readiness.blockers.length} hal perlu diselesaikan`}
                            </p>
                            <p className="mt-0.5 text-sm text-default-600">
                              {readiness.completedChecks}/{readiness.totalChecks} pemeriksaan kelengkapan terpenuhi.
                            </p>
                          </div>
                        </div>

                        {readiness.submissionDeadline && (
                          <p className="text-sm text-default-500">
                            Batas submission:{' '}
                            <span className="font-medium text-default-700">
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
                                className="flex items-start gap-3 rounded-xl border border-default-200 p-3"
                              >
                                <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">{blocker.label}</p>
                                  <p className="text-xs text-default-500">{blocker.description}</p>
                                </div>
                                <Button
                                  as={Link}
                                  href={blocker.href}
                                  size="sm"
                                  variant="light"
                                  color="primary"
                                  isIconOnly
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
                            <div className="flex items-start gap-3 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                              <AlertTriangle
                                className="text-warning mt-0.5"
                                size={20}
                              />
                              <div>
                                <p className="font-medium text-warning-700 dark:text-warning-300">
                                  Perhatian
                                </p>
                                <p className="text-sm text-warning-600 dark:text-warning-400">
                                  Setelah disubmit, project hanya dapat diubah jika dosen meminta revisi.
                                </p>
                              </div>
                            </div>

                            <p>Apakah Anda yakin ingin mengsubmit project ini?</p>
                          </div>
                        )}
                      </div>
                    ) : !error ? (
                      <div className="py-8 text-center text-default-500">
                        Data kelengkapan belum tersedia.
                      </div>
                    ) : null}
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                {success ? (
                  <Button color="primary" onPress={onClose}>
                    Tutup
                  </Button>
                ) : (
                  <>
                    <Button variant="light" onPress={onClose}>
                      Batal
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleSubmit}
                      isLoading={isSubmitting}
                      isDisabled={isChecking || !readiness?.canSubmit}
                      startContent={
                        !isSubmitting ? <Send size={16} /> : undefined
                      }
                    >
                      {currentStatus === 'REVISION_NEEDED'
                        ? 'Ya, Kirim Ulang'
                        : 'Ya, Submit Project'}
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
