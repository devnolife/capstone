import { Building2, FileText, Github, Video } from "lucide-react";
import {
  RECENT_MEETINGS,
  UP_NEXT,
  UP_NEXT_BRIEF,
  type Meeting,
} from "@/components/caret/dashboard/dashboard-data";

const PLATFORM_ICON_MAP: Record<Meeting["platform"], typeof Github> = {
  repo: Github,
  online: Video,
  kampus: Building2,
  dokumen: FileText,
};

function PlatformIcon({ platform, className }: { platform: Meeting["platform"]; className: string }) {
  const Icon = PLATFORM_ICON_MAP[platform];
  return (
    <span
      className={`bg-app-primary text-foreground flex shrink-0 items-center justify-center ${className}`}
      aria-label={platform}
    >
      <Icon className="size-[55%]" />
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const live = status === "Berlangsung";
  return (
    <span className="border-app-secondary bg-app-quinary text-app-secondary-invert inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
      {live && <span className="size-1.5 animate-pulse rounded-full bg-green-500" />}
      {status}
    </span>
  );
}

/** "Up next" briefing card + recent meeting rows. */
export function MeetingLists() {
  return (
    <div className="bg-background flex h-full flex-col">
      {/* Up next */}
      <div className="border-border border-b px-5 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h5 className="font-display text-lg leading-tight font-medium tracking-tight md:text-xl">
            Berikutnya
          </h5>
          <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
            RINGKASAN OTOMATIS
          </span>
        </div>
        <div className="border-app-secondary bg-app-quaternary rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-3">
            <PlatformIcon platform={UP_NEXT.platform} className="size-8 rounded-lg" />
            <div className="min-w-0 grow">
              <p className="truncate text-sm font-semibold">{UP_NEXT.title}</p>
              <p className="text-app-secondary-invert text-xs">
                {UP_NEXT.time} · {UP_NEXT.duration}
              </p>
            </div>
            <StatusChip status={UP_NEXT.status} />
          </div>
          <p className="text-app-secondary-invert mb-3 text-sm leading-snug">
            {UP_NEXT_BRIEF.summary}
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {UP_NEXT_BRIEF.facts.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2 text-xs">
                <dt className="text-app-teritary-invert w-20 shrink-0">{k}</dt>
                <dd className="text-app-primary-invert truncate font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {/* Recent */}
      <div className="flex grow flex-col px-5 py-4 md:px-6 md:py-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h5 className="font-display text-lg leading-tight font-medium tracking-tight md:text-xl">
            Review terakhir
          </h5>
          <a
            href="/demo"
            className="text-app-teritary-invert hover:text-app-primary-invert font-mono text-[10px] tracking-wider transition-colors md:text-xs"
          >
            LIHAT SEMUA
          </a>
        </div>
        <ul className="divide-border -mx-2 divide-y">
          {RECENT_MEETINGS.map((m) => (
            <li key={m.title}>
              <a
                href="/demo"
                className="hover:bg-app-quinary flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
              >
                <PlatformIcon platform={m.platform} className="size-6 rounded-md" />
                <div className="min-w-0 grow">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  <p className="text-app-teritary-invert text-xs">
                    {m.time} · {m.duration}
                  </p>
                </div>
                <StatusChip status={m.status} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
