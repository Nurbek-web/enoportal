"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-lg shadow-slate-950/[0.08]">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.dataKey}:</span>
          <span className="font-semibold text-slate-900">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface MarketPriceChartProps {
  data: Array<{ date: string; "AI-92": number; "AI-95": number }>;
}

export default function MarketPriceChart({ data }: MarketPriceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradient92" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradient95" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          domain={["dataMin - 200", "dataMax + 200"]}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}к`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="AI-92"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#gradient92)"
          dot={false}
          activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
        />
        <Area
          type="monotone"
          dataKey="AI-95"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#gradient95)"
          dot={false}
          activeDot={{ r: 4, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
