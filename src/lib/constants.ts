export const FUEL_DENSITY: Record<string, number> = {
  'AI-92': 0.74,
  'AI-95': 0.75,
};

export const BONUS_RATE_PER_LITER = 24; // UZS per liter

export const BASES = [
  { id: 'chirchik' as const, name: 'Чирчик' },
  { id: 'akhangaran' as const, name: 'Ахангаран' },
];

export const FUEL_TYPES = ['AI-92', 'AI-95'] as const;

/** ENO reference retail prices (сум/л) — market comparison & sales form defaults */
export const ENO_PRICES = {
  'AI-92': 10800,
  'AI-95': 12200,
} as const;

/** Default price & cost per liter for new deal form */
export const ENO_DEAL_DEFAULTS = {
  'AI-92': { price: 10800, cost: 10200 },
  'AI-95': { price: 12200, cost: 11500 },
} as const;

export const SHIFT_DAYS_ON = 14;
export const SHIFT_DAYS_HANDOVER = 1;
export const SHIFT_DAYS_OFF = 14;
export const SHIFT_CYCLE_LENGTH = SHIFT_DAYS_ON + SHIFT_DAYS_HANDOVER + SHIFT_DAYS_OFF; // 29

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Deals
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
  shipped: { bg: 'bg-blue-50', text: 'text-blue-700' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  // Reports
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700' },
  // Expenses
  new: { bg: 'bg-amber-50', text: 'text-amber-700' },
  // Operators
  on_shift: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  off_shift: { bg: 'bg-stone-100', text: 'text-stone-600' },
  handover: { bg: 'bg-blue-50', text: 'text-blue-700' },
  // Tanker segments
  loyal: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'one-time': { bg: 'bg-stone-100', text: 'text-stone-600' },
  profitable: { bg: 'bg-blue-50', text: 'text-blue-700' },
  unprofitable: { bg: 'bg-rose-50', text: 'text-rose-700' },
  // Client segments
  vip: { bg: 'bg-violet-50', text: 'text-violet-700' },
  promising: { bg: 'bg-blue-50', text: 'text-blue-700' },
  declining: { bg: 'bg-rose-50', text: 'text-rose-700' },
  novice: { bg: 'bg-stone-100', text: 'text-stone-600' },
  // Trips
  booked: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  planned: { bg: 'bg-amber-50', text: 'text-amber-700' },
  // Payment types
  cash: { bg: 'bg-amber-50', text: 'text-amber-700' },
  bank: { bg: 'bg-blue-50', text: 'text-blue-700' },
};

export const STATUS_LABELS: Record<string, string> = {
  in_progress: 'В работе',
  shipped: 'Отгружено',
  paid: 'Оплачено',
  pending: 'На проверке',
  approved: 'Подтверждён',
  rejected: 'Отклонён',
  new: 'Новая',
  on_shift: 'На вахте',
  off_shift: 'Выходной',
  handover: 'Пересменка',
  loyal: 'Лояльный',
  'one-time': 'Разовый',
  profitable: 'Выгодный',
  unprofitable: 'Невыгодный',
  vip: 'VIP',
  promising: 'Перспективный',
  declining: 'Падающий',
  novice: 'Новый',
  booked: 'Забронирован',
  planned: 'Планируется',
  cash: 'Наличные',
  bank: 'Банк',
};

export const BASE_LABELS: Record<string, string> = {
  chirchik: 'Чирчик',
  akhangaran: 'Ахангаран',
};
