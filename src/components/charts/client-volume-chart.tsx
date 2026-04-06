"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatVolume } from "@/lib/format";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-stone-200/50 bg-white px-4 py-3 shadow-lg shadow-stone-900/[0.04]">
      <p className="mb-1 text-xs font-medium text-stone-500">{label}</p>
      <p className="text-sm font-semibold text-stone-900">
        {formatVolume(payload[0].value)}
      </p>
    </div>
  );
}

interface ClientVolumeChartProps {
  data: { date: string; volume: number }[];
}

export default function ClientVolumeChart({ data }: ClientVolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={192}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
      >
        <defs>
          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e7e5e4"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="volume"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#volumeGradient)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
