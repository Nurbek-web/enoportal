"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/lib/format";

interface WeeklySalesData {
  label: string;
  volume: number;
}

const lightConfig = {
  grid: "#f5f5f4",
  tickFill: "#a8a29e",
  cursor: "#f8fafc",
  gradientTop: { color: "#3b82f6", opacity: 0.9 },
  gradientBottom: { color: "#3b82f6", opacity: 0.4 },
};

const darkConfig = {
  grid: "rgba(255,255,255,0.06)",
  tickFill: "rgba(255,255,255,0.5)",
  cursor: "rgba(255,255,255,0.05)",
  gradientTop: { color: "#60a5fa", opacity: 1.0 },
  gradientBottom: { color: "#3b82f6", opacity: 0.6 },
};

function LightTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white px-4 py-3 shadow-lg border border-stone-100">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-900">
        {formatNumber(payload[0].value)} л
      </p>
    </div>
  );
}

function DarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white/10 backdrop-blur-xl px-4 py-3 shadow-lg border border-white/15">
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">
        {formatNumber(payload[0].value)} л
      </p>
    </div>
  );
}

interface WeeklySalesChartProps {
  data: WeeklySalesData[];
  dark?: boolean;
}

export default function WeeklySalesChart({ data, dark = false }: WeeklySalesChartProps) {
  const cfg = dark ? darkConfig : lightConfig;

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} barCategoryGap="20%">
        <defs>
          <linearGradient id={dark ? "barGradientDark" : "barGradient"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.gradientTop.color} stopOpacity={cfg.gradientTop.opacity} />
            <stop offset="100%" stopColor={cfg.gradientBottom.color} stopOpacity={cfg.gradientBottom.opacity} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={cfg.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: cfg.tickFill }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: cfg.tickFill }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          content={dark ? <DarkTooltip /> : <LightTooltip />}
          cursor={{ fill: cfg.cursor }}
        />
        <Bar
          dataKey="volume"
          fill={`url(#${dark ? "barGradientDark" : "barGradient"})`}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
