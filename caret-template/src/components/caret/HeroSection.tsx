import { DownloadButton } from "@/components/caret/DownloadButton";
import { HeroMockup } from "@/components/caret/HeroMockup";

export function HeroSection() {
  return (
    <section className="md:px-4 lg:px-8">
      <div className="mx-auto max-w-(--breakpoint-xl) pt-12 pb-10 text-center max-md:px-6 md:pb-20">
        <div className="mb-8">
          <h1
            data-hero-title
            className="font-display mx-auto mb-4 max-w-lg text-[40px] leading-none font-[450] tracking-tight break-keep lg:text-5xl"
          >
            AI meeting assistant that makes you smarter
          </h1>
          <p data-hero-item className="text-app-secondary-invert mx-auto mb-2 max-w-xl text-lg">
            Get real-time answers during calls. Caret pulls context from your docs and past
            meetings in under a second.
          </p>
          <a
            data-hero-item
            className="font-display text-app-secondary-invert mb-4 inline-flex items-center gap-1.5 text-xs leading-none font-medium opacity-80 [text-box-trim:trim-both]"
            target="_blank"
            rel="noreferrer"
            href="https://www.ycombinator.com/companies/aside"
          >
            Backed by
            <img
              className="h-4"
              src="/images/caret/y-combinator.svg"
              alt="Y Combinator"
              width="80"
              height="16"
            />
          </a>
        </div>
        <div data-hero-item className="inline-flex items-center gap-3 max-md:flex-col md:gap-2">
          <a
            href="https://cal.com/team/aside/aside-demo"
            target="_blank"
            rel="noreferrer"
            className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center gap-2 border-transparent font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 border shadow-xs h-10 px-6 has-[>svg]:px-4 rounded-full text-base"
          >
            <span>Book a demo</span>
          </a>
          <DownloadButton size="md" />
        </div>
      </div>
      <HeroMockup />
    </section>
  );
}
