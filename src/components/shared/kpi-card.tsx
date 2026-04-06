"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  format?: (val: number) => string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accentColor: "blue" | "emerald" | "amber" | "violet";
}

const accentMap = {
  blue: {
    border: "border-t-blue-500",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  emerald: {
    border: "border-t-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  amber: {
    border: "border-t-amber-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  violet: {
    border: "border-t-violet-500",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
  },
};

export function KpiCard({ title, value, format, icon: Icon, trend, accentColor }: KpiCardProps) {
  const animatedValue = useCountUp(value);
  const accent = accentMap[accentColor];
  const displayValue = format ? format(animatedValue) : animatedValue.toLocaleString("ru-RU");

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/60 border-t-2 shadow-sm shadow-slate-950/[0.03] p-5",
        accent.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-light tracking-tight text-slate-900">
            {displayValue}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                  trend.positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                )}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">vs прошлый мес.</span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", accent.iconBg)}>
          <Icon className={cn("h-5 w-5", accent.iconText)} />
        </div>
      </div>
    </div>
  );
}
