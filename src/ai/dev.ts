'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-project.ts';
import '@/ai/flows/generate-proposal.ts';
import '@/ai/flows/generate-report-section.ts'; // Replaces all individual section flows
import '@/ai/flows/generate-diagrams.ts';
import '@/ai/flows/manipulate-text.ts';
import '@/ai/flows/generate-presentation.ts';
import '@/ai/flows/generate-code.ts';
import '@/ai/flows/rewrite-to-markdown.ts';
import '@/ai/flows/evaluate-report.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/rewrite-document-to-markdown.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/evaluate-and-select-context.ts';
import '@/ai/flows/translate-proposal.ts';
import '@/ai/flows/translate-presentation.ts';
import '@/ai/flows/image-to-text.ts';
import '@/ai/flows/generate-project-plan.ts';
import '@/ai/flows/project-chat.ts';
import '@/ai/flows/generate-codebase.ts';
    
// Import tools so Genkit recognizes them in development
import '@/ai/tools/generateReportSection';
import '@/ai/tools/updateProposalField';
import '@/ai/tools/generateDiagram';
import '@/ai/tools/addTaskToPhase';
import '@/ai/tools/generateCodebase';
