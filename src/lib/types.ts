
'use client';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema, ProjectProposal, SectionName, DiagramType, PresentationSlide } from '@/ai/schemas';

export type UserRole = 'user' | 'admin' | 'editor' | 'guest'; // Define possible roles
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  credits: number;
  createdAt: string; // Make sure this is in your type if it's in Firestore
  role: UserRole; // Add the role field
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
export interface PaymentRequest {
  userId: string;
  planId: string;
  planName: string;
  credits: number;
  price: number;
  userName: string;
  userEmail: string;
  paymentProofUrl: string;
  status: 'pending' | 'approved' | 'rejected'; // Add other statuses as needed
  createdAt: string; // ISO 8601 date string
}

// Represents the full state of a user's work session
// NOTE: The Zod schema for this has been moved to `src/lib/project-state-schema.ts`
// to avoid circular dependency issues with server-side modules.
export interface ProjectState {
    name?: string;
    projectIdea?: string;
    proposal: ProjectProposal | null;
    sections?: { [key in SectionName]?: string };
    diagrams?: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } };
    presentation?: { history: PresentationHistoryEntry[] };
    externalContext?: { fileName: string; content: string; } | null;
}
export interface PresentationHistoryEntry {
    id: string;
    name: string;
    slides: PresentationSlide[];
}

// Represents a project document saved in Firestore
export interface SavedProject extends ProjectState {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface HistoryEntry{
  id: string;
  name: string;
  createdAt: string;
}
