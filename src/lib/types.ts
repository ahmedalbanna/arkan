'use client';

import { z } from 'zod';
import { 
    ProjectProposalSchema, 
    DiagramTypeSchema, 
    SectionNameSchema, 
    PresentationSlideSchema, 
    ManipulateTextInputSchema,
    ManipulateTextOutputSchema,
    TranslateTextInputSchema,
    TranslateTextOutputSchema
} from '@/ai/schemas';

// --- Re-export AI schemas for client-side use ---
export type { ProjectProposal, DiagramType, SectionName, PresentationSlide, ManipulateTextInput, ManipulateTextOutput };

// --- User & Auth ---
export type UserRole = 'user' | 'admin' | 'editor' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  credits: number;
  createdAt: string;
  role: UserRole;
  hasCompletedOnboarding?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  isPopular?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
    name: string;
    email: string;
    password?: string;
}

// --- Agent Management ---
export interface AgentPrompt {
  base: string;
  guidelines?: { text: string; isDefault: boolean; }[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  pageUrl: string;
  isEnabled: boolean;
  prompt: AgentPrompt | string;
  icon: React.ElementType;
}

export interface UpdateAgentPayload {
    name?: string;
    prompt?: string;
    isEnabled?: boolean;
}

export interface UpdateAgentVariables {
    agentId: string;
    payload: UpdateAgentPayload;
}

// --- Feature Management ---
export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export interface UpdateFeaturePayload {
    isEnabled: boolean;
}

export interface UpdateFeatureVariables {
    featureId: string;
    payload: UpdateFeaturePayload;
}

// --- Translation ---
export type TranslateVariables = z.infer<typeof TranslateTextInputSchema>;

// --- Transaction Management ---
export interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}


// --- Project State Management ---
export interface PresentationHistoryEntry {
    id: string;
    name: string;
    slides: PresentationSlide[];
}

// Represents the full state of a user's work session
export interface ProjectState {
    name?: string;
    projectIdea?: string;
    proposal: ProjectProposal | null;
    sections?: { [key in SectionName]?: string };
    diagrams?: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } };
    presentation?: { history: PresentationHistoryEntry[] };
    externalContext?: { fileName: string; content: string; } | null;
}

// Represents a project document saved in Firestore
export interface SavedProject extends ProjectState {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}
