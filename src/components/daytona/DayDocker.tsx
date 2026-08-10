type IsoCubePosition = {
  i: number;
  j: number;
  k: number;
};

type IsoCubeFaces = {
  top: string;
  left: string;
  right: string;
};

function isoCubeFaces(x: number, y: number, w: number, h: number, v: number): IsoCubeFaces {
  return {
    top: `${x},${y} ${x + w},${y + h} ${x},${y + 2 * h} ${x - w},${y + h}`,
    left: `${x - w},${y + h} ${x},${y + 2 * h} ${x},${y + 2 * h + v} ${x - w},${y + h + v}`,
    right: `${x + w},${y + h} ${x},${y + 2 * h} ${x},${y + 2 * h + v} ${x + w},${y + h + v}`,
  };
}

const CUBE_W = 26;
const CUBE_H = 13;
const CUBE_V = 26;
const ORIGIN_X = 120;
const ORIGIN_Y = 70;

/** Ziggurat: 3x3 base, 2x2 middle, 1 top — drawn back-to-front, bottom-to-top. */
const PYRAMID_CUBES: IsoCubePosition[] = [
  { i: 0, j: 0, k: 0 },
  { i: 1, j: 0, k: 0 },
  { i: 0, j: 1, k: 0 },
  { i: 2, j: 0, k: 0 },
  { i: 1, j: 1, k: 0 },
  { i: 0, j: 2, k: 0 },
  { i: 2, j: 1, k: 0 },
  { i: 1, j: 2, k: 0 },
  { i: 2, j: 2, k: 0 },
  { i: 0.5, j: 0.5, k: 1 },
  { i: 1.5, j: 0.5, k: 1 },
  { i: 0.5, j: 1.5, k: 1 },
  { i: 1.5, j: 1.5, k: 1 },
  { i: 1, j: 1, k: 2 },
];

const GROUND_CIRCLES: ReadonlyArray<readonly [number, number]> = [
  [56, 118],
  [51, 150],
  [71, 160],
  [91, 169],
  [149, 169],
  [174, 157],
];

function CubePyramidIllustration() {
  return (
    <svg
      viewBox="0 0 240 240"
      width={240}
      height={240}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="day-docker-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* Blue glow under the cluster */}
      <ellipse
        cx="120"
        cy="135"
        rx="90"
        ry="42"
        fill="rgba(0,128,255,0.15)"
        filter="url(#day-docker-glow)"
      />

      {/* Dashed diamond ground outline */}
      <path
        d="M 120 86 L 218 135 L 120 184 L 22 135 Z"
        stroke="#2ecc71"
        strokeWidth="1"
        opacity="0.5"
        strokeDasharray="4 4"
      />

      {/* Connectors between lower-left edge nodes */}
      <line x1="51" y1="150" x2="71" y2="160" stroke="#2ecc71" strokeWidth="1" opacity="0.5" />
      <line x1="71" y1="160" x2="91" y2="169" stroke="#2ecc71" strokeWidth="1" opacity="0.5" />

      {/* Edge node circles */}
      {GROUND_CIRCLES.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3"
          fill="#0a0a0a"
          stroke="#2ecc71"
          strokeWidth="1"
        />
      ))}

      {/* Isometric cube pyramid */}
      {PYRAMID_CUBES.map(({ i, j, k }) => {
        const x = ORIGIN_X + (i - j) * CUBE_W;
        const y = ORIGIN_Y + (i + j) * CUBE_H - k * CUBE_V;
        const faces = isoCubeFaces(x, y, CUBE_W, CUBE_H, CUBE_V);
        return (
          <g key={`${i}-${j}-${k}`}>
            <polygon points={faces.left} fill="rgba(0,80,170,0.45)" stroke="#3399ff" strokeWidth="1" />
            <polygon points={faces.right} fill="rgba(0,50,110,0.5)" stroke="#3399ff" strokeWidth="1" />
            <polygon points={faces.top} fill="rgba(0,128,255,0.5)" stroke="#3399ff" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  );
}

function ComposeCubeIllustration() {
  const inner = isoCubeFaces(70, 39, 24, 12, 24);
  return (
    <svg
      viewBox="0 0 140 140"
      width={140}
      height={140}
      fill="none"
      aria-hidden="true"
    >
      {/* Outer isometric wireframe cube — 12 edges */}
      <g stroke="#3a3a3a" strokeWidth="1">
        {/* Top face */}
        <line x1="70" y1="14" x2="118" y2="38" />
        <line x1="118" y1="38" x2="70" y2="62" />
        <line x1="70" y1="62" x2="22" y2="38" />
        <line x1="22" y1="38" x2="70" y2="14" />
        {/* Vertical edges */}
        <line x1="70" y1="14" x2="70" y2="64" />
        <line x1="118" y1="38" x2="118" y2="88" />
        <line x1="70" y1="62" x2="70" y2="112" />
        <line x1="22" y1="38" x2="22" y2="88" />
        {/* Bottom face */}
        <line x1="70" y1="64" x2="118" y2="88" />
        <line x1="118" y1="88" x2="70" y2="112" />
        <line x1="70" y1="112" x2="22" y2="88" />
        <line x1="22" y1="88" x2="70" y2="64" />
      </g>

      {/* Solid blue inner cube */}
      <polygon points={inner.left} fill="#005ab4" stroke="#59acff" strokeWidth="1" />
      <polygon points={inner.right} fill="#003d7a" stroke="#59acff" strokeWidth="1" />
      <polygon points={inner.top} fill="#0080ff" fillOpacity="0.8" stroke="#59acff" strokeWidth="1" />

      {/* Green accent along outer cube's bottom-left edge */}
      <line x1="22" y1="88" x2="70" y2="112" stroke="#2ecc71" strokeWidth="1.5" />
    </svg>
  );
}

type SmallCardHeaderProps = {
  title: string;
  body: string;
};

function SmallCardHeader({ title, body }: SmallCardHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-day-sans text-[20px] leading-6 text-white">{title}</h3>
      <p className="font-day-sans text-[16px] leading-[25.6px] tracking-[-0.32px] text-[#a2a2a2]">
        {body}
      </p>
    </div>
  );
}

export function DayDocker() {
  return (
    <section className="day-container flex flex-col gap-16 py-20">
      <h2 className="max-w-[720px] font-day-sans text-[32px] font-medium leading-[38.4px]">
        <span className="block text-white">
          Mahasiswa pakai tools yang sama seperti profesional.
        </span>
        <span className="block text-[#a2a2a2]">
          Semua Fitur GitHub, Native di Dalam Platform.
        </span>
      </h2>

      <div className="grid gap-px border border-[#252525] bg-[#252525] min-[810px]:grid-cols-[448px_1fr]">
        {/* Large card — Struktur repository */}
        <div className="flex h-[480px] flex-col bg-[#0a0a0a] p-6 pt-8 min-[810px]:h-[600px]">
          {/* approximated illustration */}
          <div className="flex flex-1 items-center justify-center">
            <CubePyramidIllustration />
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <h3 className="font-day-sans text-[20px] leading-6 text-white">
              Struktur Repository Terstandar
            </h3>
            <p className="font-day-sans text-[16px] leading-6 tracking-[-0.16px] text-[#a2a2a2]">
              Template Repository dengan Struktur Folder, README, dan CI yang
              Sudah Disiapkan Prodi.
            </p>
          </div>
        </div>

        {/* Right side — 2x2 small cards */}
        <div className="grid grid-cols-1 gap-px bg-[#252525] min-[810px]:grid-cols-2">
          {/* Card 1 — Template project */}
          <div className="flex flex-col gap-6 bg-[#0a0a0a] p-6">
            <div className="relative flex h-[149px] items-center justify-center">
              <div className="relative h-[120px] w-[110px]">
                <img
                  src="/images/daytona/wQGb50br8rQrnpQOcfxUVTiX6c.svg"
                  width={91}
                  height={100}
                  alt=""
                  className="absolute left-0 top-0"
                />
                <img
                  src="/images/daytona/uVukxlCjHxB67PDUZCdsPgP4pIE.svg"
                  width={91}
                  height={100}
                  alt=""
                  className="absolute left-[14px] top-[14px]"
                />
              </div>
            </div>
            <SmallCardHeader
              title="Template Project"
              body="Mulai dari Template Next.js, Laravel, Flutter, atau Notebook ML."
            />
          </div>

          {/* Card 2 — Riwayat commit */}
          <div className="flex flex-col gap-6 bg-[#0a0a0a] p-6">
            <div className="relative flex h-[149px] items-center justify-center">
              <div className="relative h-[159px] w-[190px] scale-90">
                <img
                  src="/images/daytona/eWVFbMLPAS5nzSElHXdWLkDRSGs.svg"
                  width={92}
                  height={159}
                  alt=""
                  className="absolute left-0 top-0 z-[1]"
                />
                <img
                  src="/images/daytona/ymDI0smue4KxAPr6SfZVwoaQoi8.svg"
                  width={92}
                  height={159}
                  alt=""
                  className="absolute left-[32px] top-0 z-[2]"
                />
                <img
                  src="/images/daytona/WPXtdcku7BbGLhiZhNuMGClBMBM.svg"
                  width={92}
                  height={159}
                  alt=""
                  className="absolute left-[64px] top-0 z-[3]"
                />
                <img
                  src="/images/daytona/vwLcPmKhSOIhkDWWM2NULqmKXQk.svg"
                  width={92}
                  height={159}
                  alt=""
                  className="absolute left-[96px] top-0 z-[4]"
                />
              </div>
            </div>
            <SmallCardHeader
              title="Riwayat Commit Lengkap"
              body="Setiap Kontribusi Anggota Tim Tercatat dan Terlihat."
            />
          </div>

          {/* Card 3 — Branch protection */}
          <div className="flex flex-col gap-6 bg-[#0a0a0a] p-6">
            <div className="relative flex h-[149px] items-center justify-center">
              <div className="relative h-[132px] w-[105px]">
                <img
                  src="/images/daytona/AkrJSfnenOmbhz1jGrgq1ZO60.svg"
                  width={105}
                  height={132}
                  alt=""
                  className="absolute inset-0"
                />
                <img
                  src="/images/daytona/kIzpWfQ9YVFG6iKcClmm1ahTrzk.svg"
                  width={105}
                  height={132}
                  alt=""
                  className="absolute inset-0"
                />
              </div>
            </div>
            <SmallCardHeader
              title="Branch Protection"
              body="Branch Utama Terlindungi. Semua Perubahan Lewat Pull Request."
            />
          </div>

          {/* Card 4 — CI checks */}
          <div className="flex flex-col gap-6 bg-[#0a0a0a] p-6">
            {/* approximated illustration */}
            <div className="relative flex h-[149px] items-center justify-center">
              <ComposeCubeIllustration />
            </div>
            <SmallCardHeader
              title="CI Checks Otomatis"
              body="Build dan Test Berjalan Otomatis di Setiap Submission."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
