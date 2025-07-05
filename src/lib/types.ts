import type { ProjectProposal, DiagramType } from '@/ai/schemas';
import type { SectionName } from '@/app/generate-report/actions';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
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

// Remove the explicit import of SectionName from a server action file
// and define it directly here if it's needed on the client.
// However, it's only used in ReportHistoryData which is a server-side type, so we can keep it.
