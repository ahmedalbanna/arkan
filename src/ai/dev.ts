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
