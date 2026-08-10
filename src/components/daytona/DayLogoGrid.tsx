// Grid teknologi: "Stack yang dipakai tim capstone di platform ini"
// Pola visual mengikuti section logo-grid tema (sel hairline + badge).

type TechCell = {
  name: string;
  badge: 'Populer' | 'Baru' | null;
};

const TECHS: readonly TechCell[] = [
  { name: 'Next.js', badge: 'Populer' },
  { name: 'React', badge: null },
  { name: 'Laravel', badge: 'Populer' },
  { name: 'Flutter', badge: null },
  { name: 'Node.js', badge: null },
  { name: 'Python', badge: 'Populer' },
  { name: 'TensorFlow', badge: null },
  { name: 'PostgreSQL', badge: null },
  { name: 'Golang', badge: 'Baru' },
  { name: 'Express', badge: null },
  { name: 'Django', badge: null },
  { name: 'Kotlin', badge: null },
  { name: 'Vue.js', badge: null },
  { name: 'FastAPI', badge: 'Baru' },
  { name: 'MySQL', badge: null },
];

export function DayLogoGrid() {
  return (
    <section className="py-[60px]">
      <div className="day-container">
        <p className="border-y border-[#252525] px-6 py-[18px] font-day-mono text-[14px] leading-[16.8px] tracking-[-0.28px] text-[#a2a2a2]">
          Stack yang dipakai tim capstone di platform ini
        </p>
        <div className="grid grid-cols-2 gap-px border-b border-[#252525] bg-[#252525] min-[810px]:grid-cols-5">
          {TECHS.map((tech) => (
            <div
              key={tech.name}
              className="group relative flex h-[80px] flex-col items-center justify-center gap-2 bg-[#0a0a0a] min-[810px]:h-[90px]"
            >
              <span className="font-day-mono text-[16px] tracking-[-0.32px] text-[#a2a2a2] opacity-90 transition-all duration-200 group-hover:text-white group-hover:opacity-100">
                {tech.name}
              </span>
              {tech.badge !== null ? (
                <span className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 translate-y-1/2 rounded-[4px] border border-[#252525] bg-[#0a0a0a] px-[7px] py-[5px] font-day-sans text-[12px] leading-[12px] tracking-[0.24px] text-[#a2a2a2]">
                  {tech.badge}
                </span>
              ) : null}
            </div>
          ))}
          {/* filler keeps the 2-col mobile grid rectangular (15 cells -> 16 slots) */}
          <div aria-hidden className="bg-[#0a0a0a] min-[810px]:hidden" />
        </div>
      </div>
    </section>
  );
}
