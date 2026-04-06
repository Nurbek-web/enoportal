"use client";

import { useMemo, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { deals } from "@/lib/mock/sales";
import { clients } from "@/lib/mock/clients";
import { managers } from "@/lib/mock/managers";
import { tankers } from "@/lib/mock/tankers";
import { BASE_LABELS, ENO_DEAL_DEFAULTS } from "@/lib/constants";
import type { Deal, DealStatus, Base, FuelType } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  formatDateShort,
  formatPercent,
  formatVolume,
  formatMass,
  volumeToMass,
  massToVolume,
  calculateMargin,
} from "@/lib/format";

interface NewDealForm {
  clientId: string;
  managerId: string;
  base: Base;
  fuelType: FuelType;
  volume: string;
  mass: string;
  pricePerLiter: string;
  costPerLiter: string;
  tankerId: string;
  status: DealStatus;
}

function buildInitialForm(): NewDealForm {
  const defaults = ENO_DEAL_DEFAULTS["AI-92"];
  return {
    clientId: "",
    managerId: managers[0]?.id ?? "",
    base: "chirchik",
    fuelType: "AI-92",
    volume: "",
    mass: "",
    pricePerLiter: String(defaults.price),
    costPerLiter: String(defaults.cost),
    tankerId: "",
    status: "in_progress",
  };
}

export default function SalesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [baseFilter, setBaseFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [newDealOpen, setNewDealOpen] = useState(false);

  const [form, setForm] = useState<NewDealForm>(() => buildInitialForm());
  const [editingField, setEditingField] = useState<"volume" | "mass" | null>(null);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    []
  );
  const managerMap = useMemo(
    () => new Map(managers.map((m) => [m.id, m])),
    []
  );
  const tankerMap = useMemo(
    () => new Map(tankers.map((t) => [t.id, t])),
    []
  );

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (statusFilter !== "all" && deal.status !== statusFilter) return false;
      if (baseFilter !== "all" && deal.base !== baseFilter) return false;
      if (fuelFilter !== "all" && deal.fuelType !== fuelFilter) return false;
      if (searchQuery.trim()) {
        const client = clientMap.get(deal.clientId);
        const name = client?.companyName.toLowerCase() ?? "";
        if (!name.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [statusFilter, baseFilter, fuelFilter, searchQuery, clientMap]);

  const computed = useMemo(() => {
    const vol = parseFloat(form.volume) || 0;
    const price = parseFloat(form.pricePerLiter) || 0;
    const cost = parseFloat(form.costPerLiter) || 0;
    const totalAmount = vol * price;
    const costAmount = vol * cost;
    const { margin, marginPercent } = calculateMargin(totalAmount, costAmount);
    return { totalAmount, costAmount, margin, marginPercent };
  }, [form.volume, form.pricePerLiter, form.costPerLiter]);

  const handleVolumeChange = useCallback(
    (value: string) => {
      setEditingField("volume");
      const vol = parseFloat(value) || 0;
      const mass = vol > 0 ? volumeToMass(vol, form.fuelType).toFixed(2) : "";
      setForm((prev) => ({ ...prev, volume: value, mass }));
    },
    [form.fuelType]
  );

  const handleMassChange = useCallback(
    (value: string) => {
      setEditingField("mass");
      const m = parseFloat(value) || 0;
      const vol = m > 0 ? Math.round(massToVolume(m, form.fuelType)).toString() : "";
      setForm((prev) => ({ ...prev, mass: value, volume: vol }));
    },
    [form.fuelType]
  );

  const handleFuelTypeChange = useCallback(
    (ft: FuelType) => {
      const defaults = ENO_DEAL_DEFAULTS[ft];
      setForm((prev) => {
        const next = {
          ...prev,
          fuelType: ft,
          pricePerLiter: defaults.price.toString(),
          costPerLiter: defaults.cost.toString(),
        };
        if (editingField === "volume" && prev.volume) {
          const vol = parseFloat(prev.volume) || 0;
          next.mass = vol > 0 ? volumeToMass(vol, ft).toFixed(2) : "";
        } else if (editingField === "mass" && prev.mass) {
          const m = parseFloat(prev.mass) || 0;
          next.volume = m > 0 ? Math.round(massToVolume(m, ft)).toString() : "";
        }
        return next;
      });
    },
    [editingField]
  );

  const openNewDeal = useCallback(() => {
    setForm(buildInitialForm());
    setEditingField(null);
    setNewDealOpen(true);
  }, []);

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader title="Продажи">
          <button
            onClick={openNewDeal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Новая сделка
          </button>
        </PageHeader>
      </MotionItem>

      <MotionItem>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="in_progress">В работе</SelectItem>
              <SelectItem value="shipped">Отгружено</SelectItem>
              <SelectItem value="paid">Оплачено</SelectItem>
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

          <Select value={fuelFilter} onValueChange={setFuelFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Топливо" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все виды</SelectItem>
              <SelectItem value="AI-92">AI-92</SelectItem>
              <SelectItem value="AI-95">AI-95</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Поиск по клиенту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[220px] bg-white pl-9"
            />
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-100 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">№</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Клиент</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">База</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Топливо</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Объём (л)</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Сумма</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Маржа %</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Менеджер</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal, idx) => {
                const client = clientMap.get(deal.clientId);
                const manager = managerMap.get(deal.managerId);
                return (
                  <TableRow
                    key={deal.id}
                    className="cursor-pointer border-b border-stone-100 hover:bg-blue-50/50 transition-colors duration-150"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <TableCell className="font-medium text-stone-600">{idx + 1}</TableCell>
                    <TableCell className="text-stone-600">{formatDateShort(deal.date)}</TableCell>
                    <TableCell className="font-medium text-stone-900">{client?.companyName ?? "—"}</TableCell>
                    <TableCell className="text-stone-600">{BASE_LABELS[deal.base]}</TableCell>
                    <TableCell className="text-stone-600">{deal.fuelType}</TableCell>
                    <TableCell className="text-right tabular-nums text-stone-700">{formatNumber(deal.volume)}</TableCell>
                    <TableCell className="text-right tabular-nums text-stone-700">{formatCurrency(deal.totalAmount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-stone-700">{formatPercent(deal.marginPercent)}</TableCell>
                    <TableCell><StatusBadge status={deal.status} /></TableCell>
                    <TableCell className="text-stone-600">{manager?.name ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
              {filteredDeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-sm text-stone-400">
                    Сделки не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </MotionItem>

      <DealDetailSheet
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        clientMap={clientMap}
        managerMap={managerMap}
        tankerMap={tankerMap}
      />

      <Sheet open={newDealOpen} onOpenChange={setNewDealOpen}>
        <SheetContent side="right" className="w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Новая сделка</SheetTitle>
            <SheetDescription>Заполните данные для создания новой сделки</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FormField label="Клиент">
              <Select value={form.clientId} onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Менеджер">
              <Select value={form.managerId} onValueChange={(v) => setForm((p) => ({ ...p, managerId: v }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="База">
                <Select
                  value={form.base}
                  onValueChange={(v) => setForm((p) => ({ ...p, base: v as Base }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chirchik">Чирчик</SelectItem>
                    <SelectItem value="akhangaran">Ахангаран</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Топливо">
                <Select
                  value={form.fuelType}
                  onValueChange={(v) => handleFuelTypeChange(v as FuelType)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI-92">AI-92</SelectItem>
                    <SelectItem value="AI-95">AI-95</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Объём (литры)">
                <Input
                  type="number"
                  placeholder="0"
                  value={form.volume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="bg-white"
                />
              </FormField>
              <FormField label="Масса (тонны)">
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={form.mass}
                  onChange={(e) => handleMassChange(e.target.value)}
                  className="bg-white"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Цена за литр (сум)">
                <Input
                  type="number"
                  value={form.pricePerLiter}
                  onChange={(e) => setForm((p) => ({ ...p, pricePerLiter: e.target.value }))}
                  className="bg-white"
                />
              </FormField>
              <FormField label="Себестоимость за литр">
                <Input
                  type="number"
                  value={form.costPerLiter}
                  onChange={(e) => setForm((p) => ({ ...p, costPerLiter: e.target.value }))}
                  className="bg-white"
                />
              </FormField>
            </div>

            <div className="rounded-xl border border-stone-200/50 bg-stone-50 p-4 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Расчёт</p>
              <div className="grid grid-cols-2 gap-3">
                <ComputedField label="Сумма сделки" value={formatCurrency(computed.totalAmount)} />
                <ComputedField label="Себестоимость" value={formatCurrency(computed.costAmount)} />
                <ComputedField label="Маржа" value={formatCurrency(computed.margin)} />
                <ComputedField
                  label="Маржинальность"
                  value={formatPercent(computed.marginPercent)}
                  highlight={computed.marginPercent > 0}
                />
              </div>
            </div>

            <FormField label="Бензовоз">
              <Select value={form.tankerId} onValueChange={(v) => setForm((p) => ({ ...p, tankerId: v }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите бензовоз" />
                </SelectTrigger>
                <SelectContent>
                  {tankers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.plateNumber} — {t.driverName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Статус">
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as DealStatus }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="shipped">Отгружено</SelectItem>
                  <SelectItem value="paid">Оплачено</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <button
              onClick={() => setNewDealOpen(false)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              Создать сделку
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </MotionContainer>
  );
}

function DealDetailSheet({
  deal,
  onClose,
  clientMap,
  managerMap,
  tankerMap,
}: {
  deal: Deal | null;
  onClose: () => void;
  clientMap: Map<string, (typeof clients)[number]>;
  managerMap: Map<string, (typeof managers)[number]>;
  tankerMap: Map<string, (typeof tankers)[number]>;
}) {
  if (!deal) return <Sheet open={false} onOpenChange={onClose}><SheetContent><SheetHeader><SheetTitle /></SheetHeader></SheetContent></Sheet>;

  const client = clientMap.get(deal.clientId);
  const manager = managerMap.get(deal.managerId);
  const tanker = tankerMap.get(deal.tankerId);

  return (
    <Sheet open={!!deal} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Сделка {deal.id.replace("deal-", "№")}</SheetTitle>
          <SheetDescription>
            {formatDateShort(deal.date)} · <StatusBadge status={deal.status} />
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <DetailSection title="Основная информация">
            <DetailRow label="Клиент" value={client?.companyName ?? "—"} />
            <DetailRow label="Контактное лицо" value={client?.contactPerson ?? "—"} />
            <DetailRow label="Менеджер" value={manager?.name ?? "—"} />
            <DetailRow label="База" value={BASE_LABELS[deal.base]} />
            <DetailRow label="Топливо" value={deal.fuelType} />
            <DetailRow label="Статус" value={<StatusBadge status={deal.status} />} />
          </DetailSection>

          <DetailSection title="Финансы">
            <DetailRow label="Объём" value={formatVolume(deal.volume)} />
            <DetailRow label="Масса" value={formatMass(deal.mass)} />
            <DetailRow label="Цена за литр" value={formatCurrency(deal.pricePerLiter)} />
            <DetailRow label="Себестоимость за литр" value={formatCurrency(deal.costPerLiter)} />
            <DetailRow label="Сумма сделки" value={formatCurrency(deal.totalAmount)} bold />
            <DetailRow label="Себестоимость" value={formatCurrency(deal.costAmount)} />
            <DetailRow label="Маржа" value={formatCurrency(deal.margin)} highlight />
            <DetailRow label="Маржинальность" value={formatPercent(deal.marginPercent)} highlight />
          </DetailSection>

          <DetailSection title="Логистика">
            <DetailRow label="Бензовоз" value={tanker?.plateNumber ?? "—"} />
            <DetailRow label="Водитель" value={tanker?.driverName ?? "—"} />
            <DetailRow label="Телефон водителя" value={tanker?.driverPhone ?? "—"} />
            <DetailRow label="Ёмкость цистерны" value={tanker ? formatVolume(tanker.capacity) : "—"} />
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
  bold,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <>
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd
        className={`text-sm ${
          highlight ? "font-semibold text-emerald-600" : bold ? "font-semibold text-stone-900" : "text-stone-900"
        }`}
      >
        {value}
      </dd>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}

function ComputedField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-stone-900"}`}>{value}</p>
    </div>
  );
}
