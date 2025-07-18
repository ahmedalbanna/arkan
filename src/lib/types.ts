
import type { ProjectProposal, DiagramType, SectionName } from '@/ai/schemas';
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
