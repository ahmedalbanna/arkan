
/**
 * نظام تسجيل التدفقات المركزي
 * يدير جميع تدفقات الذكاء الاصطناعي في مكان واحد
 */

import { ai } from '@/ai/genkit';

export interface FlowDefinition {
    name: string;
    inputSchema: any;
    outputSchema: any;
    handler: (input: any) => Promise<any>;
    category: FlowCategory;
    description: string;
}

export type FlowCategory =
    | 'text-processing'
    | 'content-generation'
    | 'document-processing'
    | 'analysis'
    | 'academic'
    | 'visual';

export class FlowRegistry {
    private static flows = new Map<string, FlowDefinition>();
    private static categories = new Map<FlowCategory, Set<string>>();

    /**
     * تسجيل تدفق جديد
     */
    static register(definition: FlowDefinition): void {
        this.flows.set(definition.name, definition);

        // إضافة للفئة
        if (!this.categories.has(definition.category)) {
            this.categories.set(definition.category, new Set());
        }
        this.categories.get(definition.category)!.add(definition.name);
    }

    /**
     * الحصول على تدفق بالاسم
     */
    static get(name: string): FlowDefinition | undefined {
        return this.flows.get(name);
    }

    /**
     * الحصول على جميع التدفقات
     */
    static getAll(): Map<string, FlowDefinition> {
        return new Map(this.flows);
    }

    /**
     * الحصول على التدفقات حسب الفئة
     */
    static getByCategory(category: FlowCategory): FlowDefinition[] {
        const flowNames = this.categories.get(category) || new Set();
        return Array.from(flowNames)
            .map(name => this.flows.get(name))
            .filter(Boolean) as FlowDefinition[];
    }

    /**
     * الحصول على جميع الفئات
     */
    static getCategories(): FlowCategory[] {
        return Array.from(this.categories.keys());
    }

    /**
     * التحقق من وجود تدفق
     */
    static has(name: string): boolean {
        return this.flows.has(name);
    }

    /**
     * تنفيذ تدفق
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
     */
    static clear(): void {
        this.flows.clear();
        this.categories.clear();
    }
}

/**
 * دالة مساعدة لإنشاء تدفق مع تسجيل تلقائي
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
