import type { MarketPrice, Activity } from '@/lib/types';

const generateMarketPrices = (): MarketPrice[] => {
  const prices: MarketPrice[] = [];
  const regions = ['Ташкент', 'Самарканд', 'Бухара', 'Фергана', 'Навои'];

  const basePrices: Record<string, Record<string, number>> = {
    'Ташкент': { 'AI-92': 10900, 'AI-95': 12200 },
    'Самарканд': { 'AI-92': 11000, 'AI-95': 12300 },
    'Бухара': { 'AI-92': 11100, 'AI-95': 12400 },
    'Фергана': { 'AI-92': 10950, 'AI-95': 12250 },
    'Навои': { 'AI-92': 11050, 'AI-95': 12350 },
  };

  const weeklyNoise = [50, -30, 80, -20, 40, -60, 70, -40, 20, -50, 60, -10];

  for (let week = 0; week < 12; week++) {
    const date = new Date(2026, 0, 12 + week * 7);
    const dateStr = date.toISOString().split('T')[0] + 'T00:00:00.000Z';

    for (const region of regions) {
      const noise = weeklyNoise[week];
      const regionBase92 = basePrices[region]['AI-92'];
      const regionBase95 = basePrices[region]['AI-95'];

      prices.push({
        date: dateStr,
        region,
        fuelType: 'AI-92',
        price: regionBase92 + noise,
      });

      prices.push({
        date: dateStr,
        region,
        fuelType: 'AI-95',
        price: regionBase95 + noise,
      });
    }
  }

  return prices;
};

export const marketPrices: MarketPrice[] = generateMarketPrices();

export const activities: Activity[] = [
  {
    id: 'act-001',
    timestamp: '2026-04-05T15:30:00.000Z',
    type: 'deal',
    title: 'Новая сделка оформлена',
    description: 'ООО ТрансОйл Плюс — 9 000 л AI-95, Ахангаран',
  },
  {
    id: 'act-002',
    timestamp: '2026-04-05T14:15:00.000Z',
    type: 'expense',
    title: 'Расход отклонён',
    description: 'Жасур Хакимов — 3 200 000 сум, не согласованная закупка',
  },
  {
    id: 'act-003',
    timestamp: '2026-04-05T08:00:00.000Z',
    type: 'deal',
    title: 'Сделка в работе',
    description: 'ООО Зарафшон Энерго — 21 000 л AI-92, Чирчик',
  },
  {
    id: 'act-004',
    timestamp: '2026-04-04T11:15:00.000Z',
    type: 'deal',
    title: 'Сделка в работе',
    description: 'ЧП Азимов Транс — 11 000 л AI-95, Ахангаран',
  },
  {
    id: 'act-005',
    timestamp: '2026-04-04T08:00:00.000Z',
    type: 'expense',
    title: 'Расход отклонён',
    description: 'Бахтиёр Рахимов — 5 000 000 сум, замена датчика',
  },
  {
    id: 'act-006',
    timestamp: '2026-04-04T07:00:00.000Z',
    type: 'report',
    title: 'Отчёт отклонён',
    description: 'Отабек Назаров — AI-95 22%, Ахангаран',
  },
  {
    id: 'act-007',
    timestamp: '2026-04-03T11:45:00.000Z',
    type: 'fuel_alert',
    title: 'Критический уровень топлива',
    description: 'AI-95 Ахангаран — 18%, осталось на ~3 дня',
  },
  {
    id: 'act-008',
    timestamp: '2026-04-02T14:30:00.000Z',
    type: 'deal',
    title: 'Сделка в работе',
    description: 'ООО Ситора Ойл — 19 000 л AI-92, Ахангаран',
  },
  {
    id: 'act-009',
    timestamp: '2026-04-01T11:15:00.000Z',
    type: 'payment',
    title: 'Оплата бензовозу',
    description: 'Шерзод Маматов (10 B 567 FA) — 2 600 000 сум',
  },
  {
    id: 'act-010',
    timestamp: '2026-04-01T10:30:00.000Z',
    type: 'fuel_alert',
    title: 'Низкий уровень топлива',
    description: 'AI-92 Чирчик — 35%, рекомендуется пополнение',
  },
];
