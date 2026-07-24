import { CaretLogo, GlobeIcon } from "@/components/icons";
import Link from "next/link";

/**
 * Dashboard topbar: search hint, week label, and account chip.
 * On mobile it also carries the logo (sidebar is hidden below lg).
 */
export function DashTopbar() {
  return (
    <header className="border-zinc-800 bg-background sticky top-0 z-30 border-b px-4 md:px-6">
      <div className="flex h-14 items-center gap-3">
        <Link href="/" className="lg:hidden">
          <CaretLogo className="-mt-0.5 h-6 w-auto" />
        </Link>
        <div className="border-zinc-800 bg-app-quinary text-app-teritary-invert hidden h-9 w-72 items-center gap-2 rounded-full border px-4 text-sm md:flex">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="size-4 shrink-0">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
            />
          </svg>
          <span className="grow">Cari project, review…</span>
          <kbd className="border-zinc-800 text-app-teritary-invert rounded-md border px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </div>
        <div className="grow" />
        <span className="text-app-secondary-invert hidden font-mono text-xs tracking-wider md:block">
          RAB 23 JUL · PEKAN 30
        </span>
        <button
          type="button"
          className="border-zinc-800 hover:bg-accent/50 inline-flex h-9 items-center gap-2 rounded-full border px-2.5 transition-all"
        >
          <span className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-emerald-800">
            <img src="/logo.png" alt="Mahasiswa" className="h-4 w-auto" />
          </span>
          <span className="text-sm font-medium">Mahasiswa</span>
          <GlobeIcon className="caret-icon text-app-teritary-invert size-4" />
        </button>
      </div>
    </header>
  );
}
