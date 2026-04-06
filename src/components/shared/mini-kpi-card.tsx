interface MiniKpiCardProps {
  label: string;
  value: string;
}

export function MiniKpiCard({ label, value }: MiniKpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
    </div>
  );
}
