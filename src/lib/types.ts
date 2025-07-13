import type { ProjectProposal, DiagramType, SectionName } from '@/ai/schemas';
import { IntegerConfig } from 'drizzle-orm/sqlite-core';
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  credits: number;
  createdAt: string;
}

export interface Media {
  type: 'image' | 'video';
  url: string;
  alt: string;
  aiHint?: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'FlutterFlow' | 'UI/UX Design' | 'AI' | 'Web Design';
  tags: string[];
  media: Media[];
  liveLink?: string;
  summary?: {
    short: string;
    technologies: string[];
  };
  comments: Comment[];
  createdAt: string;
}


export type ProposalHistoryData = {
  type: 'proposal';
  proposal: ProjectProposal;
};

export type ReportHistoryData = {
  type: 'report';
  section: SectionName;
  content: string;
  proposalTitle: string;
};

export type DiagramHistoryData = {
  type: 'diagram';
  diagramType: DiagramType;
  plantUmlCode: string;
  imageUrl: string;
  proposalTitle: string;
};

export type HistoryEntry = {
  id: string;
  createdAt: string;
  title: string;
} & (ProposalHistoryData | ReportHistoryData | DiagramHistoryData);

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  isPopular?: boolean;
}