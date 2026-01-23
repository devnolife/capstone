'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import { Send, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Hanya tampilkan tombol jika status DRAFT
  const canSubmit = currentStatus === 'DRAFT';

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
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

  if (!canSubmit) {
    return null;
  }

  return (
    <>
      <Button
        color="primary"
        startContent={<Send size={18} />}
        onPress={onOpen}
      >
        Submit untuk Review
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

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-warning-50 rounded-lg">
                        <AlertTriangle
                          className="text-warning mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-medium text-warning-700">
                            Perhatian
                          </p>
                          <p className="text-sm text-warning-600">
                            Setelah disubmit, Anda tidak dapat mengubah
                            project kecuali diminta revisi oleh dosen.
                          </p>
                        </div>
                      </div>

                      <p>Apakah Anda yakin ingin mengsubmit project ini?</p>

                      <ul className="text-sm text-default-500 space-y-1">
                        <li>
                          - Project akan dikirim ke admin untuk ditugaskan ke
                          dosen penguji
                        </li>
                        <li>
                          - Anda akan menerima notifikasi ketika ada feedback
                        </li>
                        <li>
                          - Status project akan berubah menjadi
                          &quot;Disubmit&quot;
                        </li>
                      </ul>
                    </div>
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
                      startContent={
                        !isSubmitting ? <Send size={16} /> : undefined
                      }
                    >
                      Ya, Submit Project
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
