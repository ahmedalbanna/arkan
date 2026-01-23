'use server';

import { config } from 'dotenv';
config();

// Core Builder Flows

import '@/ai/flows/generate-report-section';

// Utility & Tool Flows
import '@/ai/flows/ai-proofread-document';
import '@/ai/flows/ai-researcher';

import '@/ai/flows/create-lecture-unit';
import '@/ai/flows/fact-checker';
import '@/ai/flows/generate-agent-config';
import '@/ai/flows/generate-citation';
import '@/ai/flows/generate-ideas';
import '@/ai/flows/generate-image';
import '@/ai/flows/generate-plantuml';
import '@/ai/flows/generate-quiz';
import '@/ai/flows/generate-session-plan';
import '@/ai/flows/generate-theoretical-lecture';
import '@/ai/flows/grammar-checker';
import '@/ai/flows/humanize-text';
import '@/ai/flows/image-to-text';
import '@/ai/flows/improve-report-markdown';
import '@/ai/flows/manipulate-text';
import '@/ai/flows/paraphrase-text';
import '@/ai/flows/plagiarism-checker';
import '@/ai/flows/project-consultant';
import '@/ai/flows/rewrite-document-to-markdown';
import '@/ai/flows/rewrite-to-markdown';
import '@/ai/flows/summarize-document';
import '@/ai/flows/summarize-text';
import '@/ai/flows/text-stylist';
import '@/ai/flows/topic-explainer';
import '@/ai/flows/translate-text';
import '@/ai/flows/write-document';
// Old flows removed - now using unified generation
import '@/ai/flows/generate-unified';

