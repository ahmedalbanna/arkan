
'use client';

// This file is being phased out in favor of co-locating types with their respective models.
// New types should be added to the relevant files in `src/lib/models/`.

export * from './models/docxTemplate';
export * from './models/pptxTemplate';
export * from './models/project';
export * from './models/reportTemplate';
export * from './models/section';
export * from './models/template';
export * from './models/transaction';
export * from './models/user';
// word-converter types are exported under a namespace to avoid name collisions
export * as WordConverterTypes from './word-converter/types';

// Re-export PptxStyleOptions from the schemas
export type { PptxStyleOptions } from '@/ai/schemas/template-schemas';

export interface HistoryEntry {
    id: string;
    createdAt: string;
    type: 'section' | 'project' | 'diagram';
    title: string; // e.g., "Project Proposal" or "Use Case Diagram"
    data: any;
}


export interface Notification {
    id: string;
    title: string;
    description: string;
    icon: 'credit-card' | 'bot' | 'file-text' | 'user-plus' | string; // Allow for more icons
    isRead: boolean;
    createdAt: string;
    link?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    isPopular?: boolean;
}

export type TTSInput = {
    text: string;
}

export type TTSOutput = {
    audioDataUri: string;
}


// --- From services/user-service ---
export interface SignupCredentials {
    email: string;
    password: string;
    name: string;
}

// --- From services/transaction-service ---
export interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}

// --- From services/feature-service ---
export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export interface UpdateFeatureVariables {
    featureId: string;
    payload: { isEnabled: boolean };
}

// --- From services/translation-service ---
export interface TranslateVariables {
    text: string;
    targetLang: string;
}

export interface PresentationHistoryEntry {
    name: string;
    timestamp: number;
    slides: any[]; // Adjust 'any' to a more specific type if available
}

// Define types for better type safety
export interface CurrencyDetails {
    iban?: string;
}

// Payment method types
export type PaymentMethodType = 'bank' | 'e-wallet' | 'local-transfer' | 'international-transfer';

// E-Wallet provider types for Yemen
export type YemenWalletProvider = 
    | 'cac-bank'           // كاك بنك
    | 'mobi-cash'          // موبي كاش
    | 'yemen-mobile'       // يمن موبايل
    | 'mtn-mobile-money'   // MTN Mobile Money
    | 'you-telecom'        // يو تليكوم
    | 'aljazira-bank'      // الجزيرة بنك
    | 'tadhamon-bank'      // تضامن بنك
    | 'other';             // أخرى

export interface WalletDetails {
    provider: YemenWalletProvider;
    accountNumber: string;
    accountName: string;
    phoneNumber?: string;
    notes?: string;
}

export interface BankTransferDetails {
    iban?: string;
    accountNumber?: string;
    swiftCode?: string;
    bankAddress?: string;
}

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    name: string;
    displayName: string;
    icon?: string;
    isActive: boolean;
    
    // For bank accounts
    accountHolder?: string;
    currencies?: {
        SAR?: BankTransferDetails;
        USD?: BankTransferDetails;
        YER?: BankTransferDetails;
    };
    
    // For e-wallets
    wallet?: WalletDetails;
    
    // Additional info
    instructions?: string;
    processingTime?: string; // e.g., "فوري" or "1-2 أيام عمل"
}

// Legacy BankAccount interface - keeping for backward compatibility
export interface BankAccount {
    bankName: string;
    accountHolder: string;
    currencies: {
        SAR?: CurrencyDetails;
        USD?: CurrencyDetails;
        YER?: CurrencyDetails;
    };
}

export interface PublicSettings {
    bankAccounts: BankAccount[];
    paymentMethods?: PaymentMethod[]; // New flexible payment methods
    newUserCredits: number;
}

// Alias for PublicSettings (used in admin pages)
export type AppSettings = PublicSettings;

// Login credentials type (re-exported from authUtils)
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    content: string;

}

export type ExternalContextType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';
export interface ExternalContext {
    id: string;
    fileName: string;
    content: string;
    type: ExternalContextType;
}

// Presentation Template Types
export interface PresentationTemplateProperties {
    id: string;
    name: string;
    description: string;
    primaryAgentId: string;
    relevantReportSectionIds?: string[];
    isDefault?: boolean;
}
export type CreatePresentationTemplateData = Omit<PresentationTemplateProperties, 'id'> & { id: string };
export type UpdatePresentationTemplateData = Partial<Omit<PresentationTemplateProperties, 'id'>>;

// Report Template Types
// Note: This is a duplicate of the interface in models/reportTemplate.ts
// Keeping for backward compatibility with existing imports
export interface ReportTemplateProperties {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  content: {
    title: string;
    sections: {
      title: string;
      type: 'report' | 'diagram' | 'presentation';
      prompt: string;
      guidelines?: string[];
      behaviors?: { name: string; type: 'persona' | 'behavior' }[];
      controls?: any; // Use a more specific type if possible
    }[];
  }[];
  // Project configuration fields
  projectType?: string;
  specialization?: string;
  university?: string;
  course?: string;
  educationalLevel?: string;
}


export type CreateReportTemplateData = Omit<ReportTemplateProperties, 'id'> & { id: string };
export type UpdateReportTemplateData = Partial<Omit<ReportTemplateProperties, 'id'>>;

// Payment proof file schema
import { z } from 'zod';
export const fileSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length == 1, 'File is required.')
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      (files) => ['image/jpeg', 'image/png', 'application/pdf'].includes(files?.[0]?.type),
      'Invalid file type. Only JPG, PNG, and PDF are allowed.'
    ),
});

export type PptxTemplateKey = 'modern' | 'dark' | 'professional';
export type DocxTemplateKey = 'modern' | 'classic' | 'academic';