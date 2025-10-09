/**
 * مثال على كيفية استخدام النظام الجديد لتنظيم السياقات في SectionAccordionItem
 *
 * هذا الملف يوضح كيفية تحديث SectionAccordionItem لاستخدام النظام الجديد
 * لتنظيم السياقات حسب المعرفة والأهمية
 */

import { ContextOrganizer, createOrganizedPrompt } from '@/ai/core/context-organizer';

/**
 * مثال على كيفية تحديث SectionAccordionItem لاستخدام النظام الجديد
 */
export function useEnhancedContextSelection(itemKey: string) {
    // جمع السياقات من المستخدم
    const contexts = [
        {
            fileName: 'project-guidelines.md',
            content: 'يجب أن يكون التقرير مهنياً ومفصلاً...',
            type: 'guidelines' as const
        },
        {
            fileName: 'database-design.pdf',
            content: 'تصميم قاعدة البيانات يجب أن يتبع...',
            type: 'textbook' as const
        },
        {
            fileName: 'example-report.docx',
            content: 'مثال على تقرير مشابه...',
            type: 'example' as const
        },
        {
            fileName: 'project-context.txt',
            content: 'سياق المشروع العام...',
            type: 'context' as const
        },
        {
            fileName: 'questions.md',
            content: 'أسئلة مهمة يجب الإجابة عليها...',
            type: 'question' as const
        }
    ];

    // تنظيم السياقات حسب المعرفة والأهمية
    const organizedContext = ContextOrganizer.organizeContexts(
        contexts,
        itemKey, // القسم المستهدف
        ['يجب أن يكون المحتوى دقيقاً', 'استخدم لغة مهنية'] // المتطلبات المحددة
    );

    // إنشاء مطالبة منظمة
    const organizedPrompt = createOrganizedPrompt(organizedContext);

    return {
        organizedContext,
        organizedPrompt,
        statistics: organizedContext.statistics
    };
}

/**
 * مثال على كيفية عرض السياقات المنظمة في واجهة المستخدم
 */
export function ContextOrganizationDisplay({ organizedContext }: { organizedContext: any }) {
    return (
        <div className="space-y-4">
            {/* الإرشادات */}
            {organizedContext.guidelines.length > 0 && (
                <div className="border-l-4 border-l-red-500 p-3 bg-red-50">
                    <h3 className="font-bold text-red-800">📋 الإرشادات والتوجيهات</h3>
                    <p className="text-sm text-red-600">
                        {organizedContext.guidelines.length} إرشاد - الأولوية القصوى
                    </p>
                </div>
            )}

            {/* المعرفة الأساسية */}
            {organizedContext.foundational.length > 0 && (
                <div className="border-l-4 border-l-blue-500 p-3 bg-blue-50">
                    <h3 className="font-bold text-blue-800">🏗️ المعرفة الأساسية</h3>
                    <p className="text-sm text-blue-600">
                        {organizedContext.foundational.length} مصدر - المعرفة الأساسية
                    </p>
                </div>
            )}

            {/* المعرفة المفاهيمية */}
            {organizedContext.conceptual.length > 0 && (
                <div className="border-l-4 border-l-green-500 p-3 bg-green-50">
                    <h3 className="font-bold text-green-800">💡 المعرفة المفاهيمية</h3>
                    <p className="text-sm text-green-600">
                        {organizedContext.conceptual.length} مصدر - النظريات والمبادئ
                    </p>
                </div>
            )}

            {/* المعرفة الإجرائية */}
            {organizedContext.procedural.length > 0 && (
                <div className="border-l-4 border-l-yellow-500 p-3 bg-yellow-50">
                    <h3 className="font-bold text-yellow-800">⚙️ المعرفة الإجرائية</h3>
                    <p className="text-sm text-yellow-600">
                        {organizedContext.procedural.length} مصدر - الخطوات والإجراءات
                    </p>
                </div>
            )}

            {/* المراجع */}
            {organizedContext.reference.length > 0 && (
                <div className="border-l-4 border-l-gray-500 p-3 bg-gray-50">
                    <h3 className="font-bold text-gray-800">📚 المراجع الإضافية</h3>
                    <p className="text-sm text-gray-600">
                        {organizedContext.reference.length} مصدر - مراجع إضافية
                    </p>
                </div>
            )}

            {/* الإحصائيات */}
            <div className="border rounded-lg p-3 bg-gray-50">
                <h3 className="font-bold text-gray-800">📊 إحصائيات السياق</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>إجمالي العناصر: {organizedContext.statistics.totalItems}</div>
                    <div>متوسط الصلة: {organizedContext.statistics.averageRelevance}</div>
                    <div className="col-span-2">
                        التوزيع: {Object.entries(organizedContext.statistics.byType)
                            .map(([type, count]) => `${type}: ${count}`)
                            .join(', ')}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * مثال على كيفية تحديث useSectionGenerationData لاستخدام النظام الجديد
 */
export function useEnhancedSectionGenerationData(itemKey: string) {
    // جمع البيانات من SectionAccordionItem
    const contexts = [
        // سيتم جمع هذه البيانات من المستخدم في الواجهة
    ];

    // تنظيم السياقات
    const organizedContext = ContextOrganizer.organizeContexts(
        contexts,
        itemKey,
        [] // المتطلبات المحددة
    );

    // إنشاء مطالبة منظمة
    const organizedPrompt = createOrganizedPrompt(organizedContext);

    return {
        organizedContext,
        organizedPrompt,
        // باقي البيانات...
    };
}

/**
 * مثال على كيفية تحديث API call لاستخدام السياقات المنظمة
 */
export function createEnhancedApiData(itemKey: string, organizedContext: any) {
    return {
        sectionToGenerate: itemKey,

        // السياقات المنظمة حسب المعرفة
        organizedContext: {
            guidelines: organizedContext.guidelines,
            foundational: organizedContext.foundational,
            conceptual: organizedContext.conceptual,
            procedural: organizedContext.procedural,
            reference: organizedContext.reference
        },

        // إحصائيات السياق
        contextStatistics: organizedContext.statistics,

        // باقي البيانات...
    };
}
