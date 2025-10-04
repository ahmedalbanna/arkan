/**
 * أنواع AI المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة للـ AI مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import { TypedError } from './improved-types';

// ==================== أنواع AI الأساسية ====================

/**
 * طلب AI محسن
 */
export interface AIRequest {
    prompt: string;
    context?: string;
    options?: AIOptions;
    metadata?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
    requestId?: string;
}

/**
 * خيارات AI محسنة
 */
export interface AIOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    timeout?: number;
    retries?: number;
}

/**
 * استجابة AI محسنة
 */
export interface AIResponse {
    content: string;
    metadata?: AIMetadata;
    success: boolean;
    message?: string;
    error?: TypedError;
    requestId?: string;
    timestamp?: string;
}

/**
 * بيانات AI محسنة
 */
export interface AIMetadata {
    model: string;
    tokens: number;
    duration: number;
    confidence?: number;
    cost?: number;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// ==================== أنواع AI المتخصصة ====================

/**
 * AI للاقتراحات محسن
 */
export interface ProposalAIRequest extends AIRequest {
    type: 'proposal';
    sectionType?: string;
    requirements?: string[];
    targetAudience?: string;
    tone?: 'formal' | 'casual' | 'professional' | 'friendly';
    length?: 'short' | 'medium' | 'long';
}

/**
 * AI للتقارير محسن
 */
export interface ReportAIRequest extends AIRequest {
    type: 'report';
    reportType?: 'analytical' | 'descriptive' | 'explanatory' | 'persuasive';
    data?: Record<string, unknown>;
    structure?: string[];
    citations?: boolean;
    references?: string[];
}

/**
 * AI للعروض التقديمية محسن
 */
export interface PresentationAIRequest extends AIRequest {
    type: 'presentation';
    slideCount?: number;
    slideType?: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
    design?: 'minimal' | 'modern' | 'corporate' | 'creative';
    audience?: string;
    duration?: number;
}

/**
 * AI للأكاديميا محسن
 */
export interface AcademicAIRequest extends AIRequest {
    type: 'academic';
    subject?: string;
    level?: 'undergraduate' | 'graduate' | 'doctoral' | 'professional';
    format?: 'essay' | 'research' | 'thesis' | 'dissertation';
    citations?: boolean;
    references?: string[];
    plagiarism?: boolean;
}

// ==================== أنواع AI المتقدمة ====================

/**
 * AI للرسوم البيانية محسن
 */
export interface DiagramAIRequest extends AIRequest {
    type: 'diagram';
    diagramType?: 'flowchart' | 'mindmap' | 'sequence' | 'class' | 'entity';
    format?: 'mermaid' | 'plantuml' | 'drawio' | 'svg';
    style?: 'minimal' | 'detailed' | 'colorful' | 'monochrome';
    complexity?: 'simple' | 'moderate' | 'complex';
}

/**
 * AI للكود محسن
 */
export interface CodeAIRequest extends AIRequest {
    type: 'code';
    language?: string;
    framework?: string;
    pattern?: 'functional' | 'object-oriented' | 'procedural' | 'reactive';
    quality?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    documentation?: boolean;
    tests?: boolean;
}

/**
 * AI للترجمة محسن
 */
export interface TranslationAIRequest extends AIRequest {
    type: 'translation';
    sourceLanguage?: string;
    targetLanguage?: string;
    domain?: 'general' | 'technical' | 'medical' | 'legal' | 'business';
    style?: 'formal' | 'informal' | 'academic' | 'casual';
    preserveFormatting?: boolean;
}

// ==================== أنواع AI المتخصصة ====================

/**
 * AI للتحليل محسن
 */
export interface AnalysisAIRequest extends AIRequest {
    type: 'analysis';
    analysisType?: 'sentiment' | 'topic' | 'keyword' | 'trend' | 'comparison';
    data?: Record<string, unknown>;
    metrics?: string[];
    timeframe?: string;
    granularity?: 'word' | 'sentence' | 'paragraph' | 'document';
}

/**
 * AI للتحسين محسن
 */
export interface OptimizationAIRequest extends AIRequest {
    type: 'optimization';
    optimizationType?: 'content' | 'structure' | 'style' | 'seo' | 'readability';
    target?: string;
    constraints?: string[];
    metrics?: string[];
    iterations?: number;
}

/**
 * AI للتحقق من الصحة محسن
 */
export interface ValidationAIRequest extends AIRequest {
    type: 'validation';
    validationType?: 'grammar' | 'spelling' | 'style' | 'fact' | 'logic';
    rules?: string[];
    severity?: 'low' | 'medium' | 'high' | 'critical';
    suggestions?: boolean;
    explanations?: boolean;
}

// ==================== أنواع AI المتقدمة ====================

/**
 * AI للتعلم الآلي محسن
 */
export interface MachineLearningAIRequest extends AIRequest {
    type: 'machine_learning';
    task?: 'classification' | 'regression' | 'clustering' | 'recommendation';
    algorithm?: string;
    features?: string[];
    target?: string;
    validation?: 'cross-validation' | 'holdout' | 'bootstrap';
    metrics?: string[];
}

/**
 * AI للتعلم العميق محسن
 */
export interface DeepLearningAIRequest extends AIRequest {
    type: 'deep_learning';
    architecture?: 'cnn' | 'rnn' | 'transformer' | 'gan' | 'autoencoder';
    layers?: number;
    neurons?: number;
    activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax';
    optimizer?: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
    learningRate?: number;
}

/**
 * AI للتعلم المعزز محسن
 */
export interface ReinforcementLearningAIRequest extends AIRequest {
    type: 'reinforcement_learning';
    algorithm?: 'q-learning' | 'policy-gradient' | 'actor-critic' | 'dqn';
    environment?: string;
    stateSpace?: string[];
    actionSpace?: string[];
    rewardFunction?: string;
    episodes?: number;
}

// ==================== أنواع AI المتخصصة ====================

/**
 * AI للتعلم الطبيعي محسن
 */
export interface NaturalLanguageProcessingAIRequest extends AIRequest {
    type: 'nlp';
    task?: 'tokenization' | 'pos' | 'ner' | 'sentiment' | 'summarization';
    language?: string;
    domain?: 'general' | 'medical' | 'legal' | 'technical' | 'business';
    model?: 'bert' | 'gpt' | 't5' | 'roberta' | 'distilbert';
    fineTuned?: boolean;
}

/**
 * AI للرؤية الحاسوبية محسن
 */
export interface ComputerVisionAIRequest extends AIRequest {
    type: 'computer_vision';
    task?: 'classification' | 'detection' | 'segmentation' | 'recognition';
    imageFormat?: 'jpg' | 'png' | 'gif' | 'bmp' | 'tiff';
    resolution?: string;
    colorSpace?: 'rgb' | 'hsv' | 'lab' | 'grayscale';
    preprocessing?: string[];
    augmentation?: string[];
}

/**
 * AI للصوت محسن
 */
export interface AudioAIRequest extends AIRequest {
    type: 'audio';
    task?: 'speech-to-text' | 'text-to-speech' | 'music-generation' | 'audio-analysis';
    format?: 'wav' | 'mp3' | 'flac' | 'aac' | 'ogg';
    sampleRate?: number;
    channels?: number;
    bitDepth?: number;
    duration?: number;
}

// ==================== أنواع AI المتقدمة ====================

/**
 * AI للروبوتات محسن
 */
export interface RoboticsAIRequest extends AIRequest {
    type: 'robotics';
    task?: 'navigation' | 'manipulation' | 'perception' | 'planning';
    robotType?: 'mobile' | 'manipulator' | 'humanoid' | 'aerial' | 'underwater';
    sensors?: string[];
    actuators?: string[];
    environment?: 'indoor' | 'outdoor' | 'underwater' | 'space';
}

/**
 * AI للألعاب محسن
 */
export interface GamingAIRequest extends AIRequest {
    type: 'gaming';
    gameType?: 'strategy' | 'action' | 'puzzle' | 'simulation' | 'rpg';
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    playerCount?: number;
    gameMode?: 'single-player' | 'multiplayer' | 'cooperative' | 'competitive';
    aiBehavior?: 'aggressive' | 'defensive' | 'balanced' | 'adaptive';
}

/**
 * AI للشبكات محسن
 */
export interface NetworkAIRequest extends AIRequest {
    type: 'network';
    task?: 'optimization' | 'security' | 'routing' | 'traffic-analysis';
    protocol?: 'tcp' | 'udp' | 'http' | 'https' | 'websocket';
    topology?: 'star' | 'ring' | 'mesh' | 'tree' | 'bus';
    scale?: 'local' | 'wan' | 'internet' | 'cloud';
    performance?: 'latency' | 'throughput' | 'reliability' | 'scalability';
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من صحة AI
 */
export type AIValidator<T> = (data: T) => boolean | string;

/**
 * دالة معالجة AI
 */
export type AIProcessor<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * دالة معالجة الخطأ للـ AI
 */
export type AIErrorHandler = (error: TypedError) => void | Promise<void>;

/**
 * دالة تسجيل AI
 */
export type AILogger = (message: string, metadata?: Record<string, unknown>) => void;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية للـ AI محسنة
 */
export interface AIResult<T = unknown, E = TypedError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
    tokens?: number;
    cost?: number;
}

/**
 * خيارات العملية للـ AI محسنة
 */
export interface AIOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    stream?: boolean;
    rateLimit?: {
        max: number;
        window: number;
    };
}

// ==================== أنواع الأدوات المساعدة ====================

/**
 * دالة المساعدة للتحقق من صحة طلب AI
 */
export function isValidAIRequest(request: unknown): request is AIRequest {
    return (
        typeof request === 'object' &&
        request !== null &&
        'prompt' in request &&
        typeof (request as AIRequest).prompt === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة استجابة AI
 */
export function isValidAIResponse(response: unknown): response is AIResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'content' in response &&
        'success' in response &&
        typeof (response as AIResponse).content === 'string' &&
        typeof (response as AIResponse).success === 'boolean'
    );
}

/**
 * دالة المساعدة للتحقق من صحة خيارات AI
 */
export function isValidAIOptions(options: unknown): options is AIOptions {
    return (
        typeof options === 'object' &&
        options !== null &&
        (typeof (options as AIOptions).model === 'string' ||
            typeof (options as AIOptions).model === 'undefined') &&
        (typeof (options as AIOptions).temperature === 'number' ||
            typeof (options as AIOptions).temperature === 'undefined') &&
        (typeof (options as AIOptions).maxTokens === 'number' ||
            typeof (options as AIOptions).maxTokens === 'undefined')
    );
}

/**
 * دالة المساعدة للتحقق من صحة بيانات AI
 */
export function isValidAIMetadata(metadata: unknown): metadata is AIMetadata {
    return (
        typeof metadata === 'object' &&
        metadata !== null &&
        'model' in metadata &&
        'tokens' in metadata &&
        'duration' in metadata &&
        typeof (metadata as AIMetadata).model === 'string' &&
        typeof (metadata as AIMetadata).tokens === 'number' &&
        typeof (metadata as AIMetadata).duration === 'number'
    );
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
