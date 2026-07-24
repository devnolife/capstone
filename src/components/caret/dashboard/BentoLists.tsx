import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  FolderGit2,
  Github,
  User,
  Video,
} from "lucide-react";
import { EmptyStateIllustration } from "@/components/caret/illustrations";

export type BentoIconKey =
  | "repo"
  | "online"
  | "kampus"
  | "dokumen"
  | "presentasi"
  | "user"
  | "review"
  | "project";

const ICON_MAP: Record<BentoIconKey, typeof Github> = {
  repo: Github,
  online: Video,
  kampus: Building2,
  dokumen: FileText,
  presentasi: CalendarCheck,
  user: User,
  review: ClipboardCheck,
  project: FolderGit2,
};

export interface BentoUpNext {
  title: string;
  time: string;
  chip: string;
  chipLive?: boolean;
  icon: BentoIconKey;
  summary?: string;
  facts?: ReadonlyArray<readonly [string, string]>;
}

export interface BentoRow {
  title: string;
  subtitle: string;
  chip?: string;
  chipLive?: boolean;
  icon: BentoIconKey;
  href: string;
}

interface BentoListsProps {
  upNextTitle?: string;
  upNextTag?: string;
  upNext?: BentoUpNext | null;
  upNextEmptyText?: string;
  rowsTitle: string;
  rowsViewAllHref?: string;
  rows: BentoRow[];
  rowsEmptyText?: string;
}

function StatusChip({ label, live }: { label: string; live?: boolean }) {
  return (
    <span className="border-app-secondary bg-app-quinary text-app-secondary-invert inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
      {live && <span className="size-1.5 animate-pulse rounded-full bg-green-500" />}
      {label}
    </span>
  );
}

function RowIcon({ icon, className }: { icon: BentoIconKey; className: string }) {
  const Icon = ICON_MAP[icon];
  return (
    <span
      className={`bg-app-primary text-foreground flex shrink-0 items-center justify-center ${className}`}
      aria-hidden
    >
      <Icon className="size-[55%]" />
    </span>
  );
}

/**
 * "Up next" briefing card + recent rows — visual clone of the /demo
 * MeetingLists, but fully data-driven via props.
 */
export function BentoLists({
  upNextTitle = "Berikutnya",
  upNextTag = "OTOMATIS",
  upNext,
  upNextEmptyText = "Belum ada jadwal terdekat.",
  rowsTitle,
  rowsViewAllHref,
  rows,
  rowsEmptyText = "Belum ada data.",
}: BentoListsProps) {
  return (
    <div className="bg-background flex h-full flex-col">
      {/* Up next */}
      <div className="border-zinc-800 border-b px-5 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h5 className="font-display text-lg leading-tight font-medium tracking-tight md:text-xl">
            {upNextTitle}
          </h5>
          <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
            {upNextTag}
          </span>
        </div>
        {upNext ? (
          <div className="border-app-secondary bg-app-quaternary rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-3">
              <RowIcon icon={upNext.icon} className="size-8 rounded-lg" />
              <div className="min-w-0 grow">
                <p className="truncate text-sm font-semibold">{upNext.title}</p>
                <p className="text-app-secondary-invert text-xs">{upNext.time}</p>
              </div>
              <StatusChip label={upNext.chip} live={upNext.chipLive} />
            </div>
            {upNext.summary && (
              <p className="text-app-secondary-invert mb-3 text-sm leading-snug">{upNext.summary}</p>
            )}
            {upNext.facts && upNext.facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {upNext.facts.map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2 text-xs">
                    <dt className="text-app-teritary-invert w-20 shrink-0">{k}</dt>
                    <dd className="text-app-primary-invert truncate font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ) : (
          <div className="border-app-secondary bg-app-quinary rounded-xl border border-dashed p-4">
            <EmptyStateIllustration icon="chart" />
            <p className="text-app-teritary-invert mt-2 text-center text-sm">{upNextEmptyText}</p>
          </div>
        )}
      </div>
      {/* Rows */}
      <div className="flex grow flex-col px-5 py-4 md:px-6 md:py-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h5 className="font-display text-lg leading-tight font-medium tracking-tight md:text-xl">
            {rowsTitle}
          </h5>
          {rowsViewAllHref && (
            <Link
              href={rowsViewAllHref}
              className="text-app-teritary-invert hover:text-app-primary-invert font-mono text-[10px] tracking-wider transition-colors md:text-xs"
            >
              LIHAT SEMUA
            </Link>
          )}
        </div>
        {rows.length > 0 ? (
          <ul className="divide-border -mx-2 divide-y">
            {rows.map((row) => (
              <li key={`${row.href}-${row.title}`}>
                <Link
                  href={row.href}
                  className="hover:bg-app-quinary flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
                >
                  <RowIcon icon={row.icon} className="size-6 rounded-md" />
                  <div className="min-w-0 grow">
                    <p className="truncate text-sm font-medium">{row.title}</p>
                    <p className="text-app-teritary-invert text-xs">{row.subtitle}</p>
                  </div>
                  {row.chip && <StatusChip label={row.chip} live={row.chipLive} />}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-6">
            <EmptyStateIllustration icon="review" />
            <p className="text-app-teritary-invert mt-2 text-center text-sm">{rowsEmptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
