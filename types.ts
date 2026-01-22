export enum PaymentMethod {
  CASH = 'Cash',
  TRANSFER = 'Bank Transfer',
  CARD = 'Card',
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  logoUrl: string | null;
  footerMessage: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface TransactionDetails {
  customerName: string;
  date: string;
  paymentMethod: PaymentMethod;
  currency: string;
}
