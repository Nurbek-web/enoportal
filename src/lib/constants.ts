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

/** Each base distributes exactly one fuel type */
export const BASE_FUEL_MAP = {
  chirchik: 'AI-95',
  akhangaran: 'AI-92',
} as const;

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

import type { DealDocumentType, DocumentStatus } from './types';

export const DOCUMENT_TYPE_LABELS: Record<DealDocumentType, string> = {
  invoice: 'Счёт',
  specification: 'Спецификация',
  waybill: 'ТТН',
  tax_invoice: 'Счёт-фактура',
  act: 'Акт',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  formed: 'Сформирован',
  signed: 'Подписан',
  sent: 'Отправлен',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Deals
  client_request: { bg: 'bg-stone-100', text: 'text-stone-600' },
  terms_negotiation: { bg: 'bg-amber-50', text: 'text-amber-700' },
  awaiting_payment: { bg: 'bg-orange-50', text: 'text-orange-700' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  approved_for_shipment: { bg: 'bg-blue-50', text: 'text-blue-700' },
  shipped: { bg: 'bg-blue-50', text: 'text-blue-700' },
  documents_done: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  invoice_accepted: { bg: 'bg-teal-50', text: 'text-teal-700' },
  deal_closed: { bg: 'bg-stone-100', text: 'text-stone-500' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
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
  // Expense types
  urgent: { bg: 'bg-rose-50', text: 'text-rose-700' },
  // Document statuses
  formed: { bg: 'bg-blue-50', text: 'text-blue-700' },
  signed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  sent: { bg: 'bg-violet-50', text: 'text-violet-700' },
  // Operations
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  error: { bg: 'bg-rose-50', text: 'text-rose-700' },
  // Receivables
  overdue: { bg: 'bg-amber-50', text: 'text-amber-700' },
  critical_debt: { bg: 'bg-rose-50', text: 'text-rose-700' },
  normal_debt: { bg: 'bg-stone-100', text: 'text-stone-600' },
};

export const STATUS_LABELS: Record<string, string> = {
  client_request: 'Запрос клиента',
  terms_negotiation: 'Согласование условий',
  awaiting_payment: 'Ожидание оплаты',
  paid: 'Оплачено',
  approved_for_shipment: 'Разрешено к отгрузке',
  shipped: 'Отгружено',
  documents_done: 'Документы оформлены',
  invoice_accepted: 'СФ принята',
  deal_closed: 'Сделка закрыта',
  in_progress: 'В работе',
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
  cash: 'Нал',
  bank: 'Безнал',
  urgent: 'Срочные',
  // Document statuses
  formed: 'Сформирован',
  signed: 'Подписан',
  sent: 'Отправлен',
  // Operations
  verified: 'Проверен',
  error: 'Ошибка',
  // Receivables
  overdue: 'Просрочено',
  critical_debt: 'Критично',
  normal_debt: 'В норме',
};

export const BASE_LABELS: Record<string, string> = {
  chirchik: 'Чирчик',
  akhangaran: 'Ахангаран',
};
