import { DownloadButton } from "@/components/caret/DownloadButton";

export function CtaSection() {
  return (
    <>
      <section id="talk-to-sales-section" className="md:px-8 mt-24 md:mt-40">
        <div className="px-6 md:px-16 lg:px-24 xl:px-40">
          <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
            <div
              data-reveal
              className="-my-px border border-zinc-800 bg-app-primary border-none px-6 py-10 md:px-11"
            >
              <div className="mb-8 md:mb-16">
                <h3 className="font-display mb-4 text-3xl leading-none font-[450] tracking-tight md:text-4xl">
                  Coba Capstone hari ini
                </h3>
                <p className="text-app-secondary-invert text-base md:text-lg">
                  Tanpa rekap manual. Review lebih terarah. Fokus pada produkmu.
                </p>
              </div>
              <DownloadButton size="md" />
            </div>
          </div>
        </div>
      </section>
      <div className="flex justify-center overflow-hidden mask-t-from-0% align-bottom md:h-32 xl:h-40">
        <span
          data-watermark
          aria-hidden
          className="text-app-teritary font-editorial select-none text-[24vw] leading-[0.8] tracking-tight md:text-[16vw]"
        >
          capstone
        </span>
      </div>
    </>
  );
}
