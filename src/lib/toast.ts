import { toast } from 'sonner';

type ToastColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface AddToastOptions {
  title?: string;
  description?: string;
  color?: ToastColor;
}

/**
 * Kompatibilitas API `addToast` (HeroUI) di atas `sonner`,
 * supaya seluruh aplikasi memakai satu sistem toast (shadcn/ui + sonner).
 */
export function addToast({ title, description, color = 'default' }: AddToastOptions) {
  const message = title ?? description ?? '';
  const options = title && description ? { description } : undefined;

  switch (color) {
    case 'success':
      return toast.success(message, options);
    case 'danger':
      return toast.error(message, options);
    case 'warning':
      return toast.warning(message, options);
    case 'primary':
    case 'secondary':
      return toast.info(message, options);
    default:
      return toast(message, options);
  }
}
