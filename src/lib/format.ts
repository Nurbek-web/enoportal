import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FUEL_DENSITY } from './constants';

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ru-RU').replace(/,/g, ' ') + ' сум';
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU').replace(/,/g, ' ');
}

export function formatVolume(liters: number): string {
  return formatNumber(Math.round(liters)) + ' л';
}

export function formatMass(tons: number): string {
  return tons.toFixed(2) + ' т';
}

export function volumeToMass(liters: number, fuelType: string): number {
  const density = FUEL_DENSITY[fuelType] || 0.74;
  return (liters * density) / 1000;
}

export function massToVolume(tons: number, fuelType: string): number {
  const density = FUEL_DENSITY[fuelType] || 0.74;
  return (tons * 1000) / density;
}

export function calculateMargin(totalAmount: number, costAmount: number): { margin: number; marginPercent: number } {
  const margin = totalAmount - costAmount;
  const marginPercent = totalAmount > 0 ? (margin / totalAmount) * 100 : 0;
  return { margin, marginPercent };
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: ru });
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'dd.MM.yyyy');
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ru });
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}
