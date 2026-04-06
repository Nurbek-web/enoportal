"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SERIES = [
  { key: "chirchik-AI-92", label: "Чирчик АИ-92", color: "#3b82f6" },
  { key: "chirchik-AI-95", label: "Чирчик АИ-95", color: "#8b5cf6" },
  { key: "akhangaran-AI-92", label: "Ахангаран АИ-92", color: "#10b981" },
  { key: "akhangaran-AI-95", label: "Ахангаран АИ-95", color: "#f59e0b" },
] as const;

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-stone-200/50 bg-white px-4 py-3 shadow-lg shadow-stone-900/[0.04]">
      <p className="mb-2 text-xs font-medium text-stone-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-stone-600">{entry.name}:</span>
          <span className="text-xs font-semibold text-stone-900">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

interface FuelLevelsChartProps {
  data: Array<Record<string, string | number>>;
}

export default function FuelLevelsChart({ data }: FuelLevelsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        {SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#gradient-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
