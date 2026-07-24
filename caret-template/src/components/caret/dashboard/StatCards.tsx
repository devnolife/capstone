import { STATS } from "@/components/caret/dashboard/dashboard-data";

/** Four bento stat cells — display numerals, mono labels, gap-px borders. */
export function StatCards() {
  return (
    <div
      data-reveal-group
      className="border-zinc-800 grid grid-cols-2 gap-px border bg-zinc-800 lg:grid-cols-4"
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="bg-background flex flex-col gap-3 px-5 py-4 md:px-6 md:py-5">
          <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
            {stat.label}
          </span>
          <span className="font-display text-3xl leading-none font-[450] tracking-tight md:text-4xl">
            {stat.value}
          </span>
          <span
            className={
              stat.positive
                ? "text-app-secondary-invert text-xs font-medium"
                : "text-destructive text-xs font-medium"
            }
          >
            {stat.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
