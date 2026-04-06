"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { MiniKpiCard } from "@/components/shared/mini-kpi-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deals } from "@/lib/mock/sales";
import { managers } from "@/lib/mock/managers";
import { BONUS_RATE_PER_LITER } from "@/lib/constants";
import { formatCurrency, formatNumber, formatVolume } from "@/lib/format";

const ManagerVolumeChart = dynamic(
  () => import("@/components/charts/manager-volume-chart"),
  {
    ssr: false,
    loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-stone-100" />,
  }
);

const MONTH_NAME_MAP: Record<string, number> = {
  february: 1,
  march: 2,
  april: 3,
};

function parseMonth(monthStr: string): { monthIndex: number; year: number } {
  const [name, yearStr] = monthStr.split("-");
  const monthIndex = MONTH_NAME_MAP[name] ?? -1;
  const year = parseInt(yearStr, 10);
  return { monthIndex, year };
}

interface ManagerStats {
  id: string;
  name: string;
  volume: number;
  bonus: number;
  dealCount: number;
}

export default function BonusesPage() {
  const [month, setMonth] = useState("april-2026");

  const managerStats = useMemo(() => {
    const { monthIndex, year } = parseMonth(month);

    const statsMap = new Map<string, ManagerStats>();

    for (const mgr of managers) {
      statsMap.set(mgr.id, {
        id: mgr.id,
        name: mgr.name,
        volume: 0,
        bonus: 0,
        dealCount: 0,
      });
    }

    for (const deal of deals) {
      const d = new Date(deal.date);
      if (d.getMonth() !== monthIndex || d.getFullYear() !== year) continue;
      const entry = statsMap.get(deal.managerId);
      if (entry) {
        entry.volume += deal.volume;
        entry.dealCount += 1;
      }
    }

    Array.from(statsMap.values()).forEach((entry) => {
      entry.bonus = entry.volume * BONUS_RATE_PER_LITER;
    });

    return Array.from(statsMap.values()).sort((a, b) => b.volume - a.volume);
  }, [month]);

  const totals = useMemo(() => {
    const totalVolume = managerStats.reduce((s, m) => s + m.volume, 0);
    const totalBonus = managerStats.reduce((s, m) => s + m.bonus, 0);
    const topManager = managerStats[0]?.name ?? "—";
    return { totalVolume, totalBonus, topManager };
  }, [managerStats]);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Бонусы продажников"
          description="Расчёт бонусов: 24 сум за литр"
        >
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="february-2026">Февраль 2026</SelectItem>
              <SelectItem value="march-2026">Март 2026</SelectItem>
              <SelectItem value="april-2026">Апрель 2026</SelectItem>
            </SelectContent>
          </Select>
        </PageHeader>
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MiniKpiCard label="Общий объём продаж" value={formatVolume(totals.totalVolume)} />
          <MiniKpiCard label="Общий бонус" value={formatCurrency(totals.totalBonus)} />
          <MiniKpiCard label="Лидер продаж" value={totals.topManager} />
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <p className="text-sm font-medium text-stone-700 mb-4">
            Объём продаж по менеджерам
          </p>
          {managerStats.every((m) => m.volume === 0) ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-stone-400">
              Нет данных за этот период
            </div>
          ) : (
            <ManagerVolumeChart data={managerStats} />
          )}
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-100 hover:bg-transparent">
                <TableHead className="w-12 text-xs font-medium uppercase tracking-wider text-stone-500">
                  №
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Менеджер
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                  Объём продаж (л)
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                  Кол-во сделок
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                  Бонус
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managerStats.map((mgr, idx) => (
                <TableRow
                  key={mgr.id}
                  className={
                    idx === 0
                      ? "border-b border-stone-100 bg-amber-50/50 hover:bg-amber-50 transition-colors duration-150"
                      : "border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150"
                  }
                >
                  <TableCell className="font-medium text-stone-600">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">
                    {mgr.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-stone-700">
                    {formatNumber(mgr.volume)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-stone-700">
                    {mgr.dealCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-stone-900">
                    {formatCurrency(mgr.bonus)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
