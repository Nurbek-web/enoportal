"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DataPoint = { label: string; current: number; previous: number };

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; color: string; value: number; name: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200/60 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-medium text-stone-600 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {(p.value / 1000).toFixed(0)} тыс. л
        </p>
      ))}
    </div>
  );
};

export default function PeriodComparisonChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#a8a29e", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#a8a29e", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#78716c", paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="current" name="Текущий период" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="previous" name="Прошлый период" fill="#d6d3d1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
