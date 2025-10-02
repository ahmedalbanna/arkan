

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import {
  AdaptiveModelSelector,
  ContextAnalyzer,
  IntelligentPromptBuilder,
  IterativeImprovementEngine,
  OutputQualityValidator,
  PerformanceMonitor
} from '@/ai/core';
import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/types';
import { z } from 'genkit';

// Define a specific schema for the prompt's input variables for better type safety and clarity.
const ReportSectionPromptInputSchema = GenerateSectionInputSchema.and(
  z.object({
    stringifiedProposal: z.string(),
    stringifiedPlan: z.string(),
  })
);

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
  const { sectionToGenerate } = input;
  const agentId = `generate-${sectionToGenerate}-section`;

  // بدء مراقبة الأداء
  const performanceSessionId = PerformanceMonitor.startSession({
    taskType: 'generation',
    domain: 'report-sections',
    userInput: `Generate ${sectionToGenerate} section`
  });

  try {
    console.log(`🚀 بدء توليد قسم التقرير الذكي: ${sectionToGenerate}`);

    const agent = await getAgent(agentId);
    if (!agent) {
      const error = `Agent configuration not found for ID: '${agentId}'`;
      PerformanceMonitor.recordError(performanceSessionId, error);
      console.error(error);
      throw new Error(`Configuration for the report section '${sectionToGenerate}' is missing or invalid.`);
    }

    // 1. تحليل السياق الذكي
    console.log('📊 تحليل السياق...');
    const contextStart = Date.now();

    // تحضير السياق الخارجي للتحليل
    const externalContext = [];

    if (input.proposal) {
      externalContext.push({
        fileName: "project-proposal.json",
        content: JSON.stringify(input.proposal, null, 2),
        type: "context"
      });
    }

    if (input.projectPlan) {
      externalContext.push({
        fileName: "project-plan.json",
        content: JSON.stringify(input.projectPlan, null, 2),
        type: "context"
      });
    }

    if (input.otherSections) {
      Object.entries(input.otherSections).forEach(([key, content]) => {
        externalContext.push({
          fileName: `section-${key}.md`,
          content: content as string,
          type: "context"
        });
      });
    }

    if (input.contextFiles) {
      input.contextFiles.forEach(file => {
        externalContext.push({
          fileName: file.fileName,
          content: file.content,
          type: "context"
        });
      });
    }

    if (input.exampleFiles) {
      input.exampleFiles.forEach(file => {
        externalContext.push({
          fileName: file.fileName,
          content: file.content,
          type: "example"
        });
      });
    }

    // تحليل السياق
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
      userInput: `Generate ${sectionToGenerate} section for project report`,
      externalContext,
      guidelines: input.guidelines || []
    });

    const contextTime = Date.now() - contextStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'contextAnalysisTime', contextTime);

    console.log(`✅ تم تحليل السياق: نوع المحتوى = ${contextAnalysis.contentType}, التعقيد = ${contextAnalysis.complexityLevel}`);

    // 2. اختيار النموذج المناسب
    console.log('🤖 اختيار النموذج المناسب...');
    const modelStart = Date.now();

    const modelConfig = AdaptiveModelSelector.selectOptimalModel(
      contextAnalysis,
      'generation',
      {
        taskType: 'generation',
        accuracyRequirement: 'high', // تقارير تحتاج دقة عالية
        outputLength: 'long' // أقسام التقارير عادة طويلة
      }
    );

    const modelTime = Date.now() - modelStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'modelSelectionTime', modelTime);

    console.log(`🤖 تم اختيار النموذج: ${modelConfig.modelId} (${modelConfig.reasoning})`);

    // 3. بناء الـ prompt الذكي
    console.log('⚡ بناء الـ prompt الذكي...');
    const promptStart = Date.now();

    const agentPrompt = agent.prompt as AgentPrompt;
    const baseSystemPrompt = `${agentPrompt.base}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

    const promptTemplate = IntelligentPromptBuilder.buildPrompt({
      taskType: 'generation',
      domain: 'report-sections',
      contextAnalysis,
      userInput: `Generate ${sectionToGenerate} section`,
      externalContext
    });

    // دمج الـ prompt الذكي مع الـ prompt الأساسي
    const enhancedSystemPrompt = `${baseSystemPrompt}

${promptTemplate.system}

**مهمتك المحددة:**
أنت خبير في كتابة التقارير المهنية. مهمتك هي إنتاج قسم "${sectionToGenerate}" شامل ومهني للتقرير.

**عملية التفكير المطلوبة:**
1. **تحليل السياق المتاح**: راجع جميع الوثائق والأقسام المتاحة
2. **تحديد المعلومات ذات الصلة**: استخرج المعلومات الأكثر صلة بالقسم المطلوب
3. **التركيب والتكامل**: ادمج المعلومات في سرد متماسك ومنطقي
4. **التأكد من الاكتمال**: تأكد من تغطية جميع النقاط المهمة للقسم

${promptTemplate.context}

${promptTemplate.instructions}

${promptTemplate.constraints}`;

    const reportSectionPrompt = ai.definePrompt({
      name: 'generateReportSectionPrompt',
      input: { schema: ReportSectionPromptInputSchema },
      output: { schema: GenerateSectionOutputSchema },
      model: modelConfig.modelId,
      system: enhancedSystemPrompt,
      prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---
{{{instructionText}}}
{{/if}}

--- AVAILABLE CONTEXT FROM PROJECT ---
You have access to the following documents. Review them and use the most relevant information to generate the requested section.

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
{{{stringifiedProposal}}}
\`\`\`
{{else}}
(No project proposal is being used for this generation. Rely on other provided context.)
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
\`\`\`json
{{{stringifiedPlan}}}
\`\`\`
{{/if}}

{{#if otherSections}}
--- Other Report Sections ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if exampleFiles}}
--- IMPORTANT EXAMPLES (STYLE REFERENCE) ---
You MUST heavily reference the following content for style, tone, and structure.
{{#each exampleFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if contextFiles}}
--- FACTUAL CONTEXT ---
Use the following content for information and data.
{{#each contextFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

${promptTemplate.outputFormat}
`,
      config: {
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.maxOutputTokens,
        topP: modelConfig.topP,
        topK: modelConfig.topK
      },
    });

    const promptTime = Date.now() - promptStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'promptBuildingTime', promptTime);

    // 4. التوليد الأولي
    console.log('⚡ بدء التوليد الأولي...');
    const generationStart = Date.now();

    const promptVariables = {
      ...input,
      stringifiedProposal: input.proposal ? JSON.stringify(input.proposal, null, 2) : '',
      stringifiedPlan: input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '',
    };

    const { output: initialOutput } = await reportSectionPrompt(promptVariables);

    if (!initialOutput) {
      const error = `AI failed to generate content for section: ${sectionToGenerate}`;
      PerformanceMonitor.recordError(performanceSessionId, error);
      throw new Error(`The AI failed to generate a response for the '${sectionToGenerate}' section. Please try again.`);
    }

    const generationTime = Date.now() - generationStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'generationTime', generationTime);

    // 5. تقييم الجودة
    console.log('🔍 تقييم جودة المخرجات...');
    const validationStart = Date.now();

    const validation = await OutputQualityValidator.validateOutput(
      JSON.stringify(initialOutput),
      `Generate ${sectionToGenerate} section`,
      contextAnalysis
    );

    const validationTime = Date.now() - validationStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'qualityValidationTime', validationTime);

    console.log(`📈 نقاط الجودة: ${validation.metrics.overall}/100`);

    // 6. التحسين التكراري إذا لزم الأمر
    let finalOutput = initialOutput;

    if (validation.needsImprovement && validation.metrics.overall < 80) {
      console.log('🔄 بدء التحسين التكراري...');

      const improvementStart = Date.now();

      try {
        const improvementSession = await IterativeImprovementEngine.runImprovementSession(
          `Generate ${sectionToGenerate} section`,
          'generation',
          'report-sections',
          externalContext,
          {
            maxIterations: 2,
            qualityThreshold: 80,
            improvementStrategy: 'balanced',
            allowModelSwitching: false // نبقي نفس النموذج للتقارير
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
        }

        const improvementTime = Date.now() - improvementStart;
        PerformanceMonitor.recordPhaseTime(performanceSessionId, 'iterativeImprovementTime', improvementTime);

      } catch (improvementError) {
        console.warn('⚠️ فشل التحسين التكراري، استخدام المخرجات الأولية:', improvementError);
        finalOutput = initialOutput;
      }
    } else {
      console.log('✅ جودة المخرجات مقبولة، لا حاجة للتحسين');
    }

    // تسجيل مقاييس الجودة النهائية
    PerformanceMonitor.recordQualityMetrics(performanceSessionId, {
      qualityScore: validation.metrics.overall,
      improvementIterations: validation.needsImprovement ? 1 : 0,
      finalAccuracy: validation.metrics.overall
    });

    // إنهاء مراقبة الأداء بنجاح
    PerformanceMonitor.endSession(performanceSessionId, true);

    console.log(`🎉 تم إنتاج قسم "${sectionToGenerate}" بنجاح!`);
    return finalOutput;

  } catch (error) {
    // تسجيل الخطأ في مراقب الأداء
    PerformanceMonitor.recordError(performanceSessionId, error instanceof Error ? error.message : 'خطأ غير معروف');
    PerformanceMonitor.endSession(performanceSessionId, false);

    console.error(`❌ خطأ في توليد قسم التقرير ${sectionToGenerate}:`, error);

    // محاولة التوليد البسيط كخطة احتياطية
    console.log('🔄 محاولة التوليد البسيط كخطة احتياطية...');
    PerformanceMonitor.recordFallbackUsage(performanceSessionId);

    try {
      const agent = await getAgent(agentId);
      if (!agent) {
        throw new Error(`Configuration for the report section '${sectionToGenerate}' is missing or invalid.`);
      }

      const agentPrompt = agent.prompt as AgentPrompt;
      const systemPrompt = `${agentPrompt.base}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

      const fallbackPrompt = ai.definePrompt({
        name: 'generateReportSectionFallbackPrompt',
        input: { schema: ReportSectionPromptInputSchema },
        output: { schema: GenerateSectionOutputSchema },
        model: agent.model || 'googleai/gemini-2.0-flash',
        system: systemPrompt,
        prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---
{{{instructionText}}}
{{/if}}

--- AVAILABLE CONTEXT FROM PROJECT ---
You have access to the following documents. Review them and use the most relevant information to generate the requested section.

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
{{{stringifiedProposal}}}
\`\`\`
{{else}}
(No project proposal is being used for this generation. Rely on other provided context.)
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
\`\`\`json
{{{stringifiedPlan}}}
\`\`\`
{{/if}}

{{#if otherSections}}
--- Other Report Sections ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if contextFiles}}
--- FACTUAL CONTEXT ---
Use the following content for information and data.
{{#each contextFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}
`,
        config: {
          temperature: 0.3,
        },
      });

      const promptVariables = {
        ...input,
        stringifiedProposal: input.proposal ? JSON.stringify(input.proposal, null, 2) : '',
        stringifiedPlan: input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '',
      };

      const { output: fallbackOutput } = await fallbackPrompt(promptVariables);

      if (fallbackOutput) {
        console.log('✅ نجح التوليد الاحتياطي');
        return fallbackOutput;
      }
    } catch (fallbackError) {
      console.error('❌ فشل التوليد الاحتياطي أيضاً:', fallbackError);
    }

    throw error;
  }
}
