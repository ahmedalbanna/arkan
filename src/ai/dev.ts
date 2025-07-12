
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-project.ts';
import '@/ai/flows/generate-proposal.ts';
import '@/ai/flows/generate-introduction.ts';
import '@/ai/flows/generate-literature-review.ts';
import '@/ai/flows/generate-system-analysis.ts';
import '@/ai/flows/generate-design-strategy.ts';
import '@/ai/flows/generate-system-design.ts';
import '@/ai/flows/generate-system-programming.ts';
import '@/ai/flows/generate-system-testing.ts';
import '@/ai/flows/generate-conclusion.ts';
import '@/ai/flows/generate-use-case-diagram.ts';
import '@/ai/flows/generate-class-diagram.ts';
import '@/ai/flows/generate-sequence-diagram.ts';
import '@/ai/flows/generate-activity-diagram.ts';
import '@/ai/flows/generate-component-diagram.ts';
import '@/ai/flows/generate-archimate-diagram.ts';
import '@/ai/flows/manipulate-text.ts';
import '@/ai/flows/generate-presentation.ts';
import '@/ai/flows/generate-code.ts';
