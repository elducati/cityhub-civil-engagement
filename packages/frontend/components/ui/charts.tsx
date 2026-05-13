'use client';

interface BarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  const barHeight = 28;
  const gap = 8;
  const totalHeight = data.length * (barHeight + gap) - gap;
  // ~7.5px per character at 12px font size
  const labelWidth = Math.max(100, ...data.map(d => d.label.length * 7.5));
  const chartWidth = 300;
  const rightMargin = 40;

  return (
    <svg width="100%" height={totalHeight + 20} viewBox={`0 0 ${labelWidth + chartWidth + rightMargin} ${totalHeight + 20}`} className="overflow-visible">
      {data.map((d, i) => {
        const barW = (d.value / max) * chartWidth;
        const y = i * (barHeight + gap);
        return (
          <g key={d.label}>
            <text x={labelWidth - 4} y={y + barHeight / 2 + 4} textAnchor="end" className="fill-on-surface-variant text-xs" fontSize="12">
              {d.label}
            </text>
            <rect
              x={labelWidth + 4}
              y={y}
              width={Math.max(barW, 4)}
              height={barHeight}
              rx="6"
              className={d.color.replace('bg-', 'fill-')}
              opacity="0.9"
            />
            <text
              x={labelWidth + 8 + Math.max(barW, 4)}
              y={y + barHeight / 2 + 4}
              className="fill-on-surface font-medium text-xs"
              fontSize="12"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const colorMap: Record<string, string> = {
    'bg-primary': '#6750A4',
    'bg-secondary': '#7F66C0',
    'bg-warning': '#ED6C02',
    'bg-success': '#2E7D32',
    'bg-on-surface-variant': '#79747E',
    'bg-outline': '#CAC4D0',
    'bg-error': '#D32F2F',
    'bg-blue-100': '#BBDEFB',
    'bg-green-100': '#C8E6C9',
    'bg-red-100': '#FFCDD2',
    'bg-amber-100': '#FFECB3',
    'bg-purple-100': '#E1BEE7',
    'bg-gray-100': '#F5F5F5',
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d) => {
        const segment = (d.value / total) * circumference;
        const start = offset;
        offset += segment;
        if (d.value === 0) return null;
        return (
          <circle
            key={d.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorMap[d.color] || '#6750A4'}
            strokeWidth="20"
            strokeDasharray={`${segment} ${circumference - segment}`}
            strokeDashoffset={-start}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-700"
          />
        );
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" className="fill-on-surface text-2xl font-bold" fontSize="24">
        {total}
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="fill-on-surface-variant text-xs" fontSize="11">
        Total
      </text>
    </svg>
  );
}

interface TrendChartProps {
  current: number;
  previous: number;
  labels?: [string, string];
}

export function TrendChart({ current, previous, labels = ['This Month', 'Last Month'] }: TrendChartProps) {
  const max = Math.max(current, previous, 1);
  const h = 120;
  const w = 200;
  const barW = 60;

  return (
    <svg width="100%" height={h + 30} viewBox={`0 0 ${w} ${h + 30}`}>
      {[
        { value: current, label: labels[0], color: 'fill-primary', y: h - (current / max) * h, h: (current / max) * h },
        { value: previous, label: labels[1], color: 'fill-primary/50', y: h - (previous / max) * h, h: (previous / max) * h },
      ].map((bar, i) => (
        <g key={bar.label}>
          <rect
            x={i === 0 ? w / 2 - barW - 8 : w / 2 + 8}
            y={bar.y}
            width={barW}
            height={Math.max(bar.h, 2)}
            rx="4"
            className={bar.color}
            opacity="0.85"
          />
          <text
            x={i === 0 ? w / 2 - barW - 8 + barW / 2 : w / 2 + 8 + barW / 2}
            y={bar.y - 6}
            textAnchor="middle"
            className="fill-on-surface font-semibold text-sm"
            fontSize="13"
          >
            {bar.value}
          </text>
          <text
            x={i === 0 ? w / 2 - barW - 8 + barW / 2 : w / 2 + 8 + barW / 2}
            y={h + 16}
            textAnchor="middle"
            className="fill-on-surface-variant text-xs"
            fontSize="11"
          >
            {bar.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
