/**
 * Writing Tools Route - Migrated to New System
 *
 * هذا الملف يحتوي على route أدوات الكتابة المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';
import { deductCredit, logGeneration } from '@/services';

// Import all flows and schemas
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { factCheckText } from '@/ai/flows/fact-checker';
import { generateCitation } from '@/ai/flows/generate-citation';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { generatePresentationOutline } from '@/ai/flows/generate-presentation-outline';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { humanizeText } from '@/ai/flows/humanize-text';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { summarizeText } from '@/ai/flows/summarize-text';
import { rewriteText, summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { writeDocument } from '@/ai/flows/write-document';
import {
    AIResearcherInputSchema,
    DetectAIInputSchema,
    FactCheckInputSchema,
    GenerateCitationInputSchema,
    GeneratePlantUMLInputSchema,
    GeneratePresentationOutlineInputSchema,
    GenerateQuizInputSchema,
    GrammarCheckInputSchema,
    HumanizeTextInputSchema,
    IdeaGenerationInputSchema,
    ManipulateTextInputSchema,
    ParaphraseInputSchema,
    PlagiarismCheckInputSchema,
    RewriteTextInputSchema,
    SummarizeInputSchema,
    SummarizeTextWithRatioInputSchema,
    TopicExplainerInputSchema,
    WriteDocumentInputSchema
} from '@/ai/schemas';

// Enhanced tool configuration with additional metadata
const toolConfig = {
    'paraphrase': {
        flow: paraphraseText,
        schema: ParaphraseInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Paraphrase text while maintaining meaning',
        estimatedTime: 5000 // 5 seconds
    },
    'summarize': {
        flow: summarizeText,
        schema: SummarizeInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Summarize text content',
        estimatedTime: 3000
    },
    'humanize': {
        flow: humanizeText,
        schema: HumanizeTextInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Make AI-generated text more human-like',
        estimatedTime: 4000
    },
    'ai-detector': {
        flow: detectAiContent,
        schema: DetectAIInputSchema,
        creditCost: 1,
        category: 'analysis',
        description: 'Detect AI-generated content',
        estimatedTime: 2000
    },
    'grammar-checker': {
        flow: grammarCheck,
        schema: GrammarCheckInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Check and correct grammar',
        estimatedTime: 3000
    },
    'quiz-generator': {
        flow: generateQuiz,
        schema: GenerateQuizInputSchema,
        creditCost: 1,
        category: 'generation',
        description: 'Generate quiz questions from content',
        estimatedTime: 6000
    },
    'fact-checker': {
        flow: factCheckText,
        schema: FactCheckInputSchema,
        creditCost: 2,
        category: 'analysis',
        description: 'Verify facts in text',
        estimatedTime: 10000
    },
    'plagiarism-checker': {
        flow: plagiarismCheck,
        schema: PlagiarismCheckInputSchema,
        creditCost: 2,
        category: 'analysis',
        description: 'Check for plagiarism',
        estimatedTime: 8000
    },
    'citation-generator': {
        flow: generateCitation,
        schema: GenerateCitationInputSchema,
        creditCost: 1,
        category: 'generation',
        description: 'Generate citations for sources',
        estimatedTime: 2000
    },
    'ai-researcher': {
        flow: aiResearcher,
        schema: AIResearcherInputSchema,
        creditCost: 2,
        category: 'research',
        description: 'Conduct AI-powered research',
        estimatedTime: 15000
    },
    'topic-explainer': {
        flow: topicExplainer,
        schema: TopicExplainerInputSchema,
        creditCost: 1,
        category: 'generation',
        description: 'Explain complex topics',
        estimatedTime: 5000
    },
    'generate-ideas': {
        flow: generateIdeas,
        schema: IdeaGenerationInputSchema,
        creditCost: 1,
        category: 'generation',
        description: 'Generate creative ideas',
        estimatedTime: 4000
    },
    'write-document': {
        flow: writeDocument,
        schema: WriteDocumentInputSchema,
        creditCost: 3,
        category: 'generation',
        description: 'Write complete documents',
        estimatedTime: 20000
    },
    'presentation-outline': {
        flow: generatePresentationOutline,
        schema: GeneratePresentationOutlineInputSchema,
        creditCost: 1,
        category: 'generation',
        description: 'Generate presentation outlines',
        estimatedTime: 6000
    },
    'generate-plantuml': {
        flow: generatePlantUML,
        schema: GeneratePlantUMLInputSchema,
        creditCost: 1,
        category: 'generation',
        description: 'Generate PlantUML diagrams',
        estimatedTime: 4000
    },
    'rewrite-text': {
        flow: rewriteText,
        schema: RewriteTextInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Rewrite text in different styles',
        estimatedTime: 5000
    },
    'summarize-with-ratio': {
        flow: summarizeTextWithRatio,
        schema: SummarizeTextWithRatioInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Summarize text with specific ratio',
        estimatedTime: 4000
    },
    'manipulate-text': {
        flow: manipulateText,
        schema: ManipulateTextInputSchema,
        creditCost: 1,
        category: 'text-processing',
        description: 'Manipulate text in various ways',
        estimatedTime: 3000
    },
} as const;

type ToolName = keyof typeof toolConfig;

/**
 * Execute writing tool with enhanced monitoring and error handling
 */
export const POST = withEnhancedAuth(async ({ request, user, params, startTime }) => {
    const toolName = params.tool as ToolName;

    // Validate tool name
    const config = toolConfig[toolName];
    if (!config) {
        return handleApiErrorEnhanced(
            new Error(`Invalid tool: ${toolName}`),
            'writing_tool_invalid_tool',
            {
                toolName,
                availableTools: Object.keys(toolConfig)
            },

        );
    }

    const { flow, schema, creditCost, category, description, estimatedTime } = config;

    try {
        // Parse and validate request body
        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return handleApiErrorEnhanced(
                new Error(`Validation failed: ${validation.error.message}`),
                'writing_tool_validation_failed',
                {
                    toolName,
                    validationErrors: validation.error.flatten().fieldErrors
                }
            );
        }

        // Check user credits before processing
        if (user.credits < creditCost) {
            return handleApiErrorEnhanced(
                new Error(`Insufficient credits. Required: ${creditCost}, Available: ${user.credits}`),
                'writing_tool_insufficient_credits',
                {
                    toolName,
                    requiredCredits: creditCost,
                    availableCredits: user.credits
                },
                // Payment Required
            );
        }

        // Execute the tool flow
        const flowStartTime = performance.now();
        const result = await flow(validation.data as any);
        const flowDuration = performance.now() - flowStartTime;

        // Deduct credits
        await deductCredit(user.id, creditCost);

        // Log generation
        await logGeneration({
            agentId: toolName,
            userId: user.id,
            input: validation.data,
            output: result,
            creditCost: creditCost,
        });

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'writing_tool_executed',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'writing-tools/[tool]',
                toolName,
                category,
                creditCost,
                userId: user.id,
                flowDuration,
                estimatedTime,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            `/api/writing-tools/${toolName}`,
            'POST',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            {
                ...result,
                metadata: {
                    toolName,
                    category,
                    description,
                    creditCost,
                    processingTime: performance.now() - startTime,
                    flowDuration,
                    estimatedTime,
                    timestamp: new Date().toISOString()
                }
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'writing-tools/[tool]',
                toolName,
                category,
                creditCost,
                userId: user.id
            }
        );

    } catch (error: any) {
        // Track error performance
        PerformanceMonitor.recordEvent({
            type: 'error',
            name: 'writing_tool_failed',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'writing-tools/[tool]',
                toolName,
                category,
                creditCost,
                userId: user.id,
                error: error.message
            }
        });

        // Track error analytics
        Analytics.trackApiCall(
            `/api/writing-tools/${toolName}`,
            'POST',
            performance.now() - startTime,
            false,
            500
        );

        return handleApiErrorEnhanced(error, 'writing_tool_execution', {
            toolName,
            category,
            creditCost,
            userId: user.id
        });
    }
}, {
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 50, // Allow more requests for writing tools
        windowMs: 60000
    }
});

/**
 * Get tool information and capabilities
 */
export const GET = withEnhancedAuth(async ({ params, startTime }) => {
    try {
        const toolName = params.tool as ToolName;

        if (!toolConfig[toolName]) {
            return handleApiErrorEnhanced(
                new Error(`Tool not found: ${toolName}`),
                'writing_tool_not_found',
                {
                    toolName,
                    availableTools: Object.keys(toolConfig)
                },

            );
        }

        const config = toolConfig[toolName];
        const toolInfo = {
            name: toolName,
            category: config.category,
            description: config.description,
            creditCost: config.creditCost,
            estimatedTime: config.estimatedTime,
            schema: config.schema.shape, // Basic schema info
            available: true,
            timestamp: new Date().toISOString()
        };

        return createApiResponseEnhanced(
            toolInfo,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'writing-tools/[tool]',
                toolName
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'writing_tool_info');
    }
}, {
    requireAuth: false, // Tool info can be accessed without auth
    performanceTracking: true,
    analytics: true
});

/**
 * Get all available tools
 */
export const OPTIONS = withEnhancedAuth(async ({ startTime }) => {
    try {
        const tools = Object.entries(toolConfig).map(([name, config]) => ({
            name,
            category: config.category,
            description: config.description,
            creditCost: config.creditCost,
            estimatedTime: config.estimatedTime
        }));

        const toolsByCategory = tools.reduce((acc, tool) => {
            if (!acc[tool.category]) {
                acc[tool.category] = [];
            }
            acc[tool.category].push(tool);
            return acc;
        }, {} as Record<string, typeof tools>);

        return createApiResponseEnhanced(
            {
                tools,
                toolsByCategory,
                totalTools: tools.length,
                categories: Object.keys(toolsByCategory),
                timestamp: new Date().toISOString()
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'writing-tools/[tool]'
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'writing_tools_list');
    }
}, {
    requireAuth: false, // Tools list can be accessed without auth
    performanceTracking: true,
    analytics: true
});
