
'use client';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema } from '@/ai/schemas';

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
export const ProjectStateSchema = z.object({
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable(),
    sections: z.record(SectionNameSchema, z.string()).optional(),
    diagrams: z.record(DiagramTypeSchema, z.object({ plantUmlCode: z.string(), imageUrl: z.string() })).optional(),
    presentation: z.object({ history: z.array(z.object({ id: z.string(), name: z.string(), slides: z.array(PresentationSlideSchema) })) }).optional(),
});

export type ProjectState = z.infer<typeof ProjectStateSchema>;

// Represents a project document saved in Firestore
export interface SavedProject extends ProjectState {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}
