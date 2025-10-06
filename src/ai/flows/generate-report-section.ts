

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import {
  ContextAnalyzer,
  IterativeImprovementEngine,
  OutputQualityValidator,
  PerformanceMonitor
} from '@/ai/core';
import { ai } from '@/ai/genkit';
import { createIntelligentSectionPrompt, getSectionQualityRequirements } from '@/ai/prompts/section-specific-prompts';
import type { SectionName } from '@/ai/schemas';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { objectToMarkdown, projectPlanToMarkdown, proposalToMarkdown } from '@/lib/utils/proposal-to-markdown';
import { z } from 'genkit';

// Define a specific schema for the prompt's input variables for better type safety and clarity.
const ReportSectionPromptInputSchema = GenerateSectionInputSchema.and(
  z.object({
    stringifiedProposal: z.string(),
    stringifiedPlan: z.string(),
  })
);

/**
 * دالة مساعدة لتحويل المحتوى إلى Markdown إذا كان JSON
 * @param content المحتوى المراد معالجته
 * @param title العنوان للـ Markdown
 * @param options خيارات التحويل
 * @returns المحتوى المعالج
 */
function processContentToMarkdown(
  content: string,
  title: string,
  options: {
    maxDepth?: number;
    arrayLimit?: number;
    includeEmpty?: boolean;
    contentType?: 'section' | 'file' | 'example' | 'diagram';
  } = {}
): string {
  try {
    // إذا كان المحتوى يبدو كـ JSON، نحاول تحويله إلى Markdown
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      const parsedContent = JSON.parse(content);

      // تحديد خيارات التحويل حسب نوع المحتوى
      const defaultOptions = {
        maxDepth: options.maxDepth || 3,
        arrayLimit: options.arrayLimit || 10,
        includeEmpty: options.includeEmpty || false
      };

      // تخصيص الخيارات حسب نوع المحتوى
      switch (options.contentType) {
        case 'section':
          defaultOptions.maxDepth = 3;
          defaultOptions.arrayLimit = 10;
          break;
        case 'file':
          defaultOptions.maxDepth = 4;
          defaultOptions.arrayLimit = 15;
          break;
        case 'example':
          defaultOptions.maxDepth = 3;
          defaultOptions.arrayLimit = 8;
          break;
        case 'diagram':
          defaultOptions.maxDepth = 2;
          defaultOptions.arrayLimit = 5;
          break;
      }

      return objectToMarkdown(parsedContent, title, defaultOptions);
    }
  } catch (e) {
    // إذا فشل التحليل، نستخدم المحتوى كما هو
    console.log(`⚠️ فشل في تحليل JSON للمحتوى "${title}":`, e);
  }

  return content;
}

/**
 * دالة مساعدة لتحسين معالجة أنواع مختلفة من المحتوى
 * @param content المحتوى الأصلي
 * @param fileName اسم الملف أو المعرف
 * @param contentType نوع المحتوى
 * @returns المحتوى المعالج مع معلومات إضافية
 */
function enhanceContentProcessing(
  content: string,
  fileName: string,
  contentType: 'section' | 'file' | 'example' | 'diagram'
): { fileName: string; content: string; type: string } {
  const processedContent = processContentToMarkdown(content, fileName, {
    contentType,
    maxDepth: contentType === 'file' ? 4 : contentType === 'diagram' ? 2 : 3,
    arrayLimit: contentType === 'file' ? 15 : contentType === 'example' ? 8 : contentType === 'diagram' ? 5 : 10,
    includeEmpty: false
  });

  // تحديد نوع الملف بناءً على المحتوى المعالج
  const fileExtension = processedContent !== content ? '.md' :
    contentType === 'diagram' ? '.puml' : '.txt';

  return {
    fileName: `${fileName}${fileExtension}`,
    content: processedContent,
    type: contentType === 'example' ? 'example' : 'context'
  };
}

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
  const { sectionToGenerate } = input;
  const sectionName = sectionToGenerate as SectionName;

  // بدء مراقبة الأداء
  const performanceSessionId = PerformanceMonitor.startSession({
    taskType: 'generation',
    domain: 'report-sections',
    userInput: `Generate ${sectionToGenerate} section using intelligent templates`
  });

  try {
    console.log(`🚀 بدء توليد قسم التقرير الذكي: ${sectionToGenerate}`);

    // 1. تحليل السياق الذكي
    console.log('📊 تحليل السياق...');
    const contextStart = Date.now();

    // تحضير السياق الخارجي للتحليل
    const externalContext = [];

    if (input.proposal) {
      const proposalMarkdown = proposalToMarkdown(input.proposal);
      externalContext.push({
        fileName: "project-proposal.md",
        content: proposalMarkdown,
        type: "context"
      });
    }

    if (input.projectPlan) {
      const planMarkdown = projectPlanToMarkdown(input.projectPlan);
      externalContext.push({
        fileName: "project-plan.md",
        content: planMarkdown,
        type: "context"
      });
    }

    if (input.otherSections) {
      Object.entries(input.otherSections).forEach(([key, content]) => {
        if (content && typeof content === 'string') {
          const processed = enhanceContentProcessing(content, `section-${key}`, 'section');
          externalContext.push(processed);
        }
      });
    }

    if (input.contextFiles) {
      input.contextFiles.forEach(file => {
        if (file.content && typeof file.content === 'string') {
          const processed = enhanceContentProcessing(file.content, file.fileName.replace(/\.[^/.]+$/, ""), 'file');
          externalContext.push(processed);
        }
      });
    }

    if (input.exampleFiles) {
      input.exampleFiles.forEach(file => {
        if (file.content && typeof file.content === 'string') {
          const processed = enhanceContentProcessing(file.content, file.fileName.replace(/\.[^/.]+$/, ""), 'example');
          externalContext.push(processed);
        }
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

    // 2. إنشاء القالب الذكي المتخصص
    console.log('🎯 إنشاء القالب الذكي المتخصص...');
    const templateStart = Date.now();

    const intelligentTemplate = await createIntelligentSectionPrompt(sectionName, {
      sectionType: sectionName,
      projectData: {
        proposal: input.proposal,
        projectPlan: input.projectPlan,
        otherSections: input.otherSections
      },
      contextData: externalContext,
      existingSections: input.otherSections as Record<string, string> | undefined,
      guidelines: input.guidelines,
      specificRequirements: input.guidelines
    });

    const templateTime = Date.now() - templateStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'promptBuildingTime', templateTime);

    console.log(`🎯 تم إنشاء القالب الذكي: ${intelligentTemplate.modelConfig.modelId}`);

    // 3. اختيار النموذج المناسب (استخدام النموذج من القالب الذكي)
    console.log('🤖 استخدام النموذج المختار من القالب الذكي...');
    const modelConfig = intelligentTemplate.modelConfig;

    console.log(`🤖 النموذج المختار: ${modelConfig.modelId} (${modelConfig.reasoning || 'من القالب الذكي'})`);

    // 4. بناء الـ prompt المحسن
    console.log('⚡ بناء الـ prompt المحسن...');
    const promptStart = Date.now();

    const reportSectionPrompt = ai.definePrompt({
      name: 'generateReportSectionPrompt',
      input: { schema: ReportSectionPromptInputSchema },
      output: { schema: GenerateSectionOutputSchema },
      model: modelConfig.modelId,
      system: intelligentTemplate.systemPrompt,
      prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

${intelligentTemplate.userPrompt}

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
{{{stringifiedProposal}}}
{{else}}
(No project proposal is being used for this generation. Rely on other provided context.)
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
{{{stringifiedPlan}}}
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

**Quality Focus Areas:**
${intelligentTemplate.qualityFocus.map(focus => `- ${focus}`).join('\n')}

**Specific Instructions:**
${intelligentTemplate.specificInstructions.map(instruction => `- ${instruction}`).join('\n')}
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

    // 5. التوليد الأولي
    console.log('⚡ بدء التوليد الأولي...');
    const generationStart = Date.now();

    const promptVariables = {
      ...input,
      stringifiedProposal: input.proposal ? proposalToMarkdown(input.proposal) : '',
      stringifiedPlan: input.projectPlan ? projectPlanToMarkdown(input.projectPlan) : '',
    };

    const { output: initialOutput } = await reportSectionPrompt(promptVariables);

    if (!initialOutput) {
      const error = `AI failed to generate content for section: ${sectionToGenerate}`;
      PerformanceMonitor.recordError(performanceSessionId, error);
      throw new Error(`The AI failed to generate a response for the '${sectionToGenerate}' section. Please try again.`);
    }

    const generationTime = Date.now() - generationStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'generationTime', generationTime);

    // 6. تقييم الجودة باستخدام معايير القسم المحدد
    console.log('🔍 تقييم جودة المخرجات باستخدام معايير القسم...');
    const validationStart = Date.now();

    const validation = await OutputQualityValidator.validateOutput(
      JSON.stringify(initialOutput),
      `Generate ${sectionToGenerate} section`,
      contextAnalysis,
      intelligentTemplate.qualityFocus // استخدام معايير الجودة المحددة للقسم
    );

    const validationTime = Date.now() - validationStart;
    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'qualityValidationTime', validationTime);

    console.log(`📈 نقاط الجودة: ${validation.metrics.overall}/100`);

    // 7. التحسين التكراري إذا لزم الأمر
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
            allowModelSwitching: false, // نبقي نفس النموذج للتقارير
            // استخدام معايير الجودة المحددة (إذا كان مدعوماً)
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

    console.log(`🎉 تم إنتاج قسم "${sectionToGenerate}" بنجاح باستخدام القالب الذكي!`);
    return finalOutput;

  } catch (error) {
    // تسجيل الخطأ في مراقب الأداء
    PerformanceMonitor.recordError(performanceSessionId, error instanceof Error ? error.message : 'خطأ غير معروف');
    PerformanceMonitor.endSession(performanceSessionId, false);

    console.error(`❌ خطأ في توليد قسم التقرير ${sectionToGenerate}:`, error);

    // محاولة التوليد البسيط كخطة احتياطية باستخدام القالب الذكي
    console.log('🔄 محاولة التوليد البسيط كخطة احتياطية...');
    PerformanceMonitor.recordFallbackUsage(performanceSessionId);

    try {
      const sectionName = sectionToGenerate as SectionName;
      const qualityRequirements = getSectionQualityRequirements(sectionName);

      const fallbackPrompt = ai.definePrompt({
        name: 'generateReportSectionFallbackPrompt',
        input: { schema: ReportSectionPromptInputSchema },
        output: { schema: GenerateSectionOutputSchema },
        model: 'googleai/gemini-2.0-flash',
        system: qualityRequirements.systemPrompt,
        prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

${qualityRequirements.userPrompt}

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
{{{stringifiedProposal}}}
{{else}}
(No project proposal is being used for this generation. Rely on other provided context.)
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
{{{stringifiedPlan}}}
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

**Quality Focus Areas:**
${qualityRequirements.qualityFocus.map(focus => `- ${focus}`).join('\n')}

**Specific Instructions:**
${qualityRequirements.specificInstructions.map(instruction => `- ${instruction}`).join('\n')}
`,
        config: {
          temperature: 0.3,
        },
      });

      const promptVariables = {
        ...input,
        stringifiedProposal: input.proposal ? proposalToMarkdown(input.proposal) : '',
        stringifiedPlan: input.projectPlan ? projectPlanToMarkdown(input.projectPlan) : '',
      };

      const { output: fallbackOutput } = await fallbackPrompt(promptVariables);

      if (fallbackOutput) {
        console.log('✅ نجح التوليد الاحتياطي باستخدام القالب الذكي');
        return fallbackOutput;
      }
    } catch (fallbackError) {
      console.error('❌ فشل التوليد الاحتياطي أيضاً:', fallbackError);
    }

    throw error;
  }
}
