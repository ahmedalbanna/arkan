
import type { ProjectProposal, DiagramType, SectionName } from '@/ai/schemas';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  credits: number;
  createdAt: string;
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
    password?: string; // Optional for phone auth
    phone?: string;    // Optional for email auth
}

export interface SignupCredentials {
    name: string;
    email: string;
    password?: string;
}
