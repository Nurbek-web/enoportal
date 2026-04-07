import { formatNumber } from "@/lib/format";

interface FuelGaugeProps {
  label: string;
  baseName: string;
  level: number; // 0–100
  status: "ok" | "warning" | "critical";
  daysRemaining: number;
  volumeRemaining: number;
  index?: number; // for stagger delay
}

const STATUS_STROKE: Record<string, string> = {
  ok:       "#10b981", // emerald-500
  warning:  "#f59e0b", // amber-500
  critical: "#ef4444", // rose-500
};

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FuelGauge({
  label,
  baseName,
  level,
  status,
  volumeRemaining,
  index = 0,
}: Omit<FuelGaugeProps, 'daysRemaining'> & { daysRemaining?: number }) {
  const strokeColor = STATUS_STROKE[status];
  const target = CIRCUMFERENCE - (CIRCUMFERENCE * level) / 100;
  const delay = index * 150;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width={120}
          height={120}
          viewBox="0 0 120 120"
        >
          {/* Background ring */}
          <circle
            cx={60}
            cy={60}
            r={RADIUS}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={8}
          />
          {/* Value ring */}
          <circle
            cx={60}
            cy={60}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="fuel-gauge-ring"
            style={
              {
                transform: "rotate(-90deg)",
                transformOrigin: "60px 60px",
                "--gauge-circumference": CIRCUMFERENCE,
                "--gauge-target": target,
                "--gauge-delay": `${delay}ms`,
              } as React.CSSProperties
            }
          />
          {/* Center percentage */}
          <text
            x={60}
            y={56}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1c1917"
            fontSize={20}
            fontWeight={600}
            fontFamily="inherit"
          >
            {level}%
          </text>
          {/* Volume remaining */}
          <text
            x={60}
            y={74}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#78716c"
            fontSize={9}
            fontFamily="inherit"
          >
            {formatNumber(volumeRemaining)} л
          </text>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="text-xs text-stone-500">{baseName}</p>
      </div>
    </div>
  );
}
