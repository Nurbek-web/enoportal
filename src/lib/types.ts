// Operator - works at a fuel base on 14/14 rotation
export interface Operator {
  id: string;
  name: string;
  phone: string;
  telegramId: string;
  base: 'chirchik' | 'akhangaran';
  shiftStartDate: string; // ISO date when current shift cycle started
  avatar?: string;
}

// Sales manager (продажник)
export interface Manager {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export type ClientSegment = 'vip' | 'promising' | 'declining' | 'novice';

// Client company (контрагент)
export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  segment: ClientSegment;
  totalVolume: number; // total liters purchased
  dealCount: number;
}

// Tanker truck (бензовоз)
export interface Tanker {
  id: string;
  plateNumber: string; // Uzbek format "01 A 123 BA"
  driverName: string;
  driverPhone: string;
  capacity: number; // liters
  tripCount: number;
  totalPaid: number; // UZS
  segment: 'loyal' | 'one-time' | 'profitable' | 'unprofitable';
}

export type FuelType = 'AI-92' | 'AI-95';
export type Base = 'chirchik' | 'akhangaran';
export type DealStatus = 'in_progress' | 'shipped' | 'paid';
export type ReportStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseStatus = 'new' | 'approved' | 'rejected';
export type ExpenseType = 'cash' | 'urgent';
export type PaymentType = 'cash' | 'bank';

// Sales deal (сделка)
export interface Deal {
  id: string;
  date: string;
  clientId: string;
  managerId: string;
  base: Base;
  fuelType: FuelType;
  volume: number; // liters
  mass: number; // tons
  pricePerLiter: number; // UZS
  costPerLiter: number; // UZS (себестоимость)
  totalAmount: number; // UZS
  costAmount: number; // UZS
  margin: number; // UZS
  marginPercent: number;
  tankerId: string;
  status: DealStatus;
}

// Daily operator report
export interface Report {
  id: string;
  date: string;
  operatorId: string;
  base: Base;
  fuelType: FuelType;
  fuelLevel: number; // percentage
  weightBefore: number; // tons
  weightAfter: number; // tons
  vehiclePlate: string;
  driverName: string;
  sealNumber: string;
  photoUrl?: string;
  status: ReportStatus;
  telegramSynced: boolean;
}

// Operator expense request
export interface Expense {
  id: string;
  date: string;
  operatorId: string;
  amount: number; // UZS
  type: ExpenseType;
  description: string;
  status: ExpenseStatus;
}

// Fuel level data point (for time series)
export interface FuelLevel {
  date: string;
  base: Base;
  fuelType: FuelType;
  level: number; // percentage 0-100
  volumeRemaining: number; // liters
}

// Market price entry
export interface MarketPrice {
  date: string;
  region: string;
  fuelType: FuelType;
  price: number; // UZS per liter
}

// Tanker payment
export interface TankerPayment {
  id: string;
  date: string;
  tankerId: string;
  amount: number;
  type: PaymentType;
  dealId?: string;
}

// Activity feed item
export interface Activity {
  id: string;
  timestamp: string;
  type: 'deal' | 'report' | 'expense' | 'fuel_alert' | 'payment';
  title: string;
  description: string;
}
