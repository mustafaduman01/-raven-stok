export type UserRole = 'ADMIN' | 'DEPO_SORUMLUSU' | 'URETIM_PERSONELI' | 'GORUNTULEYICI';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  telegramChatId?: string | null;
  notificationPrefs?: { push?: boolean; telegram?: boolean };
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo?: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  location: Location;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  category?: Category;
  unit: string;
  minStock: number;
  supplierId?: string;
  supplier?: Supplier;
  description?: string;
  totalStock: number;
  isCritical: boolean;
  stockLevels?: StockLevel[];
}

export interface Batch {
  id: string;
  productId: string;
  batchNo: string;
  supplierId?: string;
  expiryDate?: string | null;
  entryDate: string;
  initialQty: number;
  remainingQty: number;
  product?: Product;
  supplier?: Supplier;
}

export interface Label {
  id: string;
  batchId: string;
  quantity: number;
  status: 'ACTIVE' | 'CONSUMED' | 'RETURNED' | 'WASTED';
  reprintCount: number;
  qrDataUrl?: string;
  createdAt: string;
  batch?: Batch;
}

export interface StockMovement {
  id: string;
  productId: string;
  batchId?: string;
  labelId?: string;
  locationId?: string;
  type: 'ENTRY' | 'PRODUCTION_EXIT' | 'RETURN' | 'WASTE' | 'COUNT_ADJUST' | 'TRANSFER';
  quantity: number;
  userId: string;
  recipientInfo?: string;
  returnReason?: string;
  isWaste: boolean;
  note?: string;
  timestamp: string;
  product?: Product;
  batch?: Batch;
  location?: Location;
  user?: User;
}

export interface Alert {
  id: string;
  productId: string;
  type: string;
  channel: string;
  status: string;
  message: string;
  isRead: boolean;
  sentAt?: string | null;
  createdAt: string;
  product?: Product;
}
