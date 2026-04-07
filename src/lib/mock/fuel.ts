import type { FuelLevel, Base, FuelType } from '@/lib/types';

const generateFuelLevels = (): FuelLevel[] => {
  const levels: FuelLevel[] = [];

  // Chirchik distributes AI-95; Akhangaran distributes AI-92
  const configs: { base: Base; fuelType: FuelType; capacity: number; startLevel: number; endLevel: number }[] = [
    { base: 'chirchik',    fuelType: 'AI-95', capacity: 180000, startLevel: 68, endLevel: 72 },
    { base: 'akhangaran',  fuelType: 'AI-92', capacity: 150000, startLevel: 70, endLevel: 35 },
  ];

  const seed = [3, -1, 2, -2, 1, -3, 2, 0, -1, 3, -2, 1, 0, -1, 2, -2, 3, -1, 0, 1, -3, 2, -1, 0, 1, -2, 3, -1, 2, -2];

  for (const { base, fuelType, capacity, startLevel, endLevel } of configs) {
    const step = (endLevel - startLevel) / 29;

    for (let day = 0; day < 30; day++) {
      const date = new Date(2026, 2, 7 + day);
      const noise = seed[day] * 0.8;
      const level = Math.round(Math.max(5, Math.min(98, startLevel + step * day + noise)));
      const volumeRemaining = Math.round((level / 100) * capacity);

      levels.push({
        date: date.toISOString().split('T')[0] + 'T06:00:00.000Z',
        base,
        fuelType,
        level,
        volumeRemaining,
      });
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
    fuelType: 'AI-95',
    level: 72,
    status: 'ok',
    daysRemaining: 18,
    volumeRemaining: 129600,
  },
  {
    base: 'akhangaran',
    fuelType: 'AI-92',
    level: 35,
    status: 'warning',
    daysRemaining: 6,
    volumeRemaining: 52500,
  },
];
