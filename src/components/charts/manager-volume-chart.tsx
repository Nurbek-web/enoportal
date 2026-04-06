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

interface ManagerStats {
  id: string;
  name: string;
  volume: number;
  bonus: number;
  dealCount: number;
}

interface ManagerVolumeChartProps {
  data: ManagerStats[];
}

export default function ManagerVolumeChart({ data }: ManagerVolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="#e7e5e4"
          strokeOpacity={0.5}
        />
        <XAxis
          type="number"
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}`}
          tick={{ fontSize: 12, fill: "#a8a29e" }}
          tickLine={false}
          axisLine={false}
          unit=" тыс. л"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 12, fill: "#a8a29e" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "#f5f5f4" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as ManagerStats;
            return (
              <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-md text-xs text-stone-700">
                <p className="font-medium mb-1">{item.name}</p>
                <p>{formatNumber(item.volume)} л</p>
              </div>
            );
          }}
        />
        <Bar
          dataKey="volume"
          fill="#3b82f6"
          radius={[0, 6, 6, 0]}
          activeBar={{ fill: "#2563eb" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
