import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  GitBranch,
  Github,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

/* ==================================================================
   Code-drawn illustrations (DOM/SVG) in the Caret visual language —
   replace the original Caret app screenshots with capstone content.
   ================================================================== */

/** Mini "project brief" panel — used in QuickBriefsCard (before review). */
export function ProjectBriefMock() {
  return (
    <div className="font-sans-alt absolute -bottom-6 left-6 z-1 w-[420px] max-w-[92%] rounded-2xl border border-zinc-700/60 bg-zinc-900/95 shadow-2xl">
      {/* Header: repo */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
          <Github className="size-4" />
        </span>
        <div className="min-w-0 grow">
          <p className="truncate text-[13px] font-semibold leading-tight text-zinc-100">
            tim-umkm/capstone
          </p>
          <p className="flex items-center gap-1 text-[10px] leading-none text-zinc-500">
            <GitBranch className="size-2.5" /> main · 12 commit pekan ini
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
          Live
        </span>
      </div>
      {/* Checklist persyaratan */}
      <div className="space-y-2 px-4 py-3">
        {[
          { label: "Integrasi Matakuliah", done: true },
          { label: "Metodologi Pengembangan", done: true },
          { label: "Bukti Deployment", done: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.done ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
            ) : (
              <Loader2 className="size-3.5 shrink-0 text-zinc-500" />
            )}
            <span
              className={
                item.done
                  ? "text-xs text-zinc-300"
                  : "text-xs text-zinc-500"
              }
            >
              {item.label}
            </span>
            <div className="grow" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
              {item.done ? "Lengkap" : "Proses"}
            </span>
          </div>
        ))}
      </div>
      {/* Catatan review terakhir */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
          Catatan review terakhir
        </p>
        <p className="text-xs leading-snug text-zinc-400">
          &ldquo;Pisahkan layer service dan repository, lampirkan commit perbaikan.&rdquo;
        </p>
      </div>
    </div>
  );
}

/** Mini "hasil review" panel — rubrik scores, used in AfterCallSection. */
export function ReviewSummaryMock() {
  const rows = [
    { label: "Kualitas Kode", score: 18, max: 20 },
    { label: "Fungsionalitas", score: 22, max: 25 },
    { label: "Dokumentasi", score: 17, max: 20 },
    { label: "Presentasi", score: 18, max: 20 },
  ];
  return (
    <div className="font-sans-alt absolute -bottom-6 left-6 z-1 w-[400px] max-w-[92%] rounded-2xl border border-zinc-700/60 bg-zinc-900/95 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
          <ClipboardCheck className="size-4" />
        </span>
        <div className="min-w-0 grow">
          <p className="truncate text-[13px] font-semibold leading-tight text-zinc-100">
            Hasil Review · Tim UMKM
          </p>
          <p className="text-[10px] leading-none text-zinc-500">Rubrik kelompok</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold leading-none text-zinc-900">
          88<span className="font-normal text-zinc-500">/100</span>
        </span>
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-zinc-400">{row.label}</span>
            <div className="h-1.5 grow overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-200"
                style={{ width: `${(row.score / row.max) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[10px] text-zinc-500">
              {row.score}/{row.max}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-2.5">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        <p className="text-[11px] font-medium text-zinc-300">
          Bonus deployment VPS + Nginx: <span className="text-emerald-400">+15 poin</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Privacy section illustrations — line-art SVG, zinc palette         */
/* ------------------------------------------------------------------ */

function OrbitRings() {
  return (
    <>
      {[70, 110, 150].map((size) => (
        <circle
          key={size}
          cx="120"
          cy="70"
          r={size / 2}
          fill="none"
          stroke="#3f3f46"
          strokeWidth="1"
          strokeDasharray="3 6"
          opacity="0.5"
        />
      ))}
    </>
  );
}

/** Akses sesuai peran — tiga peran mengelilingi satu kunci akses. */
export function RoleAccessIllustration() {
  return (
    <div className="absolute top-1/2 flex h-28 w-full -translate-y-1/2 items-center justify-center md:h-40">
      <svg viewBox="0 0 240 140" className="h-full w-auto" aria-hidden>
        <OrbitRings />
        <g>
          <circle cx="120" cy="70" r="22" fill="#18181b" stroke="#52525b" />
          <foreignObject x="106" y="56" width="28" height="28">
            <KeyRound className="size-7 text-zinc-200" />
          </foreignObject>
        </g>
        {[
          { x: 48, y: 34, label: "M" },
          { x: 192, y: 34, label: "D" },
          { x: 120, y: 124, label: "A" },
        ].map((node) => (
          <g key={node.label}>
            <line
              x1="120"
              y1="70"
              x2={node.x}
              y2={node.y}
              stroke="#3f3f46"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <circle cx={node.x} cy={node.y} r="13" fill="#18181b" stroke="#3f3f46" />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              className="fill-zinc-400 font-mono text-[10px]"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Tanpa rekap manual — alur otomatis dokumen → proses → selesai. */
export function AutomationIllustration() {
  return (
    <div className="absolute top-1/2 flex h-28 w-full -translate-y-1/2 items-center justify-center md:h-40">
      <svg viewBox="0 0 260 120" className="h-full w-auto" aria-hidden>
        <line x1="62" y1="60" x2="106" y2="60" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="154" y1="60" x2="198" y2="60" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 4" />
        <polygon points="104,56 112,60 104,64" fill="#52525b" />
        <polygon points="196,56 204,60 196,64" fill="#52525b" />
        {[
          { x: 40, Icon: FileCheck2 },
          { x: 130, Icon: RefreshCw },
          { x: 220, Icon: CheckCircle2 },
        ].map(({ x, Icon }, index) => (
          <g key={index}>
            <rect x={x - 22} y="38" width="44" height="44" rx="12" fill="#18181b" stroke="#3f3f46" />
            <foreignObject x={x - 10} y="50" width="20" height="20">
              <Icon className="size-5 text-zinc-300" />
            </foreignObject>
          </g>
        ))}
        <text x="130" y="105" textAnchor="middle" className="fill-zinc-600 font-mono text-[9px] uppercase tracking-[0.2em]">
          submit → review → acc
        </text>
      </svg>
    </div>
  );
}

/** Terenkripsi menyeluruh — gembok dengan orbit sinyal. */
export function EncryptionIllustration() {
  return (
    <div className="absolute top-1/2 flex h-24 w-full -translate-y-1/2 items-center justify-center md:h-32">
      <svg viewBox="0 0 240 130" className="h-full w-auto" aria-hidden>
        <OrbitRings />
        <rect x="96" y="52" width="48" height="40" rx="10" fill="#18181b" stroke="#52525b" />
        <path
          d="M106 52 v-8 a14 14 0 0 1 28 0 v8"
          fill="none"
          stroke="#52525b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <foreignObject x="110" y="62" width="20" height="20">
          <Lock className="size-5 text-zinc-200" />
        </foreignObject>
        <text x="120" y="118" textAnchor="middle" className="fill-zinc-600 font-mono text-[9px] uppercase tracking-[0.2em]">
          at rest · in transit
        </text>
      </svg>
    </div>
  );
}

/** Penilaian transparan — bar rubrik terbuka dengan mata pengawas. */
export function TransparencyIllustration() {
  const bars = [26, 40, 32, 46];
  return (
    <div className="absolute top-1/2 flex h-28 w-full -translate-y-1/2 items-center justify-center md:h-36">
      <svg viewBox="0 0 240 130" className="h-full w-auto" aria-hidden>
        <line x1="52" y1="96" x2="188" y2="96" stroke="#3f3f46" strokeWidth="1" />
        {bars.map((height, index) => (
          <rect
            key={index}
            x={62 + index * 30}
            y={96 - height}
            width="18"
            height={height}
            rx="4"
            fill={index === bars.length - 1 ? "#e4e4e7" : "#27272a"}
            stroke={index === bars.length - 1 ? "none" : "#3f3f46"}
          />
        ))}
        <g>
          <circle cx="188" cy="38" r="17" fill="#18181b" stroke="#3f3f46" />
          <foreignObject x="179" y="29" width="18" height="18">
            <Eye className="size-[18px] text-zinc-300" />
          </foreignObject>
        </g>
        <line x1="176" y1="50" x2="152" y2="66" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 4" />
        <text x="120" y="120" textAnchor="middle" className="fill-zinc-600 font-mono text-[9px] uppercase tracking-[0.2em]">
          rubrik terbuka
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard empty-state illustration                                 */
/* ------------------------------------------------------------------ */

/** Ilustrasi kecil untuk empty state (orbit putus-putus + ikon). */
export function EmptyStateIllustration({
  icon = "shield",
}: {
  icon?: "shield" | "chart" | "user" | "review";
}) {
  const Icon =
    icon === "chart" ? BarChart3 : icon === "user" ? UserRound : icon === "review" ? ClipboardCheck : ShieldCheck;
  return (
    <div className="relative mx-auto flex size-16 items-center justify-center" aria-hidden>
      {[64, 46].map((size, index) => (
        <span
          key={size}
          className="animate-orbit-ripple absolute rounded-full border border-dashed border-zinc-700"
          style={{ width: size, height: size, animationDelay: `${-(index * 0.3)}s`, opacity: 0.6 }}
        />
      ))}
      <span className="flex size-8 items-center justify-center rounded-full bg-app-primary text-foreground">
        <Icon className="size-4" />
      </span>
    </div>
  );
}
