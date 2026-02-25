
import type { ChapterProperties } from '@/modules/ai-content/domain/entities/Chapter';
import type { Language, Behavior, Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import type { ExternalContextProperties } from '@/modules/ai-content/domain/entities/ExternalContext';

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
  content?: ChapterProperties[];
  externalContext?: ExternalContextProperties[];
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
