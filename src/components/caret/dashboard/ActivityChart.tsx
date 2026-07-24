import { WEEKLY_ACTIVITY } from "@/components/caret/dashboard/dashboard-data";

const CHART_W = 560;
const CHART_H = 220;
const PAD_X = 8;
const PAD_BOTTOM = 28;
const PAD_TOP = 16;
const MAX = 5; // y-axis max (meetings/day)

/**
 * 7-day meeting activity — hand-rolled SVG bars with dashed guides and
 * mono axis labels, in the landing page's visual language.
 */
export function ActivityChart() {
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const slot = innerW / WEEKLY_ACTIVITY.length;
  const barW = 34;

  return (
    <div className="bg-background flex h-full flex-col px-5 py-4 md:px-6 md:py-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h5 className="font-display text-lg leading-tight font-medium tracking-tight md:text-xl">
          Aktivitas review
        </h5>
        <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
          7 HARI TERAKHIR
        </span>
      </div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full grow"
        role="img"
        data-chart-bars
        aria-label="Review per hari selama 7 hari terakhir"
      >
        {/* dashed horizontal guides */}
        {[0, 1, 2, 3, 4, 5].map((v) => {
          const y = PAD_TOP + innerH - (v / MAX) * innerH;
          return (
            <g key={v}>
              <line
                x1={PAD_X}
                x2={CHART_W - PAD_X}
                y1={y}
                y2={y}
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray={v === 0 ? "0" : "3 5"}
              />
              <text
                x={CHART_W - PAD_X}
                y={y - 4}
                textAnchor="end"
                className="fill-[#fafafa40] font-mono text-[9px]"
              >
                {v}
              </text>
            </g>
          );
        })}
        {/* bars */}
        {WEEKLY_ACTIVITY.map((d, i) => {
          const h = (d.meetings / MAX) * innerH;
          const x = PAD_X + slot * i + (slot - barW) / 2;
          const y = PAD_TOP + innerH - h;
          const today = i === 2; // WED
          return (
            <g key={d.day} className="group">
              {/* hover hit area */}
              <rect x={PAD_X + slot * i} y={PAD_TOP} width={slot} height={innerH} fill="transparent" />
              {d.meetings > 0 ? (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="6"
                  data-bar
                  className={
                    today
                      ? "fill-[#e4e4e7] transition-opacity group-hover:opacity-90"
                      : "fill-[#fafafa1a] transition-[fill] group-hover:fill-[#fafafa40]"
                  }
                />
              ) : (
                <line
                  x1={x}
                  x2={x + barW}
                  y1={PAD_TOP + innerH}
                  y2={PAD_TOP + innerH}
                  stroke="#fafafa1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              <text
                x={PAD_X + slot * i + slot / 2}
                y={CHART_H - 8}
                textAnchor="middle"
                className={
                  today
                    ? "fill-[#fafafa] font-mono text-[10px] tracking-wider"
                    : "fill-[#fafafa40] font-mono text-[10px] tracking-wider"
                }
              >
                {d.day}
              </text>
              {/* value on hover */}
              {d.meetings > 0 && (
                <text
                  x={PAD_X + slot * i + slot / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-[#fafafa8c] font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {d.meetings}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
