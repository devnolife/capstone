import {
  AutomationIllustration,
  EncryptionIllustration,
  RoleAccessIllustration,
  TransparencyIllustration,
} from "@/components/caret/illustrations";

export function PrivacySection() {
  return (
    <section className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 bg-repeat bg-[url(/images/caret/bg-pattern-dot.svg)]">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <div className="my-16 lg:my-36">
            <div data-reveal className="-my-px border border-zinc-800 px-6 pt-5 md:px-11 md:py-10">
              <div className="mb-16">
                <h3 className="font-display text-app-secondary-invert mb-4 text-2xl leading-tight font-medium tracking-tight text-pretty md:text-3xl">
                  <span className="text-accent-foreground font-[550]">Aman sejak dirancang. </span>
                  Data akademik dikelola prodi. Akses diatur per peran, dan riwayat setiap perubahan selalu tercatat.
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
                    Akses sesuai peran
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">Mahasiswa, dosen, dan admin hanya melihat yang relevan.</p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <RoleAccessIllustration />
                </div>
              </div>
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    Tanpa rekap manual
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">
                    Status dan riwayat terekam otomatis, bukan disalin ke spreadsheet.
                  </p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <AutomationIllustration />
                </div>
              </div>
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    Terenkripsi menyeluruh
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">
                    Kredensial dan berkas dilindungi enkripsi saat dikirim maupun disimpan.
                  </p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <EncryptionIllustration />
                </div>
              </div>
              <div className="bg-background flex flex-col">
                <div className="grow px-6 pt-5">
                  <h5 className="font-display mb-1 text-lg leading-tight font-medium tracking-tight md:mb-2 md:text-xl">
                    Penilaian yang transparan
                  </h5>
                  <p className="text-app-secondary-invert leading-snug md:text-lg">
                    Rubrik terbuka dan riwayat lengkap membuat keputusan mudah dipertanggungjawabkan.
                  </p>
                </div>
                <div className="relative h-40 shrink-0 overflow-hidden md:h-48">
                  <TransparencyIllustration />
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
