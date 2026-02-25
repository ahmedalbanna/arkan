export type PaymentMethodType = 'offline' | 'online' | 'bank' | 'e-wallet' | 'local-transfer' | 'international-transfer';

export interface PaymentMethod {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  icon?: string;
  description?: string;
  type: PaymentMethodType;
  accountHolder?: string;
  currencies?: Record<string, { iban?: string; swift?: string }>
  wallet?: { name?: string; id?: string; number?: string };
  instructions?: string;
  processingTime?: string;
}
