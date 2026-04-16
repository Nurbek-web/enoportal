"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Droplets,
  TrendingUp,
  CircleDollarSign,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { FuelGauge } from "@/components/shared/fuel-gauge";
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
import { operations } from "@/lib/mock/operations";
import { reports } from "@/lib/mock/reports";
import { operators } from "@/lib/mock/operators";
import { currentFuelStatus } from "@/lib/mock/fuel";
import { formatCurrency, formatVolume, formatDateShort } from "@/lib/format";
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

const STATUS_DOT: Record<string, string> = {
  ok:       "bg-emerald-500",
  warning:  "bg-amber-500",
  critical: "bg-rose-500",
};

const REFERENCE_DATE = new Date("2026-04-07T00:00:00.000Z");

const UNPAID_STATUSES = new Set([
  "client_request",
  "terms_negotiation",
  "awaiting_payment",
]);

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

  const filteredOps = useMemo(
    () => filterByBase(operations, selectedBase),
    [selectedBase]
  );

  // KPI: sales today
  const salesToday = useMemo(() => {
    return filteredDeals
      .filter((d) => {
        const dt = new Date(d.date);
        return (
          dt.getFullYear() === REFERENCE_DATE.getFullYear() &&
          dt.getMonth() === REFERENCE_DATE.getMonth() &&
          dt.getDate() === REFERENCE_DATE.getDate()
        );
      })
      .reduce((s, d) => s + d.volume, 0);
  }, [filteredDeals]);

  // KPI: sales this week (last 7 days)
  const salesWeek = useMemo(() => {
    const weekAgo = new Date(REFERENCE_DATE.getTime() - 7 * 24 * 60 * 60 * 1000);
    return filteredDeals
      .filter((d) => {
        const dt = new Date(d.date);
        return dt >= weekAgo && dt <= REFERENCE_DATE;
      })
      .reduce((s, d) => s + d.volume, 0);
  }, [filteredDeals]);

  // KPI: total receivables
  const totalReceivables = useMemo(() => {
    return filteredDeals
      .filter((d) => UNPAID_STATUSES.has(d.status))
      .reduce((s, d) => s + d.totalAmount, 0);
  }, [filteredDeals]);

  // KPI: overdue receivables
  const overdueReceivables = useMemo(() => {
    return filteredDeals
      .filter((d) => {
        if (!UNPAID_STATUSES.has(d.status)) return false;
        return new Date(d.paymentDueDate) < REFERENCE_DATE;
      })
      .reduce((s, d) => s + d.totalAmount, 0);
  }, [filteredDeals]);

  // Weekly sales chart data (last 8 weeks)
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

  // Red zones
  const redZones = useMemo(() => {
    const zones: { type: "critical" | "warning"; title: string; description: string; href: string }[] = [];

    // 1. Fuel inventory dropping
    for (const fs of filteredFuelStatus) {
      if (fs.status === "critical") {
        zones.push({
          type: "critical",
          title: `Критический остаток: ${fs.fuelType} — ${BASE_LABELS[fs.base]}`,
          description: `Осталось ${fs.volumeRemaining.toLocaleString("ru-RU")} л (${fs.level}%). Запас на ${fs.daysRemaining} дн. Срочно закажите поставку.`,
          href: "/fuel-analysis",
        });
      } else if (fs.status === "warning") {
        zones.push({
          type: "warning",
          title: `Внимание: ${fs.fuelType} — ${BASE_LABELS[fs.base]}`,
          description: `Остаток ${fs.volumeRemaining.toLocaleString("ru-RU")} л (${fs.level}%). Запас на ${fs.daysRemaining} дн.`,
          href: "/fuel-analysis",
        });
      }
    }

    // 2. Overdue debt
    if (overdueReceivables > 0) {
      const overdueDeals = filteredDeals.filter(
        (d) => UNPAID_STATUSES.has(d.status) && new Date(d.paymentDueDate) < REFERENCE_DATE
      );
      const overdueClientIds = new Set(overdueDeals.map((d) => d.clientId));
      zones.push({
        type: overdueReceivables > 500_000_000 ? "critical" : "warning",
        title: `Просроченная дебиторка: ${formatCurrency(overdueReceivables)}`,
        description: `${overdueClientIds.size} клиент(ов) с просрочкой оплаты. Свяжитесь для уточнения сроков.`,
        href: "/receivables",
      });
    }

    // 3. Missing operator reports (operators who haven't reported in 2+ days)
    const twoDaysAgo = new Date(REFERENCE_DATE.getTime() - 2 * 24 * 60 * 60 * 1000);
    const opsWithRecentReport = new Set<string>();
    for (const r of reports) {
      if (new Date(r.date) >= twoDaysAgo) opsWithRecentReport.add(r.operatorId);
    }
    const missingReportOps = operators.filter((op) => !opsWithRecentReport.has(op.id));
    if (missingReportOps.length > 0) {
      zones.push({
        type: "warning",
        title: `Нет отчёта от ${missingReportOps.length} оператор(ов)`,
        description: `${missingReportOps.map((op) => op.name.split(" ")[0]).join(", ")} не отправляли отчёт более 2 дней.`,
        href: "/reports",
      });
    }

    return zones;
  }, [filteredFuelStatus, filteredDeals, overdueReceivables]);

  // Recent operations (last 8)
  const recentOps = useMemo(() => {
    return [...filteredOps]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [filteredOps]);

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
          <KpiCard title="Продажи сегодня" value={salesToday} format={formatVolume} icon={Droplets} accentColor="blue" href="/sales" />
          <KpiCard title="Продажи за неделю" value={salesWeek} format={formatVolume} icon={TrendingUp} accentColor="emerald" />
          <KpiCard title="Дебиторка" value={totalReceivables} format={formatCurrency} icon={CircleDollarSign} accentColor="amber" href="/receivables" />
          <KpiCard title="Просрочка" value={overdueReceivables} format={formatCurrency} icon={AlertTriangle} accentColor="violet" href="/receivables" />
        </div>
      </MotionItem>

      {/* Fuel gauges */}
      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-stone-800">Остатки по базам</h3>
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

      {/* Red Zones */}
      {redZones.length > 0 && (
        <MotionItem>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-stone-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Красные зоны
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {redZones.map((zone, idx) => (
                <Link
                  key={idx}
                  href={zone.href}
                  className={`block rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    zone.type === "critical"
                      ? "bg-rose-50 border-rose-200/60"
                      : "bg-amber-50 border-amber-200/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-lg p-2 ${
                        zone.type === "critical" ? "bg-rose-100" : "bg-amber-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          zone.type === "critical" ? "text-rose-600" : "text-amber-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          zone.type === "critical" ? "text-rose-800" : "text-amber-800"
                        }`}
                      >
                        {zone.title}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          zone.type === "critical" ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        {zone.description}
                      </p>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 mt-1 flex-shrink-0 ${
                        zone.type === "critical" ? "text-rose-400" : "text-amber-400"
                      }`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </MotionItem>
      )}

      {/* Last Operations + Weekly Sales */}
      <MotionItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent operations */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04]">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-800 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-stone-400" />
                Последние операции
              </h3>
              <Link href="/operations" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Все <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-200 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">База</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Объём</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Водитель</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOps.map((op) => (
                  <TableRow key={op.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                    <TableCell className="text-sm text-stone-700">{formatDateShort(op.date)}</TableCell>
                    <TableCell className="text-sm text-stone-700">{BASE_LABELS[op.base]}</TableCell>
                    <TableCell className="text-sm tabular-nums text-stone-600 text-right">{formatVolume(op.volume)}</TableCell>
                    <TableCell className="text-sm text-stone-700">{op.driverName}</TableCell>
                    <TableCell><StatusBadge status={op.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Weekly sales chart */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
            <h3 className="text-sm font-medium text-stone-800 mb-4">Продажи по неделям</h3>
            <div className="h-64 min-h-[256px] w-full min-w-0">
              <WeeklySalesChart data={weeklyData} />
            </div>
          </div>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
