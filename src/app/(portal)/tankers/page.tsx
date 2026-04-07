"use client";

import { useMemo, useState } from "react";
import { Truck, DollarSign, BarChart3, Bell, Star } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tankers, tankerPayments, tankerTrips } from "@/lib/mock/tankers";
import { deals } from "@/lib/mock/sales";
import type { Tanker } from "@/lib/types";
import { formatCurrency, formatNumber, formatVolume, formatDateShort } from "@/lib/format";

export default function TankersPage() {
  const [selectedTanker, setSelectedTanker] = useState<Tanker | null>(null);

  const tankerMap = useMemo(
    () => new Map(tankers.map((t) => [t.id, t])),
    []
  );

  const dealMap = useMemo(
    () => new Map(deals.map((d) => [d.id, d])),
    []
  );

  const paymentsForSelected = useMemo(() => {
    if (!selectedTanker) return [];
    return tankerPayments
      .filter((p) => p.tankerId === selectedTanker.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedTanker]);

  const tripsForSelected = useMemo(() => {
    if (!selectedTanker) return [];
    return tankerTrips
      .filter((t) => t.tankerId === selectedTanker.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedTanker]);

  const analytics = useMemo(() => {
    const totalTrips = tankers.reduce((sum, t) => sum + t.tripCount, 0);
    const totalPaid = tankers.reduce((sum, t) => sum + t.totalPaid, 0);
    const totalCapacity = tankers.reduce((sum, t) => sum + t.capacity * t.tripCount, 0);
    const avgCostPerTrip = totalTrips > 0 ? totalPaid / totalTrips : 0;
    const costPerLiter = totalCapacity > 0 ? totalPaid / totalCapacity : 0;
    const avgFrequency = tankers.length > 0 ? totalTrips / tankers.length : 0;
    return { avgCostPerTrip, costPerLiter, avgFrequency };
  }, []);

  // Compute which tankers have unpaid in-progress deals
  const tankerUnpaidDeals = useMemo(() => {
    const paidDealIds = new Set(tankerPayments.filter((p) => p.dealId).map((p) => p.dealId!));
    const result = new Map<string, string[]>();
    for (const deal of deals) {
      if (deal.status !== "deal_closed" && !paidDealIds.has(deal.id)) {
        const existing = result.get(deal.tankerId) ?? [];
        existing.push(deal.id);
        result.set(deal.tankerId, existing);
      }
    }
    return result;
  }, []);

  const bestTanker = useMemo(() => {
    return tankers.reduce((best, t) => (t.rating > best.rating ? t : best), tankers[0]);
  }, []);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Бензовозы"
          description="Реестр, оплаты и аналитика перевозчиков"
        />
      </MotionItem>

      <MotionItem>
        <Tabs defaultValue="registry" className="w-full">
          <TabsList>
            <TabsTrigger value="registry">Реестр</TabsTrigger>
            <TabsTrigger value="payments">Оплаты</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="registry">
            <div className="mt-4 rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-stone-100 hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Номер авто</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Водитель</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Телефон</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Вместимость</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Рейсов</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Оплачено</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Рейтинг</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Сегмент</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tankers.map((tanker) => {
                    const unpaid = tankerUnpaidDeals.get(tanker.id);
                    return (
                      <TableRow
                        key={tanker.id}
                        className="cursor-pointer border-b border-stone-100 hover:bg-blue-50/50 transition-colors duration-150"
                        onClick={() => setSelectedTanker(tanker)}
                      >
                        <TableCell className="font-medium text-stone-900">{tanker.plateNumber}</TableCell>
                        <TableCell className="text-stone-600">{tanker.driverName}</TableCell>
                        <TableCell className="text-stone-600">{tanker.driverPhone}</TableCell>
                        <TableCell className="text-right tabular-nums text-stone-700">{formatNumber(tanker.capacity)} л</TableCell>
                        <TableCell className="text-right tabular-nums text-stone-700">{tanker.tripCount}</TableCell>
                        <TableCell className="text-right tabular-nums text-stone-700">{formatCurrency(tanker.totalPaid)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < Math.round(tanker.rating) ? "fill-amber-400 text-amber-400" : "text-stone-200 fill-stone-200"}`}
                              />
                            ))}
                            <span className="ml-1 text-xs text-stone-500 tabular-nums">{tanker.rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={tanker.segment} /></TableCell>
                        <TableCell>
                          {unpaid && unpaid.length > 0 && (
                            <div className="relative flex items-center justify-center" title={`Необходимо оплатить ${unpaid.length} сделк${unpaid.length > 1 ? "и" : "у"}`}>
                              <Bell className="h-4 w-4 text-orange-500" />
                              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                                {unpaid.length}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="mt-4 rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-stone-100 hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата сделки</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата оплаты</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Бензовоз</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Сумма</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Тип</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Сделка</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tankerPayments.map((payment) => {
                    const tanker = tankerMap.get(payment.tankerId);
                    const deal = payment.dealId ? dealMap.get(payment.dealId) : null;
                    const dealDate = deal?.date ?? null;
                    const isLatePayment = dealDate
                      ? (new Date(payment.date).getTime() - new Date(dealDate).getTime()) > 7 * 24 * 60 * 60 * 1000
                      : false;
                    return (
                      <TableRow key={payment.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                        <TableCell className="tabular-nums text-stone-600">
                          {dealDate ? (
                            <span className={isLatePayment ? "text-amber-600 font-medium" : ""}>
                              {formatDateShort(dealDate)}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="tabular-nums text-stone-600">{formatDateShort(payment.date)}</TableCell>
                        <TableCell className="font-medium text-stone-900">{tanker?.plateNumber ?? "—"}</TableCell>
                        <TableCell className="text-right tabular-nums text-stone-700">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={payment.type} />
                        </TableCell>
                        <TableCell className="text-stone-600">
                          {deal ? `№ ${deal.id.replace("deal-", "")}` : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard
                  icon={<Truck className="h-5 w-5 text-blue-600" />}
                  label="Средняя стоимость рейса"
                  value={formatCurrency(Math.round(analytics.avgCostPerTrip))}
                />
                <KpiCard
                  icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
                  label="Стоимость доставки за литр"
                  value={`${analytics.costPerLiter.toFixed(1)} сум/л`}
                />
                <KpiCard
                  icon={<BarChart3 className="h-5 w-5 text-violet-600" />}
                  label="Средняя частота рейсов"
                  value={`${analytics.avgFrequency.toFixed(1)} рейсов/авто`}
                />
              </div>

              <AiInsightCard title="Оптимизация логистики">
                <div className="space-y-1.5 text-sm">
                  <p>
                    Рекомендуем бензовоз <strong>{bestTanker.plateNumber}</strong> для следующей поставки —
                    рейтинг <strong>{bestTanker.rating.toFixed(1)}/5</strong>, надёжность{" "}
                    <strong>{bestTanker.reliability}%</strong>.{" "}
                    Экономия до 12% по сравнению со средней ценой.
                  </p>
                  <p>
                    Водитель <strong>{bestTanker.driverName}</strong> показывает стабильную частоту рейсов и находится в сегменте «Лояльный».
                  </p>
                </div>
              </AiInsightCard>
            </div>
          </TabsContent>
        </Tabs>
      </MotionItem>

      <TankerDetailSheet
        tanker={selectedTanker}
        payments={paymentsForSelected}
        trips={tripsForSelected}
        dealMap={dealMap}
        onClose={() => setSelectedTanker(null)}
      />
    </MotionContainer>
  );
}

function TankerDetailSheet({
  tanker,
  payments,
  trips,
  dealMap,
  onClose,
}: {
  tanker: Tanker | null;
  payments: typeof tankerPayments;
  trips: typeof tankerTrips;
  dealMap: Map<string, (typeof deals)[number]>;
  onClose: () => void;
}) {
  if (!tanker) {
    return (
      <Sheet open={false} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle />
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const paymentsTotal = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <Sheet open={!!tanker} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{tanker.plateNumber}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <StatusBadge status={tanker.segment} />
            <span className="text-stone-500">
              {tanker.tripCount} рейсов · {formatCurrency(tanker.totalPaid)} всего
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Rating + Reliability */}
          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Рейтинг</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(tanker.rating) ? "fill-amber-400 text-amber-400" : "text-stone-200 fill-stone-200"}`}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-stone-900">{tanker.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Надёжность</span>
                <span className={`text-sm font-semibold ${tanker.reliability >= 85 ? "text-emerald-600" : tanker.reliability >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                  {tanker.reliability}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tanker.reliability >= 85 ? "bg-emerald-500" : tanker.reliability >= 70 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${tanker.reliability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Driver info */}
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
              Водитель и контакты
            </h3>
            <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5">
              <dt className="text-sm text-stone-500">Водитель</dt>
              <dd className="text-sm text-stone-900">{tanker.driverName}</dd>
              <dt className="text-sm text-stone-500">Телефон</dt>
              <dd className="text-sm tabular-nums text-stone-900">{tanker.driverPhone}</dd>
              <dt className="text-sm text-stone-500">Ёмкость</dt>
              <dd className="text-sm text-stone-900">{formatNumber(tanker.capacity)} л</dd>
            </dl>
          </div>

          {/* Tabs: Payments & Trips */}
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="payments" className="flex-1">Оплаты ({payments.length})</TabsTrigger>
              <TabsTrigger value="trips" className="flex-1">Рейсы ({trips.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="payments">
              <p className="mt-3 mb-2 text-sm text-stone-600">
                Сумма: <span className="font-semibold text-stone-900">{formatCurrency(paymentsTotal)}</span>
              </p>
              {payments.length > 0 ? (
                <div className="rounded-xl border border-stone-200/50 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">Дата сделки</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">Дата оплаты</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-stone-500">Сумма</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">Тип</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">№</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => {
                        const deal = p.dealId ? dealMap.get(p.dealId) : null;
                        const isLate = deal
                          ? (new Date(p.date).getTime() - new Date(deal.date).getTime()) > 7 * 24 * 60 * 60 * 1000
                          : false;
                        return (
                          <tr key={p.id} className="border-b border-stone-100 last:border-0">
                            <td className="px-3 py-2 tabular-nums">
                              {deal ? (
                                <span className={isLate ? "text-amber-600 font-medium" : "text-stone-600"}>
                                  {formatDateShort(deal.date)}
                                </span>
                              ) : <span className="text-stone-400">—</span>}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-stone-600">{formatDateShort(p.date)}</td>
                            <td className="px-3 py-2 text-right tabular-nums font-medium text-stone-900">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="px-3 py-2">
                              <StatusBadge status={p.type} />
                            </td>
                            <td className="px-3 py-2 text-stone-600">
                              {deal ? `№ ${deal.id.replace("deal-", "")}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-stone-400">Нет записей об оплатах</p>
              )}
            </TabsContent>

            <TabsContent value="trips">
              {trips.length > 0 ? (
                <div className="mt-3 rounded-xl border border-stone-200/50 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">Дата</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">Маршрут</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-stone-500">Объём</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((trip) => (
                        <tr key={trip.id} className="border-b border-stone-100 last:border-0">
                          <td className="px-3 py-2 tabular-nums text-stone-600">{formatDateShort(trip.date)}</td>
                          <td className="px-3 py-2 text-stone-700 text-xs">{trip.route}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-stone-700">{formatVolume(trip.volumeDelivered)}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trip.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${trip.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`} />
                              {trip.status === "completed" ? "Завершён" : "В пути"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-400">Нет записей о рейсах</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-900/[0.04]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50">
        {icon}
      </div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-stone-900">{value}</p>
    </div>
  );
}
