"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Droplets,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Clock,
} from "lucide-react";

import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { DashboardKpiCard } from "@/components/shared/dashboard-kpi-card";
import { FuelGauge } from "@/components/shared/fuel-gauge";
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
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-white/[0.05]" />,
  }
);

const ACTIVITY_COLORS: Record<string, string> = {
  deal:       "bg-blue-400",
  report:     "bg-amber-400",
  expense:    "bg-rose-400",
  fuel_alert: "bg-orange-400",
  payment:    "bg-emerald-400",
};

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

  const aiForecast = useMemo(() => {
    const recentWeekVol = filteredDeals
      .filter((d) => (Date.now() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24) <= 7)
      .reduce((s, d) => s + d.volume, 0);
    const topClient = topClients[0];
    const criticalFuel = filteredFuelStatus.find((f) => f.status === "critical");
    return { recentWeekVol, topClient, criticalFuel };
  }, [filteredDeals, topClients, filteredFuelStatus]);

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

  const STATUS_DOT: Record<string, string> = {
    ok:       "bg-emerald-400",
    warning:  "bg-amber-400",
    critical: "bg-rose-400",
  };

  const recentActivities = activities.slice(0, 8);

  return (
    <div className="dashboard-gradient-bg -mx-4 -my-4 md:-mx-6 md:-my-6 px-4 py-4 md:px-6 md:py-6 min-h-[calc(100vh-4rem)]">
      <MotionContainer>

        {/* Page header */}
        <MotionItem>
          <div className="mb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Дашборд</h1>
            <p className="mt-1 text-sm text-stone-400">Центр управления топливораздачей</p>
          </div>
        </MotionItem>

        {/* KPI Row */}
        <MotionItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardKpiCard
              title="Объём продаж"
              value={totalVolume}
              format={formatVolume}
              icon={Droplets}
              accentColor="blue"
              trend={{ value: 12.3, positive: true }}
            />
            <DashboardKpiCard
              title="Выручка"
              value={totalRevenue}
              format={formatCurrency}
              icon={TrendingUp}
              accentColor="emerald"
              trend={{ value: 8.5, positive: true }}
            />
            <DashboardKpiCard
              title="Активные сделки"
              value={activeDeals}
              icon={ShoppingCart}
              accentColor="amber"
              trend={{ value: 2.1, positive: false }}
            />
            <DashboardKpiCard
              title="Средняя маржа"
              value={avgMargin}
              format={formatPercent}
              icon={BarChart3}
              accentColor="violet"
              trend={{ value: 5.7, positive: true }}
            />
          </div>
        </MotionItem>

        {/* Charts row */}
        <MotionItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly sales chart */}
            <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-5">
              <h3 className="text-sm font-medium text-stone-300 mb-4">Продажи по неделям</h3>
              <div className="h-64 min-h-[256px] w-full min-w-0">
                <WeeklySalesChart data={weeklyData} dark />
              </div>
            </div>

            {/* Base load */}
            <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-5">
              <h3 className="text-sm font-medium text-stone-300 mb-4">Загрузка по базам</h3>
              <div className="space-y-5">
                {([
                  { key: "chirchik" as Base, label: "Чирчик", color: "bg-blue-400" },
                  { key: "akhangaran" as Base, label: "Ахангаран", color: "bg-emerald-400" },
                ]).map((base) => {
                  const vol = baseVolumes[base.key];
                  const pct = baseVolumes.total > 0 ? (vol / baseVolumes.total) * 100 : 0;
                  return (
                    <div key={base.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-stone-300">{base.label}</span>
                        <span className="text-sm text-stone-400">
                          {formatVolume(vol)} · {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-white/[0.1]">
                        <div
                          className={`h-3 rounded-full ${base.color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-300">Всего</span>
                  <span className="text-sm font-semibold text-white">{formatVolume(baseVolumes.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </MotionItem>

        {/* Fuel Operations */}
        <MotionItem>
          <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-5">
            <h3 className="text-sm font-medium text-stone-300 mb-6">Топливные резервуары</h3>
            <div className="flex flex-wrap items-start justify-around gap-6">
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

              {/* Base indicators */}
              <div className="flex gap-4 self-center">
                {(["chirchik", "akhangaran"] as Base[]).map((base) => {
                  const st = baseStatus[base];
                  return (
                    <div
                      key={base}
                      className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4 flex flex-col items-center gap-2 min-w-[100px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full status-pulse ${STATUS_DOT[st]}`} />
                        <span className="text-xs font-medium text-stone-300">{BASE_LABELS[base]}</span>
                      </div>
                      <span className="text-xs text-stone-500">
                        {st === "ok" ? "Норма" : st === "warning" ? "Внимание" : "Критично"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </MotionItem>

        {/* Tables row */}
        <MotionItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top clients */}
            <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.08]">
                <h3 className="text-sm font-medium text-stone-300">Топ-5 клиентов</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Компания</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Объём</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Сделки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((row) => (
                    <TableRow key={row.clientId} className="border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors duration-150">
                      <TableCell className="text-sm font-medium text-stone-200">{row.client?.companyName ?? "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums text-stone-400 text-right">{formatVolume(row.volume)}</TableCell>
                      <TableCell className="text-sm tabular-nums text-stone-400 text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Manager leaderboard */}
            <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.08]">
                <h3 className="text-sm font-medium text-stone-300">Рейтинг продажников</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
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
                      className={
                        idx === 0
                          ? "border-b border-white/[0.06] bg-amber-500/10"
                          : "border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors duration-150"
                      }
                    >
                      <TableCell className="font-semibold text-stone-500">{idx + 1}</TableCell>
                      <TableCell className="font-medium text-stone-200">{mgr.name}</TableCell>
                      <TableCell className="text-right tabular-nums text-stone-400">{formatVolume(mgr.volume)}</TableCell>
                      <TableCell className="text-right tabular-nums text-stone-400">{mgr.dealCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </MotionItem>

        {/* Bottom row: AI forecast + Activity ticker */}
        <MotionItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI forecast */}
            <div className="bg-violet-500/[0.08] backdrop-blur-2xl border border-violet-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-medium text-violet-400">
                  ✦ ИИ-прогноз
                </span>
              </div>
              <div className="space-y-2 text-sm text-stone-300">
                <p>
                  За последние 7 дней продано{" "}
                  <strong className="text-white">{formatVolume(aiForecast.recentWeekVol)}</strong>.
                  При сохранении темпа прогнозируемая выручка за апрель составит{" "}
                  <strong className="text-white">
                    {formatCurrency(
                      Math.round(
                        (aiForecast.recentWeekVol / 7) * 30 *
                        (totalRevenue / (totalVolume || 1))
                      )
                    )}
                  </strong>.
                </p>
                {aiForecast.topClient?.client && (
                  <p>
                    Приоритетный клиент:{" "}
                    <strong className="text-white">{aiForecast.topClient.client.companyName}</strong> —
                    наибольший объём закупок, рекомендуем удержание.
                  </p>
                )}
                {aiForecast.criticalFuel && (
                  <p className="text-rose-400 font-medium">
                    ⚠ Критический остаток: {aiForecast.criticalFuel.fuelType} на базе{" "}
                    {BASE_LABELS[aiForecast.criticalFuel.base]} — срочная поставка.
                  </p>
                )}
              </div>
            </div>

            {/* Activity ticker */}
            <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-5">
              <h3 className="text-sm font-medium text-stone-300 mb-4">Последние события</h3>
              <div className="space-y-3">
                {recentActivities.map((act, idx) => (
                  <div
                    key={act.id}
                    className="activity-item flex items-start gap-3 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      <div className={`h-2 w-2 rounded-full ${ACTIVITY_COLORS[act.type] ?? "bg-stone-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-200 truncate">{act.title}</p>
                      <p className="text-xs text-stone-500 truncate">{act.description}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3 text-stone-600" />
                      <span className="text-xs text-stone-600 whitespace-nowrap">
                        {formatRelativeDate(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionItem>

      </MotionContainer>
    </div>
  );
}
