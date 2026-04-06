"use client";

import { useMemo, useState, useCallback } from "react";
import { Plus, Receipt, CheckCircle2, Clock } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { expenses as initialExpenses } from "@/lib/mock/expenses";
import { operators } from "@/lib/mock/operators";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { Expense, ExpenseType } from "@/lib/types";

export default function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseList, setExpenseList] = useState<Expense[]>(() => [...initialExpenses]);

  const [operatorId, setOperatorId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [expenseType, setExpenseType] = useState<ExpenseType | "">("");
  const [description, setDescription] = useState("");

  const operatorMap = useMemo(
    () => new Map(operators.map((o) => [o.id, o])),
    []
  );

  const totalAmount = useMemo(
    () => expenseList.reduce((sum, e) => sum + e.amount, 0),
    [expenseList]
  );
  const approvedAmount = useMemo(
    () =>
      expenseList
        .filter((e) => e.status === "approved")
        .reduce((sum, e) => sum + e.amount, 0),
    [expenseList]
  );
  const pendingCount = useMemo(
    () => expenseList.filter((e) => e.status === "new").length,
    [expenseList]
  );

  const summaryCards = [
    {
      label: "Общая сумма",
      value: formatCurrency(totalAmount),
      icon: Receipt,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Одобрено",
      value: formatCurrency(approvedAmount),
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "На рассмотрении",
      value: `${pendingCount} заявок`,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const resetForm = useCallback(() => {
    setOperatorId("");
    setAmountStr("");
    setExpenseType("");
    setDescription("");
  }, []);

  const handleSubmit = useCallback(() => {
    const amount = Math.round(parseFloat(amountStr.replace(/\s/g, "")) || 0);
    if (!operatorId || !expenseType || amount <= 0 || !description.trim()) {
      return;
    }
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
      operatorId,
      amount,
      type: expenseType,
      description: description.trim(),
      status: "new",
    };
    setExpenseList((prev) => [newExpense, ...prev]);
    resetForm();
    setDialogOpen(false);
  }, [operatorId, amountStr, expenseType, description, resetForm]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) resetForm();
    },
    [resetForm]
  );

  const canSubmit =
    Boolean(operatorId) &&
    Boolean(expenseType) &&
    (parseFloat(amountStr.replace(/\s/g, "")) || 0) > 0 &&
    description.trim().length > 0;

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Расходы операторов"
          description="Заявки на расходы и контроль бюджета"
        >
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Новая заявка
          </button>
        </PageHeader>
      </MotionItem>

      <MotionItem>
        <div className="grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm shadow-slate-950/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{card.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm shadow-slate-950/[0.03]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">№</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Дата</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Оператор</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500 text-right">Сумма</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Тип</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Описание</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseList.map((exp, idx) => {
                  const op = operatorMap.get(exp.operatorId);
                  return (
                    <TableRow key={exp.id} className="border-b border-slate-100">
                      <TableCell className="font-medium text-slate-600">{idx + 1}</TableCell>
                      <TableCell className="tabular-nums text-slate-600">{formatDateShort(exp.date)}</TableCell>
                      <TableCell className="font-medium text-slate-900">{op?.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">{formatCurrency(exp.amount)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            exp.type === "urgent"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {exp.type === "urgent" ? "Срочные" : "Наличные"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-600">{exp.description}</TableCell>
                      <TableCell><StatusBadge status={exp.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </MotionItem>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Новая заявка на расход</DialogTitle>
            <DialogDescription>Заполните данные для создания заявки</DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Оператор</label>
              <Select value={operatorId} onValueChange={setOperatorId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите оператора" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Сумма (сум)</label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                className="bg-white"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Тип расхода</label>
              <Select
                value={expenseType}
                onValueChange={(v) => setExpenseType(v as ExpenseType)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Наличные</SelectItem>
                  <SelectItem value="urgent">Срочные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Описание</label>
              <textarea
                rows={3}
                placeholder="Опишите расход..."
                className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50"
            >
              Создать
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionContainer>
  );
}
