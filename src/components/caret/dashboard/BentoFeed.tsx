import Link from "next/link";
import { EmptyStateIllustration } from "@/components/caret/illustrations";

export interface BentoFeedChip {
  label: string;
  sub?: string;
  image?: string;
}

export interface BentoFeedItem {
  /** Mono uppercase tag, e.g. "REVIEW MASUK" */
  tag: string;
  title: string;
  subtitle?: string;
  body?: string;
  /** Right-aligned mono meta, e.g. relative time */
  meta?: string;
  chips?: BentoFeedChip[];
  href?: string;
}

/**
 * Two-column feed cards — visual clone of the /demo SuggestionsFeed
 * (avatar + mono tag header, bold title, citation chips), data-driven.
 */
export function BentoFeed({
  items,
  emptyText = "Belum ada aktivitas.",
}: {
  items: BentoFeedItem[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return (
      <div
        data-reveal
        className="border-border bg-background border p-8"
      >
        <EmptyStateIllustration icon="review" />
        <p className="text-app-teritary-invert mt-3 text-center text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <div data-reveal-group className="border-border grid gap-px border bg-border lg:grid-cols-2">
      {items.map((item, index) => {
        const inner = (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-emerald-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="h-5 w-auto" />
              </span>
              <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
                {item.tag}
              </span>
              <div className="grow" />
              {item.meta && (
                <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider">
                  {item.meta}
                </span>
              )}
            </div>
            <div className="space-y-0.5 py-1">
              <div className="text-app-primary-invert text-base leading-tight font-semibold tracking-tight">
                {item.title}
              </div>
              {item.subtitle && (
                <p className="text-app-secondary-invert text-sm font-medium tracking-tight">
                  {item.subtitle}
                </p>
              )}
            </div>
            {(item.body || (item.chips && item.chips.length > 0)) && (
              <div className="text-accent-foreground text-base font-medium tracking-[-0.015em]">
                {item.body && <div className="mb-3 text-sm leading-snug">{item.body}</div>}
                {item.chips && item.chips.length > 0 && (
                  <div className="-mb-0.5 flex flex-wrap items-center gap-1.5">
                    {item.chips.map((chip) => (
                      <div
                        key={chip.label}
                        className="border-app-secondary flex w-44 shrink-0 items-center gap-2 rounded-xl border bg-black/10 py-1.5 pr-3 pl-2"
                      >
                        {chip.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="size-5 rounded-full" alt="" src={chip.image} />
                        )}
                        <div className="truncate">
                          <p className="text-app-primary-invert truncate text-xs leading-tight font-medium">
                            {chip.label}
                          </p>
                          {chip.sub && (
                            <p className="text-app-secondary-invert truncate text-[10px] leading-none">
                              {chip.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        );

        const cardClass = "bg-background px-5 py-4 md:px-6 md:py-5";
        return item.href ? (
          <Link
            key={`${item.tag}-${index}`}
            href={item.href}
            className={`${cardClass} block transition-colors hover:bg-app-quinary`}
          >
            {inner}
          </Link>
        ) : (
          <article key={`${item.tag}-${index}`} className={cardClass}>
            {inner}
          </article>
        );
      })}
    </div>
  );
}
