"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Droplets } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { currentFuelStatus, fuelLevels } from "@/lib/mock/fuel";
import { BASE_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

const FuelLevelsChart = dynamic(
  () => import("@/components/charts/fuel-levels-chart"),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-xl bg-stone-100" />,
  }
);

const STATUS_CONFIG = {
  ok: { color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500", label: "Норма" },
  warning: { color: "text-amber-600", bg: "bg-amber-500", dot: "bg-amber-500", label: "Внимание" },
  critical: { color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500", label: "Критический" },
} as const;

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
                className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-stone-400" />
                    <span className="text-sm font-medium text-stone-800">
                      {baseName} — {item.fuelType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium text-stone-500">{cfg.label}</span>
                  </div>
                </div>

                <div className={`text-3xl font-bold ${cfg.color} mb-3`}>
                  {item.level}%
                </div>

                <div className="h-2 w-full rounded-full bg-stone-100 mb-3">
                  <div
                    className={`h-full rounded-full ${cfg.bg} transition-all`}
                    style={{ width: `${item.level}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Осталось: {formatNumber(item.volumeRemaining)} литров</span>
                  <span>Хватит на ~{item.daysRemaining} дней</span>
                </div>
              </div>
            );
          })}
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <h2 className="text-base font-semibold text-stone-800 mb-4">
            Динамика остатков топлива (30 дней)
          </h2>
          <div className="h-80 min-h-[320px] w-full min-w-0">
            <FuelLevelsChart data={chartData} />
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
