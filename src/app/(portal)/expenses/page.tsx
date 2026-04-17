"use client";

import { useMemo, useState, useCallback } from "react";
import { Plus, Receipt, CheckCircle2, Clock, Wallet } from "lucide-react";
import { MotionContainer, MotionItem } from "@/components/shared/motion-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiInsightCard } from "@/components/shared/ai-insight-card";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { expenses as initialExpenses, operatorBudgets } from "@/lib/mock/expenses";
import { operators } from "@/lib/mock/operators";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { useRole } from "@/contexts/role-context";
import type { Expense, ExpenseType, ExpenseCategory } from "@/lib/types";

export default function ExpensesPage() {
  const { role } = useRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseList, setExpenseList] = useState<Expense[]>(() => [...initialExpenses]);

  const [operatorId, setOperatorId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [expenseType, setExpenseType] = useState<ExpenseType | "">("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | "">("");
  const [description, setDescription] = useState("");

  const operatorMap = useMemo(
    () => new Map(operators.map((o) => [o.id, o])),
    []
  );

  const budgetMap = useMemo(
    () => new Map(operatorBudgets.map((b) => [b.operatorId, b])),
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

  // Per-operator budget summaries
  const operatorBudgetSummaries = useMemo(() => {
    const spentMap = new Map<string, number>();
    for (const exp of expenseList) {
      if (exp.status === "approved") {
        spentMap.set(exp.operatorId, (spentMap.get(exp.operatorId) ?? 0) + exp.amount);
      }
    }
    return operators
      .map((op) => {
        const budget = budgetMap.get(op.id);
        const spent = spentMap.get(op.id) ?? 0;
        const allocation = budget?.monthlyAllocation ?? 0;
        const remaining = allocation - spent;
        const percentUsed = allocation > 0 ? (spent / allocation) * 100 : 0;
        return { op, spent, allocation, remaining, percentUsed };
      })
      .filter((s) => s.allocation > 0)
      .sort((a, b) => b.percentUsed - a.percentUsed);
  }, [expenseList, budgetMap]);

  const topSpender = useMemo(
    () => operatorBudgetSummaries[0],
    [operatorBudgetSummaries]
  );

  const overBudgetCount = useMemo(
    () => operatorBudgetSummaries.filter((s) => s.remaining < 0).length,
    [operatorBudgetSummaries]
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
    {
      label: "Превышение бюджета",
      value: overBudgetCount > 0 ? `${overBudgetCount} оператора` : "Нет",
      icon: Wallet,
      iconBg: overBudgetCount > 0 ? "bg-rose-100" : "bg-stone-100",
      iconColor: overBudgetCount > 0 ? "text-rose-600" : "text-stone-400",
    },
  ];

  const resetForm = useCallback(() => {
    setOperatorId("");
    setAmountStr("");
    setExpenseType("");
    setExpenseCategory("");
    setDescription("");
  }, []);

  const handleSubmit = useCallback(() => {
    const amount = Math.round(parseFloat(amountStr.replace(/\s/g, "")) || 0);
    if (!operatorId || !expenseType || !expenseCategory || amount <= 0 || !description.trim()) {
      return;
    }
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
      operatorId,
      amount,
      type: expenseType,
      category: expenseCategory,
      description: description.trim(),
      status: "new",
    };
    setExpenseList((prev) => [newExpense, ...prev]);
    resetForm();
    setDialogOpen(false);
  }, [operatorId, amountStr, expenseType, expenseCategory, description, resetForm]);

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
    Boolean(expenseCategory) &&
    (parseFloat(amountStr.replace(/\s/g, "")) || 0) > 0 &&
    description.trim().length > 0;

  return (
    <MotionContainer>
      <MotionItem>
        <PageHeader
          title="Расходы операторов"
          description="Заявки на расходы и контроль бюджета"
        >
          {role !== "viewer" && (
            <Button size="sm" onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" />
              Новая заявка
            </Button>
          )}
        </PageHeader>
      </MotionItem>

      <MotionItem>
        <div className="grid gap-4 sm:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-900/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{card.label}</p>
                    <p className="text-lg font-semibold text-stone-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MotionItem>

      {/* Per-operator budget section */}
      <MotionItem>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5">
          <h3 className="text-sm font-medium text-stone-800 mb-4">Расходы по операторам (апрель 2026)</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {operatorBudgetSummaries.map(({ op, spent, allocation, remaining, percentUsed }) => {
              const isOver = remaining < 0;
              const isWarning = !isOver && percentUsed >= 80;
              const barColor = isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500";
              const barWidth = Math.min(percentUsed, 100);
              return (
                <div key={op.id} className={`rounded-xl border p-3.5 ${isOver ? "border-rose-200 bg-rose-50/40" : "border-stone-100"}`}>
                  <p className="text-xs font-medium text-stone-700 truncate mb-2">{op.name.split(" ").slice(0, 2).join(" ")}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-stone-500">{formatCurrency(spent)}</span>
                    <span className="text-xs text-stone-400">/ {formatCurrency(allocation)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isOver ? "text-rose-600" : "text-stone-600"}`}>
                      {isOver ? "Превышение: " : "Остаток: "}
                      <span className="font-semibold">{formatCurrency(Math.abs(remaining))}</span>
                    </span>
                    <span className={`text-xs font-semibold ${isOver ? "text-rose-600" : isWarning ? "text-amber-600" : "text-stone-500"}`}>
                      {percentUsed.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <AiInsightCard title="Анализ расходов">
          <div className="space-y-1.5 text-sm">
            <p>
              Всего заявок: <strong>{expenseList.length}</strong> на сумму{" "}
              <strong>{formatCurrency(totalAmount)}</strong>.{" "}
              {pendingCount > 0 ? (
                <><strong>{pendingCount}</strong> заявок ожидают рассмотрения — проверьте своевременно.</>
              ) : (
                <>Все заявки рассмотрены.</>
              )}
            </p>
            {topSpender && (
              <p>
                Наибольший расход: <strong>{topSpender.op.name.split(" ").slice(0, 2).join(" ")}</strong> —{" "}
                использовано <strong>{topSpender.percentUsed.toFixed(0)}%</strong> бюджета (
                {formatCurrency(topSpender.spent)} из {formatCurrency(topSpender.allocation)}).
              </p>
            )}
            {overBudgetCount > 0 && (
              <p className="text-rose-600 font-medium">
                ⚠ {overBudgetCount} оператор{overBudgetCount > 1 ? "а" : ""} превысил{overBudgetCount > 1 ? "и" : ""} бюджет расчётного периода — требуется согласование.
              </p>
            )}
            <p>
              Безнал расходов:{" "}
              <strong>{expenseList.filter((e) => e.type === "bank").length}</strong> — рекомендуем контролировать долю безналичных расходов.
            </p>
          </div>
        </AiInsightCard>
      </MotionItem>

      <MotionItem>
        <div className="rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-900/[0.04]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">№</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Дата</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Оператор</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500 text-right">Сумма</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Категория</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Тип</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Описание</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-stone-500">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseList.map((exp, idx) => {
                  const op = operatorMap.get(exp.operatorId);
                  return (
                    <TableRow key={exp.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150">
                      <TableCell className="font-medium text-stone-600">{idx + 1}</TableCell>
                      <TableCell className="tabular-nums text-stone-600">{formatDateShort(exp.date)}</TableCell>
                      <TableCell className="font-medium text-stone-900">{op?.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums text-stone-700">{formatCurrency(exp.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={exp.category === 'fuel' ? 'fuel_expense' : exp.category} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={exp.type} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-stone-600">{exp.description}</TableCell>
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
              <label className="text-sm font-medium text-stone-700">Оператор</label>
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
              <label className="text-sm font-medium text-stone-700">Сумма (сум)</label>
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
              <label className="text-sm font-medium text-stone-700">Тип расхода</label>
              <Select
                value={expenseType}
                onValueChange={(v) => setExpenseType(v as ExpenseType)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Нал</SelectItem>
                  <SelectItem value="bank">Безнал</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Категория</label>
              <Select
                value={expenseCategory}
                onValueChange={(v) => setExpenseCategory(v as ExpenseCategory)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">Транспорт</SelectItem>
                  <SelectItem value="fuel">Топливо</SelectItem>
                  <SelectItem value="repairs">Ремонт</SelectItem>
                  <SelectItem value="office">Офис</SelectItem>
                  <SelectItem value="salary">Зарплата</SelectItem>
                  <SelectItem value="other">Прочее</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Описание</label>
              <Textarea
                rows={3}
                placeholder="Опишите расход..."
                className="bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionContainer>
  );
}
