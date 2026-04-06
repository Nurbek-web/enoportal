"use client";

import { useMemo } from "react";
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
import { Droplets } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { currentFuelStatus, fuelLevels } from "@/lib/mock/fuel";
import { BASE_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

const STATUS_CONFIG = {
  ok: { color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500", label: "Норма" },
  warning: { color: "text-amber-600", bg: "bg-amber-500", dot: "bg-amber-500", label: "Внимание" },
  critical: { color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500", label: "Критический" },
} as const;

const SERIES = [
  { key: "chirchik-AI-92", label: "Чирчик АИ-92", color: "#3b82f6" },
  { key: "chirchik-AI-95", label: "Чирчик АИ-95", color: "#8b5cf6" },
  { key: "akhangaran-AI-92", label: "Ахангаран АИ-92", color: "#10b981" },
  { key: "akhangaran-AI-95", label: "Ахангаран АИ-95", color: "#f59e0b" },
] as const;

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-lg shadow-slate-950/[0.06]">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-slate-600">{entry.name}:</span>
          <span className="text-xs font-semibold text-slate-900">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function FuelAnalysisPage() {
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, string | number>>();

    for (const entry of fuelLevels) {
      const dateStr = new Date(entry.date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr });
      }
      const row = dateMap.get(dateStr)!;
      row[`${entry.base}-${entry.fuelType}`] = entry.level;
    }

    return Array.from(dateMap.values());
  }, []);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Анализ топлива"
          description="ИИ-мониторинг остатков и прогнозирование"
        />
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentFuelStatus.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const baseName = BASE_LABELS[item.base];

            return (
              <div
                key={`${item.base}-${item.fuelType}`}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-950/[0.03] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">
                      {baseName} — {item.fuelType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium text-slate-500">{cfg.label}</span>
                  </div>
                </div>

                <div className={`text-3xl font-bold ${cfg.color} mb-3`}>
                  {item.level}%
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 mb-3">
                  <div
                    className={`h-full rounded-full ${cfg.bg} transition-all`}
                    style={{ width: `${item.level}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Осталось: {formatNumber(item.volumeRemaining)} литров</span>
                  <span>Хватит на ~{item.daysRemaining} дней</span>
                </div>
              </div>
            );
          })}
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-950/[0.03] p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Динамика остатков топлива (30 дней)
          </h2>
          <div className="h-80 min-h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {SERIES.map((s) => (
                    <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
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
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="flex flex-col gap-4">
          <AiInsightCard title="Прогноз: АИ-92 Чирчик">
            <p>
              При текущей скорости продаж, АИ-92 на базе Чирчик закончится через 5 дней.
              Рекомендуем оформить поставку не позднее 8 апреля.
            </p>
          </AiInsightCard>

          <AiInsightCard title="Критический уровень: АИ-95 Ахангаран">
            <p>
              АИ-95 на базе Ахангаран на критическом уровне (18%). Срочно необходима поставка —
              текущих запасов хватит на 2 дня.
            </p>
          </AiInsightCard>

          <AiInsightCard title="Стабильный расход: АИ-92 Ахангаран">
            <p>
              Потребление АИ-92 на базе Ахангаран стабильно. Следующая поставка рекомендуется
              через 12 дней.
            </p>
          </AiInsightCard>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
