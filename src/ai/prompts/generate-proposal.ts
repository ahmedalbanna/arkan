// src/ai/prompts/generate-proposal.ts
'use server';

import { defaultModel } from '@/ai/config/models';
import { AdaptiveModelSelector } from '@/ai/core/adaptive-model-selector';
import { ContextAnalyzer } from '@/ai/core/context-analyzer';
import { IntelligentPromptBuilder } from '@/ai/core/intelligent-prompt-builder';
import { ai } from '@/ai/genkit';
import { GenerateProposalInputSchema, ProjectProposalSchema } from '@/ai/schemas';
import { z } from 'genkit';

const basicSystemPrompt = `أنت خبير في إدارة المشاريع والكتابة التقنية. مهمتك هي إنتاج مقترح مشروع شامل ومهني بناءً على الفكرة والسياق المقدم.

**عملية التفكير المطلوبة:**
1. **تحليل الفكرة الأساسية**: حلل فكرة المشروع بعمق لفهم الغرض والنطاق الأساسي.
2. **الاستنتاج والتوسع**: حتى لو قدم المستخدم فكرة بسيطة، استخدم خبرتك لاستنتاج وتطوير جميع مكونات المقترح المهني.
3. **إنتاج جميع الأقسام**: املأ **كل حقل** في مخطط JSON بمحتوى مكتوب جيداً ومهني.

ملاحظة هامة:
- يجب أن يكون الإخراج النهائي عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي أو شرح أو تعليقات.
- لا تضع أي نص خارج كائن JSON النهائي.
`;

export const generateProposalPrompt = ai.definePrompt(
  {
    name: 'generateProposalPrompt',
    input: { schema: GenerateProposalInputSchema.extend({ useEnhancedSystem: z.boolean().optional().default(true) }) },
    output: { schema: z.any() },
    model: defaultModel || 'googleai/gemini-2.0-flash',
    system: async (input) => {
      if (!input.useEnhancedSystem) {
        return basicSystemPrompt;
      }

      // محاولة استخدام النظام الذكي المحسن
      try {
        console.log("🧠 بناء prompt ذكي...");
        // تحليل السياق الذكي
        const contextAnalysis = await ContextAnalyzer.analyzeContext({
          userInput: input.projectIdea || '',
          externalContext: input.externalContext,
          guidelines: input.guidelines,
        });

        // بناء prompt ذكي
        const promptTemplate = IntelligentPromptBuilder.buildPrompt({
          taskType: 'generation',
          domain: 'project-proposals',
          contextAnalysis,
          userInput: input.projectIdea || '',
          externalContext: input.externalContext,
        });

        return `${promptTemplate.system}

**مهمتك المحددة:**
أنت خبير في إدارة المشاريع والكتابة التقنية. مهمتك هي إنتاج مقترح مشروع شامل ومهني بناءً على الفكرة والسياق المقدم.

**عملية التفكير المطلوبة:**
1. **تحليل الفكرة الأساسية**: حلل فكرة المشروع بعمق لفهم الغرض والنطاق الأساسي.
2. **الاستنتاج والتوسع**: حتى لو قدم المستخدم فكرة بسيطة، استخدم خبرتك لاستنتاج وتطوير جميع مكونات المقترح المهني.
3. **إنتاج جميع الأقسام**: املأ **كل حقل** في مخطط JSON بمحتوى مكتوب جيداً ومهني.

**السياق المتاح:**
${promptTemplate.context}

**التعليمات المفصلة:**
${promptTemplate.instructions}

**القيود والمحددات:**
${promptTemplate.constraints}

**تنسيق المخرجات:**
${promptTemplate.outputFormat}

---
ملاحظة هامة:
- يجب أن يكون الإخراج النهائي عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي أو شرح.
- لا تضع أي نص خارج كائن JSON النهائي.
`;
      } catch (enhancedError) {
        console.warn('⚠️ فشل بناء الـ prompt الذكي، استخدام النظام الأساسي:', enhancedError);
        return basicSystemPrompt;
      }
    },
    prompt: `
{{#if advancedFields}}
--- DETAILED PROJECT REQUIREMENTS ---
The user has provided the following structured details for the project. Use this as the primary source of information to construct the full proposal object.
- **Project Title**: '''{{advancedFields.projectTitle}}'''
- **Project Objective**: '''{{advancedFields.projectObjective}}'''
- **Expected Outcomes**: '''{{advancedFields.expectedOutcomes}}'''
- **Methodology**: '''{{advancedFields.methodology}}'''
- **Timeline**: '''{{advancedFields.timeline}}'''
- **Knowledge & Context**: '''{{advancedFields.knowledge}}'''
{{else}}
--- Main Input: Project Idea ---
{{{projectIdea}}}
{{/if}}

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if externalContext}}
--- IMPORTANT EXTERNAL CONTEXT ---
Analyze the following files as a primary source of truth and context.
{{#each externalContext}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---
{{#if this.content}}
{{media url=this.content}}
{{/if}}
---
{{/each}}
{{/if}}
`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  },
);