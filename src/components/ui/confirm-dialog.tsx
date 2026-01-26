'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

export type ConfirmDialogType = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  isLoading?: boolean;
}

const iconMap = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const colorMap = {
  warning: 'warning',
  danger: 'danger',
  info: 'primary',
  success: 'success',
} as const;

const bgColorMap = {
  warning: 'bg-warning-100 dark:bg-warning-900/30',
  danger: 'bg-danger-100 dark:bg-danger-900/30',
  info: 'bg-primary-100 dark:bg-primary-900/30',
  success: 'bg-success-100 dark:bg-success-900/30',
};

const iconColorMap = {
  warning: 'text-warning-600 dark:text-warning-400',
  danger: 'text-danger-600 dark:text-danger-400',
  info: 'text-primary-600 dark:text-primary-400',
  success: 'text-success-600 dark:text-success-400',
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = iconMap[type];
  const color = colorMap[type];
  const bgColor = bgColorMap[type];
  const iconColor = iconColorMap[type];

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      classNames={{
        backdrop: 'bg-black/50 backdrop-blur-sm',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              <Icon className={iconColor} size={20} />
            </div>
            <span>{title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            color={color}
            onPress={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Hook untuk kemudahan penggunaan
import { useState, useCallback } from 'react';

interface UseConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<UseConfirmDialogOptions>({
    title: '',
    message: '',
  });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: UseConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
    setIsOpen(false);
    setIsLoading(false);
  }, [resolveRef]);

  const ConfirmDialogComponent = useCallback(() => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      type={options.type}
      isLoading={isLoading}
    />
  ), [isOpen, handleClose, handleConfirm, options, isLoading]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    setIsLoading,
  };
}
