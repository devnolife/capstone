/**
 * Bento skeleton shown while dashboard data loads —
 * mirrors LabelRow + BentoStats + chart/list grid shapes.
 */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      {/* Greeting */}
      <div className="mb-2 flex items-end justify-between pt-1">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-md bg-app-primary md:h-8" />
          <div className="h-4 w-80 max-w-[70vw] rounded-md bg-app-quaternary" />
        </div>
        <div className="hidden h-4 w-40 rounded-md bg-app-quaternary md:block" />
      </div>

      {/* Label row */}
      <div className="flex h-10 items-center justify-between">
        <div className="h-3 w-32 rounded bg-app-quaternary" />
        <div className="h-3 w-24 rounded bg-app-quaternary" />
      </div>

      {/* Stats */}
      <div className="border-border grid grid-cols-2 gap-px border bg-border lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background flex flex-col gap-3 px-5 py-4 md:px-6 md:py-5">
            <div className="h-3 w-24 rounded bg-app-quaternary" />
            <div className="h-9 w-16 rounded-md bg-app-primary" />
            <div className="h-3 w-32 rounded bg-app-quaternary" />
          </div>
        ))}
      </div>

      {/* Label row */}
      <div className="flex h-10 items-center justify-between">
        <div className="h-3 w-28 rounded bg-app-quaternary" />
        <div className="h-3 w-20 rounded bg-app-quaternary" />
      </div>

      {/* Chart + list */}
      <div className="border-border grid gap-px border bg-border lg:grid-cols-[1.1fr_1fr]">
        <div className="bg-background flex h-72 flex-col px-5 py-4 md:px-6 md:py-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="h-5 w-40 rounded bg-app-primary" />
            <div className="h-3 w-24 rounded bg-app-quaternary" />
          </div>
          <div className="flex grow items-end gap-3 pb-6">
            {[40, 65, 30, 80, 55, 20, 70].map((h, i) => (
              <div key={i} className="grow rounded-t-md bg-app-quaternary" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-background px-5 py-4 md:px-6 md:py-5">
          <div className="mb-3 h-5 w-32 rounded bg-app-primary" />
          <div className="border-app-secondary bg-app-quaternary h-32 rounded-xl border" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-6 rounded-md bg-app-quaternary" />
                <div className="grow space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-app-quaternary" />
                  <div className="h-3 w-1/2 rounded bg-app-quinary" />
                </div>
                <div className="h-6 w-20 rounded-full bg-app-quinary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
