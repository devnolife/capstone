import { SUGGESTIONS } from "@/components/caret/dashboard/dashboard-data";

function AudioBars() {
  return (
    <div className="flex size-6 items-center justify-center gap-0.75">
      <div className="bg-app-secondary-invert size-0.75 animate-[audioBar1_1.5s_ease-in-out_infinite] rounded-full"></div>
      <div className="bg-app-secondary-invert size-0.75 animate-[audioBar2_1.5s_ease-in-out_infinite] rounded-full delay-200"></div>
      <div className="bg-app-secondary-invert size-0.75 animate-[audioBar3_1.5s_ease-in-out_infinite] rounded-full delay-400"></div>
    </div>
  );
}

/** Live-suggestions feed — two minibar-style Q&A cards with citation chips. */
export function SuggestionsFeed() {
  return (
    <div
      data-reveal-group
      className="border-zinc-800 grid gap-px border bg-zinc-800 lg:grid-cols-2"
    >
      {SUGGESTIONS.map((s) => (
        <article key={s.question} className="bg-background px-5 py-4 md:px-6 md:py-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-emerald-800">
              <img src="/images/caret/character-casper.svg" alt="Caret" className="-mb-1 h-5 w-auto" />
            </span>
            <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
              LIVE SUGGESTION
            </span>
            <div className="grow" />
            <AudioBars />
          </div>
          <div className="space-y-0.5 py-1">
            <div className="text-app-primary-invert text-base leading-tight font-semibold tracking-tight">
              {s.question}
            </div>
            <p className="text-app-secondary-invert text-sm font-medium tracking-tight">
              {s.sourceLabel}
            </p>
          </div>
          <div className="text-accent-foreground text-base font-medium tracking-[-0.015em]">
            <div className="mb-3">{s.answer}</div>
            <div className="-mb-0.5 flex flex-wrap items-center gap-1.5">
              {s.citations.map((c) => (
                <div
                  key={c.title}
                  className="border-app-secondary flex w-44 shrink-0 items-center gap-2 rounded-xl border bg-black/10 py-1.5 pr-3 pl-2 *:[text-box-trim:trim-both]"
                >
                  <img className="size-5 rounded-full" alt="Citation" src={c.image} />
                  <div className="truncate">
                    <p className="text-app-primary-invert truncate text-xs leading-tight font-medium">
                      {c.title}
                    </p>
                    <p className="text-app-secondary-invert truncate text-[10px] leading-none">
                      {c.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
