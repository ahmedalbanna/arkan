if (typeof window !== 'undefined') {
    throw new Error('N8nAiService cannot be imported in the browser. It is a server-only service.');
}

import { injectable } from "tsyringe";
import { IAiService } from "../../domain/services/IAiService";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";
import type { RetrievalOptions, RetrievalResult } from "../../domain/services/IRetrievalService";

/**
 * N8nAiService
 * 
 * A hybrid drop-in replacement for GenkitAiService:
 * 
 * - generateText        → n8n Arkan AI Agent (OpenRouter via webhook)
 * - runFlow             → LOCAL execution of the flow function directly (preserves all 40+ Genkit flows)
 * - retrieveContext     → n8n (Qdrant vector search)
 * - generateChapterWithRAG → n8n Chapter RAG Agent
 * - generateSectionWithRAG → n8n Section RAG Agent
 *
 * Environment Variables:
 *   N8N_AI_WEBHOOK_URL: The URL of the n8n webhook endpoint.
 */
@injectable()
export class N8nAiService implements IAiService {

    private readonly webhookUrl: string;
    private readonly timeoutMs: number = 120_000; // 2 minutes

    constructor() {
        this.webhookUrl = process.env.N8N_AI_WEBHOOK_URL || '';
        if (!this.webhookUrl) {
            console.error('[N8nAiService] N8N_AI_WEBHOOK_URL is missing. Orchestration is disabled.');
        } else if (!this.webhookUrl.startsWith('http')) {
            console.error('[N8nAiService] N8N_AI_WEBHOOK_URL is invalid. Must be a full URL.');
        }
    }

    // ──────────────────────────────────────────────
    // Core HTTP bridge to n8n
    // ──────────────────────────────────────────────

    private async callN8n<T>(payload: Record<string, unknown>): Promise<Result<T, AiError>> {
        const startTime = performance.now();
        const action = String(payload.action || 'unknown');
        
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            const duration = (performance.now() - startTime).toFixed(2);

            if (!response.ok) {
                const text = await response.text();
                console.error(`[N8nAiService] ${action} failed (${duration}ms): ${response.status}`);
                return Result.fail(AiError.generationFailed(`n8n responded with ${response.status}: ${text}`));
            }

            const data = await response.json() as Record<string, unknown>;

            if (data.success === false) {
                console.error(`[N8nAiService] ${action} business error (${duration}ms): ${data.error}`);
                return Result.fail(AiError.generationFailed(String(data.error || 'n8n returned an unsuccessful response')));
            }

            console.log(`[N8nAiService] ${action} success (${duration}ms)`);
            return Result.ok(data as T);
        } catch (error: unknown) {
            const duration = (performance.now() - startTime).toFixed(2);
            const message = error instanceof Error ? error.message : String(error);
            
            console.error(`[N8nAiService] ${action} system error (${duration}ms): ${message}`);

            if (message.includes('abort') || message.includes('timeout')) {
                return Result.fail(AiError.generationFailed('n8n request timed out after 2 minutes'));
            }
            return Result.fail(AiError.generationFailed(message));
        }
    }

    // ──────────────────────────────────────────────
    // IAiService implementation
    // ──────────────────────────────────────────────

    /**
     * Sends a text generation request to the n8n Arkan AI Agent.
     */
    async generateText(prompt: string, options?: unknown): Promise<Result<string, AiError>> {
        const result = await this.callN8n<{ text: string }>({
            action: 'generateText',
            prompt,
            options,
        });

        if (!result.isSuccess) return Result.fail(result.error!);
        const text = result.getValue()?.text;
        if (typeof text !== 'string') {
            return Result.fail(AiError.generationFailed('n8n response missing "text" field'));
        }
        return Result.ok(this.cleanAiOutput(text));
    }

    /**
     * Maps specific flowNames to n8n specialized agents.
     * When a flow is listed here, it will be executed via n8n instead of locally.
     * This allows gradual migration of specific flows to n8n agents.
     */
    private readonly N8N_FLOW_MAP: Record<string, string> = {
        // Writing Tools
        'summarize': 'summarize',
        'summarizer': 'summarize',
        'grammar-checker': 'grammarCheck',
        'paraphrase': 'paraphrase',
        'paraphraser': 'paraphrase',
        'humanize': 'humanize',
        'translator': 'translate',
        'translate-text': 'translate',
        'write-document': 'writeDocument',
        'manipulate-text': 'manipulateText',
        'text-stylist': 'textStyleTune',
        
        // Analysis Tools
        'ai-detector': 'detectAi',
        'bias-checker': 'biasCheck',
        'fact-checker': 'factCheck',
        'plagiarism-checker': 'plagiarismCheck',
        'sentence-structure-checker': 'sentenceStructureCheck',
        
        // Academic Tools
        'ai-researcher': 'aiResearch',
        'lecture-generator': 'generateLecture',
        'generate-citation': 'generateCitation',
        'literature-review-generator': 'generateLitReview',
        'generate-quiz': 'quiz',
        'solve-assignments': 'solveAssignments',
        'theoretical-lecture': 'generateTheoreticalLecture',
        
        // Generation Tools
        'generate-ideas': 'generateIdeas',
        'generate-toc': 'generateTOC',
        'generate-ui-description': 'generateUIDescription',
        'generate-session-plan': 'generateSessionPlan',
        'generate-project-blueprint': 'generateProjectBlueprint',
        'topic-explainer': 'explainTopic',
        'image-to-text': 'imageToText',
        'generate-plant-uml': 'generatePlantUML',
        'question-answering': 'questionAnswering',
        'fact-retrieval': 'factRetrieval',

        // Document Level Specialized Agents (Used directly via flowName)
        'proofreadDocument': 'proofreadDocument',
        'analyzeContext': 'analyzeContext',
        'checkPaperQuality': 'checkPaperQuality',
        'improveMarkdown': 'improveMarkdown',
        'generateProjectDoc': 'generateProjectDoc',
        'rewriteToMarkdown': 'rewriteToMarkdown',
        'writeTechSpec': 'writeTechSpec',
        'createPresentation': 'createPresentation'
    };

    /**
     * HYBRID: 
     * - If the flowName is in N8N_FLOW_MAP → delegates to the n8n specialized agent.
     * - Otherwise → executes the Genkit flow function DIRECTLY on the server.
     * This preserves all 40+ existing flow functions without rewriting them.
     */
    async runFlow<TInput, TOutput>(
        flow: (input: TInput) => Promise<TOutput>,
        input: TInput,
        flowName?: string
    ): Promise<Result<TOutput, AiError>> {
        // Check if this flow has an n8n specialized agent
        if (flowName && this.N8N_FLOW_MAP[flowName]) {
            console.log(`[N8nAiService] Routing flow "${flowName}" to n8n specialized agent`);
            const result = await this.callN8n<{ text: unknown }>({
                action: 'generateText',
                flowName: this.N8N_FLOW_MAP[flowName],
                prompt: typeof input === 'object' ? JSON.stringify(input) : String(input),
                input,
            });

            if (!result.isSuccess) return Result.fail(result.error!);
            const text = result.getValue()?.text;
            if (typeof text === 'string') {
                return Result.ok(this.cleanAiOutput(text) as unknown as TOutput);
            }
            return Result.ok(text as TOutput);
        }

        // Default: execute locally
        try {
            console.log(`[N8nAiService] Running flow locally: ${flowName || 'unnamed'}`);
            const result = await flow(input);

            // Post-process string outputs to remove conversational filler
            if (result && typeof result === 'object') {
                const processed = result as Record<string, unknown>;
                for (const key in processed) {
                    if (typeof processed[key] === 'string') {
                        processed[key] = this.cleanAiOutput(processed[key] as string);
                    }
                }
                return Result.ok(processed as TOutput);
            } else if (typeof result === 'string') {
                return Result.ok(this.cleanAiOutput(result) as unknown as TOutput);
            }

            return Result.ok(result as TOutput);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[N8nAiService] Local flow execution failed for "${flowName || 'unnamed'}": ${message}`);
            return Result.fail(AiError.generationFailed(message));
        }
    }

    /**
     * Retrieves relevant context from the knowledge base via n8n → Qdrant.
     */
    async retrieveContext(query: string, options?: RetrievalOptions): Promise<Result<RetrievalResult, AiError>> {
        const result = await this.callN8n<RetrievalResult>({
            action: 'retrieveContext',
            prompt: query,
            options,
        });

        if (!result.isSuccess) return Result.fail(result.error!);
        return Result.ok(result.getValue()!);
    }

    /**
     * Generates chapter content using the n8n Chapter RAG Agent.
     * The full structured input is forwarded to n8n.
     */
    async generateChapterWithRAG(input: unknown): Promise<Result<unknown, AiError>> {
        const result = await this.callN8n<{ text: unknown }>({
            action: 'generateChapterWithRAG',
            flowName: 'generateChapterWithRAG',
            input,
        });

        if (!result.isSuccess) return Result.fail(result.error!);
        return Result.ok(result.getValue()?.text ?? result.getValue());
    }

    /**
     * Generates a report section using the n8n Section RAG Agent.
     * The full structured input is forwarded to n8n.
     */
    async generateSectionWithRAG(input: unknown): Promise<Result<unknown, AiError>> {
        const result = await this.callN8n<{ text: unknown }>({
            action: 'generateSectionWithRAG',
            flowName: 'generateSectionWithRAG',
            input,
        });

        if (!result.isSuccess) return Result.fail(result.error!);
        return Result.ok(result.getValue()?.text ?? result.getValue());
    }

    // ──────────────────────────────────────────────
    // Output sanitization (mirrors GenkitAiService)
    // ──────────────────────────────────────────────

    private cleanAiOutput(text: string): string {
        if (!text) return text;

        const patterns = [
            /^Sure,? (here is|here's) the [^:]+:?\s*/i,
            /^Sure,? here (is|'s) [^:]+:?\s*/i,
            /^Certainly!? [^:]+:?\s*/i,
            /^As requested,? [^:]+:?\s*/i,
            /^I have [^:]+ below:?\s*/i,
            /^The following is [^:]+:?\s*/i,
            /^Ok,? (here is|here's) [^:]+:?\s*/i,
            /^Below is the [^:]+:?\s*/i,
            /^Sure,? I can [^:]+:?\s*/i,
        ];

        let cleaned = text.trim();
        for (let i = 0; i < 2; i++) {
            for (const pattern of patterns) {
                cleaned = cleaned.replace(pattern, '');
            }
            cleaned = cleaned.trim();
        }
        return cleaned;
    }
}
