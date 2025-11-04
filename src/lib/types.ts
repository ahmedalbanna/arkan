import { SectionProperties } from 'docx';



export * from './models/agent';
export * from './models/diagram';
export * from './models/project';
export * from './models/section';
export * from './models/transaction';
export * from './models/user';
export * from './models/template';
export * from './models/docxTemplate';
export * from './models/pptxTemplate';
export * from './models/reportTemplate';
// word-converter types are exported under a namespace to avoid name collisions
export * as WordConverterTypes from './word-converter/types';

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
    slides: any[]; // Adjust 'any' to a more specific slide type if available
}

// Define types for better type safety
export interface CurrencyDetails {
    iban?: string;
}

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
}

export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

// define types for the report mode generator
export interface ReportModeGeneratorProps {
    orderedSections: SectionProperties[];
    setOrderedSections: (sections: SectionProperties[]) => void;
}

// define CreateAgentVariables, UpdateAgentVariables, UploadedFile
export interface CreateAgentVariables {
    name: string;
    description: string;
    category: string;
    pageUrl: string;
    prompt: string;

}

export interface UpdateAgentVariables {
    agentId: string;
    payload: {
        name?: string;
        description?: string;
        category?: string;
        pageUrl?: string;
        prompt?: string;
        isEnabled?: boolean;

    }
}

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    content: string;

}
