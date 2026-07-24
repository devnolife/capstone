import Link from "next/link";

export interface BentoStat {
  label: string;
  value: string | number;
  /** Small line under the value (e.g. "12 sudah submit" or delta text) */
  hint?: string;
  /** Render the hint in destructive red */
  hintNegative?: boolean;
  /** Makes the whole cell a link */
  href?: string;
}

/**
 * Four bento stat cells — display numerals, mono labels, gap-px borders.
 * Visual clone of the /demo StatCards, but data-driven via props.
 */
export function BentoStats({ stats }: { stats: BentoStat[] }) {
  return (
    <div
      data-reveal-group
      className="border-zinc-800 grid grid-cols-2 gap-px border bg-zinc-800 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const content = (
          <>
            <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
              {stat.label}
            </span>
            <span className="font-display text-3xl leading-none font-[450] tracking-tight tabular-nums md:text-4xl">
              {stat.value}
            </span>
            {stat.hint && (
              <span
                className={
                  stat.hintNegative
                    ? "text-destructive text-xs font-medium"
                    : "text-app-secondary-invert text-xs font-medium"
                }
              >
                {stat.hint}
              </span>
            )}
          </>
        );

        const cellClass =
          "bg-background flex flex-col gap-3 px-5 py-4 md:px-6 md:py-5";

        return stat.href ? (
          <Link
            key={stat.label}
            href={stat.href}
            className={`${cellClass} transition-colors hover:bg-app-quinary`}
          >
            {content}
          </Link>
        ) : (
          <div key={stat.label} className={cellClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
