import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Halaman 404 custom — bahasa visual Caret (mono label, display type, watermark). */
export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      {/* Top meta */}
      <div className="flex items-center justify-between px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-app-teritary-invert md:px-10">
        <span>Capstone · Prodi Informatika</span>
        <span>[404] TIDAK DITEMUKAN</span>
      </div>

      {/* Content */}
      <main className="relative z-10 flex grow flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-app-secondary px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-app-primary-invert">
          Error 404
        </span>
        <h1 className="font-display max-w-xl text-4xl leading-tight font-[450] tracking-tight text-balance md:text-5xl">
          Halaman ini tidak ada di <span className="font-editorial">capstone</span>
        </h1>
        <p className="mt-4 max-w-md text-app-secondary-invert">
          Alamat mungkin salah ketik, atau halamannya sudah dipindahkan.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <ArrowLeft size={15} /> Kembali ke beranda
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full border border-input bg-input/30 px-6 text-sm font-medium text-foreground transition-all hover:bg-input/50 active:scale-[0.98]"
          >
            Buka dashboard
          </Link>
        </div>
      </main>

      {/* Watermark */}
      <div aria-hidden className="pointer-events-none relative z-0 -mb-[5vw] select-none text-center">
        <span className="font-editorial text-[24vw] leading-[0.8] tracking-tight text-app-quaternary">
          404
        </span>
      </div>
    </div>
  );
}
