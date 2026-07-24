import type { ReactNode } from "react";
import { LabelRow } from "@/components/caret/dashboard/LabelRow";

interface PageHeaderProps {
  /** Mono label kiri, mis. "[01] PROJECT" */
  label: string;
  /** Mono label kanan, mis. "/ SEMUA" */
  labelRight?: string;
  title: string;
  description?: string;
  /** Slot tombol/aksi di kanan judul */
  actions?: ReactNode;
}

/**
 * Header halaman internal — pola Caret: LabelRow mono di atas,
 * judul font-display + deskripsi, dan slot aksi di kanan.
 */
export function PageHeader({
  label,
  labelRight = "",
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-2">
      <LabelRow left={label} right={labelRight} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl leading-none font-[450] tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-app-secondary-invert mt-1.5 text-sm">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
