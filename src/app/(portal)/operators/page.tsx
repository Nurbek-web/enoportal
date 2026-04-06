"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  SHIFT_DAYS_ON,
  SHIFT_DAYS_HANDOVER,
  SHIFT_CYCLE_LENGTH,
  BASE_LABELS,
} from "@/lib/constants";
import { formatDateShort } from "@/lib/format";
import { operators } from "@/lib/mock/operators";
import type { Operator, Base } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useBaseFilter } from "@/contexts/base-filter-context";
import { filterByBase } from "@/lib/filter-by-base";

type ShiftStatus = "on_shift" | "handover" | "off_shift";

function getShiftStatus(shiftStartDate: string, referenceDate: Date): ShiftStatus {
  const shiftStart = new Date(shiftStartDate);
  const daysSinceStart = Math.floor(
    (referenceDate.getTime() - shiftStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay =
    ((daysSinceStart % SHIFT_CYCLE_LENGTH) + SHIFT_CYCLE_LENGTH) % SHIFT_CYCLE_LENGTH;

  if (cycleDay < SHIFT_DAYS_ON) return "on_shift";
  if (cycleDay < SHIFT_DAYS_ON + SHIFT_DAYS_HANDOVER) return "handover";
  return "off_shift";
}

function getNextShiftChangeDate(shiftStartDate: string, today: Date): Date {
  const shiftStart = new Date(shiftStartDate);
  const daysSinceStart = Math.floor(
    (today.getTime() - shiftStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay =
    ((daysSinceStart % SHIFT_CYCLE_LENGTH) + SHIFT_CYCLE_LENGTH) % SHIFT_CYCLE_LENGTH;

  let daysUntilChange: number;
  if (cycleDay < SHIFT_DAYS_ON) {
    daysUntilChange = SHIFT_DAYS_ON - cycleDay;
  } else if (cycleDay < SHIFT_DAYS_ON + SHIFT_DAYS_HANDOVER) {
    daysUntilChange = SHIFT_DAYS_ON + SHIFT_DAYS_HANDOVER - cycleDay;
  } else {
    daysUntilChange = SHIFT_CYCLE_LENGTH - cycleDay;
  }

  const next = new Date(today);
  next.setDate(next.getDate() + daysUntilChange);
  return next;
}

const SHIFT_CELL_COLORS: Record<ShiftStatus, string> = {
  on_shift: "bg-emerald-500",
  handover: "bg-amber-500",
  off_shift: "bg-stone-200",
};

export default function OperatorsPage() {
  const { selectedBase } = useBaseFilter();
  const [baseFilter, setBaseFilter] = useState<"all" | Base>("all");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = useMemo(() => new Date(), []);

  const filteredOperators = useMemo(() => {
    const byGlobal = filterByBase(operators, selectedBase);
    return baseFilter === "all"
      ? byGlobal
      : byGlobal.filter((op) => op.base === baseFilter);
  }, [selectedBase, baseFilter]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [today]);

  const todayDayOfMonth = today.getDate();

  function handleRowClick(operator: Operator) {
    setSelectedOperator(operator);
    setSheetOpen(true);
  }

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Операторы и вахты"
          description="Управление персоналом и графиком вахт"
        />
      </MotionItem>

      <MotionItem>
        <Tabs
          value={baseFilter}
          onValueChange={(v) => setBaseFilter(v as "all" | Base)}
        >
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="chirchik">Чирчик</TabsTrigger>
            <TabsTrigger value="akhangaran">Ахангаран</TabsTrigger>
          </TabsList>
        </Tabs>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-200 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Имя</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Телефон</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">База</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Telegram ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperators.map((op) => {
                const status = getShiftStatus(op.shiftStartDate, today);
                return (
                  <TableRow
                    key={op.id}
                    className="border-b border-stone-100 hover:bg-blue-50/50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleRowClick(op)}
                  >
                    <TableCell className="font-medium text-stone-900">{op.name}</TableCell>
                    <TableCell className="tabular-nums text-stone-600">{op.phone}</TableCell>
                    <TableCell className="text-stone-600">{BASE_LABELS[op.base]}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell className="text-stone-500">{op.telegramId}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            График вахт — {format(today, "LLLL yyyy", { locale: ru })}
          </h2>

          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex items-end gap-0 mb-1">
                <div className="w-36 shrink-0" />
                {calendarDays.map((day) => {
                  const dayNum = day.getDate();
                  const isToday = dayNum === todayDayOfMonth;
                  return (
                    <div
                      key={dayNum}
                      className={cn(
                        "w-7 text-center text-[10px] font-medium text-stone-400",
                        isToday && "text-stone-900 font-semibold"
                      )}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>

              {filteredOperators.map((op) => (
                <div key={op.id} className="flex items-center gap-0 mb-0.5">
                  <div className="w-36 shrink-0 text-xs text-stone-600 truncate pr-2">
                    {op.name}
                  </div>
                  {calendarDays.map((day) => {
                    const dayNum = day.getDate();
                    const isToday = dayNum === todayDayOfMonth;
                    const status = getShiftStatus(op.shiftStartDate, day);
                    return (
                      <div
                        key={dayNum}
                        className={cn(
                          "w-7 h-7 rounded-md flex-shrink-0",
                          SHIFT_CELL_COLORS[status],
                          isToday && "ring-2 ring-stone-900 ring-offset-1"
                        )}
                      />
                    );
                  })}
                </div>
              ))}

              <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span>На вахте</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span>Пересменка</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-stone-200" />
                  <span>Выходной</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionItem>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedOperator?.name}</SheetTitle>
            <SheetDescription>Детали оператора</SheetDescription>
          </SheetHeader>

          {selectedOperator && (
            <div className="mt-6 space-y-4">
              <DetailRow label="Телефон" value={selectedOperator.phone} />
              <DetailRow
                label="База"
                value={BASE_LABELS[selectedOperator.base]}
              />
              <DetailRow
                label="Telegram ID"
                value={selectedOperator.telegramId}
              />
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-sm text-stone-500">Статус</span>
                <StatusBadge
                  status={getShiftStatus(selectedOperator.shiftStartDate, today)}
                />
              </div>
              <DetailRow
                label="Начало цикла вахты"
                value={formatDateShort(selectedOperator.shiftStartDate)}
              />
              <DetailRow
                label="Следующая смена статуса"
                value={formatDateShort(
                  getNextShiftChangeDate(
                    selectedOperator.shiftStartDate,
                    today
                  ).toISOString()
                )}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MotionContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-stone-100">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-medium text-stone-900">{value}</span>
    </div>
  );
}
