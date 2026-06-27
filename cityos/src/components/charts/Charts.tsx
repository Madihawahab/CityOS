"use client";

import { cn } from "@/lib/utils/cn";

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 24,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.map((segment, index) => {
    const percent = total > 0 ? segment.value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const previousSum = data.slice(0, index).reduce((sum, d) => sum + (total > 0 ? d.value / total : 0), 0);
    const strokeDashoffset = -previousSum * circumference;
    return {
      ...segment,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-container)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((segment, index) => {
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>

        {/* Center label */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue !== undefined && (
              <span className="text-2xl font-bold text-on-surface">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-label-md text-on-surface-variant">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((segment, i) => (
          <div key={i} className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
            <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: segment.color }} aria-hidden="true" />
            {segment.label}
            <span className="font-semibold text-on-surface">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

interface HBarChartProps {
  data: Array<{ label: string; value: number; color?: string; maxValue?: number }>;
  maxValue?: number;
  className?: string;
}

export function HorizontalBarChart({ data, maxValue, className }: HBarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("space-y-3", className)} role="img" aria-label="Horizontal bar chart">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-label-md">
            <span className="text-on-surface-variant">{item.label}</span>
            <span className="font-semibold text-on-surface">{item.value}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color ?? "var(--color-primary)",
              }}
              role="progressbar"
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-label={`${item.label}: ${item.value}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Gauge Widget ─────────────────────────────────────────────────────────────

interface GaugeWidgetProps {
  value: number;
  maxValue?: number;
  label: string;
  size?: number;
  className?: string;
}

export function GaugeWidget({ value, maxValue = 100, label, size = 120, className }: GaugeWidgetProps) {
  const pct = Math.min(value / maxValue, 1);

  const color =
    pct >= 0.8 ? "#006c49" :
    pct >= 0.6 ? "#004ac6" :
    pct >= 0.4 ? "#784b00" :
    "#ba1a1a";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative overflow-hidden" style={{ width: size, height: size / 2 + 8 }}>
        <svg width={size} height={size} aria-hidden="true">
          {/* Track */}
          <path
            d={`M ${10} ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="var(--color-surface-container)"
            strokeWidth={10}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${10} ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${pct * Math.PI * (size / 2 - 10)} ${Math.PI * (size / 2 - 10)}`}
            className="transition-all duration-700"
          />
          {/* Needle (visual only) */}
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            fontSize={pct >= 0.1 ? 20 : 16}
            fontWeight={700}
            fill="var(--color-on-surface)"
          >
            {value}
          </text>
        </svg>
      </div>
      <p className="text-label-md text-on-surface-variant text-center">{label}</p>
    </div>
  );
}

// ─── Mini Trend Sparkline ─────────────────────────────────────────────────────

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function Sparkline({ data, color = "#004ac6", height = 40, width = 100, className }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className={className} aria-hidden="true">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
