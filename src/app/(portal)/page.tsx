"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  Clock,
} from "lucide-react";

import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { FuelGauge } from "@/components/shared/fuel-gauge";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deals } from "@/lib/mock/sales";
import { clients } from "@/lib/mock/clients";
import { managers } from "@/lib/mock/managers";
import { operators } from "@/lib/mock/operators";
import { reports } from "@/lib/mock/reports";
import { currentFuelStatus } from "@/lib/mock/fuel";
import { activities } from "@/lib/mock/market";
import { formatCurrency, formatVolume, formatPercent, formatRelativeDate } from "@/lib/format";
import { BASE_LABELS } from "@/lib/constants";
import { useBaseFilter } from "@/contexts/base-filter-context";
import { filterByBase } from "@/lib/filter-by-base";
import type { Base } from "@/lib/types";

const WeeklySalesChart = dynamic(
  () => import("@/components/charts/weekly-sales-chart"),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-stone-100" />,
  }
);

const PeriodComparisonChart = dynamic(
  () => import("@/components/charts/period-comparison-chart"),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-xl bg-stone-100" />,
  }
);

const ACTIVITY_COLORS: Record<string, string> = {
  deal:       "bg-blue-500",
  report:     "bg-amber-500",
  expense:    "bg-rose-500",
  fuel_alert: "bg-orange-500",
  payment:    "bg-emerald-500",
};

const STATUS_DOT: Record<string, string> = {
  ok:       "bg-emerald-500",
  warning:  "bg-amber-500",
  critical: "bg-rose-500",
};

// Use the latest deal date as reference for "today" (demo data)
const REFERENCE_DATE = new Date("2026-04-07T00:00:00.000Z");

export default function DashboardPage() {
  const { selectedBase } = useBaseFilter();

  const filteredDeals = useMemo(
    () => filterByBase(deals, selectedBase),
    [selectedBase]
  );

  const filteredFuelStatus = useMemo(
    () => filterByBase(currentFuelStatus, selectedBase),
    [selectedBase]
  );

  const totalVolume = useMemo(() => filteredDeals.reduce((s, d) => s + d.volume, 0), [filteredDeals]);
  const totalRevenue = useMemo(() => filteredDeals.reduce((s, d) => s + d.totalAmount, 0), [filteredDeals]);
  const activeDeals = useMemo(() => filteredDeals.filter((d) => d.status !== "paid").length, [filteredDeals]);
  const avgMargin = useMemo(() => {
    if (filteredDeals.length === 0) return 0;
    return filteredDeals.reduce((s, d) => s + d.marginPercent, 0) / filteredDeals.length;
  }, [filteredDeals]);

  const weeklyData = useMemo(() => {
    if (filteredDeals.length === 0) return [];
    const sorted = [...filteredDeals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = new Date(sorted[sorted.length - 1].date);
    const weekStart = new Date(latest);
    weekStart.setDate(weekStart.getDate() - 7 * 8);
    return Array.from({ length: 8 }, (_, i) => {
      const from = new Date(weekStart);
      from.setDate(from.getDate() + i * 7);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      const vol = filteredDeals
        .filter((d) => { const dt = new Date(d.date); return dt >= from && dt < to; })
        .reduce((s, d) => s + d.volume, 0);
      const dd = from.getDate().toString().padStart(2, "0");
      const mm = (from.getMonth() + 1).toString().padStart(2, "0");
      return { label: `${dd}.${mm}`, volume: vol };
    });
  }, [filteredDeals]);

  // Period comparison: last 4 weeks vs previous 4 weeks
  const periodComparison = useMemo(() => {
    const now = REFERENCE_DATE.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return Array.from({ length: 4 }, (_, i) => {
      const currentEnd = new Date(now - i * weekMs);
      const currentStart = new Date(currentEnd.getTime() - weekMs);
      const previousEnd = new Date(currentStart.getTime());
      const previousStart = new Date(previousEnd.getTime() - weekMs);

      const currentVol = filteredDeals
        .filter((d) => { const t = new Date(d.date).getTime(); return t >= currentStart.getTime() && t < currentEnd.getTime(); })
        .reduce((s, d) => s + d.volume, 0);
      const previousVol = filteredDeals
        .filter((d) => { const t = new Date(d.date).getTime(); return t >= previousStart.getTime() && t < previousEnd.getTime(); })
        .reduce((s, d) => s + d.volume, 0);

      const dd = currentStart.getDate().toString().padStart(2, "0");
      const mm = (currentStart.getMonth() + 1).toString().padStart(2, "0");
      return { label: `${dd}.${mm}`, current: currentVol, previous: previousVol };
    }).reverse();
  }, [filteredDeals]);

  // Week-over-week delta
  const weekDelta = useMemo(() => {
    if (periodComparison.length < 2) return { value: 0, positive: true };
    const curr = periodComparison[periodComparison.length - 1].current;
    const prev = periodComparison[periodComparison.length - 1].previous;
    if (prev === 0) return { value: 0, positive: true };
    const delta = ((curr - prev) / prev) * 100;
    return { value: Math.abs(delta), positive: delta >= 0 };
  }, [periodComparison]);

  const baseVolumes = useMemo(() => {
    const chirchik = filteredDeals.reduce((s, d) => (d.base === "chirchik" ? s + d.volume : s), 0);
    const akhangaran = filteredDeals.reduce((s, d) => (d.base === "akhangaran" ? s + d.volume : s), 0);
    return { chirchik, akhangaran, total: chirchik + akhangaran };
  }, [filteredDeals]);

  const topClients = useMemo(() => {
    const map = new Map<string, { volume: number; count: number }>();
    for (const d of filteredDeals) {
      const prev = map.get(d.clientId) || { volume: 0, count: 0 };
      map.set(d.clientId, { volume: prev.volume + d.volume, count: prev.count + 1 });
    }
    return Array.from(map.entries())
      .map(([clientId, stats]) => ({ clientId, ...stats, client: clients.find((c) => c.id === clientId) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [filteredDeals]);

  const topManagers = useMemo(() => {
    const statsMap = new Map<string, { name: string; volume: number; dealCount: number }>();
    for (const mgr of managers) statsMap.set(mgr.id, { name: mgr.name, volume: 0, dealCount: 0 });
    for (const d of filteredDeals) {
      const entry = statsMap.get(d.managerId);
      if (entry) { entry.volume += d.volume; entry.dealCount += 1; }
    }
    return Array.from(statsMap.values()).sort((a, b) => b.volume - a.volume).slice(0, 5);
  }, [filteredDeals]);

  // Operator efficiency: report count + approval rate
  const operatorEfficiency = useMemo(() => {
    return operators.map((op) => {
      const opReports = reports.filter((r) => r.operatorId === op.id);
      const approved = opReports.filter((r) => r.status === "approved").length;
      const total = opReports.length;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      return { id: op.id, name: op.name, total, approvalRate };
    }).sort((a, b) => b.approvalRate - a.approvalRate || b.total - a.total).slice(0, 5);
  }, []);

  const aiForecast = useMemo(() => {
    const recentWeekVol = filteredDeals
      .filter((d) => (REFERENCE_DATE.getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24) <= 7)
      .reduce((s, d) => s + d.volume, 0);
    const topClient = topClients[0];
    const criticalFuel = filteredFuelStatus.find((f) => f.status === "critical");
    const warningFuel = filteredFuelStatus.filter((f) => f.status === "warning" || f.status === "critical");
    const promisingClients = clients.filter((c) => c.segment === "promising").slice(0, 2);
    const trendPositive = weekDelta.positive;
    const trendPct = weekDelta.value.toFixed(1);
    return { recentWeekVol, topClient, criticalFuel, warningFuel, promisingClients, trendPositive, trendPct };
  }, [filteredDeals, topClients, filteredFuelStatus, weekDelta]);

  // Per-base worst status for pulse indicators
  const baseStatus = useMemo(() => {
    const result: Record<string, "ok" | "warning" | "critical"> = {
      chirchik: "ok",
      akhangaran: "ok",
    };
    for (const s of currentFuelStatus) {
      const cur = result[s.base];
      if (s.status === "critical" || (s.status === "warning" && cur === "ok")) {
        result[s.base] = s.status;
      }
    }
    return result;
  }, []);

  const recentActivities = activities.slice(0, 8);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Дашборд"
          description="Центр управления топливораздачей"
        />
      </MotionItem>

      {/* KPI Row */}
      <MotionItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Объём продаж" value={totalVolume} format={formatVolume} icon={Droplets} accentColor="blue" trend={{ value: 12.3, positive: true }} />
          <KpiCard title="Выручка" value={totalRevenue} format={formatCurrency} icon={TrendingUp} accentColor="emerald" trend={{ value: 8.5, positive: true }} />
          <KpiCard title="Активные сделки" value={activeDeals} icon={ShoppingCart} accentColor="amber" trend={{ value: 2.1, positive: false }} />
          <KpiCard title="Средняя маржа" value={avgMargin} format={formatPercent} icon={BarChart3} accentColor="violet" trend={{ value: 5.7, positive: true }} />
        </div>
      </MotionItem>

      {/* Charts row */}
      <MotionItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
            <h3 className="text-sm font-medium text-stone-800 mb-4">Продажи по неделям</h3>
            <div className="h-64 min-h-[256px] w-full min-w-0">
              <WeeklySalesChart data={weeklyData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
            <h3 className="text-sm font-medium text-stone-800 mb-4">Загрузка по базам</h3>
            <div className="space-y-5">
              {([
                { key: "chirchik" as Base, label: "Чирчик", color: "bg-blue-500" },
                { key: "akhangaran" as Base, label: "Ахангаран", color: "bg-emerald-500" },
              ]).map((base) => {
                const vol = baseVolumes[base.key];
                const pct = baseVolumes.total > 0 ? (vol / baseVolumes.total) * 100 : 0;
                return (
                  <div key={base.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700">{base.label}</span>
                      <span className="text-sm text-stone-500">{formatVolume(vol)} · {pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-stone-100">
                      <div className={`h-3 rounded-full ${base.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">Всего</span>
                <span className="text-sm font-semibold text-stone-900">{formatVolume(baseVolumes.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </MotionItem>

      {/* Period Comparison */}
      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-stone-800">Сравнение периодов</h3>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${weekDelta.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {weekDelta.positive
                ? <TrendingUp className="h-3.5 w-3.5" />
                : <TrendingDown className="h-3.5 w-3.5" />
              }
              {weekDelta.positive ? "+" : "-"}{weekDelta.value.toFixed(1)}% к прошлой неделе
            </div>
          </div>
          <div className="h-48 min-h-[192px] w-full min-w-0">
            <PeriodComparisonChart data={periodComparison} />
          </div>
        </div>
      </MotionItem>

      {/* Fuel gauges */}
      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-stone-800">Топливные резервуары</h3>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              {(["chirchik", "akhangaran"] as Base[]).map((base) => {
                const st = baseStatus[base];
                return (
                  <div key={base} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full status-pulse ${STATUS_DOT[st]}`} />
                    <span>{BASE_LABELS[base]}: {st === "ok" ? "Норма" : st === "warning" ? "Внимание" : "Критично"}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap justify-around gap-6">
            {filteredFuelStatus.map((item, idx) => (
              <FuelGauge
                key={`${item.base}-${item.fuelType}`}
                label={item.fuelType}
                baseName={BASE_LABELS[item.base]}
                level={item.level}
                status={item.status}
                daysRemaining={item.daysRemaining}
                volumeRemaining={item.volumeRemaining}
                index={idx}
              />
            ))}
          </div>
        </div>
      </MotionItem>

      {/* Tables row */}
      <MotionItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top clients */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04]">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="text-sm font-medium text-stone-800">Топ-5 клиентов</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-200 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Компания</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Объём</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Сделки</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((row) => (
                  <TableRow key={row.clientId} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                    <TableCell className="text-sm font-medium text-stone-700">{row.client?.companyName ?? "—"}</TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-600 text-right">{formatVolume(row.volume)}</TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-600 text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Manager leaderboard */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04]">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="text-sm font-medium text-stone-800">Рейтинг продажников</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-200 hover:bg-transparent">
                  <TableHead className="w-8 text-xs font-medium uppercase tracking-wider text-stone-500">#</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Менеджер</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Объём</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Сделок</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topManagers.map((mgr, idx) => (
                  <TableRow
                    key={mgr.name}
                    className={idx === 0
                      ? "border-b border-stone-100 bg-amber-50/50"
                      : "border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150"
                    }
                  >
                    <TableCell className="font-semibold text-stone-500">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-stone-900">{mgr.name}</TableCell>
                    <TableCell className="text-right tabular-nums text-stone-600">{formatVolume(mgr.volume)}</TableCell>
                    <TableCell className="text-right tabular-nums text-stone-600">{mgr.dealCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </MotionItem>

      {/* Operator Efficiency */}
      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04]">
          <div className="px-5 py-4 border-b border-stone-100">
            <h3 className="text-sm font-medium text-stone-800">Эффективность операторов</h3>
          </div>
          <div className="p-5 space-y-3">
            {operatorEfficiency.map((op) => (
              <div key={op.id} className="flex items-center gap-4">
                <span className="w-36 text-sm font-medium text-stone-700 truncate flex-shrink-0">{op.name.split(" ")[0]} {op.name.split(" ")[1]?.[0]}.</span>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${op.approvalRate >= 80 ? "bg-emerald-500" : op.approvalRate >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${op.approvalRate}%` }}
                  />
                </div>
                <span className={`w-12 text-right text-sm font-semibold tabular-nums ${op.approvalRate >= 80 ? "text-emerald-600" : op.approvalRate >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                  {op.approvalRate}%
                </span>
                <span className="w-16 text-right text-xs text-stone-400 tabular-nums">{op.total} отч.</span>
              </div>
            ))}
          </div>
        </div>
      </MotionItem>

      {/* AI forecast + Activity */}
      <MotionItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <AiInsightCard title="ИИ-прогноз продаж">
              <div className="space-y-2 text-sm">
                <p>
                  За последние 7 дней продано{" "}
                  <strong>{formatVolume(aiForecast.recentWeekVol)}</strong>.
                  При сохранении темпа прогнозируемая выручка за апрель составит{" "}
                  <strong>
                    {formatCurrency(Math.round(
                      (aiForecast.recentWeekVol / 7) * 30 * (totalRevenue / (totalVolume || 1))
                    ))}
                  </strong>.
                </p>
                <p>
                  Тренд:{" "}
                  <span className={aiForecast.trendPositive ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                    {aiForecast.trendPositive ? "рост" : "спад"} {aiForecast.trendPositive ? "+" : "-"}{aiForecast.trendPct}%
                  </span>{" "}
                  по сравнению с прошлой неделей.
                </p>
                {aiForecast.promisingClients.length > 0 && (
                  <p>
                    Рекомендуем акцент на перспективных клиентах:{" "}
                    <strong>{aiForecast.promisingClients.map((c) => c.companyName).join(", ")}</strong>.
                  </p>
                )}
                {aiForecast.topClient?.client && (
                  <p>
                    Приоритет удержания: <strong>{aiForecast.topClient.client.companyName}</strong> — наибольший объём закупок.
                  </p>
                )}
              </div>
            </AiInsightCard>

            <AiInsightCard title="Прогноз дефицита топлива">
              <div className="space-y-2 text-sm">
                {aiForecast.warningFuel.length === 0 ? (
                  <p>Все резервуары в норме. Плановая закупка не требуется в ближайшие 7 дней.</p>
                ) : (
                  aiForecast.warningFuel.map((f) => (
                    <p key={`${f.base}-${f.fuelType}`} className={f.status === "critical" ? "text-rose-600 font-medium" : "text-amber-700"}>
                      {f.status === "critical" ? "⚠ Критично:" : "⚡ Внимание:"}{" "}
                      {f.fuelType} на базе {BASE_LABELS[f.base]} — остаток на{" "}
                      <strong>{f.daysRemaining} дн.</strong> Рекомендуем срочную поставку.
                    </p>
                  ))
                )}
                <p className="text-stone-500">
                  Оптимальный момент закупки — когда цена рынка ниже среднего на 2%+. Следите за вкладкой «Рынок».
                </p>
              </div>
            </AiInsightCard>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
            <h3 className="text-sm font-medium text-stone-800 mb-4">Последние события</h3>
            <div className="space-y-3">
              {recentActivities.map((act, idx) => (
                <div
                  key={act.id}
                  className="activity-item flex items-start gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${ACTIVITY_COLORS[act.type] ?? "bg-stone-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{act.title}</p>
                    <p className="text-xs text-stone-500 truncate">{act.description}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 text-stone-400" />
                    <span className="text-xs text-stone-400 whitespace-nowrap">{formatRelativeDate(act.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
