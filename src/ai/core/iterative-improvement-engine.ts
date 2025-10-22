/**
 * محرك التحسين التكراري
 * يحسن المخرجات تدريجياً من خلال عدة تكرارات
 */

import { ai } from '@/ai/genkit';
import { AdaptiveModelSelector, ModelConfig } from './adaptive-model-selector';
import { ContextAnalysisResult, ContextAnalyzer } from './context-analyzer';
import { IntelligentPromptBuilder, PromptBuildingConfig } from './intelligent-prompt-builder';
import { OutputQualityValidator, ValidationResult } from './output-quality-validator';

export interface ImprovementIteration {
    iterationNumber: number;
    input: string;
    output: string;
    qualityScore: number;
    issues: string[];
    improvements: string[];
    modelUsed: string;
    timestamp: Date;
}

export interface ImprovementSession {
    sessionId: string;
    originalInput: string;
    contextAnalysis: ContextAnalysisResult;
    iterations: ImprovementIteration[];
    finalOutput: string;
    totalImprovementScore: number;
    status: 'in_progress' | 'completed' | 'failed';
    maxIterations: number;
    qualityThreshold: number;
}

export interface ImprovementConfig {
    maxIterations?: number;
    qualityThreshold?: number;
    improvementStrategy?: 'aggressive' | 'balanced' | 'conservative';
    focusAreas?: Array<'completeness' | 'accuracy' | 'clarity' | 'structure' | 'relevance'>;
    allowModelSwitching?: boolean;
}

export class IterativeImprovementEngine {

    /**
     * تشغيل جلسة تحسين تكرارية كاملة
     */
    static async runImprovementSession(
        originalInput: string,
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement',
        domain: string,
        externalContext?: Array<{ fileName: string; content: string; type: string }>,
        config: ImprovementConfig = {}
    ): Promise<ImprovementSession> {

        const sessionId = this.generateSessionId();
        const maxIterations = config.maxIterations || 2; // Reduced for faster testing
        const qualityThreshold = config.qualityThreshold || 85;

        const contextAnalysis = await ContextAnalyzer.analyzeContext({
            userInput: originalInput,
            externalContext,
            guidelines: []
        });

        const session: ImprovementSession = {
            sessionId,
            originalInput,
            contextAnalysis,
            iterations: [],
            finalOutput: '',
            totalImprovementScore: 0,
            status: 'in_progress',
            maxIterations,
            qualityThreshold
        };

        try {
            let currentInput = originalInput;
            let currentOutput = '';
            let currentModelConfig: ModelConfig | null = null;

            for (let i = 1; i <= maxIterations; i++) {
                console.log(`بدء التكرار ${i} من ${maxIterations}`);

                if (!currentModelConfig || config.allowModelSwitching) {
                    currentModelConfig = AdaptiveModelSelector.selectOptimalModel(
                        contextAnalysis,
                        taskType,
                        { taskType }
                    );
                }

                const promptConfig: PromptBuildingConfig = {
                    taskType,
                    domain,
                    contextAnalysis,
                    userInput: currentInput,
                    externalContext,
                    previousOutput: i > 1 ? currentOutput : undefined,
                    iterationCount: i
                };

                const promptTemplate = IntelligentPromptBuilder.buildPrompt(promptConfig);
                const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

                currentOutput = await this.executeGeneration(compiledPrompt, currentModelConfig);

                const validation = await OutputQualityValidator.validateOutput(
                    currentOutput,
                    originalInput,
                    contextAnalysis
                );

                const iteration: ImprovementIteration = {
                    iterationNumber: i,
                    input: currentInput,
                    output: currentOutput,
                    qualityScore: validation.metrics.overall,
                    issues: validation.issues.map(issue => issue.description),
                    improvements: validation.suggestions,
                    modelUsed: currentModelConfig.modelId,
                    timestamp: new Date()
                };

                session.iterations.push(iteration);
                console.log(`التكرار ${i}: نقاط الجودة = ${validation.metrics.overall}`);

                if (validation.metrics.overall >= qualityThreshold) {
                    console.log(`تم الوصول للجودة المطلوبة في التكرار ${i}`);
                    session.status = 'completed';
                    break;
                }

                if (i < maxIterations) {
                    if (validation.needsImprovement && validation.improvementPrompt) {
                        currentInput = validation.improvementPrompt;
                        if (config.allowModelSwitching) {
                            currentModelConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                                currentModelConfig,
                                validation.metrics.overall,
                                validation.issues.map(issue => issue.type)
                            );
                        }
                    } else {
                        currentInput = this.generateFallbackImprovementPrompt(
                            currentOutput,
                            validation,
                            config.improvementStrategy || 'balanced'
                        );
                    }
                }
            }
            
            session.finalOutput = currentOutput; // Always assign the last output
            if(session.status === 'in_progress') {
                session.status = session.iterations[session.iterations.length - 1].qualityScore >= 70 ? 'completed' : 'failed';
            }

            session.totalImprovementScore = this.calculateTotalImprovement(session);
            console.log(`انتهت الجلسة: النقاط النهائية = ${session.iterations[session.iterations.length - 1]?.qualityScore || 0}`);

        } catch (error) {
            console.error('خطأ في جلسة التحسين:', error);
            session.status = 'failed';
            session.finalOutput = session.iterations[session.iterations.length - 1]?.output || '';
        }

        return session;
    }

    /**
     * Executes a single generation call with the AI model.
     */
    private static async executeGeneration(prompt: string, modelConfig: ModelConfig): Promise<string> {
        try {
            console.log(`استخدام النموذج: ${modelConfig.modelId}`);
            console.log(`المعاملات: temp=${modelConfig.temperature}, tokens=${modelConfig.maxOutputTokens}`);

            const result = await ai.generate({
              model: modelConfig.modelId as any,
              prompt: prompt,
              config: {
                temperature: modelConfig.temperature,
                maxOutputTokens: modelConfig.maxOutputTokens,
                topP: modelConfig.topP,
                topK: modelConfig.topK
              },
              output: { format: 'json' } 
            });
            
            // CORRECTED: Access the 'output' property directly, not as a function.
            const output = result.output;

            if (typeof output === 'string') {
                return output;
            } else if (typeof output === 'object' && output !== null) {
                return JSON.stringify(output);
            }
            // Fallback for unexpected types
            throw new Error(`Invalid AI output format. Expected string or object, got ${typeof output}`);

        } catch (error) {
            console.error('خطأ في التوليد:', error);
            throw new Error(`فشل في التوليد: ${error}`);
        }
    }

    private static generateFallbackImprovementPrompt(
        currentOutput: string,
        validation: ValidationResult,
        strategy: 'aggressive' | 'balanced' | 'conservative'
    ): string {

        let prompt = 'Please improve the following content:\n\n';
        prompt += currentOutput + '\n\n';
        prompt += 'The required improvements are:\n';

        switch (strategy) {
            case 'aggressive':
                prompt += '- Completely rewrite the content to be more comprehensive and accurate.\n';
                prompt += '- Add more details and examples.\n';
                prompt += '- Radically improve the structure and organization.\n';
                break;
            case 'balanced':
                prompt += '- Improve clarity and organization.\n';
                prompt += '- Add any missing information.\n';
                prompt += '- Make the language more precise.\n';
                break;
            case 'conservative':
                prompt += '- Make minor improvements.\n';
                prompt += '- Focus on correcting obvious errors.\n';
                prompt += '- Maintain the basic structure.\n';
                break;
        }

        if (validation.issues.length > 0) {
            prompt += '\nSpecific issues to address:\n';
            validation.issues.forEach((issue, index) => {
                prompt += `${index + 1}. ${issue.description}\n`;
            });
        }
        return prompt;
    }

    private static calculateTotalImprovement(session: ImprovementSession): number {
        if (session.iterations.length === 0) return 0;
        const firstScore = session.iterations[0].qualityScore;
        const lastScore = session.iterations[session.iterations.length - 1].qualityScore;
        return lastScore - firstScore;
    }

    static analyzeImprovementTrend(session: ImprovementSession): any {
        if (session.iterations.length < 2) {
            return { trend: 'stable', averageImprovement: 0, bestIteration: 1, recommendations: ['More iterations needed for analysis'] };
        }
        const scores = session.iterations.map(iter => iter.qualityScore);
        const improvements = scores.slice(1).map((score, i) => score - scores[i]);
        const averageImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
        const bestIteration = scores.indexOf(Math.max(...scores)) + 1;
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (averageImprovement > 2) trend = 'improving';
        else if (averageImprovement < -2) trend = 'declining';
        const recommendations = [];
        if (trend === 'improving') {
            recommendations.push('Improvement is on the right track.');
        } else if (trend === 'declining') {
            recommendations.push('Output quality is declining; review the strategy.');
        } else {
            recommendations.push('Improvement is stagnant; consider changing the approach.');
        }
        return { trend, averageImprovement, bestIteration, recommendations };
    }

    static getBestOutput(session: ImprovementSession): any {
        if (!session.iterations.length) return { output: '', iterationNumber: 0, qualityScore: 0 };
        return session.iterations.reduce((best, current) => 
            current.qualityScore > best.qualityScore ? current : best, session.iterations[0]
        );
    }

    static generateSessionReport(session: ImprovementSession): string {
        let report = `# Iterative Improvement Session Report\n\n`;
        report += `**Session ID:** ${session.sessionId}\n`;
        report += `**Status:** ${session.status}\n`;
        report += `**Total Iterations:** ${session.iterations.length}\n`;
        report += `**Overall Score Improvement:** ${session.totalImprovementScore.toFixed(1)}\n\n`;
        const trendAnalysis = this.analyzeImprovementTrend(session);
        report += `## Trend Analysis\n`;
        report += `**Trend:** ${trendAnalysis.trend}\n`;
        report += `**Average Improvement:** ${trendAnalysis.averageImprovement.toFixed(1)}\n`;
        report += `**Best Iteration:** ${trendAnalysis.bestIteration}\n\n`;
        report += `## Recommendations\n`;
        trendAnalysis.recommendations.forEach((rec: string, index: number) => {
            report += `${index + 1}. ${rec}\n`;
        });
        report += '\n## Iteration Details\n\n';
        session.iterations.forEach(iteration => {
            report += `### Iteration ${iteration.iterationNumber}\n`;
            report += `- **Score:** ${iteration.qualityScore}\n`;
            report += `- **Model Used:** ${iteration.modelUsed}\n`;
            report += `- **Issues Found:** ${iteration.issues.length}\n`;
            if (iteration.issues.length > 0) {
                report += `- **Key Issues:** ${iteration.issues.slice(0, 3).join(', ')}\n`;
            }
            report += '\n';
        });
        return report;
    }

    private static generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    static async saveSession(session: ImprovementSession): Promise<void> {
        console.log(`Saving session: ${session.sessionId}`);
        // Dummy implementation for saving to a database
    }

    static async loadSession(sessionId: string): Promise<ImprovementSession | null> {
        console.log(`Loading session: ${sessionId}`);
        // Dummy implementation for loading from a database
        return null;
    }
}
