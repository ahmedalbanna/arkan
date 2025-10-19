
// src/ai/prompts/generate-proposal.ts
'use server';

/**
 * @fileOverview نظام المطالبة المحسن لتوليد المقترحات
 * يستخدم النظام الذكي الجديد في بناء المطالبات
 */

import { defaultModel } from '@/ai/config/models';
import { ContextAnalyzer } from '@/ai/core/context-analyzer';
import { AdaptiveModelSelector } from '@/ai/core/adaptive-model-selector';
import { IntelligentPromptBuilder } from '@/ai/core/intelligent-prompt-builder';
import { ai } from '@/ai/genkit';
import { GenerateProposalInputSchema } from '@/ai/schemas';
import { z } from 'genkit';

export const generateProposalPrompt = ai.definePrompt(
  {
    name: 'generateProposalPrompt',
    input: { schema: GenerateProposalInputSchema },
    output: { schema: z.any() },
    model: defaultModel || 'googleai/gemini-2.0-flash',
    system: async (input) => {
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

        // بناء المطالبة الذكية
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

${promptTemplate.context}

${promptTemplate.instructions}

${promptTemplate.constraints}

${promptTemplate.outputFormat}

---
ملاحظة هامة:
- يجب أن يكون الإخراج النهائي عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي أو شرح أو تعليقات أو رموز برمجية أو علامات HTML أو Markdown.
- إذا لم تتمكن من توليد كائن JSON صالح لأي سبب، أعد محاولة التوليد أو أعد صياغة الحقول بحيث تكون جميع القيم نصية وصالحة لـ JSON.
- لا تضع أي نص خارج كائن JSON النهائي.
`;

      } catch (error) {
        console.warn('⚠️ فشل النظام المحسن، استخدام النظام الأساسي:', error);

        // النظام الأساسي المبسط
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

---
ملاحظة هامة:
- يجب أن يكون الإخراج النهائي عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي أو شرح أو تعليقات أو رموز برمجية أو علامات HTML أو Markdown.
- إذا لم تتمكن من توليد كائن JSON صالح لأي سبب، أعد محاولة التوليد أو أعد صياغة الحقول بحيث تكون جميع القيم نصية وصالحة لـ JSON.
- لا تضع أي نص خارج كائن JSON النهائي.
`;
      }
    },
    prompt: `بناءً على المعلومات المقدمة، قم بتوليد مقترح مشروع شامل ومهني.`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  },
);





