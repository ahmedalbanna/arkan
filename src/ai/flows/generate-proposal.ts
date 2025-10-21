'use server';

/**
 * @fileOverview محرك ذكي ومحسن لتوليد مقترحات المشاريع المفصلة
 * يستخدم النظام الجديد منطقًا مبسطًا للتحسين التكراري والتعافي من الأخطاء.
 */

import { AdaptiveModelSelector } from '@/ai/core/adaptive-model-selector';
import { ContextAnalyzer } from '@/ai/core/context-analyzer';
import { IterativeImprovementEngine } from '@/ai/core/iterative-improvement-engine';
import { OutputQualityValidator } from '@/ai/core/output-quality-validator';
import { ai } from '@/ai/genkit';
import { generateProposalPrompt } from '@/ai/prompts/generate-proposal';
import { AnyProjectProposal, GenerateProposalInputSchema } from '@/ai/schemas';
import { z } from 'genkit';

async function runBasicGeneration(input: z.infer<typeof GenerateProposalInputSchema>): Promise<AnyProjectProposal> {
  console.log('🔄 استخدام النظام الأساسي للتوليد...');
  const { output } = await generateProposalPrompt({
    ...input,
    useEnhancedSystem: false //  استخدام النظام الأساسي في الـ prompt
  });
  if (!output) {
    throw new Error("فشل في توليد المقترح حتى بالنظام الأساسي.");
  }
  console.log('✅ تم إنتاج المقترح بالنظام الأساسي');
  return output;
}

export const generateProposal = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: z.any(),
  },
  async (input): Promise<AnyProjectProposal> => {
    const { projectIdea, externalContext, guidelines } = input;
    let initialOutput: AnyProjectProposal;

    try {
      // 1. التوليد الأولي باستخدام النظام المحسن
      console.log('🚀 بدء التوليد الأولي بالنظام المحسن...');
      const { output } = await generateProposalPrompt({ 
        ...input, 
        useEnhancedSystem: true // تفعيل النظام المحسن في الـ prompt
      });

      if (!output) {
        throw new Error("فشل التوليد الأولي في إنتاج مخرجات.");
      }
      initialOutput = output;
      console.log('✅ نجح التوليد الأولي.');

      // 2. تحليل السياق وتقييم الجودة
      console.log('📊 تحليل السياق لتقييم الجودة...');
      const contextAnalysis = await ContextAnalyzer.analyzeContext({
        userInput: projectIdea || '',
        externalContext,
        guidelines,
      });

      console.log('🔍 تقييم جودة المخرجات الأولية...');
      const validation = await OutputQualityValidator.validateOutput(
        JSON.stringify(initialOutput),
        projectIdea || '',
        contextAnalysis
      );
      console.log(`📈 نقاط الجودة الأولية: ${validation.metrics.overall}/100`);

      // 3. التحسين التكراري إذا لزم الأمر
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
          try {
            const improvedOutput = JSON.parse(bestResult.output);
            console.log('🎉 تم اعتماد المخرجات المحسنة.');
            return improvedOutput;
          } catch (parseError) {
            console.warn('⚠️ فشل في تحليل المخرجات المحسنة، سيتم استخدام النتيجة الأولية.');
          }
        } else {
          console.log('⚠️ لم يكتمل التحسين بنجاح، سيتم استخدام النتيجة الأولية.');
        }
      } else {
        console.log('✅ جودة المخرجات مقبولة، لا حاجة للتحسين.');
      }

      return initialOutput;

    } catch (error) {
      console.error('❌ حدث خطأ أثناء عملية التوليد المحسنة:', error);
      // في حالة فشل أي خطوة في النظام المحسن، نلجأ للنظام الأساسي
      return await runBasicGeneration(input);
    }
  }
);