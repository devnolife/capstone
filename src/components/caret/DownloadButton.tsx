"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  GraduationHatIcon,
  HelpCircleIcon,
  Star7Icon,
} from "@/components/icons";
import { MenuItem, MenuSurface, useDropdown } from "@/components/caret/DropdownLite";

interface DownloadButtonProps {
  /** "sm" = header (h-9), "md" = hero/CTA (h-10) */
  size?: "sm" | "md";
  className?: string;
}

const ROLES = [
  { label: "Mahasiswa", href: "/login", icon: GraduationHatIcon, iconClass: "-mt-0.5 size-4 md:size-4.5" },
  { label: "Dosen", href: "/login", icon: Star7Icon, iconClass: "mt-0.5 size-4" },
  { label: "Admin Prodi", href: "/login", icon: HelpCircleIcon, iconClass: "mt-0.5 size-4" },
];

/**
 * Split "Masuk" button used in the header, hero, and CTA sections
 * (adapted from the Caret download button).
 * Left segment: light pill with "Masuk".
 * Right segment: chevron trigger opening the role menu.
 */
export function DownloadButton({ size = "md", className }: DownloadButtonProps) {
  const { open, setOpen, rootRef } = useDropdown();
  const height = size === "sm" ? "h-9" : "h-10";
  const text = size === "sm" ? "text-sm" : "text-base";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="inline-flex items-center overflow-hidden rounded-full">
        <a
          href="/login"
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] inline-flex shrink-0 items-center justify-center gap-2 rounded-none! font-medium whitespace-nowrap shadow-xs transition-all outline-none",
            height,
            text,
            size === "sm" ? "px-3" : "px-4"
          )}
        >
          <GraduationHatIcon className="mt-0.5 size-4" />
          <span>Mulai sekarang</span>
        </a>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "bg-primary text-background hover:bg-primary/90 inline-flex aspect-square shrink-0 items-center justify-center rounded-none! border-l border-black/5 p-0! font-medium transition-all outline-none",
            height
          )}
        >
          <ChevronDownIcon
            className={cn(
              "caret-icon size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </div>
      <MenuSurface open={open} align="end" className="min-w-36">
        {ROLES.map(({ label, href, icon: Icon, iconClass }) => (
          <MenuItem key={label} href={href} onSelect={() => setOpen(false)}>
            <Icon className={iconClass} />
            {label}
          </MenuItem>
        ))}
      </MenuSurface>
    </div>
  );
}
