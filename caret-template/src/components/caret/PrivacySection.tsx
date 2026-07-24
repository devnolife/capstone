export function PrivacySection() {
  return (
    <section className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-dot.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <div className="my-16 lg:my-36">
            <div data-reveal className="-my-px border border-zinc-800 px-6 pt-5 md:px-11 md:py-10">
              <div className="mb-16">
                <h3 className="font-display text-app-secondary-invert mb-4 text-2xl leading-tight font-medium tracking-tight md:text-3xl">
                  <span className="text-accent-foreground font-[550]">Private by design. </span>
                  No bots join your calls. No screen sharing. Your data stays encrypted and never leaves your control.
                </h3>
              </div>
            </div>
            <div
              data-reveal-group
              className="-my-px border border-zinc-800 grid gap-px bg-zinc-800 md:grid-cols-2"
            >
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    Hidden during screen share
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">Only you can see Caret.</p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <img
                    src="/images/caret/lock-03.png"
                    alt="Hidden during screen share"
                    className="absolute top-1/2 h-28 w-full -translate-y-1/2 object-contain object-center md:h-40"
                  />
                </div>
              </div>
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    No bot participants
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">
                    Records locally on your device, not as a meeting guest.
                  </p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <img
                    src="/images/caret/lock-04.png"
                    alt="No bot participants"
                    className="absolute top-1/2 h-40 w-full -translate-y-1/2 object-contain object-center"
                  />
                </div>
              </div>
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    End-to-end encrypted
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">
                    AES-256-GCM and RSA-4096 protect your data in transit and at rest.
                  </p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <img
                    src="/images/caret/lock-01.png"
                    alt="End-to-end encrypted"
                    className="absolute top-1/2 h-20 w-full -translate-y-1/2 object-cover object-center md:h-28"
                  />
                </div>
              </div>
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    Never used to train AI
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">
                    Your conversations stay yours. We don&apos;t train models on your data.
                  </p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <img
                    src="/images/caret/lock-02.png"
                    alt="Never used to train AI"
                    className="absolute top-1/2 h-28 w-full -translate-y-1/2 object-contain object-center md:h-36"
                  />
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
