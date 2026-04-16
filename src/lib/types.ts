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
  purchaseFrequencyDays?: number; // avg days between purchases
  rating?: number; // 1-5 score
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
  rating: number; // 1-5
  reliability: number; // percentage 0-100
}

// Tanker trip record
export interface TankerTrip {
  id: string;
  tankerId: string;
  dealId: string;
  date: string;
  route: string; // e.g. "Чирчик → Ташкент"
  volumeDelivered: number; // liters
  cost: number; // UZS
  status: 'completed' | 'in_transit';
}

export type FuelType = 'AI-92' | 'AI-95';
export type Base = 'chirchik' | 'akhangaran';
export type DealStatus =
  | 'client_request'
  | 'terms_negotiation'
  | 'awaiting_payment'
  | 'paid'
  | 'approved_for_shipment'
  | 'shipped'
  | 'documents_done'
  | 'invoice_accepted'
  | 'deal_closed';
export type ReportStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseStatus = 'new' | 'approved' | 'rejected';
export type ExpenseType = 'cash' | 'bank';
export type PaymentType = 'cash' | 'bank';
export type DeliveryType = 'delivery' | 'pickup';
export type OperationStatus = 'new' | 'verified' | 'error';

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
  deliveryType: DeliveryType;
  status: DealStatus;
  paymentDueDate: string;
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

export type BaseFilter = "all" | Base;

// Deal documents
export type DealDocumentType = 'invoice' | 'specification' | 'waybill' | 'tax_invoice' | 'act';
export type DocumentStatus = 'formed' | 'signed' | 'sent';

export interface DealDocument {
  id: string;
  dealId: string;
  type: DealDocumentType;
  number: string;
  date: string; // ISO date
  status: DocumentStatus;
}

// Activity feed item
export interface Activity {
  id: string;
  timestamp: string;
  type: 'deal' | 'report' | 'expense' | 'fuel_alert' | 'payment';
  title: string;
  description: string;
}

// Fuel operation / shipment
export interface Operation {
  id: string;
  date: string;
  base: Base;
  fuelType: FuelType;
  volume: number;
  tankerId: string;
  driverName: string;
  comment: string;
  photoUrl?: string;
  status: OperationStatus;
}
