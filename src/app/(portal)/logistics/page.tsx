"use client";

import { useMemo, useState } from "react";
import { Plane, Train, Bus, Star, Clock, Banknote, Plus, CalendarClock } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { MiniKpiCard } from "@/components/shared/mini-kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { operators } from "@/lib/mock/operators";
import {
  upcomingTrips,
  transportComparisonCards,
  type Trip,
  type TransportIconKey,
} from "@/lib/mock/logistics";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateShort, formatCurrency } from "@/lib/format";
import { SHIFT_DAYS_ON, SHIFT_DAYS_HANDOVER, SHIFT_CYCLE_LENGTH } from "@/lib/constants";

function getNextShiftStart(shiftStartDate: string): Date {
  const today = new Date();
  const shiftStart = new Date(shiftStartDate);
  const daysSinceStart = Math.floor(
    (today.getTime() - shiftStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay =
    ((daysSinceStart % SHIFT_CYCLE_LENGTH) + SHIFT_CYCLE_LENGTH) % SHIFT_CYCLE_LENGTH;
  const daysUntilNextOn =
    cycleDay < SHIFT_DAYS_ON
      ? 0
      : SHIFT_CYCLE_LENGTH - cycleDay;
  const next = new Date(today);
  next.setDate(next.getDate() + daysUntilNextOn);
  return next;
}

function getShiftEndDate(shiftStartDate: string): Date {
  const nextStart = getNextShiftStart(shiftStartDate);
  const end = new Date(nextStart);
  end.setDate(end.getDate() + SHIFT_DAYS_ON);
  return end;
}

const iconMap: Record<TransportIconKey, typeof Plane> = {
  plane: Plane,
  train: Train,
  bus: Bus,
};

const TRANSPORT_PRICES: Record<string, number> = {
  Авиа: 450000,
  "Ж/Д": 180000,
  Автобус: 95000,
};

const EARLY_DISCOUNT = 0.18;
const EARLY_DAYS_THRESHOLD = 3;

export default function LogisticsPage() {
  const [trips, setTrips] = useState<Trip[]>(upcomingTrips);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formOperator, setFormOperator] = useState("");
  const [formDirection, setFormDirection] = useState("");
  const [formTransport, setFormTransport] = useState("");
  const [formDate, setFormDate] = useState("");

  const operatorMap = useMemo(
    () => new Map(operators.map((o) => [o.id, o])),
    []
  );

  const totalCost = useMemo(
    () => trips.reduce((sum, t) => sum + t.price, 0),
    [trips]
  );

  const avgCost = useMemo(
    () => (trips.length > 0 ? Math.round(totalCost / trips.length) : 0),
    [totalCost, trips.length]
  );

  const isEarlyBooking = useMemo(() => {
    if (!formDate) return false;
    const diff =
      (new Date(formDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= EARLY_DAYS_THRESHOLD;
  }, [formDate]);

  const previewPrice = useMemo(() => {
    const base = TRANSPORT_PRICES[formTransport] ?? 0;
    return isEarlyBooking ? Math.round(base * (1 - EARLY_DISCOUNT)) : base;
  }, [formTransport, isEarlyBooking]);

  const canSubmit =
    formOperator !== "" &&
    formDirection !== "" &&
    formTransport !== "" &&
    formDate !== "";

  function handleSubmit() {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      operatorId: formOperator,
      direction: formDirection,
      transport: formTransport,
      date: formDate,
      price: previewPrice,
      status: "planned",
    };
    setTrips((prev) => [newTrip, ...prev]);
    setDialogOpen(false);
    setFormOperator("");
    setFormDirection("");
    setFormTransport("");
    setFormDate("");
  }

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Логистика и билеты"
          description="Планирование поездок операторов: Алматы ↔ Ташкент"
        >
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Запланировать
          </Button>
        </PageHeader>
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MiniKpiCard
            label="Поездок в апреле"
            value={String(trips.length)}
          />
          <MiniKpiCard
            label="Общая стоимость"
            value={formatCurrency(totalCost)}
          />
          <MiniKpiCard
            label="Средняя стоимость"
            value={formatCurrency(avgCost)}
          />
        </div>
      </MotionItem>

      <MotionItem>
        <AiInsightCard title="Оптимальное время покупки">
          Покупка билетов за 3+ дня до вылета экономит в среднем{" "}
          <strong>81 000 сум на авиабилете (−18%)</strong> по данным за
          последние 6 месяцев. Следующая смена: 10–14 апреля.
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
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${t.iconColor}`} />
                  </div>
                  <span className="text-base font-semibold text-stone-900">
                    {t.type}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Banknote className="h-4 w-4 text-stone-400" />
                    <span className="font-medium text-stone-900">
                      {t.priceRange}
                    </span>
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
            <h2 className="text-sm font-semibold text-stone-900">
              Ближайшие поездки
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Оператор
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Направление
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Дата выезда
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Транспорт
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                    Стоимость
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Статус
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => {
                  const op = operatorMap.get(trip.operatorId);
                  return (
                    <TableRow
                      key={trip.id}
                      className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150"
                    >
                      <TableCell className="font-medium text-stone-900">
                        {op?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {trip.direction}
                      </TableCell>
                      <TableCell className="tabular-nums text-stone-600">
                        {formatDateShort(trip.date)}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {trip.transport}
                      </TableCell>
                      <TableCell className="tabular-nums text-right text-stone-700">
                        {formatCurrency(trip.price)}
                      </TableCell>
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

      {/* Book Trip Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Запланировать поездку</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Оператор
              </label>
              <Select value={formOperator} onValueChange={setFormOperator}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Выберите оператора" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formOperator && (() => {
              const op = operators.find((o) => o.id === formOperator);
              if (!op) return null;
              const shiftEnd = getShiftEndDate(op.shiftStartDate);
              return (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
                  <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    Вахта заканчивается {formatDateShort(shiftEnd.toISOString())} — рекомендуемая дата выезда
                  </span>
                </div>
              );
            })()}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Направление
              </label>
              <Select value={formDirection} onValueChange={setFormDirection}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Алматы → Ташкент">
                    Алматы → Ташкент
                  </SelectItem>
                  <SelectItem value="Ташкент → Алматы">
                    Ташкент → Алматы
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Транспорт
              </label>
              <Select value={formTransport} onValueChange={setFormTransport}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Тип транспорта" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Авиа">Авиа</SelectItem>
                  <SelectItem value="Ж/Д">Ж/Д</SelectItem>
                  <SelectItem value="Автобус">Автобус</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Дата выезда
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formTransport && formDate && (
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 flex items-center justify-between">
                <span className="text-sm text-stone-600">
                  Расчётная стоимость
                </span>
                <div className="flex items-center gap-2">
                  {isEarlyBooking && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      −18% ранняя покупка
                    </span>
                  )}
                  <span className="text-sm font-semibold text-stone-900">
                    {formatCurrency(previewPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
              onClick={handleSubmit}
            >
              Добавить поездку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionContainer>
  );
}
