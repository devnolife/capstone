/**
 * Mono label row — identical to the /demo dashboard LabelRow.
 * `data-label-left/right` are picked up by DashboardEntrance (on-mount)
 * or ScrollAnimations (scroll-triggered) for the slide-in effect.
 */
export function LabelRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="text-primary/50 flex h-10 items-center justify-between font-mono text-[10px] font-medium tracking-wider md:text-xs">
      <span data-label-left>{left}</span>
      <span data-label-right>{right}</span>
    </div>
  );
}
