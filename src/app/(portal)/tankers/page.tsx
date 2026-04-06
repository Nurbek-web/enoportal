"use client";

import { useMemo, useState } from "react";
import { Truck, DollarSign, BarChart3 } from "lucide-react";
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
import { tankers, tankerPayments } from "@/lib/mock/tankers";
import { deals } from "@/lib/mock/sales";
import type { Tanker } from "@/lib/types";
import { formatCurrency, formatNumber, formatDateShort } from "@/lib/format";

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

  const analytics = useMemo(() => {
    const totalTrips = tankers.reduce((sum, t) => sum + t.tripCount, 0);
    const totalPaid = tankers.reduce((sum, t) => sum + t.totalPaid, 0);
    const totalCapacity = tankers.reduce((sum, t) => sum + t.capacity * t.tripCount, 0);
    const avgCostPerTrip = totalTrips > 0 ? totalPaid / totalTrips : 0;
    const costPerLiter = totalCapacity > 0 ? totalPaid / totalCapacity : 0;
    const avgFrequency = tankers.length > 0 ? totalTrips / tankers.length : 0;
    return { avgCostPerTrip, costPerLiter, avgFrequency };
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
            <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white shadow-sm shadow-slate-950/[0.03]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Номер авто</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Водитель</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Телефон</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500 text-right">Вместимость</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500 text-right">Рейсов</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500 text-right">Оплачено</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Сегмент</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tankers.map((tanker) => (
                    <TableRow
                      key={tanker.id}
                      className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50"
                      onClick={() => setSelectedTanker(tanker)}
                    >
                      <TableCell className="font-medium text-slate-900">{tanker.plateNumber}</TableCell>
                      <TableCell className="text-slate-600">{tanker.driverName}</TableCell>
                      <TableCell className="text-slate-600">{tanker.driverPhone}</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">{formatNumber(tanker.capacity)} л</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">{tanker.tripCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">{formatCurrency(tanker.totalPaid)}</TableCell>
                      <TableCell><StatusBadge status={tanker.segment} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white shadow-sm shadow-slate-950/[0.03]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Дата</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Бензовоз</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500 text-right">Сумма</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Тип</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Привязка к сделке</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tankerPayments.map((payment) => {
                    const tanker = tankerMap.get(payment.tankerId);
                    const deal = payment.dealId ? dealMap.get(payment.dealId) : null;
                    return (
                      <TableRow key={payment.id} className="border-b border-slate-100">
                        <TableCell className="text-slate-600">{formatDateShort(payment.date)}</TableCell>
                        <TableCell className="font-medium text-slate-900">{tanker?.plateNumber ?? "—"}</TableCell>
                        <TableCell className="text-right tabular-nums text-slate-700">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                              payment.type === "cash"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {payment.type === "cash" ? "Наличные" : "Банк"}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {deal ? `Сделка ${deal.id.replace("deal-", "№")}` : "—"}
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
                Для следующей поставки рекомендуем бензовоз 01 A 234 BA — экономия до 12% по сравнению со средней ценой.
                Водитель Хуршид Ботиров показывает стабильную частоту рейсов и находится в сегменте «Лояльный».
              </AiInsightCard>
            </div>
          </TabsContent>
        </Tabs>
      </MotionItem>

      <TankerDetailSheet
        tanker={selectedTanker}
        payments={paymentsForSelected}
        dealMap={dealMap}
        onClose={() => setSelectedTanker(null)}
      />
    </MotionContainer>
  );
}

function TankerDetailSheet({
  tanker,
  payments,
  dealMap,
  onClose,
}: {
  tanker: Tanker | null;
  payments: typeof tankerPayments;
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
            <span className="text-slate-500">
              {tanker.tripCount} рейсов · {formatCurrency(tanker.totalPaid)} всего
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Водитель и контакты
            </h3>
            <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5">
              <dt className="text-sm text-slate-500">Водитель</dt>
              <dd className="text-sm text-slate-900">{tanker.driverName}</dd>
              <dt className="text-sm text-slate-500">Телефон</dt>
              <dd className="text-sm tabular-nums text-slate-900">{tanker.driverPhone}</dd>
              <dt className="text-sm text-slate-500">Ёмкость</dt>
              <dd className="text-sm text-slate-900">{formatNumber(tanker.capacity)} л</dd>
            </dl>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Оплаты ({payments.length})
            </h3>
            <p className="mb-2 text-sm text-slate-600">
              Сумма по списку: <span className="font-semibold text-slate-900">{formatCurrency(paymentsTotal)}</span>
            </p>
            {payments.length > 0 ? (
              <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Дата</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Сумма</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Тип</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Сделка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const deal = p.dealId ? dealMap.get(p.dealId) : null;
                      return (
                        <tr key={p.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2 tabular-nums text-slate-600">{formatDateShort(p.date)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-900">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                p.type === "cash"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {p.type === "cash" ? "Наличные" : "Банк"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {deal ? `№ ${deal.id.replace("deal-", "")}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Нет записей об оплатах</p>
            )}
          </div>
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
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
