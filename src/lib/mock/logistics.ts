export type TransportIconKey = 'plane' | 'train' | 'bus';

export interface Trip {
  id: string;
  operatorId: string;
  direction: string;
  date: string;
  transport: string;
  status: 'booked' | 'planned';
}

/** Карточки сравнения транспорта (данные без React-компонентов иконок) */
export const transportComparisonCards: Array<{
  id: string;
  type: string;
  icon: TransportIconKey;
  priceRange: string;
  duration: string;
  comfort: number;
  cardClass: string;
  iconBg: string;
  iconColor: string;
}> = [
  {
    id: 'avia',
    type: 'Авиа',
    icon: 'plane',
    priceRange: 'от 450 000 сум',
    duration: '2 часа',
    comfort: 5,
    cardClass: 'border border-sky-200/60',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    id: 'rail',
    type: 'Ж/Д',
    icon: 'train',
    priceRange: 'от 180 000 сум',
    duration: '12 часов',
    comfort: 4,
    cardClass: 'border border-amber-200/60',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'bus',
    type: 'Автобус',
    icon: 'bus',
    priceRange: 'от 95 000 сум',
    duration: '18 часов',
    comfort: 3,
    cardClass: 'border border-emerald-200/60',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
];

export const upcomingTrips: Trip[] = [
  { id: 'trip-001', operatorId: 'op-001', direction: 'Алматы → Ташкент', date: '2026-04-10', transport: 'Авиа', status: 'booked' },
  { id: 'trip-002', operatorId: 'op-003', direction: 'Ташкент → Алматы', date: '2026-04-12', transport: 'Ж/Д', status: 'planned' },
  { id: 'trip-003', operatorId: 'op-005', direction: 'Алматы → Ташкент', date: '2026-04-14', transport: 'Авиа', status: 'booked' },
  { id: 'trip-004', operatorId: 'op-002', direction: 'Ташкент → Алматы', date: '2026-04-15', transport: 'Автобус', status: 'planned' },
  { id: 'trip-005', operatorId: 'op-007', direction: 'Алматы → Ташкент', date: '2026-04-18', transport: 'Ж/Д', status: 'booked' },
  { id: 'trip-006', operatorId: 'op-004', direction: 'Ташкент → Алматы', date: '2026-04-20', transport: 'Авиа', status: 'planned' },
];
