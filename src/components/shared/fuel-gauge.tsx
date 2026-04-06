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

const STATUS_GLOW: Record<string, string> = {
  ok:       "drop-shadow(0 0 6px rgba(16,185,129,0.5))",
  warning:  "drop-shadow(0 0 6px rgba(245,158,11,0.5))",
  critical: "drop-shadow(0 0 8px rgba(239,68,68,0.6))",
};

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FuelGauge({
  label,
  baseName,
  level,
  status,
  daysRemaining,
  volumeRemaining,
  index = 0,
}: FuelGaugeProps) {
  const strokeColor = STATUS_STROKE[status];
  const glowFilter = STATUS_GLOW[status];
  const target = CIRCUMFERENCE - (CIRCUMFERENCE * level) / 100;
  const delay = index * 150;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width={120}
          height={120}
          viewBox="0 0 120 120"
          style={{ filter: glowFilter }}
        >
          {/* Background ring */}
          <circle
            cx={60}
            cy={60}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
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
            fill="white"
            fontSize={20}
            fontWeight={600}
            fontFamily="inherit"
          >
            {level}%
          </text>
          {/* Days remaining */}
          <text
            x={60}
            y={74}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(168,162,158,0.8)"
            fontSize={10}
            fontFamily="inherit"
          >
            ~{daysRemaining} дн.
          </text>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-stone-500">{baseName}</p>
        <p className="mt-0.5 text-xs text-stone-500">
          {formatNumber(volumeRemaining)} л
        </p>
      </div>
    </div>
  );
}
