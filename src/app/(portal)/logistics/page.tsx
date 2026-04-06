"use client";

import { useMemo } from "react";
import { Plane, Train, Bus, Star, Clock, Banknote } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { operators } from "@/lib/mock/operators";
import {
  upcomingTrips,
  transportComparisonCards,
  type TransportIconKey,
} from "@/lib/mock/logistics";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateShort } from "@/lib/format";

const iconMap: Record<TransportIconKey, typeof Plane> = {
  plane: Plane,
  train: Train,
  bus: Bus,
};

export default function LogisticsPage() {
  const operatorMap = useMemo(
    () => new Map(operators.map((o) => [o.id, o])),
    []
  );

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Логистика и билеты"
          description="Планирование поездок операторов: Алматы ↔ Ташкент"
        />
      </MotionItem>

      <MotionItem>
        <AiInsightCard title="Оптимальное время покупки">
          Рекомендуем покупать билеты за 3 дня до вылета — экономия до 18% по
          данным за последние 6 месяцев.
        </AiInsightCard>
      </MotionItem>

      <MotionItem>
        <div className="grid gap-4 sm:grid-cols-3">
          {transportComparisonCards.map((t) => {
            const Icon = iconMap[t.icon];
            return (
              <div
                key={t.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm shadow-stone-900/[0.04] ${t.cardClass}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.iconBg}`}>
                    <Icon className={`h-5 w-5 ${t.iconColor}`} />
                  </div>
                  <span className="text-base font-semibold text-stone-900">{t.type}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Banknote className="h-4 w-4 text-stone-400" />
                    <span className="font-medium text-stone-900">{t.priceRange}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Clock className="h-4 w-4 text-stone-400" />
                    <span>{t.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="text-stone-400 text-xs">Комфорт</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < t.comfort
                              ? "fill-amber-400 text-amber-400"
                              : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Ближайшие поездки</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Оператор</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Направление</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата выезда</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Транспорт</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingTrips.map((trip) => {
                  const op = operatorMap.get(trip.operatorId);
                  return (
                    <TableRow key={trip.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                      <TableCell className="font-medium text-stone-900">{op?.name ?? "—"}</TableCell>
                      <TableCell className="text-stone-600">{trip.direction}</TableCell>
                      <TableCell className="tabular-nums text-stone-600">{formatDateShort(trip.date)}</TableCell>
                      <TableCell className="text-stone-600">{trip.transport}</TableCell>
                      <TableCell>
                        <StatusBadge status={trip.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
