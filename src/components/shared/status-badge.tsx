import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || { bg: "bg-stone-100", text: "text-stone-600" };
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full",
        colors.bg,
        colors.text,
        className
      )}
    >
      {label}
    </span>
  );
}
