type CardHeaderProps = {
  title: string;
  body: string;
};

function CardHeader({ title, body }: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-day-sans text-[20px] leading-6 text-white">{title}</h3>
      <p className="font-day-sans text-[16px] leading-[25.6px] tracking-[-0.32px] text-[#a2a2a2]">
        {body}
      </p>
    </div>
  );
}

function CommentIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2.5h10v7H6.5L4 12V9.5H2v-7Z"
        stroke="#2ecc71"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewIllustration() {
  return (
    <div className="relative h-[150px] w-[300px]">
      {/* approximated illustration */}
      <div className="absolute inset-x-6 inset-y-2 rounded-[60px] border border-dashed border-[#585858] opacity-70" />
      <div className="relative z-10 mx-auto mt-[40px] flex h-[64px] w-[210px] items-center justify-center gap-2 rounded-full border border-[#2ecc71] bg-[radial-gradient(ellipse_at_center,rgba(46,204,113,0.22),transparent_70%)]">
        <CommentIcon />
        <span className="font-day-mono text-[18px] text-[#2ecc71]">REVIEW</span>
      </div>
      <svg
        width={24}
        height={12}
        viewBox="0 0 24 12"
        fill="none"
        aria-hidden="true"
        className="absolute left-[-8px] top-1/2 w-6 -translate-y-1/2"
      >
        <path
          d="M22 6H2M8 1 2 6l6 5"
          stroke="#2ecc71"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width={24}
        height={12}
        viewBox="0 0 24 12"
        fill="none"
        aria-hidden="true"
        className="absolute right-[-8px] top-[65%] w-6 -translate-y-1/2"
      >
        <path
          d="M2 6h20M16 1l6 5-6 5"
          stroke="#2ecc71"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function VsCodeIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <img
        src="/images/daytona/VxuNSQabCOO7jtjBFWPBkysA7s.svg"
        width={54}
        height={54}
        alt=""
      />
      {/* approximated illustration */}
      <svg
        width={60}
        height={70}
        viewBox="0 0 60 70"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M0 35h60" stroke="#252525" strokeWidth="1" />
        <path d="M0 35c28 0 42-5 42-33" stroke="#2ecc71" strokeWidth="1" />
      </svg>
      <div className="flex size-[134px] items-center justify-center rounded-full border border-dashed border-[#585858]">
        <img
          src="/images/daytona/LYNxOjvH1DRm0o8WsN7SA7a5Do.svg"
          width={72}
          height={72}
          alt="VS Code"
        />
      </div>
    </div>
  );
}

function ActivityLogIllustration() {
  return (
    <div className="flex w-full max-w-[352px] translate-y-2 flex-col gap-3 rounded-t-[12px] border border-b-0 border-[#252525] bg-[#0a0a0a] p-3">
      <div className="flex gap-1.5">
        <span className="size-[9px] rounded-full bg-[#ed6b5f]" />
        <span className="size-[9px] rounded-full bg-[#f3be4e]" />
        <span className="size-[9px] rounded-full bg-[#65c757]" />
      </div>
      <div className="font-day-code text-[13px] leading-5">
        <p className="text-[#a2a2a2]">dosen@capstone ~ review tim-alpha</p>
        <p className="text-[#a2a2a2]">
          status: <span className="text-[#2ecc71]">2 komentar baru</span>
        </p>
      </div>
    </div>
  );
}

export function DayHumanInLoop() {
  return (
    <section className="day-container flex flex-col gap-16 py-20">
      <h2 className="max-w-[680px] font-day-sans text-[32px] font-medium leading-[38.4px]">
        <span className="text-white">Dosen in the Loop. </span>
        <span className="text-[#a2a2a2]">
          Bimbingan, Review, dan Intervensi Penuh Tanpa Menghambat Laju
          Mahasiswa.
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-px border-y border-[#252525] bg-[#252525] md:grid-cols-3">
        {/* Card 1 — Komentar inline */}
        <div className="flex h-auto min-h-[300px] flex-col gap-8 bg-[#0a0a0a] p-8 md:h-[340px]">
          <CardHeader
            title="Komentar Inline"
            body="Feedback Menempel Langsung di Baris Kode yang Dimaksud"
          />
          <div className="relative flex flex-1 items-center justify-center">
            <ReviewIllustration />
          </div>
        </div>

        {/* Card 2 — VS Code Browser */}
        <div className="flex h-auto min-h-[300px] flex-col gap-8 bg-[#0a0a0a] p-8 md:h-[340px]">
          <CardHeader
            title="Buka di VS Code"
            body="Buka Repository Mahasiswa di Editor dengan Satu Klik"
          />
          <div className="relative flex flex-1 items-center justify-center">
            <VsCodeIllustration />
          </div>
        </div>

        {/* Card 3 — Riwayat aktivitas */}
        <div className="flex h-auto min-h-[300px] flex-col gap-8 overflow-hidden bg-[#0a0a0a] p-8 md:h-[340px]">
          <CardHeader
            title="Riwayat Aktivitas"
            body="Semua Aktivitas Review Tercatat. Transparan untuk Semua Pihak."
          />
          <div className="relative flex flex-1 items-end justify-center overflow-hidden">
            <ActivityLogIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
