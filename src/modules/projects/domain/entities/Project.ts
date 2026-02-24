
import type { Language, Behavior, Tone } from '@/lib/models/control-types';

export interface ProjectProperties {
  id?: string;
  name?: string;
  description?: string;
  projectDescription?: string;
  projectType?: string;
  specialization?: string;
  university?: string;
  supervisor?: string;
  course?: string;
  educationalLevel?: string;
  teamMembers?: string[];
  logoUrl?: string;
  universityLogoUrl?: string;
  content?: any[]; // To be refined with Chapter/Section
  externalContext?: any[];
  meta?: {
    author?: string;
    version?: string;
    created?: string;
    updated?: string;
  };
  tableOfContentsMarkdown?: string;
  language?: Language;
  complexity?: number;
  formality?: number;
  tone?: Tone;
  behaviors?: Behavior[];
  rules?: string[];
  constraints?: string[];
  citationStyle?: string;
}
