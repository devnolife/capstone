import type { ReactNode } from 'react';
import type { DayCodeLine } from '@/types/daytona';

/* ============ Shared modern code-window primitives ============
   Chrome ala editor: traffic lights + tab nama file + slot kanan,
   baris kode bernomor dengan hover highlight (.day-code-line). */

function FileGlyph() {
  return (
    <svg
      viewBox="0 0 12 14"
      width={10}
      height={12}
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M1.5 1h6L11 4.5V13H1.5V1Z"
        stroke="#585858"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M7.5 1v3.5H11" stroke="#585858" strokeWidth="1.1" />
    </svg>
  );
}

interface DayWindowChromeProps {
  filename: string;
  right?: ReactNode;
}

export function DayWindowChrome({ filename, right }: DayWindowChromeProps) {
  return (
    <div className="flex h-[44px] items-center justify-between gap-3 border-b border-[#1c1c1c] pl-4 pr-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 gap-2">
          <span className="size-[11px] rounded-full bg-[#ed6b5f]" />
          <span className="size-[11px] rounded-full bg-[#f3be4e]" />
          <span className="size-[11px] rounded-full bg-[#65c757]" />
        </div>
        <span className="flex min-w-0 items-center gap-2 rounded-[6px] border border-[#1f1f1f] bg-[#111111] px-3 py-1.5">
          <FileGlyph />
          <span className="truncate font-day-code text-[12px] leading-none text-[#a2a2a2]">
            {filename}
          </span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </div>
  );
}

interface DayCodeLinesProps {
  lines: DayCodeLine[];
  /** kelas warna token tanpa color eksplisit */
  defaultTokenClass?: string;
  /** kursor berkedip di akhir baris terisi terakhir */
  showCursor?: boolean;
}

export function DayCodeLines({
  lines,
  defaultTokenClass = 'text-[#eeeeee]',
  showCursor = false,
}: DayCodeLinesProps) {
  const lastFilled = showCursor
    ? lines.reduce((acc, line, i) => (line.length > 0 ? i : acc), -1)
    : -1;

  return (
    <div className="min-w-max font-day-code text-[13.5px] leading-[21px]">
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="day-code-line flex pr-4">
          <span
            aria-hidden="true"
            className="w-10 shrink-0 select-none pr-4 text-right text-[13px] text-[#3a3a3a]"
          >
            {lineIndex + 1}
          </span>
          <span className="whitespace-pre">
            {line.length === 0
              ? '\u00A0'
              : line.map((token, tokenIndex) =>
                  token.color ? (
                    <span key={tokenIndex} style={{ color: token.color }}>
                      {token.t}
                    </span>
                  ) : (
                    <span key={tokenIndex} className={defaultTokenClass}>
                      {token.t}
                    </span>
                  ),
                )}
            {lineIndex === lastFilled ? (
              <span
                aria-hidden="true"
                className="day-anim-cursor ml-[2px] inline-block h-[14px] w-[7px] translate-y-[2px] bg-white/60"
              />
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}
