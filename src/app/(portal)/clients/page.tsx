"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, Star } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { FilterBar } from "@/components/shared/filter-bar";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { clients } from "@/lib/mock/clients";
import { deals } from "@/lib/mock/sales";
import type { Client, ClientSegment, Deal } from "@/lib/types";
import { useBaseFilter } from "@/contexts/base-filter-context";
import {
  formatVolume,
  formatCurrency,
  formatDateShort,
} from "@/lib/format";

const ClientVolumeChart = dynamic(
  () => import("@/components/charts/client-volume-chart"),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-xl bg-stone-100" />,
  }
);

export default function ClientsPage() {
  const { selectedBase } = useBaseFilter();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | ClientSegment>("all");

  const filteredClients = useMemo(() => {
    const baseClients =
      selectedBase === "all"
        ? clients
        : clients.filter((c) =>
            deals.some((d) => d.clientId === c.id && d.base === selectedBase)
          );
    const q = searchQuery.trim().toLowerCase();
    return baseClients.filter((c) => {
      if (segmentFilter !== "all" && c.segment !== segmentFilter) return false;
      if (!q) return true;
      const hay = `${c.companyName} ${c.contactPerson} ${c.phone}`.toLowerCase();
      return hay.includes(q);
    });
  }, [selectedBase, searchQuery, segmentFilter]);

  const UNPAID_STATUSES = new Set(["client_request", "terms_negotiation", "awaiting_payment"]);

  const clientDebtMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of deals) {
      if (!UNPAID_STATUSES.has(d.status)) continue;
      map.set(d.clientId, (map.get(d.clientId) || 0) + d.totalAmount);
    }
    return map;
  }, []);

  const stats = useMemo(() => {
    const list = filteredClients;
    const totalClients = list.length;
    const vipClients = list.filter((c) => c.segment === "vip").length;
    const totalVolume = list.reduce((sum, c) => sum + c.totalVolume, 0);
    const avgDeals =
      list.length > 0
        ? Math.round(
            list.reduce((sum, c) => sum + c.dealCount, 0) / list.length
          )
        : 0;
    const withFreq = list.filter((c) => c.purchaseFrequencyDays);
    const avgFrequency =
      withFreq.length > 0
        ? Math.round(withFreq.reduce((sum, c) => sum + (c.purchaseFrequencyDays ?? 0), 0) / withFreq.length)
        : 0;
    return { totalClients, vipClients, totalVolume, avgDeals, avgFrequency };
  }, [filteredClients]);

  const clientDeals = useMemo(() => {
    if (!selectedClient) return [];
    return deals
      .filter((d) => d.clientId === selectedClient.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedClient]);

  const chartData = useMemo(() => {
    return clientDeals.map((d) => ({
      date: formatDateShort(d.date),
      volume: d.volume,
    }));
  }, [clientDeals]);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Клиенты"
          description="Аналитика клиентской базы и сегментация"
        />
      </MotionItem>

      <MotionItem>
        <FilterBar>
          <Select
            value={segmentFilter}
            onValueChange={(v) => setSegmentFilter(v as "all" | ClientSegment)}
          >
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Сегмент" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все сегменты</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="promising">Перспективный</SelectItem>
              <SelectItem value="novice">Новый</SelectItem>
              <SelectItem value="declining">Падающий</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Поиск: компания, контакт, телефон..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white pl-9"
            />
          </div>
        </FilterBar>
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MiniKpiCard label="Всего клиентов" value={String(stats.totalClients)} />
          <MiniKpiCard label="VIP клиенты" value={String(stats.vipClients)} />
          <MiniKpiCard label="Общий объём" value={formatVolume(stats.totalVolume)} />
          <MiniKpiCard label="Ср. частота закупок" value={stats.avgFrequency > 0 ? `раз в ${stats.avgFrequency} дн.` : "—"} />
        </div>
      </MotionItem>

      <MotionItem>
        <div className="overflow-x-auto rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-100 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Компания
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Контакт
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Телефон
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                  Объём
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                  Сделок
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">
                  Долг
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Сегмент
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer border-b border-stone-100 hover:bg-blue-50/50 transition-colors duration-150"
                  onClick={() => setSelectedClient(client)}
                >
                  <TableCell className="font-medium text-stone-900">
                    {client.companyName}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {client.contactPerson}
                  </TableCell>
                  <TableCell className="text-stone-600 tabular-nums">
                    {client.phone}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-stone-700">
                    {formatVolume(client.totalVolume)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-stone-700">
                    {client.dealCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {clientDebtMap.get(client.id) ? (
                      <span className="font-medium text-rose-600">{formatCurrency(clientDebtMap.get(client.id)!)}</span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={client.segment} />
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-stone-400">
                    Клиенты не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </MotionItem>

      <MotionItem>
        <AiInsightCard title="Сегментация клиентской базы">
          {stats.vipClients > 0 && (
            <>
              <strong>{stats.vipClients} VIP-клиент{stats.vipClients > 1 ? "а" : ""}</strong> обеспечивают основной объём продаж — приоритет для персонального менеджера.{" "}
            </>
          )}
          {filteredClients.filter((c) => c.segment === "declining").length > 0 && (
            <>
              Обнаружено <strong>{filteredClients.filter((c) => c.segment === "declining").length} клиент{filteredClients.filter((c) => c.segment === "declining").length > 1 ? "а" : ""}</strong> с падающим потреблением — рекомендуем звонок или скидку для удержания.{" "}
            </>
          )}
          Средний показатель: <strong>{stats.avgDeals} сделок</strong> на клиента.
        </AiInsightCard>
      </MotionItem>

      <ClientDetailSheet
        client={selectedClient}
        clientDeals={clientDeals}
        chartData={chartData}
        onClose={() => setSelectedClient(null)}
      />
    </MotionContainer>
  );
}


function ClientDetailSheet({
  client,
  clientDeals,
  chartData,
  onClose,
}: {
  client: Client | null;
  clientDeals: Deal[];
  chartData: Array<{ date: string; volume: number }>;
  onClose: () => void;
}) {
  if (!client) {
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

  return (
    <Sheet open={!!client} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{client.companyName}</SheetTitle>
          <SheetDescription>
            <StatusBadge status={client.segment} />
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
              Информация
            </h3>
            <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5">
              <dt className="text-sm text-stone-500">Компания</dt>
              <dd className="text-sm text-stone-900">{client.companyName}</dd>
              <dt className="text-sm text-stone-500">Контакт</dt>
              <dd className="text-sm text-stone-900">{client.contactPerson}</dd>
              <dt className="text-sm text-stone-500">Телефон</dt>
              <dd className="text-sm text-stone-900">{client.phone}</dd>
              <dt className="text-sm text-stone-500">Сегмент</dt>
              <dd className="text-sm">
                <StatusBadge status={client.segment} />
              </dd>
              {client.purchaseFrequencyDays && (
                <>
                  <dt className="text-sm text-stone-500">Частота закупок</dt>
                  <dd className="text-sm text-stone-900">Каждые {client.purchaseFrequencyDays} дней</dd>
                </>
              )}
              {client.rating && (
                <>
                  <dt className="text-sm text-stone-500">Рейтинг</dt>
                  <dd className="text-sm">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.round(client.rating!) ? "fill-amber-400 text-amber-400" : "text-stone-200 fill-stone-200"}`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-stone-500">{client.rating.toFixed(1)}</span>
                    </div>
                  </dd>
                </>
              )}
            </dl>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
              История закупок ({clientDeals.length})
            </h3>
            {clientDeals.length > 0 ? (
              <div className="rounded-xl border border-stone-200/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">
                        Дата
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-stone-500">
                        Объём
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-stone-500">
                        Сумма
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientDeals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="border-b border-stone-100 last:border-0"
                      >
                        <td className="px-3 py-2 text-stone-600">
                          {formatDateShort(deal.date)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-700">
                          {formatVolume(deal.volume)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-700">
                          {formatCurrency(deal.totalAmount)}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={deal.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-stone-400">Нет сделок</p>
            )}
          </div>

          {chartData.length > 1 && (
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
                Динамика объёмов
              </h3>
              <div className="h-48 min-h-[192px] w-full min-w-0 rounded-xl border border-stone-200/50 bg-stone-50/30 p-3">
                <ClientVolumeChart data={chartData} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
