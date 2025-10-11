/**
 * @fileoverview نظام التدفقات المصنف الجديد - نظام إدارة موحد لجميع تدفقات الذكاء الاصطناعي
 * @author فريق تطوير Arkan
 * @version 2.0.0
 * @since 1.0.0
 */

/**
 * فئات التدفقات المتاحة في النظام
 * @typedef {('text-processing'|'content-generation'|'document-processing'|'analysis'|'academic'|'visual')} FlowCategory
 */
export type FlowCategory =
    | 'text-processing'      // معالجة النصوص
    | 'content-generation'   // توليد المحتوى
    | 'document-processing'  // معالجة المستندات
    | 'analysis'            // التحليل
    | 'academic'            // الأكاديمي
    | 'visual';             // المرئي

/**
 * تعريف تدفق في النظام
 * @interface FlowDefinition
 */
export interface FlowDefinition {
    /** اسم التدفق الفريد */
    name: string;

    /** مخطط Zod للمدخلات */
    inputSchema: any;

    /** مخطط Zod للمخرجات */
    outputSchema: any;

    /** معالج التدفق - الدالة التي تنفذ منطق التدفق */
    handler: (input: any) => Promise<any>;

    /** فئة التدفق */
    category: FlowCategory;

    /** وصف التدفق */
    description: string;
}

/**
 * طلب تنفيذ تدفق موحد
 * @interface UnifiedFlowRequest
 */
export interface UnifiedFlowRequest {
    /** اسم التدفق المراد تنفيذه */
    flowName: string;

    /** بيانات المدخلات للتدفق */
    input: any;

    /** فئة التدفق (اختيارية) */
    category?: FlowCategory;
}

/**
 * استجابة تنفيذ تدفق موحد
 * @interface UnifiedFlowResponse
 */
export interface UnifiedFlowResponse {
    /** نجاح العملية */
    success: boolean;

    /** البيانات الناتجة (في حالة النجاح) */
    data?: any;

    /** رسالة الخطأ (في حالة الفشل) */
    error?: string;

    /** وقت التنفيذ بالميلي ثانية */
    executionTime: number;

    /** اسم التدفق المنفذ */
    flowName: string;

    /** فئة التدفق */
    category: FlowCategory;
}

/**
 * نظام تسجيل التدفقات المركزي
 * يدير جميع تدفقات الذكاء الاصطناعي في مكان واحد
 *
 * @class FlowRegistry
 * @example
 * ```typescript
 * // تسجيل تدفق جديد
 * FlowRegistry.register({
 *   name: 'my-flow',
 *   category: 'text-processing',
 *   description: 'تدفق مخصص',
 *   inputSchema: MyInputSchema,
 *   outputSchema: MyOutputSchema,
 *   handler: async (input) => ({ result: 'processed' })
 * });
 *
 * // تنفيذ تدفق
 * const result = await FlowRegistry.execute('my-flow', { text: 'hello' });
 * ```
 */
export class FlowRegistry {
    /** خريطة التدفقات المسجلة */
    private static flows = new Map<string, FlowDefinition>();

    /** خريطة التدفقات حسب الفئة */
    private static categories = new Map<FlowCategory, Set<string>>();

    /**
     * تسجيل تدفق جديد في النظام
     * @param {FlowDefinition} definition - تعريف التدفق
     * @throws {Error} إذا كان التدفق مسجل مسبقاً
     * @example
     * ```typescript
     * FlowRegistry.register({
     *   name: 'grammar-checker',
     *   category: 'text-processing',
     *   description: 'فحص القواعد النحوية',
     *   inputSchema: GrammarCheckInputSchema,
     *   outputSchema: GrammarCheckOutputSchema,
     *   handler: async (input) => {
     *     // منطق فحص القواعد
     *     return { corrections: [] };
     *   }
     * });
     * ```
     */
    static register(definition: FlowDefinition): void {
        if (this.flows.has(definition.name)) {
            throw new Error(`Flow '${definition.name}' is already registered`);
        }

        this.flows.set(definition.name, definition);

        // إضافة للفئة
        if (!this.categories.has(definition.category)) {
            this.categories.set(definition.category, new Set());
        }
        this.categories.get(definition.category)!.add(definition.name);
    }

    /**
     * الحصول على تدفق بالاسم
     * @param {string} name - اسم التدفق
     * @returns {FlowDefinition | undefined} تعريف التدفق أو undefined إذا لم يوجد
     * @example
     * ```typescript
     * const flow = FlowRegistry.get('grammar-checker');
     * if (flow) {
     *   console.log('الوصف:', flow.description);
     * }
     * ```
     */
    static get(name: string): FlowDefinition | undefined {
        return this.flows.get(name);
    }

    /**
     * الحصول على جميع التدفقات المسجلة
     * @returns {Map<string, FlowDefinition>} خريطة جميع التدفقات
     * @example
     * ```typescript
     * const allFlows = FlowRegistry.getAll();
     * console.log(`إجمالي التدفقات: ${allFlows.size}`);
     * ```
     */
    static getAll(): Map<string, FlowDefinition> {
        return new Map(this.flows);
    }

    /**
     * الحصول على التدفقات حسب الفئة
     * @param {FlowCategory} category - فئة التدفقات
     * @returns {FlowDefinition[]} مصفوفة التدفقات في الفئة المحددة
     * @example
     * ```typescript
     * const textFlows = FlowRegistry.getByCategory('text-processing');
     * console.log(`تدفقات معالجة النصوص: ${textFlows.length}`);
     * ```
     */
    static getByCategory(category: FlowCategory): FlowDefinition[] {
        const flowNames = this.categories.get(category) || new Set();
        return Array.from(flowNames)
            .map(name => this.flows.get(name))
            .filter(Boolean) as FlowDefinition[];
    }

    /**
     * الحصول على جميع الفئات المتاحة
     * @returns {FlowCategory[]} مصفوفة الفئات
     * @example
     * ```typescript
     * const categories = FlowRegistry.getCategories();
     * console.log('الفئات المتاحة:', categories);
     * ```
     */
    static getCategories(): FlowCategory[] {
        return Array.from(this.categories.keys());
    }

    /**
     * التحقق من وجود تدفق
     * @param {string} name - اسم التدفق
     * @returns {boolean} true إذا كان التدفق موجود
     * @example
     * ```typescript
     * if (FlowRegistry.has('grammar-checker')) {
     *   console.log('التدفق موجود');
     * }
     * ```
     */
    static has(name: string): boolean {
        return this.flows.has(name);
    }

    /**
     * تنفيذ تدفق بالاسم والمدخلات
     * @param {string} name - اسم التدفق
     * @param {any} input - مدخلات التدفق
     * @returns {Promise<any>} نتيجة تنفيذ التدفق
     * @throws {Error} إذا لم يوجد التدفق
     * @example
     * ```typescript
     * try {
     *   const result = await FlowRegistry.execute('grammar-checker', {
     *     text: 'نص للفحص',
     *     language: 'ar'
     *   });
     *   console.log('النتيجة:', result);
     * } catch (error) {
     *   console.error('خطأ:', error.message);
     * }
     * ```
     */
    static async execute(name: string, input: any): Promise<any> {
        const flow = this.get(name);
        if (!flow) {
            throw new Error(`Flow '${name}' not found`);
        }
        return flow.handler(input);
    }

    /**
     * الحصول على إحصائيات التدفقات
     * @returns {Object} إحصائيات النظام
     * @returns {number} returns.totalFlows - إجمالي عدد التدفقات
     * @returns {Record<FlowCategory, number>} returns.flowsByCategory - عدد التدفقات لكل فئة
     * @returns {FlowCategory[]} returns.categoryList - قائمة الفئات
     * @example
     * ```typescript
     * const stats = FlowRegistry.getStats();
     * console.log(`إجمالي التدفقات: ${stats.totalFlows}`);
     * console.log('التدفقات حسب الفئة:', stats.flowsByCategory);
     * ```
     */
    static getStats(): {
        totalFlows: number;
        flowsByCategory: Record<FlowCategory, number>;
        categoryList: FlowCategory[];
    } {
        const flowsByCategory: Record<FlowCategory, number> = {} as any;

        for (const category of this.categories.keys()) {
            flowsByCategory[category] = this.categories.get(category)!.size;
        }

        return {
            totalFlows: this.flows.size,
            flowsByCategory,
            categoryList: Array.from(this.categories.keys())
        };
    }

    /**
     * مسح جميع التدفقات (للاستخدام في الاختبارات)
     * @example
     * ```typescript
     * beforeEach(() => {
     *   FlowRegistry.clear();
     * });
     * ```
     */
    static clear(): void {
        this.flows.clear();
        this.categories.clear();
    }
}

/**
 * دالة مساعدة لإنشاء تدفق مع تسجيل تلقائي
 * @param {string} name - اسم التدفق
 * @param {FlowCategory} category - فئة التدفق
 * @param {string} description - وصف التدفق
 * @param {any} inputSchema - مخطط المدخلات
 * @param {any} outputSchema - مخطط المخرجات
 * @param {Function} handler - معالج التدفق
 * @returns {FlowDefinition} تعريف التدفق المسجل
 * @example
 * ```typescript
 * const flow = createFlow(
 *   'my-flow',
 *   'text-processing',
 *   'تدفق مخصص',
 *   MyInputSchema,
 *   MyOutputSchema,
 *   async (input) => ({ result: 'processed' })
 * );
 * ```
 */
export function createFlow(
    name: string,
    category: FlowCategory,
    description: string,
    inputSchema: any,
    outputSchema: any,
    handler: (input: any) => Promise<any>
): FlowDefinition {
    const definition: FlowDefinition = {
        name,
        inputSchema,
        outputSchema,
        handler,
        category,
        description
    };

    FlowRegistry.register(definition);
    return definition;
}

/**
 * دالة مساعدة لإنشاء تدفق Genkit مع تسجيل تلقائي
 * @param {string} name - اسم التدفق
 * @param {FlowCategory} category - فئة التدفق
 * @param {string} description - وصف التدفق
 * @param {any} inputSchema - مخطط المدخلات
 * @param {any} outputSchema - مخطط المخرجات
 * @param {Function} handler - معالج التدفق
 * @returns {FlowDefinition} تعريف التدفق المسجل
 * @example
 * ```typescript
 * const flow = createGenkitFlow(
 *   'grammar-checker',
 *   'text-processing',
 *   'فحص القواعد النحوية',
 *   GrammarCheckInputSchema,
 *   GrammarCheckOutputSchema,
 *   async (input) => {
 *     const { output } = await grammarCheckPrompt(input);
 *     return output;
 *   }
 * );
 * ```
 */
export function createGenkitFlow(
    name: string,
    category: FlowCategory,
    description: string,
    inputSchema: any,
    outputSchema: any,
    handler: (input: any) => Promise<any>
): FlowDefinition {
    const genkitFlow = ai.defineFlow({
        name: `${name}Flow`,
        inputSchema,
        outputSchema
    }, handler);

    const definition: FlowDefinition = {
        name,
        inputSchema,
        outputSchema,
        handler: genkitFlow,
        category,
        description
    };

    FlowRegistry.register(definition);
    return definition;
}

/**
 * الواجهة الموحدة لتنفيذ التدفقات
 * نقطة دخول واحدة لجميع التدفقات المصنفة
 *
 * @class UnifiedFlows
 * @example
 * ```typescript
 * // تنفيذ تدفق واحد
 * const result = await UnifiedFlows.execute({
 *   flowName: 'grammar-checker',
 *   input: { text: 'نص للفحص' }
 * });
 *
 * // تنفيذ متعدد التدفقات
 * const results = await UnifiedFlows.executeMultiple([
 *   { flowName: 'grammar-checker', input: { text: 'نص 1' } },
 *   { flowName: 'summarize-text', input: { text: 'نص 2' } }
 * ]);
 * ```
 */
export class UnifiedFlows {
    /**
     * تنفيذ تدفق بالاسم
     * @param {UnifiedFlowRequest} request - طلب تنفيذ التدفق
     * @returns {Promise<UnifiedFlowResponse>} استجابة تنفيذ التدفق
     * @example
     * ```typescript
     * const result = await UnifiedFlows.execute({
     *   flowName: 'grammar-checker',
     *   input: { text: 'نص للفحص', language: 'ar' }
     * });
     *
     * if (result.success) {
     *   console.log('النتيجة:', result.data);
     *   console.log('وقت التنفيذ:', result.executionTime);
     * } else {
     *   console.error('خطأ:', result.error);
     * }
     * ```
     */
    static async execute(request: UnifiedFlowRequest): Promise<UnifiedFlowResponse> {
        const startTime = Date.now();

        try {
            const flow = FlowRegistry.get(request.flowName);
            if (!flow) {
                throw new Error(`Flow '${request.flowName}' not found`);
            }

            const result = await flow.handler(request.input);
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: result,
                executionTime,
                flowName: request.flowName,
                category: flow.category
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;

            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime,
                flowName: request.flowName,
                category: request.category || 'text-processing'
            };
        }
    }

    /**
     * الحصول على جميع التدفقات المتاحة
     * @returns {Promise<Array<{name: string, category: FlowCategory, description: string}>>} قائمة التدفقات المتاحة
     * @example
     * ```typescript
     * const flows = await UnifiedFlows.getAvailableFlows();
     * console.log('التدفقات المتاحة:');
     * flows.forEach(flow => {
     *   console.log(`- ${flow.name} (${flow.category}): ${flow.description}`);
     * });
     * ```
     */
    static async getAvailableFlows(): Promise<Array<{
        name: string;
        category: FlowCategory;
        description: string;
    }>> {
        const flows = FlowRegistry.getAll();
        return Array.from(flows.values()).map(flow => ({
            name: flow.name,
            category: flow.category,
            description: flow.description
        }));
    }

    /**
     * الحصول على التدفقات حسب الفئة
     * @param {FlowCategory} category - فئة التدفقات
     * @returns {Promise<Array<{name: string, category: FlowCategory, description: string}>>} قائمة التدفقات في الفئة
     * @example
     * ```typescript
     * const textFlows = await UnifiedFlows.getFlowsByCategory('text-processing');
     * console.log('تدفقات معالجة النصوص:', textFlows);
     * ```
     */
    static async getFlowsByCategory(category: FlowCategory): Promise<Array<{
        name: string;
        category: FlowCategory;
        description: string;
    }>> {
        const flows = FlowRegistry.getByCategory(category);
        return flows.map(flow => ({
            name: flow.name,
            category: flow.category,
            description: flow.description
        }));
    }

    /**
     * التحقق من وجود تدفق
     * @param {string} flowName - اسم التدفق
     * @returns {Promise<boolean>} true إذا كان التدفق موجود
     * @example
     * ```typescript
     * const exists = await UnifiedFlows.hasFlow('grammar-checker');
     * console.log('التدفق موجود:', exists);
     * ```
     */
    static async hasFlow(flowName: string): Promise<boolean> {
        return FlowRegistry.has(flowName);
    }

    /**
     * الحصول على معلومات تدفق
     * @param {string} flowName - اسم التدفق
     * @returns {Promise<{name: string, category: FlowCategory, description: string} | null>} معلومات التدفق أو null إذا لم يوجد
     * @example
     * ```typescript
     * const info = await UnifiedFlows.getFlowInfo('grammar-checker');
     * if (info) {
     *   console.log('اسم التدفق:', info.name);
     *   console.log('الفئة:', info.category);
     *   console.log('الوصف:', info.description);
     * }
     * ```
     */
    static async getFlowInfo(flowName: string): Promise<{
        name: string;
        category: FlowCategory;
        description: string;
    } | null> {
        const flow = FlowRegistry.get(flowName);
        if (!flow) return null;

        return {
            name: flow.name,
            category: flow.category,
            description: flow.description
        };
    }

    /**
     * الحصول على إحصائيات التدفقات
     * @returns {Promise<{totalFlows: number, flowsByCategory: Record<FlowCategory, number>, categoryList: FlowCategory[]}>} إحصائيات النظام
     * @example
     * ```typescript
     * const stats = await UnifiedFlows.getStats();
     * console.log(`إجمالي التدفقات: ${stats.totalFlows}`);
     * console.log('التدفقات حسب الفئة:', stats.flowsByCategory);
     * ```
     */
    static async getStats(): Promise<{
        totalFlows: number;
        flowsByCategory: Record<FlowCategory, number>;
        categoryList: FlowCategory[];
    }> {
        return FlowRegistry.getStats();
    }

    /**
     * تنفيذ متعدد التدفقات
     * @param {UnifiedFlowRequest[]} requests - مصفوفة طلبات التنفيذ
     * @returns {Promise<UnifiedFlowResponse[]>} مصفوفة استجابات التنفيذ
     * @example
     * ```typescript
     * const results = await UnifiedFlows.executeMultiple([
     *   { flowName: 'grammar-checker', input: { text: 'نص 1' } },
     *   { flowName: 'summarize-text', input: { text: 'نص 2' } },
     *   { flowName: 'generate-text', input: { prompt: 'مطالبة' } }
     * ]);
     *
     * results.forEach((result, index) => {
     *   if (result.success) {
     *     console.log(`النتيجة ${index + 1}:`, result.data);
     *   } else {
     *     console.error(`خطأ ${index + 1}:`, result.error);
     *   }
     * });
     * ```
     */
    static async executeMultiple(requests: UnifiedFlowRequest[]): Promise<UnifiedFlowResponse[]> {
        const results = await Promise.allSettled(
            requests.map(request => this.execute(request))
        );

        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    success: false,
                    error: result.reason instanceof Error ? result.reason.message : String(result.reason),
                    executionTime: 0,
                    flowName: requests[index].flowName,
                    category: requests[index].category || 'text-processing'
                };
            }
        });
    }

    /**
     * تنفيذ تدفق مع إعادة المحاولة
     * @param {UnifiedFlowRequest} request - طلب تنفيذ التدفق
     * @param {number} [maxRetries=3] - الحد الأقصى للمحاولات
     * @param {number} [delayMs=1000] - التأخير بين المحاولات بالميلي ثانية
     * @returns {Promise<UnifiedFlowResponse>} استجابة تنفيذ التدفق
     * @example
     * ```typescript
     * const result = await UnifiedFlows.executeWithRetry(
     *   { flowName: 'generate-text', input: { prompt: 'مطالبة مهمة' } },
     *   3, // محاولات
     *   1000 // تأخير بالميلي ثانية
     * );
     *
     * if (result.success) {
     *   console.log('تم بنجاح:', result.data);
     * } else {
     *   console.error('فشل بعد جميع المحاولات:', result.error);
     * }
     * ```
     */
    static async executeWithRetry(
        request: UnifiedFlowRequest,
        maxRetries: number = 3,
        delayMs: number = 1000
    ): Promise<UnifiedFlowResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.execute(request);
                if (result.success) {
                    return result;
                }
                lastError = new Error(result.error || 'Unknown error');
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
            }

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }

        return {
            success: false,
            error: lastError?.message || 'Max retries exceeded',
            executionTime: 0,
            flowName: request.flowName,
            category: request.category || 'text-processing'
        };
    }
}

/**
 * تصدير جميع التدفقات المصنفة للاستخدام المباشر
 *
 * @example
 * ```typescript
 * // استيراد التدفقات المباشرة
 * import {
 *   grammarCheck,
 *   summarizeText,
 *   generateText,
 *   UnifiedFlows
 * } from '@/ai/flows';
 *
 * // استخدام التدفقات المباشرة
 * const result = await grammarCheck({ text: 'نص للفحص' });
 *
 * // أو استخدام الواجهة الموحدة
 * const result = await UnifiedFlows.execute({
 *   flowName: 'grammar-checker',
 *   input: { text: 'نص للفحص' }
 * });
 * ```
 */

// تصدير التدفقات المباشرة
export {
    // معالجة النصوص
    aiProofreadDocument,
    detectAiContent,
    grammarCheck,
    humanizeText,
    manipulateText,
    paraphraseText,
    plagiarismCheck,
    summarizeText
} from './text-processing';

export {
    // توليد المحتوى
    generateAgentConfig,
    generateCitation,
    generateCode,
    generateCodebase,
    generateIdeas,
    generateQuiz,
    generateText,
    topicExplainer
} from './content-generation';

export {
    // معالجة المستندات
    generatePresentation,
    generatePresentationOutline,
    generateProjectPlan,
    generateProposal,
    improveReportMarkdown,
    rewriteDocumentToMarkdown,
    rewriteText,
    rewriteToMarkdown,
    summarizeDocument,
    summarizeFullProject,
    summarizeProject,
    summarizeTextWithRatio,
    writeDocument
} from './document-processing';

export {
    // التحليل
    aiResearcher,
    analyzeContext,
    evaluateReport,
    factCheckText,
    imageToText
} from './analysis';

export {
    // الأكاديمي
    analyzeAcademicDocument,
    createLectureUnit,
    generateSessionPlan,
    generateTheoreticalLecture,
    solveAcademicDocument
} from './academic';

export {
    // المرئي
    generateDiagram,
    generatePlantUML
} from './visual';
