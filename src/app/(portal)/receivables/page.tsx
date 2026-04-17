"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Search,
} from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { MiniKpiCard } from "@/components/shared/mini-kpi-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { Input } from "@/components/ui/input";
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
import { clients } from "@/lib/mock/clients";
import { formatCurrency, formatDateShort } from "@/lib/format";

const REFERENCE_DATE = new Date("2026-04-07T00:00:00.000Z");

const UNPAID_STATUSES = new Set([
  "client_request",
  "terms_negotiation",
  "awaiting_payment",
]);

type DebtFilter = "all" | "overdue" | "critical";

interface ClientDebt {
  clientId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  totalDebt: number;
  dealCount: number;
  earliestDueDate: string;
  daysOverdue: number;
  debtStatus: "normal_debt" | "overdue" | "critical_debt";
}

export default function ReceivablesPage() {
  const [filter, setFilter] = useState<DebtFilter>("all");
  const [search, setSearch] = useState("");

  const clientDebts = useMemo(() => {
    const unpaidDeals = deals.filter((d) => UNPAID_STATUSES.has(d.status));
    const debtMap = new Map<
      string,
      { totalDebt: number; dealCount: number; earliestDueDate: string }
    >();

    for (const deal of unpaidDeals) {
      const prev = debtMap.get(deal.clientId) || {
        totalDebt: 0,
        dealCount: 0,
        earliestDueDate: deal.paymentDueDate,
      };
      prev.totalDebt += deal.totalAmount;
      prev.dealCount += 1;
      if (deal.paymentDueDate < prev.earliestDueDate) {
        prev.earliestDueDate = deal.paymentDueDate;
      }
      debtMap.set(deal.clientId, prev);
    }

    const result: ClientDebt[] = [];
    for (const [clientId, data] of Array.from(debtMap.entries())) {
      const client = clients.find((c) => c.id === clientId);
      if (!client) continue;

      const dueDate = new Date(data.earliestDueDate);
      const diffMs = REFERENCE_DATE.getTime() - dueDate.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      let debtStatus: ClientDebt["debtStatus"] = "normal_debt";
      if (daysOverdue > 30) debtStatus = "critical_debt";
      else if (daysOverdue > 0) debtStatus = "overdue";

      result.push({
        clientId,
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        phone: client.phone,
        totalDebt: data.totalDebt,
        dealCount: data.dealCount,
        earliestDueDate: data.earliestDueDate,
        daysOverdue,
        debtStatus,
      });
    }

    return result.sort((a, b) => b.daysOverdue - a.daysOverdue || b.totalDebt - a.totalDebt);
  }, []);

  const filtered = useMemo(() => {
    let result = clientDebts;
    if (filter === "overdue") result = result.filter((d) => d.daysOverdue > 0);
    if (filter === "critical") result = result.filter((d) => d.daysOverdue > 30);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.companyName.toLowerCase().includes(q) ||
          d.contactPerson.toLowerCase().includes(q)
      );
    }
    return result;
  }, [clientDebts, filter, search]);

  const totalDebt = clientDebts.reduce((s, d) => s + d.totalDebt, 0);
  const overdueDebt = clientDebts
    .filter((d) => d.daysOverdue > 0)
    .reduce((s, d) => s + d.totalDebt, 0);
  const debtorCount = clientDebts.length;
  const avgDaysOverdue =
    clientDebts.length > 0
      ? Math.round(
          clientDebts.reduce((s, d) => s + d.daysOverdue, 0) / clientDebts.length
        )
      : 0;

  const topDebtor = clientDebts[0];
  const overdueCount = clientDebts.filter((d) => d.daysOverdue > 0).length;
  const criticalCount = clientDebts.filter((d) => d.daysOverdue > 30).length;

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Дебиторская задолженность"
          description="Контроль долгов и сроков оплаты"
        />
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniKpiCard label="Общая дебиторка" value={formatCurrency(totalDebt)} />
          <MiniKpiCard label="Просроченная" value={formatCurrency(overdueDebt)} />
          <MiniKpiCard label="Должников" value={String(debtorCount)} />
          <MiniKpiCard label="Ср. дней просрочки" value={`${avgDaysOverdue} дн.`} />
        </div>
      </MotionItem>

      <MotionItem>
        <FilterBar>
          <Select value={filter} onValueChange={(v) => setFilter(v as DebtFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="overdue">Просроченные</SelectItem>
              <SelectItem value="critical">Критичные (&gt;30 дн.)</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Поиск по клиенту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </FilterBar>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-200 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Клиент</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Контакт</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Долг</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Сделок</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Срок оплаты</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Просрочка</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.clientId}
                  className={`border-b border-stone-100 transition-colors duration-150 ${
                    row.debtStatus === "critical_debt"
                      ? "bg-rose-50/30 hover:bg-rose-50/50"
                      : row.debtStatus === "overdue"
                      ? "bg-amber-50/30 hover:bg-amber-50/50"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <TableCell className="text-sm font-medium text-stone-800">{row.companyName}</TableCell>
                  <TableCell className="text-sm text-stone-600">{row.contactPerson}</TableCell>
                  <TableCell className="text-sm tabular-nums font-medium text-stone-800 text-right">
                    {formatCurrency(row.totalDebt)}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-stone-600">{row.dealCount}</TableCell>
                  <TableCell className="text-sm text-stone-600">{formatDateShort(row.earliestDueDate)}</TableCell>
                  <TableCell>
                    {row.daysOverdue > 0 ? (
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          row.daysOverdue > 30 ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        {row.daysOverdue} дн.
                      </span>
                    ) : (
                      <span className="text-sm text-stone-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.debtStatus} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-stone-400 py-8">
                    Нет задолженностей
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </MotionItem>

      <MotionItem>
        <AiInsightCard title="ИИ-анализ дебиторки">
          <div className="space-y-2 text-sm">
            {overdueCount > 0 ? (
              <p className="text-amber-700 font-medium">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                {overdueCount} клиент(ов) с просроченной оплатой на общую сумму{" "}
                <strong>{formatCurrency(overdueDebt)}</strong>.
              </p>
            ) : (
              <p className="text-emerald-700 font-medium">
                Все платежи в срок. Просроченных задолженностей нет.
              </p>
            )}
            {topDebtor && (
              <p>
                Крупнейший должник: <strong>{topDebtor.companyName}</strong> —{" "}
                {formatCurrency(topDebtor.totalDebt)}.
                {topDebtor.daysOverdue > 0 &&
                  ` Просрочка ${topDebtor.daysOverdue} дн. Рекомендуем связаться с ${topDebtor.contactPerson}.`}
              </p>
            )}
            {criticalCount > 0 && (
              <p className="text-rose-600 font-medium">
                {criticalCount} клиент(ов) с критичной просрочкой (&gt;30 дней).
                Необходимы срочные меры по взысканию.
              </p>
            )}
          </div>
        </AiInsightCard>
      </MotionItem>
    </MotionContainer>
  );
}
