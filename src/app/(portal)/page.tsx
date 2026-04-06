"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Droplets,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Fuel,
  Clock,
} from "lucide-react";

import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { currentFuelStatus } from "@/lib/mock/fuel";
import { activities } from "@/lib/mock/market";
import { formatCurrency, formatVolume, formatPercent, formatRelativeDate } from "@/lib/format";
import { BASE_LABELS } from "@/lib/constants";

const WeeklySalesChart = dynamic(
  () => import("@/components/charts/weekly-sales-chart"),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-stone-100" />,
  }
);

const ACTIVITY_COLORS: Record<string, string> = {
  deal: "bg-blue-500",
  report: "bg-amber-500",
  expense: "bg-rose-500",
  fuel_alert: "bg-orange-500",
  payment: "bg-emerald-500",
};

const FUEL_STATUS_DOT: Record<string, string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500",
};

export default function DashboardPage() {
  const totalVolume = useMemo(() => deals.reduce((s, d) => s + d.volume, 0), []);
  const totalRevenue = useMemo(() => deals.reduce((s, d) => s + d.totalAmount, 0), []);
  const activeDeals = useMemo(() => deals.filter((d) => d.status !== "paid").length, []);
  const avgMargin = useMemo(() => {
    const sum = deals.reduce((s, d) => s + d.marginPercent, 0);
    return sum / deals.length;
  }, []);

  const weeklyData = useMemo(() => {
    const sorted = [...deals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = new Date(sorted[sorted.length - 1].date);

    const weekStart = new Date(latest);
    weekStart.setDate(weekStart.getDate() - 7 * 8);

    const weeks: { label: string; volume: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const from = new Date(weekStart);
      from.setDate(from.getDate() + i * 7);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);

      const vol = deals
        .filter((d) => {
          const dt = new Date(d.date);
          return dt >= from && dt < to;
        })
        .reduce((s, d) => s + d.volume, 0);

      const dd = from.getDate().toString().padStart(2, "0");
      const mm = (from.getMonth() + 1).toString().padStart(2, "0");
      weeks.push({ label: `${dd}.${mm}`, volume: vol });
    }
    return weeks;
  }, []);

  const baseVolumes = useMemo(() => {
    const chirchik = deals.reduce((s, d) => (d.base === "chirchik" ? s + d.volume : s), 0);
    const akhangaran = deals.reduce((s, d) => (d.base === "akhangaran" ? s + d.volume : s), 0);
    const total = chirchik + akhangaran;
    return { chirchik, akhangaran, total };
  }, []);

  const topClients = useMemo(() => {
    const map = new Map<string, { volume: number; count: number }>();
    for (const d of deals) {
      const prev = map.get(d.clientId) || { volume: 0, count: 0 };
      map.set(d.clientId, { volume: prev.volume + d.volume, count: prev.count + 1 });
    }
    return Array.from(map.entries())
      .map(([clientId, stats]) => {
        const client = clients.find((c) => c.id === clientId);
        return { clientId, ...stats, client };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, []);

  const recentActivities = activities.slice(0, 8);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Дашборд"
          description="Обзор ключевых показателей бизнеса"
        />
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Объём продаж"
            value={totalVolume}
            format={formatVolume}
            icon={Droplets}
            accentColor="blue"
            trend={{ value: 12.3, positive: true }}
          />
          <KpiCard
            title="Выручка"
            value={totalRevenue}
            format={formatCurrency}
            icon={TrendingUp}
            accentColor="emerald"
            trend={{ value: 8.5, positive: true }}
          />
          <KpiCard
            title="Активные сделки"
            value={activeDeals}
            icon={ShoppingCart}
            accentColor="amber"
            trend={{ value: 2.1, positive: false }}
          />
          <KpiCard
            title="Средняя маржа"
            value={avgMargin}
            format={formatPercent}
            icon={BarChart3}
            accentColor="violet"
            trend={{ value: 5.7, positive: true }}
          />
        </div>
      </MotionItem>

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
                { key: "chirchik" as const, label: "Чирчик", color: "bg-blue-500" },
                { key: "akhangaran" as const, label: "Ахангаран", color: "bg-emerald-500" },
              ]).map((base) => {
                const vol = baseVolumes[base.key];
                const pct = baseVolumes.total > 0 ? (vol / baseVolumes.total) * 100 : 0;
                return (
                  <div key={base.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700">{base.label}</span>
                      <span className="text-sm text-stone-500">
                        {formatVolume(vol)} · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-stone-100">
                      <div
                        className={`h-3 rounded-full ${base.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">Всего</span>
                <span className="text-sm font-semibold text-stone-900">
                  {formatVolume(baseVolumes.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
            <h3 className="text-sm font-medium text-stone-800 mb-4">Топ-5 клиентов</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-200 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Компания
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                    Объём
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                    Сделки
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                    Сегмент
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((row) => (
                  <TableRow key={row.clientId} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                    <TableCell className="text-sm text-stone-700 font-medium">
                      {row.client?.companyName ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-600 text-right">
                      {formatVolume(row.volume)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-600 text-right">
                      {row.count}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.client && <StatusBadge status={row.client.segment} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AiInsightCard title="Статус топлива на базах">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentFuelStatus.map((fs) => (
                <div
                  key={`${fs.base}-${fs.fuelType}`}
                  className="rounded-xl border border-stone-200/50 bg-white p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-stone-400" />
                      <span className="text-sm font-medium text-stone-800">{fs.fuelType}</span>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${FUEL_STATUS_DOT[fs.status]}`} />
                  </div>
                  <p className="text-xs text-stone-500 mb-3">{BASE_LABELS[fs.base]}</p>
                  <div className="h-2 w-full rounded-full bg-stone-100 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        fs.status === "critical"
                          ? "bg-rose-500"
                          : fs.status === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${fs.level}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-stone-900">{fs.level}%</span>
                    <span className="text-xs text-stone-500">~{fs.daysRemaining} дн.</span>
                  </div>
                </div>
              ))}
            </div>
          </AiInsightCard>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <h3 className="text-sm font-medium text-stone-800 mb-4">Последние события</h3>
          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="mt-1.5 flex-shrink-0">
                  <div className={`h-2.5 w-2.5 rounded-full ${ACTIVITY_COLORS[act.type] ?? "bg-stone-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{act.title}</p>
                  <p className="text-sm text-stone-500 truncate">{act.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs text-stone-400 whitespace-nowrap">
                    {formatRelativeDate(act.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
