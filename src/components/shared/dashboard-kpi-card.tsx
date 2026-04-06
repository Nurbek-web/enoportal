"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardKpiCardProps {
  title: string;
  value: number;
  format?: (val: number) => string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accentColor: "blue" | "emerald" | "amber" | "violet";
}

const accentMap = {
  blue:    { border: "border-l-blue-400",    glow: "shadow-blue-500/20",    iconBg: "bg-blue-500/20",    iconText: "text-blue-400"    },
  emerald: { border: "border-l-emerald-400", glow: "shadow-emerald-500/20", iconBg: "bg-emerald-500/20", iconText: "text-emerald-400" },
  amber:   { border: "border-l-amber-400",   glow: "shadow-amber-500/20",   iconBg: "bg-amber-500/20",   iconText: "text-amber-400"   },
  violet:  { border: "border-l-violet-400",  glow: "shadow-violet-500/20",  iconBg: "bg-violet-500/20",  iconText: "text-violet-400"  },
};

export function DashboardKpiCard({
  title,
  value,
  format,
  icon: Icon,
  trend,
  accentColor,
}: DashboardKpiCardProps) {
  const animatedValue = useCountUp(value);
  const accent = accentMap[accentColor];
  const displayValue = format ? format(animatedValue) : animatedValue.toLocaleString("ru-RU");

  return (
    <div
      className={cn(
        "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] border-l-2 rounded-2xl p-5",
        "shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200",
        accent.border,
        accent.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-stone-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {displayValue}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                  trend.positive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                )}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-stone-500">vs прошлый мес.</span>
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
