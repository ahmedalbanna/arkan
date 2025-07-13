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
