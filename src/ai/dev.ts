'use server';

import { config } from 'dotenv';
config();

// Core Builder Flows

import '@/ai/flows/generate-report-section.ts';
import '@/ai/flows/generate-diagrams.ts';

// Utility & Tool Flows
import '@/ai/flows/ai-proofread-document.ts';
import '@/ai/flows/ai-researcher.ts';

import '@/ai/flows/fact-checker.ts';
import '@/ai/flows/generate-agent-config.ts';
import '@/ai/flows/generate-citation.ts';
import '@/ai/flows/generate-ideas.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/generate-plantuml.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/grammar-checker.ts';
import '@/ai/flows/humanize-text.ts';
import '@/ai/flows/image-to-text.ts';
import '@/ai/flows/improve-report-markdown.ts';
import '@/ai/flows/manipulate-text.ts';
import '@/ai/flows/paraphrase-text.ts';
import '@/ai/flows/plagiarism-checker.ts';
import '@/ai/flows/rewrite-document-to-markdown.ts';
import '@/ai/flows/rewrite-to-markdown.ts';
import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/summarize-text.ts';
import '@/ai/flows/text-stylist.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/topic-explainer.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/write-document.ts';
import '@/ai/flows/create-lecture-unit.ts';
import '@/ai/flows/generate-theoretical-lecture.ts';
import '@/ai/flows/generate-session-plan.ts';
import '@/ai/flows/project-consultant';