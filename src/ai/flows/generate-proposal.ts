// f:\arkan\src\ai\flows\generate-proposal.ts

'use server';

/**
 * @fileOverview محرك ذكي لتوليد مقترحات المشاريع المفصلة
 * يستخدم النظام المحسن للتحليل الذكي والتحسين التكراري
 */

import { AdaptiveModelSelector } from '@/ai/core/adaptive-model-selector';
import { ContextAnalyzer } from '@/ai/core/context-analyzer';
import { IterativeImprovementEngine } from '@/ai/core/iterative-improvement-engine';
import { OutputQualityValidator } from '@/ai/core/output-quality-validator';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GenerateProposalInputSchema, ProjectProposalSchema, type GenerateProposalInput, type ProjectProposal } from '@/ai/schemas';

const PromptInputSchema = z.object({
  projectIdea: z.string(),
  guidelines: z.array(z.string()).optional(),
  textContext: z.array(z.object({ fileName: z.string(), content: z.string() })).optional(),
  mediaContext: z.array(z.object({ fileName: z.string(), content: z.string() })).optional(),
});

const jsonSchema = zodToJsonSchema(ProjectProposalSchema, "ProjectProposal");
const schemaString = JSON.stringify(jsonSchema, null, 2);

  export const generateProposalPrompt = ai.definePrompt(
    {
      name: 'generateProposalPrompt',
      input: { schema: PromptInputSchema },
      output: { schema: ProjectProposalSchema },
      model: 'googleai/gemini-1.5-flash',
      system: `You are an expert project manager and technical writer. Your task is to generate a comprehensive and professional project proposal based on the provided idea and context.
Your entire response must be a valid JSON object that adheres to the provided output schema.
For all string fields in the schema, you MUST use well-formed markdown syntax. This includes properly formatted lists, bold text, etc., where appropriate.
The 'description' fields in the JSON schema below are your primary instructions for what to generate for each property.

--- OUTPUT SCHEMA ---
${schemaString}
---`,
      prompt: `
{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if textContext}}
--- IMPORTANT CONTEXT ---
Use the following text as the primary source of truth and context for generating the proposal.
{{#each textContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if mediaContext}}
--- IMPORTANT MEDIA CONTEXT ---
Analyze the following files as the primary source of truth and context.
{{#each mediaContext}}
File: {{this.fileName}}
{{media url=this.content}}
---
{{/each}}
{{/if}}

--- Main Input: Project Idea ---
{{{projectIdea}}}
`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    },
  );

export const generateProposal = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input): Promise<ProjectProposal> => {
    const { projectIdea, guidelines, externalContext } = input;

<<<<<<< HEAD
    const textContext = externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const { output } = await generateProposalPrompt({
      projectIdea,
      guidelines,
      textContext,
      mediaContext,
    });
=======
    try {
      console.log('🚀 بدء توليد المقترح بالنظام المحسن...');

      // محاولة استخدام النظام الذكي المحسن
      try {
        console.log('🧠 محاولة استخدام النظام الذكي المحسن...');
>>>>>>> 8d4968ff (🎉 تم إنجاز المشروع بنجاح كامل!)

        // 1. تحليل السياق الذكي
        console.log('📊 تحليل السياق...');
        const contextAnalysis = await ContextAnalyzer.analyzeContext({
          userInput: projectIdea || '',
          externalContext,
          guidelines,
        });

        console.log(`✅ تم تحليل السياق: نوع المحتوى = ${contextAnalysis.contentType}, التعقيد = ${contextAnalysis.complexityLevel}`);

        // 2. اختيار النموذج المناسب
        const modelConfig = AdaptiveModelSelector.selectOptimalModel(
          contextAnalysis,
          'generation'
        );

        console.log(`🤖 تم اختيار النموذج: ${modelConfig.modelId} (${modelConfig.reasoning})`);

        // 3. التوليد الأولي
        console.log('⚡ بدء التوليد الأولي...');
        const { output: initialOutput } = await generateProposalPrompt({
          projectIdea,
          guidelines,
          externalContext,
          advancedFields,
          jsonStructure,
        });

        if (!initialOutput) {
          throw new Error("فشل في توليد المقترح. قد يحتاج الذكاء الاصطناعي لمزيد من السياق.");
        }

        // 4. تقييم الجودة
        console.log('🔍 تقييم جودة المخرجات...');
        const validation = await OutputQualityValidator.validateOutput(
          JSON.stringify(initialOutput),
          projectIdea || '',
          contextAnalysis
        );

        console.log(`📈 نقاط الجودة: ${validation.metrics.overall}/100`);

        // 5. التحسين التكراري إذا لزم الأمر (مبسط)
        let finalOutput = initialOutput;

        if (validation.needsImprovement && validation.metrics.overall < 85) {
          console.log('🔄 بدء التحسين التكراري...');

          const improvementSession = await IterativeImprovementEngine.runImprovementSession(
            projectIdea || '',
            'generation',
            'project-proposals',
            externalContext,
            {
              maxIterations: 2,
              qualityThreshold: 85,
              improvementStrategy: 'balanced',
              allowModelSwitching: true
            }
          );

          if (improvementSession.status === 'completed') {
            const bestResult = IterativeImprovementEngine.getBestOutput(improvementSession);
            console.log(`✨ تم التحسين! النقاط النهائية: ${bestResult.qualityScore}/100`);

            // محاولة تحويل النتيجة المحسنة إلى JSON
            try {
              finalOutput = JSON.parse(bestResult.output);
            } catch (parseError) {
              console.warn('⚠️ فشل في تحويل المخرجات المحسنة إلى JSON، استخدام المخرجات الأولية');
              finalOutput = initialOutput;
            }
          } else {
            console.log('⚠️ لم يتم التحسين بنجاح، استخدام المخرجات الأولية');
          }
        } else {
          console.log('✅ جودة المخرجات مقبولة، لا حاجة للتحسين');
        }

        // 6. التحقق النهائي من صحة البيانات
        if (typeof finalOutput !== 'object' || finalOutput === null) {
          throw new Error("المخرجات النهائية ليست في التنسيق الصحيح");
        }

        console.log('🎉 تم إنتاج المقترح بنجاح بالنظام المحسن!');
        return finalOutput;

      } catch (enhancedError) {
        console.warn('⚠️ فشل النظام المحسن، التبديل للنظام الأساسي:', enhancedError);

        // التبديل للنظام الأساسي
        console.log('🔄 استخدام النظام الأساسي...');
        const { output: basicOutput } = await generateProposalPrompt({
          projectIdea,
          guidelines,
          externalContext,
          advancedFields,
          jsonStructure,
        });

        if (!basicOutput) {
          throw new Error("فشل في توليد المقترح حتى بالنظام الأساسي.");
        }

        console.log('✅ تم إنتاج المقترح بالنظام الأساسي');
        return basicOutput;
      }

    } catch (error) {
      console.error('❌ خطأ في توليد المقترح:', error);

      // محاولة التوليد البسيط كخطة احتياطية
      console.log('🔄 محاولة التوليد البسيط كخطة احتياطية...');
      try {
        const { output: fallbackOutput } = await generateProposalPrompt({
          projectIdea,
          guidelines,
          externalContext,
          advancedFields,
          jsonStructure,
        });

        if (fallbackOutput) {
          console.log('✅ نجح التوليد الاحتياطي');
          return fallbackOutput;
        }
      } catch (fallbackError) {
        console.error('❌ فشل التوليد الاحتياطي أيضاً:', fallbackError);
      }

      throw new Error(`فشل في توليد المقترح: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }
);
