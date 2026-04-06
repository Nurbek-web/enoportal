"use client";

import { useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { reports } from "@/lib/mock/reports";
import { operators } from "@/lib/mock/operators";
import { BASE_LABELS } from "@/lib/constants";
import { useBaseFilter } from "@/contexts/base-filter-context";
import { filterByBase } from "@/lib/filter-by-base";
import type { Report } from "@/lib/types";
import { formatDateShort, formatMass, formatPercent } from "@/lib/format";

export default function ReportsPage() {
  const { selectedBase } = useBaseFilter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [baseFilter, setBaseFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const operatorMap = useMemo(
    () => new Map(operators.map((o) => [o.id, o])),
    []
  );

  const filteredReports = useMemo(() => {
    return filterByBase(reports, selectedBase).filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (baseFilter !== "all" && r.base !== baseFilter) return false;
      if (operatorFilter !== "all" && r.operatorId !== operatorFilter) return false;
      return true;
    });
  }, [selectedBase, statusFilter, baseFilter, operatorFilter]);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Отчёты операторов"
          description="Ежедневные отчёты с баз — синхронизация через Telegram"
        />
      </MotionItem>

      <MotionItem>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">На проверке</SelectItem>
              <SelectItem value="approved">Подтверждён</SelectItem>
              <SelectItem value="rejected">Отклонён</SelectItem>
            </SelectContent>
          </Select>

          <Select value={baseFilter} onValueChange={setBaseFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="База" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все базы</SelectItem>
              <SelectItem value="chirchik">Чирчик</SelectItem>
              <SelectItem value="akhangaran">Ахангаран</SelectItem>
            </SelectContent>
          </Select>

          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Оператор" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все операторы</SelectItem>
              {operators.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-100 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">№</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Оператор</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">База</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Топливо</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Уровень %</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Telegram</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report, idx) => {
                const operator = operatorMap.get(report.operatorId);
                return (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer border-b border-stone-100 hover:bg-blue-50/50 transition-colors duration-150"
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell className="font-medium text-stone-600">{idx + 1}</TableCell>
                    <TableCell className="text-stone-600">{formatDateShort(report.date)}</TableCell>
                    <TableCell className="font-medium text-stone-900">{operator?.name ?? "—"}</TableCell>
                    <TableCell className="text-stone-600">{BASE_LABELS[report.base]}</TableCell>
                    <TableCell className="text-stone-600">{report.fuelType}</TableCell>
                    <TableCell className="text-right tabular-nums text-stone-700">{report.fuelLevel}%</TableCell>
                    <TableCell><StatusBadge status={report.status} /></TableCell>
                    <TableCell>
                      {report.telegramSynced && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Telegram
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-stone-400">
                    Отчёты не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </MotionItem>

      <ReportDetailSheet
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        operatorMap={operatorMap}
      />
    </MotionContainer>
  );
}

function ReportDetailSheet({
  report,
  onClose,
  operatorMap,
}: {
  report: Report | null;
  onClose: () => void;
  operatorMap: Map<string, (typeof operators)[number]>;
}) {
  if (!report) {
    return (
      <Sheet open={false} onOpenChange={onClose}>
        <SheetContent><SheetHeader><SheetTitle /></SheetHeader></SheetContent>
      </Sheet>
    );
  }

  const operator = operatorMap.get(report.operatorId);

  return (
    <Sheet open={!!report} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Отчёт {report.id.replace("rpt-", "№")}</SheetTitle>
          <SheetDescription>
            {formatDateShort(report.date)} · <StatusBadge status={report.status} />
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex h-40 w-full items-center justify-center rounded-xl bg-stone-100">
            <div className="flex flex-col items-center gap-2 text-stone-400">
              <Camera className="h-8 w-8" />
              <span className="text-xs">Фото уровня топлива</span>
            </div>
          </div>

          <DetailSection title="Основная информация">
            <DetailRow label="Дата" value={formatDateShort(report.date)} />
            <DetailRow label="Оператор" value={operator?.name ?? "—"} />
            <DetailRow label="База" value={BASE_LABELS[report.base]} />
            <DetailRow label="Топливо" value={report.fuelType} />
          </DetailSection>

          <DetailSection title="Данные замера">
            <DetailRow
              label="Уровень топлива"
              value={
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${report.fuelLevel}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{formatPercent(report.fuelLevel)}</span>
                </div>
              }
            />
            <DetailRow label="Вес до" value={formatMass(report.weightBefore)} />
            <DetailRow label="Вес после" value={formatMass(report.weightAfter)} />
          </DetailSection>

          <DetailSection title="Транспорт">
            <DetailRow label="Номер авто" value={report.vehiclePlate} />
            <DetailRow label="Водитель" value={report.driverName} />
            <DetailRow label="Номер пломбы" value={report.sealNumber} />
          </DetailSection>

          <DetailSection title="Статус">
            <DetailRow label="Статус" value={<StatusBadge status={report.status} />} />
            <DetailRow
              label="Telegram"
              value={
                report.telegramSynced ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Синхронизировано
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">Не синхронизировано</span>
                )
              }
            />
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">{title}</h3>
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2.5">{children}</dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-900">{value}</dd>
    </>
  );
}
