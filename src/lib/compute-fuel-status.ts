import type { Operation, Base, FuelType } from '@/lib/types';
import { BASE_FUEL_MAP } from '@/lib/constants';

export interface ComputedFuelStatus {
  base: Base;
  fuelType: FuelType;
  level: number;
  status: 'ok' | 'warning' | 'critical';
  daysRemaining: number;
  volumeRemaining: number;
}

const TANK_CONFIG: Record<Base, { capacity: number; fuelType: FuelType; received: number }> = {
  chirchik: { capacity: 180_000, fuelType: BASE_FUEL_MAP.chirchik, received: 223_600 },
  akhangaran: { capacity: 150_000, fuelType: BASE_FUEL_MAP.akhangaran, received: 124_500 },
};

export function computeFuelStatus(operations: Operation[]): ComputedFuelStatus[] {
  const bases = Object.keys(TANK_CONFIG) as Base[];

  return bases.map((base) => {
    const cfg = TANK_CONFIG[base];

    const verifiedOps = operations.filter((op) => op.base === base && op.status === 'verified');
    const totalShipped = verifiedOps.reduce((sum, op) => sum + op.volume, 0);
    const volumeRemaining = Math.max(0, cfg.received - totalShipped);
    const level = Math.round((volumeRemaining / cfg.capacity) * 100);

    const status: ComputedFuelStatus['status'] =
      level <= 25 ? 'critical' : level <= 50 ? 'warning' : 'ok';

    let daysRemaining = 0;
    if (verifiedOps.length >= 2) {
      const dates = verifiedOps.map((op) => new Date(op.date).getTime()).sort((a, b) => a - b);
      const spanDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
      const avgDaily = spanDays > 0 ? totalShipped / spanDays : 0;
      daysRemaining = avgDaily > 0 ? Math.round(volumeRemaining / avgDaily) : 99;
    } else {
      daysRemaining = 99;
    }

    return { base, fuelType: cfg.fuelType, level, status, daysRemaining, volumeRemaining };
  });
}
