"use client";

import { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { MiniKpiCard } from "@/components/shared/mini-kpi-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { operations as initialOperations } from "@/lib/mock/operations";
import { tankers } from "@/lib/mock/tankers";
import { useRole } from "@/contexts/role-context";
import { computeFuelStatus } from "@/lib/compute-fuel-status";
import { formatVolume, formatDateShort, formatNumber } from "@/lib/format";
import { BASE_LABELS, BASE_FUEL_MAP, BASES } from "@/lib/constants";
import { useBaseFilter } from "@/contexts/base-filter-context";
import { filterByBase } from "@/lib/filter-by-base";
import type { Operation, OperationStatus, Base, FuelType } from "@/lib/types";

const REFERENCE_DATE = new Date("2026-04-07T00:00:00.000Z");

type StatusFilter = "all" | OperationStatus;

function buildInitialForm() {
  return {
    date: "2026-04-07",
    base: "chirchik" as Base,
    fuelType: "AI-95" as FuelType,
    volume: "",
    tankerId: "",
    driverName: "",
    comment: "",
    photoUrl: "",
  };
}

export default function OperationsPage() {
  const { selectedBase } = useBaseFilter();
  const { role } = useRole();
  const [ops, setOps] = useState<Operation[]>(initialOperations);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [newOpOpen, setNewOpOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm);

  const filtered = useMemo(() => {
    let result = filterByBase(ops, selectedBase);
    if (statusFilter !== "all") result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.driverName.toLowerCase().includes(q) ||
          o.comment.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ops, selectedBase, statusFilter, search]);

  const totalOps = filtered.length;
  const verifiedCount = filtered.filter((o) => o.status === "verified").length;
  const errorCount = filtered.filter((o) => o.status === "error").length;
  const todayVolume = filtered
    .filter((o) => {
      const d = new Date(o.date);
      return (
        d.getFullYear() === REFERENCE_DATE.getFullYear() &&
        d.getMonth() === REFERENCE_DATE.getMonth() &&
        d.getDate() === REFERENCE_DATE.getDate()
      );
    })
    .reduce((s, o) => s + o.volume, 0);

  function handleSubmit() {
    const vol = parseFloat(form.volume);
    if (!vol || !form.tankerId || !form.driverName.trim()) return;

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      date: new Date(form.date).toISOString(),
      base: form.base,
      fuelType: form.fuelType,
      volume: vol,
      tankerId: form.tankerId,
      driverName: form.driverName,
      comment: form.comment,
      photoUrl: form.photoUrl || undefined,
      status: "new",
    };
    setOps((prev) => [newOp, ...prev]);
    setNewOpOpen(false);
    setForm(buildInitialForm());
  }

  function handleStatusChange(opId: string, newStatus: OperationStatus) {
    setOps((prev) =>
      prev.map((o) => (o.id === opId ? { ...o, status: newStatus } : o))
    );
    setSelectedOp((prev) => (prev && prev.id === opId ? { ...prev, status: newStatus } : prev));
  }

  const fuelStatus = useMemo(() => computeFuelStatus(ops), [ops]);

  const tankerMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of tankers) m.set(t.id, `${t.plateNumber} — ${t.driverName}`);
    return m;
  }, []);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader title="Операции / Отгрузки" description="Учёт отгрузок топлива по базам">
          {role !== "viewer" && (
            <Button onClick={() => setNewOpOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Новая операция
            </Button>
          )}
        </PageHeader>
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniKpiCard label="Всего операций" value={String(totalOps)} />
          <MiniKpiCard label="Проверено" value={String(verifiedCount)} />
          <MiniKpiCard label="С ошибками" value={String(errorCount)} />
          <MiniKpiCard label="Объём сегодня" value={formatVolume(todayVolume)} />
        </div>
      </MotionItem>

      {/* Fuel inventory impact */}
      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Остатки на базах (авто-расчёт из операций)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fuelStatus.map((fs) => {
              const barColor = fs.status === "critical" ? "bg-rose-500" : fs.status === "warning" ? "bg-amber-500" : "bg-emerald-500";
              const textColor = fs.status === "critical" ? "text-rose-600" : fs.status === "warning" ? "text-amber-600" : "text-emerald-600";
              return (
                <div key={fs.base} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-stone-700">{BASE_LABELS[fs.base]} — {fs.fuelType}</span>
                      <span className={`text-sm font-semibold ${textColor}`}>{fs.level}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${fs.level}%` }} />
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{formatNumber(fs.volumeRemaining)} л · ~{fs.daysRemaining} дн.</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <FilterBar>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новый</SelectItem>
              <SelectItem value="verified">Проверен</SelectItem>
              <SelectItem value="error">Ошибка</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Поиск по водителю, комментарию..."
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
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">База</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Продукт</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Объём</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Бензовоз</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Водитель</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((op) => (
                <TableRow
                  key={op.id}
                  className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => setSelectedOp(op)}
                >
                  <TableCell className="text-sm text-stone-700">{formatDateShort(op.date)}</TableCell>
                  <TableCell className="text-sm text-stone-700">{BASE_LABELS[op.base]}</TableCell>
                  <TableCell className="text-sm text-stone-700">{op.fuelType}</TableCell>
                  <TableCell className="text-sm tabular-nums text-stone-600 text-right">{formatVolume(op.volume)}</TableCell>
                  <TableCell className="text-sm text-stone-600">{tankerMap.get(op.tankerId) ?? "—"}</TableCell>
                  <TableCell className="text-sm text-stone-700">{op.driverName}</TableCell>
                  <TableCell><StatusBadge status={op.status} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-stone-400 py-8">
                    Нет операций
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </MotionItem>

      <MotionItem>
        <AiInsightCard title="ИИ-рекомендация по операциям">
          <div className="space-y-2 text-sm">
            <p>
              За последний месяц зафиксировано <strong>{errorCount}</strong> операций с ошибками.
              {errorCount > 2
                ? " Рекомендуем проверить процедуру взвешивания и целостность пломб перед отправкой."
                : " Показатель в пределах нормы."}
            </p>
            <p>
              Наиболее загруженная база —{" "}
              <strong>
                {filtered.filter((o) => o.base === "chirchik").length >=
                filtered.filter((o) => o.base === "akhangaran").length
                  ? "Чирчик"
                  : "Ахангаран"}
              </strong>
              . Следите за равномерным распределением нагрузки.
            </p>
          </div>
        </AiInsightCard>
      </MotionItem>

      {/* Detail sheet */}
      <Sheet open={!!selectedOp} onOpenChange={() => setSelectedOp(null)}>
        <SheetContent side="right" className="w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Операция {selectedOp?.id}
            </SheetTitle>
          </SheetHeader>
          {selectedOp && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-500 mb-1">Дата</p>
                  <p className="text-sm font-medium text-stone-800">{formatDateShort(selectedOp.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1">Статус</p>
                  <StatusBadge status={selectedOp.status} />
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1">База</p>
                  <p className="text-sm font-medium text-stone-800">{BASE_LABELS[selectedOp.base]}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1">Продукт</p>
                  <p className="text-sm font-medium text-stone-800">{selectedOp.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1">Объём</p>
                  <p className="text-sm font-medium text-stone-800">{formatVolume(selectedOp.volume)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1">Бензовоз</p>
                  <p className="text-sm font-medium text-stone-800">{tankerMap.get(selectedOp.tankerId) ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Водитель</p>
                <p className="text-sm font-medium text-stone-800">{selectedOp.driverName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Комментарий</p>
                <p className="text-sm text-stone-700">{selectedOp.comment || "—"}</p>
              </div>
              {selectedOp.photoUrl && (
                <div>
                  <p className="text-xs text-stone-500 mb-2">Фото</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOp.photoUrl}
                    alt="Фото операции"
                    className="w-full rounded-xl border border-stone-200"
                  />
                </div>
              )}
              {role !== "viewer" && (
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs font-medium text-stone-600 mb-3">Изменить статус</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedOp.status === "verified"}
                      onClick={() => handleStatusChange(selectedOp.id, "verified")}
                      className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Проверен
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedOp.status === "error"}
                      onClick={() => handleStatusChange(selectedOp.id, "error")}
                      className="gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      <XCircle className="h-4 w-4" /> Ошибка
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New operation sheet */}
      <Sheet open={newOpOpen} onOpenChange={setNewOpOpen}>
        <SheetContent side="right" className="w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Новая операция
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Дата</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">База</label>
              <Select
                value={form.base}
                onValueChange={(v) => {
                  const base = v as Base;
                  setForm((p) => ({
                    ...p,
                    base,
                    fuelType: BASE_FUEL_MAP[base] as FuelType,
                  }));
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BASES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Продукт</label>
              <Input value={form.fuelType} readOnly className="bg-stone-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Объём (литры)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.volume}
                onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Бензовоз</label>
              <Select
                value={form.tankerId}
                onValueChange={(v) => {
                  const tanker = tankers.find((t) => t.id === v);
                  setForm((p) => ({
                    ...p,
                    tankerId: v,
                    driverName: tanker?.driverName ?? p.driverName,
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Выберите бензовоз" /></SelectTrigger>
                <SelectContent>
                  {tankers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.plateNumber} — {t.driverName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Водитель</label>
              <Input
                placeholder="Имя водителя"
                value={form.driverName}
                onChange={(e) => setForm((p) => ({ ...p, driverName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Комментарий</label>
              <Textarea
                placeholder="Описание операции..."
                value={form.comment}
                onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">Фото (URL)</label>
              <Input
                placeholder="https://..."
                value={form.photoUrl}
                onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full mt-2">
              Создать операцию
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MotionContainer>
  );
}
