'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-project.ts';
import '@/ai/flows/generate-proposal.ts';
import '@/ai/flows/select-proposal-template.ts'; // Add new flow
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
import '@/ai/flows/generate-codebase.ts';
import '@/ai/flows/academic-solver.ts';
import '@/ai/flows/explain-diagram.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/project-chat.ts'; // Add new flow
import '@/ai/flows/analyze-context.ts'; // Add new flow
import '@/ai/flows/analyzeAndReport.ts';
import '@/ai/flows/generate-agent-config.ts';
import '@/ai/flows/improve-report-markdown.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/paraphrase-text.ts';
import '@/ai/flows/summarize-text.ts';
import '@/ai/flows/humanize-text.ts';
import '@/ai/flows/detect-ai-content.ts';
import '@/ai/flows/generate-citation.ts';
import '@/ai/flows/fact-checker.ts';
import '@/ai/flows/plagiarism-checker.ts';
import '@/ai/flows/grammar-checker.ts';
import '@/ai/flows/text-stylist.ts';
import '@/ai/flows/write-document.ts';
import '@/ai/flows/generate-presentation-outline.ts';
    
// Import tools so Genkit recognizes them in development
import '@/ai/tools/generateReportSection';
import '@/ai/tools/updateProposalField';
import '@/ai/tools/generateDiagram';
import '@/ai/tools/addTaskToPhase';
import '@/ai/tools/generateCodebase';
import '@/ai/tools/generateProjectPlan';

// Add new tools

import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/ai-proofread-document.ts';
import '@/ai/flows/generate-text.ts';