"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingDown, TrendingUp } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { marketPrices } from "@/lib/mock/market";
import { formatCurrency } from "@/lib/format";
import { ENO_PRICES } from "@/lib/constants";

const MarketPriceChart = dynamic(
  () => import("@/components/charts/market-price-chart"),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-xl bg-stone-100" />,
  }
);

export default function MarketPage() {
  const chartData = useMemo(() => {
    const weekMap = new Map<string, { date: string; sum92: number; count92: number; sum95: number; count95: number }>();

    for (const p of marketPrices) {
      const dateKey = p.date.split("T")[0];
      const entry = weekMap.get(dateKey) || { date: dateKey, sum92: 0, count92: 0, sum95: 0, count95: 0 };
      if (p.fuelType === "AI-92") {
        entry.sum92 += p.price;
        entry.count92 += 1;
      } else {
        entry.sum95 += p.price;
        entry.count95 += 1;
      }
      weekMap.set(dateKey, entry);
    }

    return Array.from(weekMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        "AI-92": Math.round(w.sum92 / (w.count92 || 1)),
        "AI-95": Math.round(w.sum95 / (w.count95 || 1)),
      }));
  }, []);

  const latestAvg = useMemo(() => {
    const last = chartData[chartData.length - 1];
    return { "AI-92": last?.["AI-92"] ?? 0, "AI-95": last?.["AI-95"] ?? 0 };
  }, [chartData]);

  const comparisonCards = useMemo(() => {
    return (["AI-92", "AI-95"] as const).map((fuel) => {
      const enoPrice = ENO_PRICES[fuel];
      const marketAvg = latestAvg[fuel];
      const diff = enoPrice - marketAvg;
      const isLower = diff < 0;
      return { fuel, enoPrice, marketAvg, diff, isLower };
    });
  }, [latestAvg]);

  const latestDate = useMemo(() => {
    const dates = marketPrices.map((p) => p.date);
    dates.sort();
    return dates[dates.length - 1];
  }, []);

  const regionalPrices = useMemo(() => {
    const latest = marketPrices.filter((p) => p.date === latestDate);
    const regionMap = new Map<string, { ai92: number; ai95: number }>();
    for (const p of latest) {
      const entry = regionMap.get(p.region) || { ai92: 0, ai95: 0 };
      if (p.fuelType === "AI-92") entry.ai92 = p.price;
      else entry.ai95 = p.price;
      regionMap.set(p.region, entry);
    }
    return Array.from(regionMap.entries()).map(([region, prices]) => ({
      region,
      ...prices,
    }));
  }, [latestDate]);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Рынок топлива"
          description="Средние цены на бензин по регионам Узбекистана"
        />
      </MotionItem>

      <MotionItem>
        <div className="grid gap-4 sm:grid-cols-2">
          {comparisonCards.map((card) => {
            const absDiff = Math.abs(card.diff);
            return (
              <div
                key={card.fuel}
                className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-900/[0.04] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-semibold text-stone-900">{card.fuel}</span>
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      card.isLower
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {card.isLower ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5" />
                    )}
                    {card.isLower ? "Ниже рынка" : "Выше рынка"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-stone-500">Ваша цена</p>
                    <p className="text-lg font-semibold text-stone-900">{formatCurrency(card.enoPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Среднерыночная</p>
                    <p className="text-lg font-semibold text-stone-900">{formatCurrency(card.marketAvg)}</p>
                  </div>
                </div>

                <p className={`text-sm font-medium ${card.isLower ? "text-emerald-600" : "text-rose-600"}`}>
                  Ваша цена на {formatCurrency(absDiff)} {card.isLower ? "ниже" : "выше"} рынка
                </p>
              </div>
            );
          })}
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-900/[0.04]">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-stone-900">Динамика цен за 12 недель</h2>
            <p className="text-xs text-stone-500 mt-0.5">Средние по всем регионам</p>
          </div>
          <MarketPriceChart data={chartData} />
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              AI-92
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              AI-95
            </div>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Цены по регионам</h2>
            <p className="text-xs text-stone-500 mt-0.5">Последняя неделя</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-100 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Регион</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">АИ-92</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">АИ-95</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionalPrices.map((row) => (
                <TableRow key={row.region} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                  <TableCell className="font-medium text-stone-900">{row.region}</TableCell>
                  <TableCell className="text-right tabular-nums text-stone-700">{formatCurrency(row.ai92)}</TableCell>
                  <TableCell className="text-right tabular-nums text-stone-700">{formatCurrency(row.ai95)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
