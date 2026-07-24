"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight dropdown primitives matching the live site's shadcn/Radix
 * menu styling (bg-popover rounded-xl p-1 + fade/zoom-in entrance) without
 * pulling in a positioning library. Menus anchor to the trigger's wrapper.
 */

export function useDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return { open, setOpen, rootRef };
}

interface MenuSurfaceProps {
  open: boolean;
  align?: "start" | "end";
  className?: string;
  children: React.ReactNode;
}

export function MenuSurface({ open, align = "end", className, children }: MenuSurfaceProps) {
  if (!open) return null;
  return (
    <div
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute top-[calc(100%+4px)] z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-xl border p-1 shadow-md",
        align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MenuItemProps {
  onSelect?: () => void;
  href?: string;
  children: React.ReactNode;
}

/** Plain menu item (icon + label), classes verbatim from the live menu. */
export function MenuItem({ onSelect, href, children }: MenuItemProps) {
  const className =
    "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
  if (href) {
    return (
      <a role="menuitem" href={href} target="_blank" rel="noreferrer" className={className} onClick={onSelect}>
        {children}
      </a>
    );
  }
  return (
    <button role="menuitem" type="button" className={cn(className, "w-full text-left")} onClick={onSelect}>
      {children}
    </button>
  );
}

interface MenuRadioItemProps {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

/** Radio menu item with the left dot indicator (language switcher). */
export function MenuRadioItem({ checked, onSelect, children }: MenuRadioItemProps) {
  return (
    <button
      role="menuitemradio"
      aria-checked={checked}
      type="button"
      onClick={onSelect}
      className="focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-lg py-1.5 pr-2 pl-8 text-left text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-2 fill-current"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}
