# استكشاف الأخطاء وإصلاحها - نظام التدفقات المصنف

## 📋 نظرة عامة

هذا الدليل يساعد في تشخيص وحل المشاكل الشائعة في نظام التدفقات المصنف الجديد. يحتوي على حلول مفصلة وأدوات تشخيص متقدمة.

## 🚨 المشاكل الشائعة وحلولها

### 1. تدفق غير موجود

#### المشكلة
```typescript
const result = await UnifiedFlows.execute({
    flowName: 'non-existent-flow',
    input: { text: 'test' }
});
// خطأ: Flow 'non-existent-flow' not found
```

#### التشخيص
```typescript
// التحقق من التدفقات المتاحة
const availableFlows = await UnifiedFlows.getAvailableFlows();
console.log('التدفقات المتاحة:', availableFlows.map(f => f.name));

// البحث عن تدفق مشابه
const similarFlows = availableFlows.filter(f =>
    f.name.includes('grammar') || f.description.includes('قواعد')
);
console.log('تدفقات مشابهة:', similarFlows);
```

#### الحل
```typescript
// استخدام التدفق الصحيح
const result = await UnifiedFlows.execute({
    flowName: 'grammar-checker', // التدفق الصحيح
    input: { text: 'test' }
});
```

### 2. خطأ في المدخلات

#### المشكلة
```typescript
const result = await UnifiedFlows.execute({
    flowName: 'grammar-checker',
    input: { invalidField: 'value' } // حقل غير صحيح
});
// خطأ: Invalid input schema
```

#### التشخيص
```typescript
// الحصول على معلومات التدفق
const flowInfo = await UnifiedFlows.getFlowInfo('grammar-checker');
console.log('معلومات التدفق:', flowInfo);

// التحقق من المخطط المطلوب
const flow = FlowRegistry.get('grammar-checker');
if (flow) {
    console.log('مخطط المدخلات:', flow.inputSchema);
}
```

#### الحل
```typescript
// استخدام المدخلات الصحيحة
const result = await UnifiedFlows.execute({
    flowName: 'grammar-checker',
    input: {
        text: 'نص للفحص',
        language: 'ar'
    }
});
```

### 3. انتهاء مهلة التنفيذ

#### المشكلة
```typescript
const result = await UnifiedFlows.execute({
    flowName: 'generate-codebase',
    input: { requirements: 'متطلبات معقدة جداً' }
});
// خطأ: Request timeout
```

#### التشخيص
```typescript
// مراقبة وقت التنفيذ
const startTime = Date.now();
const result = await UnifiedFlows.execute({
    flowName: 'generate-codebase',
    input: { requirements: 'متطلبات معقدة' }
});
const executionTime = Date.now() - startTime;
console.log('وقت التنفيذ:', executionTime, 'ms');
```

#### الحل
```typescript
// استخدام إعادة المحاولة مع تأخير أطول
const result = await UnifiedFlows.executeWithRetry(
    {
        flowName: 'generate-codebase',
        input: { requirements: 'متطلبات معقدة' }
    },
    2, // محاولات أقل
    5000 // تأخير أطول
);

// أو تقسيم المهمة إلى أجزاء أصغر
const simpleResult = await UnifiedFlows.execute({
    flowName: 'generate-code',
    input: {
        description: 'دالة بسيطة',
        language: 'javascript'
    }
});
```

### 4. خطأ في الذاكرة

#### المشكلة
```typescript
const result = await UnifiedFlows.execute({
    flowName: 'analyze-context',
    input: {
        contextFiles: [
            { name: 'large-file.txt', content: 'محتوى كبير جداً...' }
        ]
    }
});
// خطأ: Out of memory
```

#### التشخيص
```typescript
// مراقبة استخدام الذاكرة
const startMemory = process.memoryUsage();
console.log('الذاكرة قبل التنفيذ:', startMemory);

const result = await UnifiedFlows.execute({
    flowName: 'analyze-context',
    input: { contextFiles: largeFiles }
});

const endMemory = process.memoryUsage();
console.log('الذاكرة بعد التنفيذ:', endMemory);
console.log('الزيادة في الذاكرة:', endMemory.heapUsed - startMemory.heapUsed);
```

#### الحل
```typescript
// تقسيم الملفات الكبيرة
const chunkSize = 10000; // 10KB لكل جزء
const chunks = [];
for (let i = 0; i < largeFile.length; i += chunkSize) {
    chunks.push(largeFile.slice(i, i + chunkSize));
}

// معالجة كل جزء منفصلاً
const results = [];
for (const chunk of chunks) {
    const result = await UnifiedFlows.execute({
        flowName: 'analyze-context',
        input: { contextFiles: [{ name: 'chunk', content: chunk }] }
    });
    results.push(result);
}
```

### 5. خطأ في الشبكة

#### المشكلة
```typescript
const result = await UnifiedFlows.execute({
    flowName: 'ai-researcher',
    input: { query: 'بحث عن الذكاء الاصطناعي' }
});
// خطأ: Network error
```

#### التشخيص
```typescript
// اختبار الاتصال
async function testConnection() {
    try {
        const result = await fetch('https://api.example.com/health');
        return result.ok;
    } catch (error) {
        console.error('خطأ في الاتصال:', error);
        return false;
    }
}

const isConnected = await testConnection();
console.log('الاتصال متاح:', isConnected);
```

#### الحل
```typescript
// استخدام إعادة المحاولة مع تأخير متزايد
const result = await UnifiedFlows.executeWithRetry(
    {
        flowName: 'ai-researcher',
        input: { query: 'بحث عن الذكاء الاصطناعي' }
    },
    5, // محاولات أكثر
    2000 // تأخير أطول
);

// أو استخدام تدفق محلي بديل
if (!result.success) {
    const localResult = await UnifiedFlows.execute({
        flowName: 'analyze-context',
        input: {
            prompt: 'حلل هذا الموضوع',
            contextFiles: [{ name: 'local-data', content: 'بيانات محلية' }]
        }
    });
}
```

## 🔧 أدوات التشخيص المتقدمة

### أداة تشخيص شاملة

```typescript
/**
 * أداة تشخيص شاملة للتدفقات
 */
class FlowDiagnostics {

    /**
     * تشخيص شامل للتدفق
     */
    static async diagnoseFlow(flowName: string, input: any) {
        console.log(`🔍 تشخيص التدفق: ${flowName}`);

        const diagnosis = {
            flowName,
            timestamp: new Date(),
            checks: {
                flowExists: false,
                inputValid: false,
                executionSuccessful: false,
                performanceAcceptable: false
            },
            results: {
                executionTime: 0,
                memoryUsage: 0,
                error: null,
                data: null
            },
            recommendations: []
        };

        // 1. التحقق من وجود التدفق
        diagnosis.checks.flowExists = FlowRegistry.has(flowName);
        if (!diagnosis.checks.flowExists) {
            diagnosis.recommendations.push('التدفق غير موجود - تحقق من اسم التدفق');
            return diagnosis;
        }

        // 2. التحقق من صحة المدخلات
        const flow = FlowRegistry.get(flowName);
        if (flow) {
            try {
                flow.inputSchema.parse(input);
                diagnosis.checks.inputValid = true;
            } catch (error) {
                diagnosis.checks.inputValid = false;
                diagnosis.recommendations.push('مدخلات غير صالحة - تحقق من المخطط المطلوب');
            }
        }

        // 3. تنفيذ التدفق مع مراقبة الأداء
        if (diagnosis.checks.inputValid) {
            const startTime = Date.now();
            const startMemory = process.memoryUsage();

            try {
                const result = await UnifiedFlows.execute({ flowName, input });
                const endTime = Date.now();
                const endMemory = process.memoryUsage();

                diagnosis.results.executionTime = endTime - startTime;
                diagnosis.results.memoryUsage = endMemory.heapUsed - startMemory.heapUsed;
                diagnosis.results.data = result.data;

                diagnosis.checks.executionSuccessful = result.success;

                if (!result.success) {
                    diagnosis.results.error = result.error;
                    diagnosis.recommendations.push(`فشل التنفيذ: ${result.error}`);
                }

                // 4. تقييم الأداء
                diagnosis.checks.performanceAcceptable =
                    diagnosis.results.executionTime < 10000 && // أقل من 10 ثوان
                    diagnosis.results.memoryUsage < 100 * 1024 * 1024; // أقل من 100MB

                if (!diagnosis.checks.performanceAcceptable) {
                    diagnosis.recommendations.push('الأداء بطيء - فكر في تحسين المدخلات أو استخدام تدفق بديل');
                }

            } catch (error) {
                diagnosis.results.error = error instanceof Error ? error.message : String(error);
                diagnosis.recommendations.push(`خطأ غير متوقع: ${diagnosis.results.error}`);
            }
        }

        return diagnosis;
    }

    /**
     * تشخيص متعدد التدفقات
     */
    static async diagnoseMultipleFlows(requests: UnifiedFlowRequest[]) {
        console.log(`🔍 تشخيص ${requests.length} تدفق`);

        const diagnoses = [];

        for (const request of requests) {
            const diagnosis = await this.diagnoseFlow(request.flowName, request.input);
            diagnoses.push(diagnosis);
        }

        // تحليل النتائج الإجمالية
        const summary = {
            totalFlows: diagnoses.length,
            successfulFlows: diagnoses.filter(d => d.checks.executionSuccessful).length,
            failedFlows: diagnoses.filter(d => !d.checks.executionSuccessful).length,
            averageExecutionTime: diagnoses.reduce((sum, d) => sum + d.results.executionTime, 0) / diagnoses.length,
            totalMemoryUsage: diagnoses.reduce((sum, d) => sum + d.results.memoryUsage, 0),
            commonIssues: this.identifyCommonIssues(diagnoses)
        };

        console.log('ملخص التشخيص:', summary);
        return { diagnoses, summary };
    }

    /**
     * تحديد المشاكل الشائعة
     */
    private static identifyCommonIssues(diagnoses: any[]) {
        const issues: Record<string, number> = {};

        diagnoses.forEach(diagnosis => {
            diagnosis.recommendations.forEach((rec: string) => {
                issues[rec] = (issues[rec] || 0) + 1;
            });
        });

        return Object.entries(issues)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([issue, count]) => ({ issue, count }));
    }
}
```

### أداة مراقبة الأداء

```typescript
/**
 * أداة مراقبة أداء التدفقات
 */
class PerformanceMonitor {
    private static metrics = new Map<string, {
        executions: number;
        totalTime: number;
        minTime: number;
        maxTime: number;
        errors: number;
        lastExecution: Date;
    }>();

    /**
     * مراقبة تنفيذ التدفق
     */
    static async monitorExecution(flowName: string, input: any) {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();

        try {
            const result = await UnifiedFlows.execute({ flowName, input });
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            this.recordMetrics(flowName, executionTime, result.success);

            return {
                result,
                metrics: {
                    executionTime,
                    memoryUsage: process.memoryUsage().heapUsed - startMemory.heapUsed,
                    timestamp: new Date()
                }
            };

        } catch (error) {
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            this.recordMetrics(flowName, executionTime, false);

            throw error;
        }
    }

    /**
     * تسجيل المقاييس
     */
    private static recordMetrics(flowName: string, executionTime: number, success: boolean) {
        const current = this.metrics.get(flowName) || {
            executions: 0,
            totalTime: 0,
            minTime: Infinity,
            maxTime: 0,
            errors: 0,
            lastExecution: new Date()
        };

        current.executions++;
        current.totalTime += executionTime;
        current.minTime = Math.min(current.minTime, executionTime);
        current.maxTime = Math.max(current.maxTime, executionTime);
        current.lastExecution = new Date();

        if (!success) {
            current.errors++;
        }

        this.metrics.set(flowName, current);
    }

    /**
     * الحصول على تقرير الأداء
     */
    static getPerformanceReport() {
        const report: any = {};

        for (const [flowName, metrics] of this.metrics) {
            report[flowName] = {
                ...metrics,
                averageTime: metrics.totalTime / metrics.executions,
                successRate: ((metrics.executions - metrics.errors) / metrics.executions) * 100,
                errorRate: (metrics.errors / metrics.executions) * 100
            };
        }

        return report;
    }

    /**
     * الحصول على التدفقات الأبطأ
     */
    static getSlowestFlows(limit: number = 10) {
        const flows = Array.from(this.metrics.entries())
            .map(([name, metrics]) => ({
                name,
                averageTime: metrics.totalTime / metrics.executions,
                executions: metrics.executions
            }))
            .sort((a, b) => b.averageTime - a.averageTime)
            .slice(0, limit);

        return flows;
    }

    /**
     * الحصول على التدفقات الأكثر خطأ
     */
    static getMostErrorProneFlows(limit: number = 10) {
        const flows = Array.from(this.metrics.entries())
            .map(([name, metrics]) => ({
                name,
                errorRate: (metrics.errors / metrics.executions) * 100,
                totalErrors: metrics.errors,
                executions: metrics.executions
            }))
            .filter(flow => flow.totalErrors > 0)
            .sort((a, b) => b.errorRate - a.errorRate)
            .slice(0, limit);

        return flows;
    }
}
```

## 🛠️ أدوات الإصلاح التلقائي

### إصلاح المدخلات التلقائي

```typescript
/**
 * أداة إصلاح المدخلات التلقائي
 */
class InputAutoFixer {

    /**
     * إصلاح مدخلات التدفق تلقائياً
     */
    static async fixAndExecute(flowName: string, input: any) {
        console.log(`🔧 إصلاح مدخلات التدفق: ${flowName}`);

        // 1. محاولة التنفيذ الأصلي
        try {
            const result = await UnifiedFlows.execute({ flowName, input });
            if (result.success) {
                console.log('✅ نجح التنفيذ بدون إصلاح');
                return result;
            }
        } catch (error) {
            console.log('⚠️ فشل التنفيذ الأصلي:', error);
        }

        // 2. محاولة الإصلاح التلقائي
        const fixedInput = this.autoFixInput(flowName, input);

        if (fixedInput) {
            console.log('🔧 تم إصلاح المدخلات، جاري التنفيذ...');
            const result = await UnifiedFlows.execute({ flowName, input: fixedInput });

            if (result.success) {
                console.log('✅ نجح التنفيذ بعد الإصلاح');
                return result;
            }
        }

        // 3. محاولة تدفق بديل
        const alternativeFlow = this.getAlternativeFlow(flowName);
        if (alternativeFlow) {
            console.log(`🔄 جاري تجربة التدفق البديل: ${alternativeFlow}`);
            const result = await UnifiedFlows.execute({
                flowName: alternativeFlow,
                input
            });

            if (result.success) {
                console.log('✅ نجح التدفق البديل');
                return result;
            }
        }

        throw new Error('فشل جميع محاولات الإصلاح');
    }

    /**
     * إصلاح المدخلات تلقائياً
     */
    private static autoFixInput(flowName: string, input: any): any {
        const fixes: Record<string, (input: any) => any> = {
            'grammar-checker': (input) => {
                if (!input.text) {
                    return { ...input, text: 'نص للفحص' };
                }
                if (!input.language) {
                    return { ...input, language: 'ar' };
                }
                return input;
            },
            'summarize-text': (input) => {
                if (!input.text) {
                    return { ...input, text: 'نص للتلخيص' };
                }
                if (!input.maxLength) {
                    return { ...input, maxLength: 100 };
                }
                return input;
            },
            'generate-text': (input) => {
                if (!input.prompt) {
                    return { ...input, prompt: 'اكتب نص' };
                }
                if (!input.length) {
                    return { ...input, length: 'medium' };
                }
                return input;
            }
        };

        const fixer = fixes[flowName];
        return fixer ? fixer(input) : null;
    }

    /**
     * الحصول على تدفق بديل
     */
    private static getAlternativeFlow(flowName: string): string | null {
        const alternatives: Record<string, string> = {
            'grammar-checker': 'ai-proofread-document',
            'summarize-text': 'summarize-document',
            'generate-text': 'topic-explainer',
            'analyze-context': 'ai-researcher'
        };

        return alternatives[flowName] || null;
    }
}
```

### إصلاح الأداء التلقائي

```typescript
/**
 * أداة إصلاح الأداء التلقائي
 */
class PerformanceAutoFixer {

    /**
     * تحسين أداء التدفق تلقائياً
     */
    static async optimizeFlowExecution(flowName: string, input: any) {
        console.log(`⚡ تحسين أداء التدفق: ${flowName}`);

        // 1. تحسين المدخلات
        const optimizedInput = this.optimizeInput(flowName, input);

        // 2. تنفيذ مع مراقبة الأداء
        const startTime = Date.now();
        const result = await UnifiedFlows.execute({ flowName, input: optimizedInput });
        const executionTime = Date.now() - startTime;

        // 3. تقييم الأداء
        if (executionTime > 10000) { // أكثر من 10 ثوان
            console.log('⚠️ الأداء بطيء، جاري التحسين...');

            // محاولة تقسيم المهمة
            const splitResult = await this.splitTask(flowName, optimizedInput);
            if (splitResult) {
                return splitResult;
            }

            // محاولة تدفق أسرع
            const fasterFlow = this.getFasterFlow(flowName);
            if (fasterFlow) {
                console.log(`🚀 جاري تجربة التدفق الأسرع: ${fasterFlow}`);
                const fastResult = await UnifiedFlows.execute({
                    flowName: fasterFlow,
                    input: optimizedInput
                });

                if (fastResult.success) {
                    console.log('✅ نجح التدفق الأسرع');
                    return fastResult;
                }
            }
        }

        return result;
    }

    /**
     * تحسين المدخلات
     */
    private static optimizeInput(flowName: string, input: any): any {
        const optimizations: Record<string, (input: any) => any> = {
            'analyze-context': (input) => {
                // تقليل حجم الملفات
                if (input.contextFiles) {
                    input.contextFiles = input.contextFiles.map((file: any) => ({
                        ...file,
                        content: file.content.substring(0, 50000) // حد أقصى 50KB
                    }));
                }
                return input;
            },
            'generate-text': (input) => {
                // تقليل طول المطالبة
                if (input.prompt && input.prompt.length > 5000) {
                    input.prompt = input.prompt.substring(0, 5000);
                }
                return input;
            },
            'summarize-text': (input) => {
                // تقليل حجم النص
                if (input.text && input.text.length > 100000) {
                    input.text = input.text.substring(0, 100000);
                }
                return input;
            }
        };

        const optimizer = optimizations[flowName];
        return optimizer ? optimizer(input) : input;
    }

    /**
     * تقسيم المهمة
     */
    private static async splitTask(flowName: string, input: any): Promise<any> {
        const splitters: Record<string, (input: any) => Promise<any>> = {
            'analyze-context': async (input) => {
                if (input.contextFiles && input.contextFiles.length > 1) {
                    // تحليل كل ملف منفصلاً
                    const results = [];
                    for (const file of input.contextFiles) {
                        const result = await UnifiedFlows.execute({
                            flowName,
                            input: { ...input, contextFiles: [file] }
                        });
                        results.push(result);
                    }

                    // دمج النتائج
                    return {
                        success: true,
                        data: {
                            combinedAnalysis: results.map(r => r.data),
                            summary: 'تم تحليل الملفات منفصلاً'
                        }
                    };
                }
                return null;
            }
        };

        const splitter = splitters[flowName];
        return splitter ? await splitter(input) : null;
    }

    /**
     * الحصول على تدفق أسرع
     */
    private static getFasterFlow(flowName: string): string | null {
        const fasterFlows: Record<string, string> = {
            'analyze-context': 'ai-researcher',
            'generate-text': 'topic-explainer',
            'summarize-text': 'summarize-document'
        };

        return fasterFlows[flowName] || null;
    }
}
```

## 📊 تقارير التشخيص

### تقرير شامل للنظام

```typescript
/**
 * تقرير تشخيص شامل للنظام
 */
class SystemDiagnosticsReport {

    /**
     * إنشاء تقرير تشخيص شامل
     */
    static async generateReport() {
        console.log('📊 إنشاء تقرير تشخيص شامل...');

        const report = {
            timestamp: new Date(),
            systemHealth: await this.checkSystemHealth(),
            flowStatistics: await this.getFlowStatistics(),
            performanceMetrics: await this.getPerformanceMetrics(),
            commonIssues: await this.identifyCommonIssues(),
            recommendations: await this.generateRecommendations()
        };

        console.log('📋 تقرير التشخيص:', report);
        return report;
    }

    /**
     * فحص صحة النظام
     */
    private static async checkSystemHealth() {
        const health = {
            totalFlows: FlowRegistry.getAll().size,
            availableFlows: (await UnifiedFlows.getAvailableFlows()).length,
            registryHealthy: true,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };

        // فحص التدفقات المسجلة
        const stats = FlowRegistry.getStats();
        health.registryHealthy = health.totalFlows === stats.totalFlows;

        return health;
    }

    /**
     * الحصول على إحصائيات التدفقات
     */
    private static async getFlowStatistics() {
        const stats = FlowRegistry.getStats();
        const flows = await UnifiedFlows.getAvailableFlows();

        return {
            totalFlows: stats.totalFlows,
            flowsByCategory: stats.flowsByCategory,
            categoryDistribution: flows.reduce((acc, flow) => {
                acc[flow.category] = (acc[flow.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }

    /**
     * الحصول على مقاييس الأداء
     */
    private static async getPerformanceMetrics() {
        const performanceReport = PerformanceMonitor.getPerformanceReport();
        const slowestFlows = PerformanceMonitor.getSlowestFlows(5);
        const errorProneFlows = PerformanceMonitor.getMostErrorProneFlows(5);

        return {
            performanceReport,
            slowestFlows,
            errorProneFlows,
            averageExecutionTime: Object.values(performanceReport)
                .reduce((sum: number, metrics: any) => sum + metrics.averageTime, 0) /
                Object.keys(performanceReport).length
        };
    }

    /**
     * تحديد المشاكل الشائعة
     */
    private static async identifyCommonIssues() {
        const issues = [];

        // فحص التدفقات البطيئة
        const slowestFlows = PerformanceMonitor.getSlowestFlows(3);
        if (slowestFlows.length > 0) {
            issues.push({
                type: 'performance',
                severity: 'warning',
                message: `تدفقات بطيئة: ${slowestFlows.map(f => f.name).join(', ')}`,
                recommendation: 'فكر في تحسين المدخلات أو استخدام تدفقات بديلة'
            });
        }

        // فحص التدفقات الأكثر خطأ
        const errorProneFlows = PerformanceMonitor.getMostErrorProneFlows(3);
        if (errorProneFlows.length > 0) {
            issues.push({
                type: 'reliability',
                severity: 'error',
                message: `تدفقات عالية الخطأ: ${errorProneFlows.map(f => f.name).join(', ')}`,
                recommendation: 'تحقق من المدخلات وتحسين معالجة الأخطاء'
            });
        }

        return issues;
    }

    /**
     * إنشاء التوصيات
     */
    private static async generateRecommendations() {
        const recommendations = [];

        // توصيات الأداء
        const performanceReport = PerformanceMonitor.getPerformanceReport();
        const slowFlows = Object.entries(performanceReport)
            .filter(([, metrics]: [string, any]) => metrics.averageTime > 5000)
            .map(([name]) => name);

        if (slowFlows.length > 0) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                action: 'تحسين الأداء',
                details: `التدفقات البطيئة: ${slowFlows.join(', ')}`,
                steps: [
                    'تحسين المدخلات لتقليل حجم البيانات',
                    'استخدام إعادة المحاولة مع تأخير أطول',
                    'تقسيم المهام الكبيرة إلى أجزاء أصغر'
                ]
            });
        }

        // توصيات الموثوقية
        const errorProneFlows = PerformanceMonitor.getMostErrorProneFlows(3);
        if (errorProneFlows.length > 0) {
            recommendations.push({
                category: 'reliability',
                priority: 'high',
                action: 'تحسين الموثوقية',
                details: `التدفقات عالية الخطأ: ${errorProneFlows.map(f => f.name).join(', ')}`,
                steps: [
                    'تحسين التحقق من المدخلات',
                    'إضافة معالجة أفضل للأخطاء',
                    'استخدام تدفقات بديلة عند الفشل'
                ]
            });
        }

        return recommendations;
    }
}
```

## 🎯 الخلاصة

هذا الدليل يوفر:

- **تشخيص شامل**: أدوات متقدمة لتشخيص المشاكل
- **حلول عملية**: حلول مفصلة للمشاكل الشائعة
- **إصلاح تلقائي**: أدوات لإصلاح المشاكل تلقائياً
- **مراقبة الأداء**: أدوات لمراقبة وتحسين الأداء
- **تقارير مفصلة**: تقارير شاملة لحالة النظام

استخدام هذه الأدوات يساعد في:
- **توفير الوقت**: تشخيص سريع للمشاكل
- **تحسين الأداء**: مراقبة وتحسين مستمر
- **زيادة الموثوقية**: إصلاح تلقائي للمشاكل
- **سهولة الصيانة**: تقارير واضحة ومفصلة
