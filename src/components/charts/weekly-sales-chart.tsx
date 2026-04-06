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

function CustomTooltip({
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

interface WeeklySalesChartProps {
  data: WeeklySalesData[];
}

export default function WeeklySalesChart({ data }: WeeklySalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} barCategoryGap="20%">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="volume" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
