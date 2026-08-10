'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from 'react';

const CARD_COUNT = 9;

type FeatureCard = {
  title: string;
  body: string;
  illustration: ReactNode;
};

function ProposalArt() {
  return (
    /* approximated illustration */
    <div className="relative mb-16 h-[150px] w-[150px] border border-[#2ecc71]">
      <span className="absolute -left-[5px] -top-[5px] h-[10px] w-[10px] bg-[#2ecc71]" />
      <span className="absolute -right-[5px] -top-[5px] h-[10px] w-[10px] bg-[#2ecc71]" />
      <span className="absolute -bottom-[5px] -left-[5px] h-[10px] w-[10px] bg-[#2ecc71]" />
      <span className="absolute -bottom-[5px] -right-[5px] h-[10px] w-[10px] bg-[#2ecc71]" />
      <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-[#585858]" />
      <span className="absolute left-1/2 top-full h-16 border-l border-dashed border-[#585858]" />
    </div>
  );
}

function ProgressChartArt() {
  return (
    /* approximated illustration */
    <svg
      width="200"
      height="140"
      viewBox="0 0 200 140"
      fill="none"
      aria-hidden="true"
    >
      <line x1="0" y1="35" x2="200" y2="35" stroke="#252525" strokeWidth="1" />
      <line x1="0" y1="70" x2="200" y2="70" stroke="#252525" strokeWidth="1" />
      <line
        x1="0"
        y1="105"
        x2="200"
        y2="105"
        stroke="#252525"
        strokeWidth="1"
      />
      <polyline
        points="10,120 70,55 125,85 190,20"
        stroke="#2ecc71"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="10" cy="120" r="3" fill="#2ecc71" />
      <circle cx="70" cy="55" r="3" fill="#2ecc71" />
      <circle cx="125" cy="85" r="3" fill="#2ecc71" />
      <circle cx="190" cy="20" r="3" fill="#2ecc71" />
    </svg>
  );
}

function DemoAppArt() {
  return (
    /* approximated illustration */
    <div className="relative h-[130px] w-[200px] rounded-[8px] border border-[#252525]">
      <div className="flex h-[22px] items-center gap-[5px] border-b border-[#252525] px-2.5">
        <span className="h-1 w-1 rounded-full bg-[#252525]" />
        <span className="h-1 w-1 rounded-full bg-[#252525]" />
        <span className="h-1 w-1 rounded-full bg-[#252525]" />
      </div>
      <div className="absolute left-[52%] top-[66%] h-[18px] w-[60px] rounded-[4px] border border-[#2ecc71]/60" />
      <svg
        className="absolute left-[60%] top-[55%]"
        width="14"
        height="16"
        viewBox="0 0 14 16"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="1,0 1,12.5 4.4,9.6 6.6,14.6 9,13.5 6.7,8.7 11.4,8.6"
          fill="#2ecc71"
        />
      </svg>
    </div>
  );
}

function DocumentStackArt() {
  return (
    /* approximated illustration: dokumen BAB 1–5 bertumpuk */
    <div className="relative h-[150px] w-[170px]">
      {[
        { offset: 'left-0 top-[24px]', opacity: 'opacity-40' },
        { offset: 'left-[12px] top-[12px]', opacity: 'opacity-65' },
        { offset: 'left-[24px] top-0', opacity: 'opacity-100' },
      ].map((sheet, i) => (
        <div
          key={i}
          className={`absolute ${sheet.offset} ${sheet.opacity} h-[126px] w-[100px] rounded-[6px] border border-[#585858] bg-[#0a0a0a] p-3`}
        >
          {i === 2 ? (
            <>
              <span className="block font-day-mono text-[10px] text-[#2ecc71]">
                BAB 1-5
              </span>
              <span className="mt-2 block h-1 w-3/4 bg-[#252525]" />
              <span className="mt-1.5 block h-1 w-full bg-[#252525]" />
              <span className="mt-1.5 block h-1 w-2/3 bg-[#252525]" />
              <span className="mt-4 block h-1 w-full bg-[#252525]" />
              <span className="mt-1.5 block h-1 w-5/6 bg-[#252525]" />
            </>
          ) : null}
        </div>
      ))}
      <span className="absolute bottom-0 right-0 rounded-[4px] border border-[#2ecc71]/60 px-2 py-1 font-day-mono text-[10px] uppercase text-[#2ecc71]">
        Terunggah
      </span>
    </div>
  );
}

function ScheduleArt() {
  return (
    /* approximated illustration: kalender jadwal sidang */
    <div className="relative h-[140px] w-[180px] rounded-[8px] border border-[#252525]">
      <div className="flex h-[26px] items-center justify-between border-b border-[#252525] px-3">
        <span className="font-day-mono text-[10px] uppercase text-[#a2a2a2]">
          Des 2025
        </span>
        <span className="h-1 w-6 bg-[#252525]" />
      </div>
      <div className="grid grid-cols-5 gap-1.5 p-3">
        {Array.from({ length: 15 }, (_, i) => (
          <span
            key={i}
            className={`flex h-[18px] items-center justify-center rounded-[3px] border font-day-mono text-[9px] ${
              i === 11
                ? 'border-[#2ecc71] bg-[#2ecc71]/15 text-[#2ecc71]'
                : 'border-[#252525] text-[#585858]'
            }`}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[4px] border border-[#252525] bg-[#0a0a0a] px-2 py-1 font-day-mono text-[10px] text-[#a2a2a2]">
        Sidang · 09:00, Lab 2
      </span>
    </div>
  );
}

const CARDS: FeatureCard[] = [
  {
    title: 'Pengajuan Tema',
    body: 'Ajukan tema dan proposal capstone, lalu pantau status persetujuan koordinator.',
    illustration: <ProposalArt />,
  },
  {
    title: 'Kolaborasi Tim',
    body: 'Kelola anggota tim dan lihat kontribusi setiap mahasiswa secara real-time.',
    illustration: (
      <img
        src="/images/daytona/aa3yyQcExIgMR0bUon92NeVIpM.webp"
        width={320}
        height={277}
        alt="Grid sel dengan beberapa run tersorot"
      />
    ),
  },
  {
    title: 'Review Kode',
    body: 'Dosen mereview kode langsung dari repository yang terhubung dengan komentar inline.',
    illustration: (
      <img
        src="/images/daytona/AuUwwGfzynX222GZIfjXQZ5jZk.webp"
        width={320}
        height={277}
        alt="Jendela terminal bertumpuk dengan garis hijau"
      />
    ),
  },
  {
    title: 'Penilaian Paralel',
    body: 'Beberapa dosen penguji menilai bersamaan dengan rubrik terstandar dan bobot jelas.',
    illustration: (
      <img
        src="/images/daytona/uwOW4jBTxBI4n7OVopcCjbCXA7g.webp"
        width={320}
        height={277}
        alt="Diagram garis cabang evaluasi paralel"
      />
    ),
  },
  {
    title: 'Progress Tracking',
    body: 'Grafik perkembangan milestone dan aktivitas commit tim dalam satu tampilan.',
    illustration: <ProgressChartArt />,
  },
  {
    title: 'Siklus Revisi',
    body: 'Terima catatan revisi, perbaiki, dan kumpulkan ulang dengan riwayat versi lengkap.',
    illustration: (
      <img
        src="/images/daytona/FBvGlH1J5ZDQ15LXrhWxBAtxA.webp"
        width={225}
        height={227}
        alt="Diagram siklus umpan balik"
      />
    ),
  },
  {
    title: 'Upload Dokumen',
    body: 'Unggah proposal, BAB 1-5, laporan akhir, dan slide presentasi per project.',
    illustration: <DocumentStackArt />,
  },
  {
    title: 'Jadwal Sidang',
    body: 'Lihat jadwal presentasi, ruangan, dan dosen penguji yang ditetapkan admin.',
    illustration: <ScheduleArt />,
  },
  {
    title: 'Demo Aplikasi',
    body: 'Lampirkan link demo dan video presentasi project untuk dinilai saat sidang.',
    illustration: <DemoAppArt />,
  },
];

function renderCard(card: FeatureCard, key: string, isClone = false) {
  return (
    <article
      key={key}
      aria-hidden={isClone ? 'true' : undefined}
      className="flex h-[520px] w-[var(--card-w)] flex-none flex-col border-r border-[#252525]"
    >
      <div className="flex flex-col gap-2 p-8 pb-9">
        <h3 className="font-day-mono text-[20px] leading-[28px] tracking-[-0.8px] text-white">
          {card.title}
        </h3>
        <p className="font-day-sans text-[16px] leading-6 tracking-[-0.16px] text-[#a2a2a2]">
          {card.body}
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {card.illustration}
      </div>
    </article>
  );
}

export function DayAiFirst() {
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
    <section className="day-container flex flex-col gap-16 py-20">
      <div className="flex items-end justify-between">
        <h2 className="font-day-sans text-[32px] font-normal leading-[38.4px]">
          <span className="block text-white">Dibangun untuk Mahasiswa.</span>
          <span className="block text-[#a2a2a2]">
            Dari Proposal sampai Sidang.
          </span>
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
          {CARDS.map((card, i) => renderCard(card, `${i}-a`))}
          {CARDS.map((card, i) => renderCard(card, `${i}-b`, true))}
        </div>
      </div>
    </section>
  );
}
