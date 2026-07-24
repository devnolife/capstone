import { DownloadButton } from "@/components/caret/DownloadButton";
import { CaretWatermark } from "@/components/icons";

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
                  Try Caret today
                </h3>
                <p className="text-app-secondary-invert text-base md:text-lg">
                  Fewer awkward pauses. Better answers. Focus on the conversation.
                </p>
              </div>
              <DownloadButton size="md" />
            </div>
          </div>
        </div>
      </section>
      <div className="flex justify-center overflow-hidden mask-t-from-0% align-bottom md:h-32 xl:h-40">
        <CaretWatermark data-watermark className="text-app-teritary h-24 w-auto md:h-32 lg:h-48" />
      </div>
    </>
  );
}
