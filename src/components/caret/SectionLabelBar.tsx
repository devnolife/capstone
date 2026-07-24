interface SectionLabelBarProps {
  left: string;
  right: string;
}

/**
 * Mono-font label strip that heads each numbered section,
 * e.g. "[01] LIVE SUGGESTION" ... "/ FEATURES".
 */
export function SectionLabelBar({ left, right }: SectionLabelBarProps) {
  return (
    <div className="-my-px border border-zinc-800 px-6 max-md:border-x-0 md:px-16 lg:px-24 xl:px-40">
      <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
        <div className="text-primary/50 flex h-12 items-center justify-between font-mono text-xs font-medium tracking-wider md:h-16 md:text-sm">
          <span data-label-left>{left}</span>
          <span data-label-right>{right}</span>
        </div>
      </div>
    </div>
  );
}
