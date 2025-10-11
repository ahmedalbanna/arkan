
// src/ai/prompts/generate-proposal.ts
'use server';

import { defaultModel } from '@/ai/config/models';
import { AdaptiveModelSelector } from '@/ai/core/adaptive-model-selector';
import { ContextAnalyzer } from '@/ai/core/context-analyzer';
import { IntelligentPromptBuilder } from '@/ai/core/intelligent-prompt-builder';

import { GenerateProposalInputSchema, ProjectProposalSchema } from '@/ai/schemas';

import { zodToJsonSchema } from 'zod-to-json-schema';

import { z } from 'zod';
// Mock function for testing environment
const createMockPrompt = (config: any) => {
  return async (input: any) => {
    // Mock implementation for testing
    return { output: {} };
  };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
  ? { definePrompt: createMockPrompt }
  : require('@/ai/genkit').ai;

const jsonSchema = zodToJsonSchema(ProjectProposalSchema, "ProjectProposal");
const schemaString = JSON.stringify(jsonSchema, null, 2);

export const generateProposalPrompt = ai.definePrompt(
  {
    name: 'generateProposalPrompt',
    input: { schema: GenerateProposalInputSchema },
    output: { schema: z.any() },
    model: defaultModel || 'googleai/gemini-2.0-flash',
    system: async (input: any) => {
      // محاولة استخدام النظام الذكي المحسن
      try {
        // تحليل السياق الذكي
        const contextAnalysis = await ContextAnalyzer.analyzeContext({
          userInput: input.projectIdea || '',
          externalContext: input.externalContext,
          guidelines: input.guidelines,
        });

        // اختيار النموذج المناسب
        const modelConfig = AdaptiveModelSelector.selectOptimalModel(
          contextAnalysis,
          'generation'
        );

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
2. **الاستنتاج والتوسع**: حتى لو قدم المستخدم فكرة بسيطة، استخدم خبرتك لاستنتاج وتطوير جميع مكونات المقترح المهني:
   - **الهدف**: ما هو الهدف الأساسي؟
   - **النطاق**: ما هو داخل وخارج النطاق؟
   - **المنهجية**: ما النهج المناسب (مثل Agile، Waterfall)؟
   - **الجدول الزمني**: جدول زمني واقعي ومرحلي
   - **الميزانية**: ميزانية معقولة ومفصلة
   - **أصحاب المصلحة**: الأدوار المحتملة المشاركة
   - **المخاطر**: التحديات المحتملة وكيفية التعامل معها
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
- يجب أن يكون الإخراج النهائي عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي أو شرح أو تعليقات أو رموز برمجية أو علامات HTML أو Markdown.
- إذا لم تتمكن من توليد كائن JSON صالح لأي سبب، أعد محاولة التوليد أو أعد صياغة الحقول بحيث تكون جميع القيم نصية وصالحة لـ JSON.
- لا تضع أي نص خارج كائن JSON النهائي.
`;

      } catch (enhancedError) {
        console.warn('⚠️ فشل النظام المحسن في الـ prompt، استخدام النظام الأساسي:', enhancedError);

        // النظام الأساسي
        return `أنت خبير في إدارة المشاريع والكتابة التقنية. مهمتك هي إنتاج مقترح مشروع شامل ومهني بناءً على الفكرة والسياق المقدم.

**عملية التفكير المطلوبة:**
1. **تحليل الفكرة الأساسية**: حلل فكرة المشروع بعمق لفهم الغرض والنطاق الأساسي.
2. **الاستنتاج والتوسع**: حتى لو قدم المستخدم فكرة بسيطة، استخدم خبرتك لاستنتاج وتطوير جميع مكونات المقترح المهني:
   - **الهدف**: ما هو الهدف الأساسي؟
   - **النطاق**: ما هو داخل وخارج النطاق؟
   - **المنهجية**: ما النهج المناسب (مثل Agile، Waterfall)؟
   - **الجدول الزمني**: جدول زمني واقعي ومرحلي
   - **الميزانية**: ميزانية معقولة ومفصلة
   - **أصحاب المصلحة**: الأدوار المحتملة المشاركة
   - **المخاطر**: التحديات المحتملة وكيفية التعامل معها
3. **إنتاج جميع الأقسام**: املأ **كل حقل** في مخطط JSON بمحتوى مكتوب جيداً ومهني.

--- مخطط المخرجات ---
يجب أن تكون استجابتك بالكامل عبارة عن كائن JSON صالح واحد يلتزم بهذا المخطط:
${schemaString}
---
ملاحظة هامة:
- يجب أن يكون الإخراج النهائي عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي أو شرح أو تعليقات أو رموز برمجية أو علامات HTML أو Markdown.
- إذا لم تتمكن من توليد كائن JSON صالح لأي سبب، أعد محاولة التوليد أو أعد صياغة الحقول بحيث تكون جميع القيم نصية وصالحة لـ JSON.
- لا تضع أي نص خارج كائن JSON النهائي.
`;
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





