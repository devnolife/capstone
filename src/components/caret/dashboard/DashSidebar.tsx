import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CaretLogo,
  GitMergeIcon,
  GraduationHatIcon,
  HelpCircleIcon,
  MessageCircleIcon,
  Star7Icon,
} from "@/components/icons";
import { DownloadButton } from "@/components/caret/DownloadButton";

const NAV = [
  { label: "Ringkasan", icon: Star7Icon, active: true },
  { label: "Review", icon: MessageCircleIcon, active: false },
  { label: "Wawasan", icon: GraduationHatIcon, active: false },
  { label: "Integrasi", icon: GitMergeIcon, active: false },
  { label: "Pengaturan", icon: HelpCircleIcon, active: false },
];

/**
 * Fixed dashboard sidebar — nav pills in the landing page's visual language.
 * Only "Overview" routes anywhere (this demo is a single page).
 */
export function DashSidebar() {
  return (
    <aside className="border-border bg-background fixed top-0 bottom-0 left-0 z-40 hidden w-60 flex-col border-r px-4 py-5 lg:flex">
      <Link href="/" className="mb-8 px-2">
        <CaretLogo className="-mt-0.5 h-6 w-auto [&_path]:transition-all" />
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="/demo"
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2.5 rounded-full border border-transparent px-4 text-sm font-medium whitespace-nowrap transition-all outline-none [&_svg]:size-4 [&_svg]:shrink-0",
              active
                ? "bg-app-primary text-primary"
                : "text-app-secondary-invert hover:bg-primary/5 hover:text-accent-foreground dark:hover:bg-accent/50"
            )}
          >
            <Icon className="caret-icon" />
            {label}
          </a>
        ))}
      </nav>
      <div className="grow" />
      <div className="border-border -mx-4 border-t px-4 pt-4">
        <p className="text-app-teritary-invert mb-3 px-2 font-mono text-[10px] tracking-wider uppercase">
          Akses cepat
        </p>
        <DownloadButton size="sm" />
      </div>
    </aside>
  );
}
