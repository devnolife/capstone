import Link from "next/link";

const footerColumns = [
  {
    heading: "Platform",
    links: [
      { label: "Persyaratan Project", href: "/login" },
      { label: "Repository GitHub", href: "/login" },
      { label: "Review & Penilaian", href: "/login" },
      { label: "Jadwal Presentasi", href: "/login" },
      { label: "Rubrik Penilaian", href: "/login" },
    ],
  },
  {
    heading: "Peran",
    links: [
      { label: "Mahasiswa", href: "/login" },
      { label: "Dosen Penguji", href: "/login" },
      { label: "Admin Prodi", href: "/login" },
    ],
  },
  {
    heading: "Prodi",
    links: [
      { label: "Informatika Unismuh", href: "#" },
      { label: "Demo Dashboard", href: "/demo" },
      { label: "Fitur", href: "#fitur" },
      { label: "Statistik", href: "#statistik" },
    ],
  },
];

export function CaretFooter() {
  return (
    <footer className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <div
        data-reveal
        className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 py-10"
      >
        <div className="bg-background mx-auto grid w-full max-w-(--breakpoint-lg) gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <p className="text-app-primary-invert grow text-sm font-semibold">
              Capstone Platform — Prodi Informatika
            </p>
            <address className="text-app-secondary-invert mt-2 grow text-sm not-italic">
              Universitas Muhammadiyah Makassar
              <br />
              Jl. Sultan Alauddin No. 259, Makassar
            </address>
          </div>
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <p className="text-app-teritary-invert mb-4 font-dm-mono text-[10px] uppercase tracking-[0.18em]">
                {column.heading}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-app-secondary-invert text-sm transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 text-app-secondary-invert flex py-6 text-sm max-md:flex-col max-md:gap-y-3">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <p className="mb-1 grow">
            © {new Date().getFullYear()} Capstone Platform — Prodi Informatika Unismuh Makassar.
          </p>
          <ul className="flex shrink-0 items-center gap-2 text-right">
            <li>
              <a
                className="text-app-primary-invert decoration-border hover:decoration-app-secondary-invert font-semibold underline underline-offset-2 transition-colors"
                href="/login"
              >
                Masuk
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
