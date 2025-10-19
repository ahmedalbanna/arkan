
'use server';

/**
 * @fileOverview Intelligent engine for generating detailed project proposals.
 * Uses an enhanced system for smart analysis and iterative improvement.
 */

import { AdaptiveModelSelector } from '@/ai/core/adaptive-model-selector';
import { ContextAnalyzer } from '@/ai/core/context-analyzer';
import { IterativeImprovementEngine } from '@/ai/core/iterative-improvement-engine';
import { OutputQualityValidator } from '@/ai/core/output-quality-validator';
import { ProposalContextAnalyzer } from '@/ai/core/proposal-context-analyzer';
import { ProposalPromptBuilder } from '@/ai/core/proposal-prompt-builder';
import { ProposalQualityValidator } from '@/ai/core/proposal-quality-validator';
import { ProposalAnalyzer } from '@/ai/core/proposal-analyzer';
import { ProposalEnhancer } from '@/ai/core/proposal-enhancer';
import { ProposalReporter } from '@/ai/core/proposal-reporter';
import { PerformanceMonitor } from '@/ai/core/performance-monitor';
import { ai } from '@/ai/genkit';
import { generateProposalPrompt } from '@/ai/prompts/generate-proposal';
import { AnyProjectProposal, GenerateProposalInputSchema } from '@/ai/schemas';
import { z } from 'genkit';

export const generateProposal = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: z.any(),
  },
  async (input): Promise<AnyProjectProposal> => {
    const { projectIdea, guidelines, externalContext, advancedFields, jsonStructure } = input;

    try {
      console.log('🚀 Starting proposal generation with enhanced system...');

      // Start performance monitoring
      const performanceSessionId = PerformanceMonitor.startSession({
        taskType: 'proposal-generation',
        domain: 'project-proposals',
        userInput: projectIdea || ''
      });

      try {
        console.log('🧠 Attempting to use the enhanced intelligent system...');

        // 1. Specialized context analysis for proposals
        console.log('📊 Analyzing specialized context for proposals...');
        const proposalContextAnalysis = await ProposalContextAnalyzer.analyzeProposalContext({
          projectIdea: projectIdea || '',
          externalContext,
          guidelines,
          projectType: (advancedFields as any)?.projectType || 'business',
          budget: (advancedFields as any)?.budget || 'Not specified',
          timeline: (advancedFields as any)?.timeline || 'Not specified',
          targetAudience: (advancedFields as any)?.targetAudience || 'Not specified'
        });

        console.log(`✅ Context analyzed: Proposal Type = ${proposalContextAnalysis.proposalType}, Industry = ${proposalContextAnalysis.industry}, Audience = ${proposalContextAnalysis.stakeholderTypes.join(', ')}`);

        // 2. Select the optimal model
        const modelConfig = AdaptiveModelSelector.selectOptimalModel(
          proposalContextAnalysis,
          'generation'
        );

        console.log(`🤖 Selected model: ${modelConfig.modelId} (${modelConfig.reasoning})`);

        // 3. Build the specialized proposal prompt
        console.log('🔧 Building specialized proposal prompt...');
        const proposalPromptTemplate = ProposalPromptBuilder.buildProposalPrompt(
          proposalContextAnalysis,
          projectIdea || '',
          externalContext
        );

        // 4. Initial generation using the specialized prompt
        console.log('⚡ Starting initial generation with specialized prompt...');
        const { output: initialOutput } = await generateProposalPrompt({
          projectIdea,
          guidelines,
          externalContext,
          advancedFields,
          jsonStructure,
        });

        if (!initialOutput) {
          throw new Error("Failed to generate proposal. The AI may need more context.");
        }

        // 5. Specialized proposal output quality evaluation
        console.log('🔍 Evaluating proposal output quality (specialized)...');
        const validation = await ProposalQualityValidator.validateProposal(
          initialOutput,
          projectIdea || '',
          proposalContextAnalysis
        );

        console.log(`📈 Quality score: ${validation.overallProposalScore}/100`);
        console.log(`📊 Business readiness: ${validation.businessReadiness}/100`);
        console.log(`🔧 Technical readiness: ${validation.technicalReadiness}/100`);
        console.log(`📈 Market readiness: ${validation.marketReadiness}/100`);

        // 6. Iterative specialized proposal improvement
        let finalOutput = initialOutput;

        if (validation.needsImprovement && validation.overallProposalScore < 85) {
          console.log('🔄 Starting specialized iterative proposal improvement...');

          const improvementSession = await IterativeImprovementEngine.runImprovementSession(
            projectIdea || '',
            'generation',
            'project-proposals',
            externalContext,
            {
              maxIterations: 3,
              qualityThreshold: 85,
              improvementStrategy: 'balanced',
              allowModelSwitching: true
            }
          );

          if (improvementSession.status === 'completed') {
            const bestResult = IterativeImprovementEngine.getBestOutput(improvementSession);
            console.log(`✨ Improved! Final score: ${bestResult.qualityScore}/100`);

            // Attempt to parse improved result as JSON
            try {
              finalOutput = JSON.parse(bestResult.output);
            } catch (parseError) {
              console.warn('⚠️ Failed to parse improved output as JSON, using initial output');
              finalOutput = initialOutput;
            }
          } else {
            console.log('⚠️ Improvement was unsuccessful, using initial output');
          }
        } else {
          console.log('✅ Output quality is acceptable, no need for improvement');
        }

        // 7. Final data validation
        if (typeof finalOutput !== 'object' || finalOutput === null) {
          throw new Error("Final output is not in the correct format");
        }

        // 8. Advanced proposal analysis
        console.log('🔍 Advanced proposal analysis...');
        const proposalAnalysis = await ProposalAnalyzer.analyzeProposal(
          finalOutput,
          proposalContextAnalysis,
          validation.proposalMetrics
        );

        console.log(`📊 Analysis result: ${proposalAnalysis.overallLevel} (${proposalAnalysis.overallScore}/100)`);
        console.log(`🎯 Decision: ${proposalAnalysis.decision}`);
        console.log(`💪 Strengths: ${proposalAnalysis.strengths.length}`);
        console.log(`⚠️ Weaknesses: ${proposalAnalysis.weaknesses.length}`);

        // 9. Automatic proposal enhancement
        console.log('✨ Automatic proposal enhancement...');
        const proposalEnhancement = await ProposalEnhancer.enhanceProposal(
          finalOutput,
          proposalAnalysis,
          proposalContextAnalysis,
          validation.proposalMetrics
        );

        console.log(`🚀 Applied improvements: ${proposalEnhancement.improvementMetrics.autoImprovements}`);
        console.log(`📝 Suggested improvements: ${proposalEnhancement.improvementMetrics.totalSuggestions}`);
        console.log(`📈 Overall improvement: ${proposalEnhancement.improvementMetrics.overallImprovement}%`);

        // 10. Generate comprehensive proposal report
        console.log('📊 Generating comprehensive proposal report...');
        const proposalReport = await ProposalReporter.generateReport(
          finalOutput,
          proposalAnalysis,
          proposalEnhancement,
          proposalContextAnalysis,
          validation.proposalMetrics
        );

        console.log(`📋 Report ready: ${proposalReport.basicInfo.title}`);
        console.log(`🎯 Final decision: ${proposalReport.overallAssessment.decision}`);
        console.log(`📊 Final scores: ${proposalReport.overallAssessment.score}/100`);
        console.log(`💡 Recommendations: ${proposalReport.finalRecommendations.actions.length}`);

        // 11. Log performance information
        PerformanceMonitor.recordQualityMetrics(performanceSessionId, {
          qualityScore: validation.overallProposalScore,
          improvementIterations: validation.needsImprovement ? 3 : 1,
          finalAccuracy: validation.overallProposalScore
        });

        PerformanceMonitor.recordResourceUsage(performanceSessionId, {
          tokensUsed: Math.ceil(JSON.stringify(finalOutput).length * 1.3),
          modelSwitches: validation.needsImprovement ? 2 : 0
        });

        PerformanceMonitor.endSession(performanceSessionId, true);

        console.log('🎉 Proposal successfully produced with the specialized enhanced system!');
        return finalOutput;

      } catch (enhancedError) {
        console.warn('⚠️ Enhanced system failed, switching to basic system:', enhancedError);

        // Switch to basic system
        console.log('🔄 Using the basic system...');
        const { output: basicOutput } = await generateProposalPrompt({
          projectIdea,
          guidelines,
          externalContext,
          advancedFields,
          jsonStructure,
        });

        if (!basicOutput) {
          throw new Error("Failed to generate the proposal even with the basic system.");
        }

        console.log('✅ Proposal generated using the basic system');
        return basicOutput;
      }

    } catch (error) {
      console.error('❌ Error generating proposal:', error);

      // Attempt simple generation as fallback
      console.log('🔄 Attempting simple generation as a fallback...');
      try {
        const { output: fallbackOutput } = await generateProposalPrompt({
          projectIdea,
          guidelines,
          externalContext,
          advancedFields,
          jsonStructure,
        });

        if (fallbackOutput) {
          console.log('✅ Fallback generation succeeded');
          return fallbackOutput;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback generation also failed:', fallbackError);
      }

      throw new Error(`Failed to generate proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);
