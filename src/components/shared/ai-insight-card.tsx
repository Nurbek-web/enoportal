import { Sparkles } from "lucide-react";

interface AiInsightCardProps {
  title: string;
  children: React.ReactNode;
}

export function AiInsightCard({ title, children }: AiInsightCardProps) {
  return (
    <div className="relative rounded-2xl border border-violet-200/30 bg-gradient-to-r from-violet-500/[0.04] via-blue-500/[0.04] to-violet-500/[0.04] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <span className="bg-violet-100 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
          ИИ-рекомендация
        </span>
        <span className="text-sm font-medium text-slate-800">{title}</span>
      </div>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
}
