/**
 * أمثلة عملية لاستخدام برومبتات المخططات الذكية
 * يوضح كيفية استخدام النظام لتوليد مخططات مختلفة
 */

import { generateDiagram } from '@/ai/flows/generate-diagram';
import {
    DiagramPromptBuilder
} from '@/ai/prompts/diagram-prompts';
import type { DiagramType } from '@/ai/schemas';

// إنشاء مثيل من بناء البرومبتات
const promptBuilder = new DiagramPromptBuilder();

/**
 * مثال 1: توليد مخطط فئات لنظام إدارة مكتبة
 */
export async function generateLibraryClassDiagram() {
    console.log('🎨 مثال: توليد مخطط فئات لنظام إدارة المكتبة');

    try {
        const result = await generateDiagram({
            title: 'نظام إدارة المكتبة الذكي',
            description: 'مخطط الفئات الأساسية لنظام إدارة المكتبة مع الكتب والمستخدمين والاستعارة',
            type: 'class',
            complexity: 'detailed',
            style: {
                theme: 'modern',
                direction: 'top-bottom',
                showDetails: true,
                includeNotes: true
            },
            requirements: [
                'إدارة الكتب والمؤلفين',
                'تسجيل المستخدمين',
                'نظام الاستعارة والإرجاع',
                'البحث والتصفية',
                'إدارة المخزون'
            ],
            projectContext: {
                title: 'نظام المكتبة الذكي',
                description: 'نظام شامل لإدارة المكتبات الرقمية',
                domain: 'library-management',
                technologies: ['Java', 'Spring Boot', 'MySQL', 'React'],
                stakeholders: ['أمين المكتبة', 'القراء', 'الإدارة'],
                constraints: ['أمان البيانات', 'سهولة الاستخدام']
            },
            intelligentSettings: {
                enableContextAnalysis: true,
                enableIterativeImprovement: true,
                qualityThreshold: 85
            }
        });

        console.log('✅ تم توليد مخطط الفئات بنجاح');
        console.log(`📊 جودة المخطط: ${result.performanceMetrics.qualityScore}/100`);
        console.log(`⏱️ وقت التوليد: ${result.performanceMetrics.executionTime}ms`);
        console.log(`🔄 عدد التكرارات: ${result.performanceMetrics.iterations}`);

        return result;

    } catch (error) {
        console.error('❌ خطأ في توليد مخطط الفئات:', error);
        throw error;
    }
}

/**
 * مثال 2: توليد مخطط تسلسل لعملية الاستعارة
 */
export async function generateBorrowingSequenceDiagram() {
    console.log('🎨 مثال: توليد مخطط تسلسل لعملية الاستعارة');

    try {
        const result = await generateDiagram({
            title: 'عملية استعارة كتاب',
            description: 'تسلسل العمليات لاستعارة كتاب من المكتبة',
            type: 'sequence',
            complexity: 'comprehensive',
            style: {
                theme: 'colorful',
                direction: 'left-right',
                showDetails: true,
                includeNotes: true
            },
            requirements: [
                'تسجيل دخول المستخدم',
                'البحث عن الكتاب',
                'التحقق من التوفر',
                'تسجيل الاستعارة',
                'إرسال إشعار'
            ],
            projectContext: {
                stakeholders: [
                    'القارئ',
                    'نظام المصادقة',
                    'قاعدة بيانات الكتب',
                    'نظام الاستعارة',
                    'نظام الإشعارات'
                ]
            },
            intelligentSettings: {
                enableContextAnalysis: true,
                enableIterativeImprovement: true,
                qualityThreshold: 90
            }
        });

        console.log('✅ تم توليد مخطط التسلسل بنجاح');
        console.log(`📊 عدد العناصر: ${result.elementCount}`);
        console.log(`💡 اقتراحات التحسين: ${result.suggestions.length}`);

        return result;

    } catch (error) {
        console.error('❌ خطأ في توليد مخطط التسلسل:', error);
        throw error;
    }
}

/**
 * مثال 3: توليد مخطط حالات استخدام
 */
export async function generateUseCaseDiagram() {
    console.log('🎨 مثال: توليد مخطط حالات الاستخدام');

    try {
        const result = await generateDiagram({
            title: 'حالات استخدام نظام المكتبة',
            description: 'جميع حالات الاستخدام الرئيسية في نظام إدارة المكتبة',
            type: 'usecase',
            complexity: 'detailed',
            requirements: [
                'تسجيل مستخدم جديد',
                'تسجيل الدخول',
                'البحث عن كتاب',
                'استعارة كتاب',
                'إرجاع كتاب',
                'تجديد الاستعارة',
                'إدارة الكتب',
                'إنشاء التقارير'
            ],
            projectContext: {
                stakeholders: [
                    'القارئ العادي',
                    'القارئ المميز',
                    'أمين المكتبة',
                    'مدير النظام',
                    'المحاسب'
                ]
            },
            intelligentSettings: {
                enableContextAnalysis: true,
                qualityThreshold: 80
            }
        });

        console.log('✅ تم توليد مخطط حالات الاستخدام بنجاح');
        return result;

    } catch (error) {
        console.error('❌ خطأ في توليد مخطط حالات الاستخدام:', error);
        throw error;
    }
}

/**
 * مثال 4: توليد مخطط شبكة لبنية النظام
 */
export async function generateNetworkDiagram() {
    console.log('🎨 مثال: توليد مخطط الشبكة');

    try {
        const result = await generateDiagram({
            title: 'بنية شبكة نظام المكتبة',
            description: 'توزيع مكونات النظام على الشبكة والخوادم',
            type: 'network',
            complexity: 'comprehensive',
            requirements: [
                'خادم الويب',
                'خادم قاعدة البيانات',
                'خادم التطبيقات',
                'موازن الأحمال',
                'جدار الحماية',
                'شبكة DMZ'
            ],
            projectContext: {
                technologies: [
                    'Nginx',
                    'Apache Tomcat',
                    'MySQL Cluster',
                    'Redis',
                    'Docker',
                    'Kubernetes'
                ],
                constraints: [
                    'أمان عالي',
                    'توفر 99.9%',
                    'قابلية التوسع',
                    'النسخ الاحتياطي'
                ]
            },
            intelligentSettings: {
                enableContextAnalysis: true,
                enableIterativeImprovement: true,
                qualityThreshold: 85
            }
        });

        console.log('✅ تم توليد مخطط الشبكة بنجاح');
        return result;

    } catch (error) {
        console.error('❌ خطأ في توليد مخطط الشبكة:', error);
        throw error;
    }
}

/**
 * مثال 5: توليد خريطة ذهنية لمتطلبات المشروع
 */
export async function generateProjectMindmap() {
    console.log('🎨 مثال: توليد خريطة ذهنية للمشروع');

    try {
        const result = await generateDiagram({
            title: 'متطلبات نظام المكتبة الذكي',
            description: 'خريطة ذهنية شاملة لجميع متطلبات وميزات النظام',
            type: 'mindmap',
            complexity: 'comprehensive',
            requirements: [
                'إدارة المحتوى',
                'إدارة المستخدمين',
                'العمليات الأساسية',
                'التقارير والإحصائيات',
                'الأمان والحماية',
                'التكامل الخارجي'
            ],
            projectContext: {
                domain: 'library-management',
                stakeholders: [
                    'المستخدمون',
                    'الإدارة',
                    'فريق التطوير',
                    'فريق الدعم'
                ]
            },
            intelligentSettings: {
                enableContextAnalysis: true,
                qualityThreshold: 75
            }
        });

        console.log('✅ تم توليد الخريطة الذهنية بنجاح');
        return result;

    } catch (error) {
        console.error('❌ خطأ في توليد الخريطة الذهنية:', error);
        throw error;
    }
}

/**
 * مثال 6: توليد مخطط جانت لجدولة المشروع
 */
export async function generateProjectGanttChart() {
    console.log('🎨 مثال: توليد مخطط جانت للمشروع');

    try {
        const result = await generateDiagram({
            title: 'جدولة مشروع نظام المكتبة',
            description: 'الجدول الزمني لتطوير وتنفيذ نظام إدارة المكتبة',
            type: 'gantt',
            complexity: 'detailed',
            requirements: [
                'تحليل المتطلبات',
                'تصميم النظام',
                'تطوير قاعدة البيانات',
                'تطوير الواجهة الخلفية',
                'تطوير الواجهة الأمامية',
                'الاختبار والتجريب',
                'النشر والتدريب'
            ],
            projectContext: {
                constraints: [
                    'مدة المشروع: 6 أشهر',
                    'فريق من 5 مطورين',
                    'ميزانية محدودة',
                    'موعد إطلاق ثابت'
                ]
            },
            intelligentSettings: {
                enableContextAnalysis: true,
                qualityThreshold: 80
            }
        });

        console.log('✅ تم توليد مخطط جانت بنجاح');
        return result;

    } catch (error) {
        console.error('❌ خطأ في توليد مخطط جانت:', error);
        throw error;
    }
}

/**
 * مثال 7: اختبار برومبت مخصص
 */
export async function testCustomPrompt() {
    console.log('🧪 مثال: اختبار برومبت مخصص');

    try {
        // بناء برومبت مخصص
        const customPrompt = await promptBuilder.buildDiagramPrompt({
            diagramType: 'class',
            title: 'نظام الدفع الإلكتروني',
            description: 'مخطط فئات لنظام دفع آمن ومتطور',
            complexity: 'comprehensive',
            style: {
                theme: 'modern',
                direction: 'top-bottom',
                showDetails: true,
                includeNotes: true
            },
            requirements: [
                'معالجة المدفوعات',
                'أمان البيانات',
                'دعم عملات متعددة',
                'تتبع المعاملات'
            ],
            stakeholders: [
                'العميل',
                'التاجر',
                'البنك',
                'مقدم الخدمة'
            ],
            language: 'ar'
        });

        console.log('📝 البرومبت المولد:');
        console.log(customPrompt);
        console.log('\n✅ تم بناء البرومبت المخصص بنجاح');

        return customPrompt;

    } catch (error) {
        console.error('❌ خطأ في بناء البرومبت المخصص:', error);
        throw error;
    }
}

/**
 * مثال 8: اختبار برومبت التحسين
 */
export async function testImprovementPrompt() {
    console.log('🔧 مثال: اختبار برومبت التحسين');

    const sampleDiagram = `@startuml
class Book {
    +title: String
    +author: String
}
class User {
    +name: String
}
User --> Book
@enduml`;

    const qualityAssessment = {
        overallScore: 60,
        issues: [
            'نقص في التفاصيل',
            'علاقات غير واضحة',
            'عدم وجود طرق'
        ],
        focusAreas: ['تفصيل الخصائص', 'توضيح العلاقات', 'إضافة الطرق']
    };

    try {
        const improvementPrompt = promptBuilder.buildImprovementPrompt({
            currentDiagram: sampleDiagram,
            qualityAssessment,
            targetQuality: 85,
            focusAreas: ['التفاصيل', 'العلاقات', 'الطرق']
        });

        console.log('📝 برومبت التحسين:');
        console.log(improvementPrompt);
        console.log('\n✅ تم بناء برومبت التحسين بنجاح');

        return improvementPrompt;

    } catch (error) {
        console.error('❌ خطأ في بناء برومبت التحسين:', error);
        throw error;
    }
}

/**
 * مثال 9: اختبار جميع أنواع المخططات
 */
export async function testAllDiagramTypes() {
    console.log('🎯 مثال: اختبار جميع أنواع المخططات');

    const diagramTypes: DiagramType[] = [
        'class', 'sequence', 'usecase', 'activity', 'component', 'deployment',
        'state', 'object', 'communication', 'interaction', 'timing',
        'flowchart', 'mindmap', 'gantt', 'network', 'er', 'wireframe'
    ];

    const results = [];

    for (const type of diagramTypes) {
        try {
            console.log(`\n🎨 اختبار مخطط: ${type}`);

            const prompt = await promptBuilder.buildDiagramPrompt({
                diagramType: type,
                title: `مخطط ${type} تجريبي`,
                description: `مثال على مخطط ${type} للاختبار`,
                complexity: 'detailed',
                requirements: ['متطلب 1', 'متطلب 2', 'متطلب 3'],
                language: 'ar'
            });

            results.push({
                type,
                promptLength: prompt.length,
                hasSystemPrompt: prompt.includes('أنت خبير'),
                hasUserPrompt: prompt.includes('أنشئ'),
                success: true
            });

            console.log(`✅ ${type}: تم بناء البرومبت (${prompt.length} حرف)`);

        } catch (error) {
            console.error(`❌ ${type}: خطأ في البرومبت`);
            results.push({
                type,
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف'
            });
        }
    }

    console.log('\n📊 ملخص النتائج:');
    const successful = results.filter(r => r.success).length;
    console.log(`✅ نجح: ${successful}/${diagramTypes.length}`);
    console.log(`❌ فشل: ${diagramTypes.length - successful}/${diagramTypes.length}`);

    return results;
}

/**
 * تشغيل جميع الأمثلة
 */
export async function runAllExamples() {
    console.log('🚀 تشغيل جميع أمثلة برومبتات المخططات\n');

    try {
        // الأمثلة العملية
        await generateLibraryClassDiagram();
        await generateBorrowingSequenceDiagram();
        await generateUseCaseDiagram();
        await generateNetworkDiagram();
        await generateProjectMindmap();
        await generateProjectGanttChart();

        // اختبارات البرومبتات
        await testCustomPrompt();
        await testImprovementPrompt();
        await testAllDiagramTypes();

        console.log('\n🎉 تم تشغيل جميع الأمثلة بنجاح!');

    } catch (error) {
        console.error('\n💥 خطأ في تشغيل الأمثلة:', error);
    }
}

// تصدير جميع الأمثلة
export const diagramExamples = {
    generateLibraryClassDiagram,
    generateBorrowingSequenceDiagram,
    generateUseCaseDiagram,
    generateNetworkDiagram,
    generateProjectMindmap,
    generateProjectGanttChart,
    testCustomPrompt,
    testImprovementPrompt,
    testAllDiagramTypes,
    runAllExamples
};

// تشغيل الأمثلة إذا تم استدعاء الملف مباشرة
if (require.main === module) {
    runAllExamples().catch(console.error);
}
