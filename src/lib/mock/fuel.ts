import type { FuelLevel, Base, FuelType } from '@/lib/types';

const generateFuelLevels = (): FuelLevel[] => {
  const levels: FuelLevel[] = [];
  const capacities: Record<string, number> = {
    'chirchik-AI-92': 200000,
    'chirchik-AI-95': 180000,
    'akhangaran-AI-92': 150000,
    'akhangaran-AI-95': 120000,
  };

  const startLevels: Record<string, number> = {
    'chirchik-AI-92': 62,
    'chirchik-AI-95': 68,
    'akhangaran-AI-92': 70,
    'akhangaran-AI-95': 52,
  };

  const endLevels: Record<string, number> = {
    'chirchik-AI-92': 35,
    'chirchik-AI-95': 72,
    'akhangaran-AI-92': 65,
    'akhangaran-AI-95': 18,
  };

  const bases: Base[] = ['chirchik', 'akhangaran'];
  const fuelTypes: FuelType[] = ['AI-92', 'AI-95'];
  const seed = [3, -1, 2, -2, 1, -3, 2, 0, -1, 3, -2, 1, 0, -1, 2, -2, 3, -1, 0, 1, -3, 2, -1, 0, 1, -2, 3, -1, 2, -2];

  for (const base of bases) {
    for (const fuelType of fuelTypes) {
      const key = `${base}-${fuelType}`;
      const cap = capacities[key];
      const start = startLevels[key];
      const end = endLevels[key];
      const step = (end - start) / 29;

      for (let day = 0; day < 30; day++) {
        const date = new Date(2026, 2, 7 + day);
        const noise = seed[day] * 0.8;
        const level = Math.round(Math.max(5, Math.min(98, start + step * day + noise)));
        const volumeRemaining = Math.round((level / 100) * cap);

        levels.push({
          date: date.toISOString().split('T')[0] + 'T06:00:00.000Z',
          base,
          fuelType,
          level,
          volumeRemaining,
        });
      }
    }
  }

  return levels;
};

export const fuelLevels: FuelLevel[] = generateFuelLevels();

export const currentFuelStatus: {
  base: Base;
  fuelType: FuelType;
  level: number;
  status: 'ok' | 'warning' | 'critical';
  daysRemaining: number;
  volumeRemaining: number;
}[] = [
  {
    base: 'chirchik',
    fuelType: 'AI-92',
    level: 35,
    status: 'warning',
    daysRemaining: 6,
    volumeRemaining: 70000,
  },
  {
    base: 'chirchik',
    fuelType: 'AI-95',
    level: 72,
    status: 'ok',
    daysRemaining: 18,
    volumeRemaining: 129600,
  },
  {
    base: 'akhangaran',
    fuelType: 'AI-92',
    level: 65,
    status: 'ok',
    daysRemaining: 14,
    volumeRemaining: 97500,
  },
  {
    base: 'akhangaran',
    fuelType: 'AI-95',
    level: 18,
    status: 'critical',
    daysRemaining: 3,
    volumeRemaining: 21600,
  },
];
