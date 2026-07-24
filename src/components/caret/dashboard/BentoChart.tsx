export interface ChartPoint {
  /** Short axis label, e.g. "SEN" */
  label: string;
  value: number;
}

interface BentoChartProps {
  title: string;
  caption: string;
  data: ChartPoint[];
  /** Index of the highlighted (solid) bar; defaults to the last non-zero value */
  highlightIndex?: number;
  /** Y-axis maximum; defaults to max(5, data max) */
  max?: number;
}

const CHART_W = 560;
const CHART_H = 220;
const PAD_X = 8;
const PAD_BOTTOM = 28;
const PAD_TOP = 16;

/**
 * Hand-rolled SVG bar chart with dashed guides and mono axis labels —
 * visual clone of the /demo ActivityChart, but data-driven via props.
 * Bars carry `data-bar` inside `data-chart-bars` for the grow animation.
 */
export function BentoChart({ title, caption, data, highlightIndex, max }: BentoChartProps) {
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const slot = data.length > 0 ? innerW / data.length : innerW;
  const barW = 34;

  const dataMax = Math.max(...data.map((d) => d.value), 0);
  const yMax = max ?? Math.max(5, dataMax);
  const step = Math.max(1, Math.ceil(yMax / 5));
  const guides = [0, 1, 2, 3, 4, 5].map((i) => i * step);

  const highlight =
    highlightIndex ??
    (() => {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].value > 0) return i;
      }
      return data.length - 1;
    })();

  return (
    <div className="bg-background flex h-full flex-col px-5 py-4 md:px-6 md:py-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h5 className="font-display text-lg leading-tight font-medium tracking-tight md:text-xl">
          {title}
        </h5>
        <span className="text-app-teritary-invert font-mono text-[10px] tracking-wider md:text-xs">
          {caption}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full grow"
        role="img"
        data-chart-bars
        aria-label={`${title} — ${caption}`}
      >
        {/* dashed horizontal guides */}
        {guides.map((v) => {
          const y = PAD_TOP + innerH - (v / (step * 5)) * innerH;
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
        {data.map((d, i) => {
          const h = (d.value / (step * 5)) * innerH;
          const x = PAD_X + slot * i + (slot - barW) / 2;
          const y = PAD_TOP + innerH - h;
          const active = i === highlight;
          return (
            <g key={`${d.label}-${i}`} className="group">
              {/* hover hit area */}
              <rect x={PAD_X + slot * i} y={PAD_TOP} width={slot} height={innerH} fill="transparent" />
              {d.value > 0 ? (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="6"
                  data-bar
                  className={
                    active
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
                  active
                    ? "fill-[#fafafa] font-mono text-[10px] tracking-wider"
                    : "fill-[#fafafa40] font-mono text-[10px] tracking-wider"
                }
              >
                {d.label}
              </text>
              {/* value on hover */}
              {d.value > 0 && (
                <text
                  x={PAD_X + slot * i + slot / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-[#fafafa8c] font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
