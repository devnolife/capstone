'use client';

import {
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from 'react';

import { QuoteIcon } from '@/components/daytona/icons';

const CARD_COUNT = 6;

type Testimonial = {
  initials: string;
  accent: string;
  name: string;
  role: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'AP',
    accent: '#2ecc71',
    name: 'Andi Pratama',
    role: 'Mahasiswa Angkatan 2021',
    quote:
      'Submit project tinggal push ke GitHub, status review langsung kelihatan. Tidak ada lagi kirim file zip lewat chat.',
  },
  {
    initials: 'NH',
    accent: '#0080ff',
    name: 'Nurul Hikmah',
    role: 'Mahasiswa Angkatan 2020',
    quote:
      'Rubrik terlihat sejak awal semester, jadi tim kami tahu persis apa yang dikejar di setiap milestone.',
  },
  {
    initials: 'LK',
    accent: '#33cccc',
    name: 'Dr. Lukman, M.Kom',
    role: 'Dosen Penguji',
    quote:
      'Saya mereview kode langsung dari repository dan menaruh komentar di baris yang bermasalah. Kualitas revisi mahasiswa naik drastis.',
  },
  {
    initials: 'MF',
    accent: '#f3be4e',
    name: 'Muh. Fadel',
    role: 'Mahasiswa Angkatan 2021',
    quote:
      'Riwayat submission tersimpan semua. Saat sidang saya tinggal buka platform untuk menunjukkan perkembangan project.',
  },
  {
    initials: 'HS',
    accent: '#bb88ff',
    name: 'Ir. Hasanuddin, M.T',
    role: 'Koordinator Capstone',
    quote:
      'Rekap nilai dari beberapa penguji yang dulu makan waktu berhari-hari sekarang selesai otomatis.',
  },
  {
    initials: 'SR',
    accent: '#ff8866',
    name: 'Sitti Rahmah',
    role: 'Mahasiswa Angkatan 2022',
    quote:
      'Platformnya web-based, jadi saya bisa cek komentar dosen dari HP. Tim kami tidak pernah kelewatan deadline.',
  },
];

function renderTestimonial(
  testimonial: Testimonial,
  key: string,
  isClone = false,
) {
  return (
    <article
      key={key}
      aria-hidden={isClone ? 'true' : undefined}
      className="flex h-[380px] w-[var(--card-w)] flex-none flex-col justify-between border-r border-[#252525] bg-[#0a0a0a] p-6"
    >
      <div className="flex flex-col gap-4 pb-6">
        <QuoteIcon className="h-[18px] w-[21px] text-[#2ecc71]" />
        <p className="font-day-sans text-[20px] leading-[30px] tracking-[-0.2px] text-white">
          {testimonial.quote}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full border bg-[#161616] font-day-mono text-[13px]"
          style={{ borderColor: `${testimonial.accent}66`, color: testimonial.accent }}
        >
          {testimonial.initials}
        </span>
        <div className="flex flex-col">
          <span className="font-day-sans text-[16px] leading-5 text-white">
            {testimonial.name}
          </span>
          <span className="font-day-mono text-[12px] uppercase leading-4 tracking-[-0.24px] text-[#a2a2a2]">
            {testimonial.role}
          </span>
        </div>
      </div>
    </article>
  );
}

export function DayTestimonials() {
  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);
  const busyRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Runs after the no-transition snap has been committed and painted
  // (double requestAnimationFrame), then releases the click guard.
  const settleAfterSnap = (fn: () => void) => {
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        fn();
        busyRef.current = false;
      });
    });
  };

  const goPrev = () => {
    if (busyRef.current) return;
    if (index === 0) {
      // Snap (no transition) to the duplicate set, then animate one step back.
      busyRef.current = true;
      setAnimated(false);
      setIndex(CARD_COUNT);
      settleAfterSnap(() => {
        setAnimated(true);
        setIndex(CARD_COUNT - 1);
      });
      return;
    }
    setIndex((i) => Math.max(i - 1, 0));
  };

  const goNext = () => {
    if (busyRef.current) return;
    setIndex((i) => Math.min(i + 1, CARD_COUNT));
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'transform') return;
    if (index < CARD_COUNT) return;
    // Landed on the duplicate first slide: snap back to the real one.
    busyRef.current = true;
    setAnimated(false);
    setIndex((i) => i - CARD_COUNT);
    settleAfterSnap(() => {
      setAnimated(true);
    });
  };

  return (
    <section id="testimoni" className="day-container flex flex-col gap-16 py-20 scroll-mt-16">
      <div className="flex items-end justify-between">
        <h2 className="font-day-sans text-[32px] font-normal leading-[38.4px]">
          <span className="text-[#a2a2a2]">Kata </span>
          <span className="text-white">Mahasiswa & Dosen</span>
          <span className="text-[#a2a2a2]"> Tentang Platform Ini.</span>
        </h2>
        <div className="flex flex-row gap-2">
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={goPrev}
            className="transition-opacity hover:opacity-80"
          >
            <img
              src="/images/daytona/6tTbkXggWgQCAJ4DO2QEdXXmgM.svg"
              width={40}
              height={40}
              alt=""
            />
          </button>
          <button
            type="button"
            aria-label="Berikutnya"
            onClick={goNext}
            className="transition-opacity hover:opacity-80"
          >
            <img
              src="/images/daytona/11KSGbIZoRSg4pjdnUoif6MKHI.svg"
              width={40}
              height={40}
              alt=""
            />
          </button>
        </div>
      </div>

      <div className="overflow-hidden border-y border-[#252525]">
        <div
          className={`flex flex-row [--card-w:100%] min-[810px]:[--card-w:33.3333%] ${
            animated
              ? 'transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
              : 'transition-none'
          }`}
          style={{
            transform: `translateX(calc(-${index} * var(--card-w)))`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {TESTIMONIALS.map((t, i) => renderTestimonial(t, `${i}-a`))}
          {TESTIMONIALS.map((t, i) => renderTestimonial(t, `${i}-b`, true))}
        </div>
      </div>
    </section>
  );
}
