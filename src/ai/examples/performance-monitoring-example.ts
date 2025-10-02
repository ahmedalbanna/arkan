/**
 * مثال شامل لاستخدام نظام مراقبة الأداء
 * يوضح كيفية مراقبة وتحليل أداء النظام الذكي
 */

import { IntelligentAISystem } from '../core';

/**
 * مثال على مراقبة الأداء الأساسية
 */
export async function demonstrateBasicPerformanceMonitoring() {
    console.log('📊 مثال على مراقبة الأداء الأساسية...\n');

    // تشغيل عدة مهام مع مراقبة الأداء
    const tasks = [
        {
            input: "تطوير تطبيق جوال للتجارة الإلكترونية",
            taskType: 'generation' as const,
            domain: 'mobile-apps'
        },
        {
            input: "إنشاء نظام إدارة المحتوى",
            taskType: 'generation' as const,
            domain: 'web-systems'
        },
        {
            input: "تطوير منصة تعليمية تفاعلية",
            taskType: 'generation' as const,
            domain: 'education-platforms'
        }
    ];

    console.log(`🚀 تشغيل ${tasks.length} مهام مع مراقبة الأداء...\n`);

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        console.log(`📝 المهمة ${i + 1}: ${task.input}`);

        try {
            const result = await IntelligentAISystem.runIntelligentFlow({
                userInput: task.input,
                taskType: task.taskType,
                domain: task.domain,
                enablePerformanceMonitoring: true,
                enableIterativeImprovement: true,
                qualityThreshold: 80
            });

            console.log(`✅ اكتملت المهمة ${i + 1}:`);
            console.log(`   - نقاط الجودة: ${result.qualityScore}/100`);
            console.log(`   - عدد التكرارات: ${result.iterations}`);
            console.log(`   - النموذج المستخدم: ${result.modelUsed}`);

            if (result.performanceMetrics) {
                console.log(`   - وقت التنفيذ: ${result.performanceMetrics.executionTime}ms`);
                console.log(`   - وقت تحليل السياق: ${result.performanceMetrics.contextAnalysisTime}ms`);
                console.log(`   - وقت التوليد: ${result.performanceMetrics.generationTime || result.performanceMetrics.iterativeImprovementTime}ms`);
            }

        } catch (error) {
            console.error(`❌ فشلت المهمة ${i + 1}:`, error);
        }

        console.log('');
    }

    // الحصول على إحصائيات سريعة
    console.log('📈 الإحصائيات السريعة:');
    const quickStats = IntelligentAISystem.getQuickPerformanceStats();
    console.log(`- الجلسات النشطة: ${quickStats.activeSessions}`);
    console.log(`- الجلسات المكتملة: ${quickStats.completedSessions}`);
    console.log(`- متوسط الجودة اليوم: ${quickStats.avgQualityToday.toFixed(1)}/100`);
    console.log(`- متوسط وقت التنفيذ اليوم: ${quickStats.avgExecutionTimeToday.toFixed(0)}ms`);
    console.log('');
}

/**
 * مثال على تحليل تقرير الأداء المفصل
 */
export async function demonstratePerformanceReporting() {
    console.log('📊 مثال على تقرير الأداء المفصل...\n');

    // تشغيل بعض المهام أولاً
    await demonstrateBasicPerformanceMonitoring();

    // الحصول على تقرير شامل
    console.log('📋 توليد تقرير الأداء الشامل...');
    const report = IntelligentAISystem.getPerformanceReport();

    console.log(`\n📊 تقرير الأداء:`);
    console.log(`- إجمالي الجلسات: ${report.totalSessions}`);
    console.log(`- متوسط وقت التنفيذ: ${report.averageExecutionTime.toFixed(0)}ms`);
    console.log(`- متوسط نقاط الجودة: ${report.averageQualityScore.toFixed(1)}/100`);
    console.log(`- معدل النجاح: ${report.successRate.toFixed(1)}%`);

    if (report.mostCommonErrors.length > 0) {
        console.log(`\n❌ الأخطاء الأكثر شيوعاً:`);
        report.mostCommonErrors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.error} (${error.count} مرة)`);
        });
    }

    if (report.modelUsageStats.length > 0) {
        console.log(`\n🤖 إحصائيات استخدام النماذج:`);
        report.modelUsageStats.forEach((stat, index) => {
            console.log(`   ${index + 1}. ${stat.model}: ${stat.usage} استخدام، جودة ${stat.avgQuality.toFixed(1)}/100`);
        });
    }

    if (report.performanceTrends.length > 0) {
        console.log(`\n📈 اتجاهات الأداء (آخر ${report.performanceTrends.length} أيام):`);
        report.performanceTrends.forEach(trend => {
            console.log(`   ${trend.date}: وقت ${trend.avgTime.toFixed(0)}ms، جودة ${trend.avgQuality.toFixed(1)}/100`);
        });
    }

    console.log(`\n💡 التوصيات:`);
    report.recommendations.forEach((recommendation, index) => {
        console.log(`   ${index + 1}. ${recommendation}`);
    });
    console.log('');
}

/**
 * مثال على مقارنة الأداء بين إعدادات مختلفة
 */
export async function demonstratePerformanceComparison() {
    console.log('⚖️ مثال على مقارنة الأداء بين إعدادات مختلفة...\n');

    const testInput = "تطوير نظام إدارة علاقات العملاء للشركات الصغيرة";

    // اختبار بدون تحسين تكراري
    console.log('🔄 اختبار بدون تحسين تكراري...');
    const simpleResult = await IntelligentAISystem.runIntelligentFlow({
        userInput: testInput,
        taskType: 'generation',
        domain: 'crm-systems',
        enableIterativeImprovement: false,
        enablePerformanceMonitoring: true
    });

    // اختبار مع تحسين تكراري
    console.log('🔄 اختبار مع تحسين تكراري...');
    const iterativeResult = await IntelligentAISystem.runIntelligentFlow({
        userInput: testInput,
        taskType: 'generation',
        domain: 'crm-systems',
        enableIterativeImprovement: true,
        maxIterations: 3,
        qualityThreshold: 85,
        enablePerformanceMonitoring: true
    });

    // مقارنة النتائج
    console.log('\n📊 مقارنة النتائج:');
    console.log('┌─────────────────────────────┬──────────────┬──────────────────┐');
    console.log('│ المقياس                    │ بدون تحسين   │ مع التحسين       │');
    console.log('├─────────────────────────────┼──────────────┼──────────────────┤');
    console.log(`│ نقاط الجودة                │ ${simpleResult.qualityScore.toString().padEnd(12)} │ ${iterativeResult.qualityScore.toString().padEnd(16)} │`);
    console.log(`│ عدد التكرارات              │ ${simpleResult.iterations.toString().padEnd(12)} │ ${iterativeResult.iterations.toString().padEnd(16)} │`);

    if (simpleResult.performanceMetrics && iterativeResult.performanceMetrics) {
        console.log(`│ وقت التنفيذ (ms)           │ ${simpleResult.performanceMetrics.executionTime.toString().padEnd(12)} │ ${iterativeResult.performanceMetrics.executionTime.toString().padEnd(16)} │`);
        console.log(`│ وقت تحليل السياق (ms)     │ ${simpleResult.performanceMetrics.contextAnalysisTime.toString().padEnd(12)} │ ${iterativeResult.performanceMetrics.contextAnalysisTime.toString().padEnd(16)} │`);
    }

    console.log('└─────────────────────────────┴──────────────┴──────────────────┘');

    // تحليل النتائج
    const qualityImprovement = iterativeResult.qualityScore - simpleResult.qualityScore;
    const timeIncrease = iterativeResult.performanceMetrics?.executionTime && simpleResult.performanceMetrics?.executionTime
        ? iterativeResult.performanceMetrics.executionTime - simpleResult.performanceMetrics.executionTime
        : 0;

    console.log('\n📈 التحليل:');
    console.log(`- تحسن الجودة: ${qualityImprovement > 0 ? '+' : ''}${qualityImprovement.toFixed(1)} نقطة`);
    console.log(`- زيادة الوقت: ${timeIncrease > 0 ? '+' : ''}${timeIncrease}ms`);

    if (qualityImprovement > 0 && timeIncrease > 0) {
        const efficiency = qualityImprovement / (timeIncrease / 1000); // نقاط الجودة لكل ثانية إضافية
        console.log(`- كفاءة التحسين: ${efficiency.toFixed(2)} نقطة جودة/ثانية`);
    }

    console.log('');
}

/**
 * مثال على مراقبة الأداء في الوقت الفعلي
 */
export async function demonstrateRealTimeMonitoring() {
    console.log('⏱️ مثال على مراقبة الأداء في الوقت الفعلي...\n');

    // محاكاة عدة مهام متزامنة
    const tasks = [
        "تطوير تطبيق للصحة واللياقة",
        "إنشاء منصة للتعلم الإلكتروني",
        "تطوير نظام إدارة المخزون",
        "إنشاء موقع للتجارة الإلكترونية",
        "تطوير تطبيق للتواصل الاجتماعي"
    ];

    console.log('🚀 بدء تشغيل مهام متعددة...');

    // تشغيل المهام بشكل متزامن
    const promises = tasks.map(async (task, index) => {
        console.log(`📝 بدء المهمة ${index + 1}: ${task}`);

        try {
            const result = await IntelligentAISystem.runIntelligentFlow({
                userInput: task,
                taskType: 'generation',
                domain: 'software-development',
                enablePerformanceMonitoring: true,
                enableIterativeImprovement: true,
                qualityThreshold: 75
            });

            console.log(`✅ اكتملت المهمة ${index + 1}: جودة ${result.qualityScore}/100`);
            return result;

        } catch (error) {
            console.error(`❌ فشلت المهمة ${index + 1}:`, error);
            return null;
        }
    });

    // انتظار اكتمال جميع المهام
    const results = await Promise.all(promises);
    const successfulResults = results.filter(r => r !== null);

    console.log(`\n📊 ملخص النتائج:`);
    console.log(`- المهام المكتملة: ${successfulResults.length}/${tasks.length}`);

    if (successfulResults.length > 0) {
        const avgQuality = successfulResults.reduce((sum, r) => sum + r!.qualityScore, 0) / successfulResults.length;
        const avgTime = successfulResults
            .filter(r => r!.performanceMetrics)
            .reduce((sum, r) => sum + r!.performanceMetrics!.executionTime, 0) / successfulResults.length;

        console.log(`- متوسط الجودة: ${avgQuality.toFixed(1)}/100`);
        console.log(`- متوسط وقت التنفيذ: ${avgTime.toFixed(0)}ms`);
    }

    // إحصائيات نهائية
    const finalStats = IntelligentAISystem.getQuickPerformanceStats();
    console.log(`\n📈 الإحصائيات النهائية:`);
    console.log(`- إجمالي الجلسات المكتملة: ${finalStats.completedSessions}`);
    console.log(`- متوسط الجودة اليوم: ${finalStats.avgQualityToday.toFixed(1)}/100`);
    console.log(`- متوسط وقت التنفيذ اليوم: ${finalStats.avgExecutionTimeToday.toFixed(0)}ms`);
    console.log('');
}

/**
 * مثال على تصدير وتحليل البيانات
 */
export function demonstrateDataExport() {
    console.log('💾 مثال على تصدير وتحليل البيانات...\n');

    // تصدير البيانات بصيغة JSON
    console.log('📄 تصدير البيانات بصيغة JSON...');
    const jsonData = IntelligentAISystem.exportPerformanceData('json');
    console.log(`حجم البيانات: ${(jsonData.length / 1024).toFixed(1)} KB`);

    // تصدير البيانات بصيغة CSV
    console.log('📊 تصدير البيانات بصيغة CSV...');
    const csvData = IntelligentAISystem.exportPerformanceData('csv');
    const csvLines = csvData.split('\n').length - 1; // عدد الصفوف (مطروحاً منها العنوان)
    console.log(`عدد الصفوف: ${csvLines}`);

    // مسح البيانات القديمة
    console.log('🗑️ مسح البيانات الأقدم من 7 أيام...');
    const removedCount = IntelligentAISystem.clearOldPerformanceData(7);
    console.log(`تم حذف ${removedCount} جلسة قديمة`);

    console.log('');
}

/**
 * تشغيل جميع أمثلة مراقبة الأداء
 */
export async function runAllPerformanceExamples() {
    console.log('🎯 تشغيل جميع أمثلة مراقبة الأداء...\n');
    console.log('='.repeat(80));

    try {
        // المثال الأساسي
        console.log('\n1️⃣ مراقبة الأداء الأساسية:');
        await demonstrateBasicPerformanceMonitoring();
        console.log('='.repeat(80));

        // تقرير الأداء
        console.log('\n2️⃣ تقرير الأداء المفصل:');
        await demonstratePerformanceReporting();
        console.log('='.repeat(80));

        // مقارنة الأداء
        console.log('\n3️⃣ مقارنة الأداء:');
        await demonstratePerformanceComparison();
        console.log('='.repeat(80));

        // المراقبة في الوقت الفعلي
        console.log('\n4️⃣ المراقبة في الوقت الفعلي:');
        await demonstrateRealTimeMonitoring();
        console.log('='.repeat(80));

        // تصدير البيانات
        console.log('\n5️⃣ تصدير وتحليل البيانات:');
        demonstrateDataExport();
        console.log('='.repeat(80));

        console.log('\n🎉 انتهت جميع أمثلة مراقبة الأداء بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في تشغيل أمثلة مراقبة الأداء:', error);
    }
}

/**
 * عرض فوائد نظام مراقبة الأداء
 */
export function showPerformanceMonitoringBenefits() {
    console.log('🎯 فوائد نظام مراقبة الأداء:\n');

    const benefits = {
        '📊 التحليل المفصل': [
            'مراقبة وقت كل مرحلة من مراحل التوليد',
            'تتبع جودة المخرجات عبر الوقت',
            'تحليل استخدام الموارد والنماذج',
            'إحصائيات شاملة عن الأداء'
        ],
        '🔍 اكتشاف المشاكل': [
            'تحديد نقاط الاختناق في الأداء',
            'رصد الأخطاء الشائعة وأسبابها',
            'مراقبة معدلات النجاح والفشل',
            'تتبع استخدام الخطط الاحتياطية'
        ],
        '📈 التحسين المستمر': [
            'توصيات ذكية لتحسين الأداء',
            'مقارنة فعالية الإعدادات المختلفة',
            'تحليل اتجاهات الأداء',
            'تحسين اختيار النماذج'
        ],
        '💾 إدارة البيانات': [
            'تصدير البيانات للتحليل الخارجي',
            'أرشفة تلقائية للجلسات',
            'مسح البيانات القديمة',
            'تقارير قابلة للتخصيص'
        ],
        '⚡ الأداء في الوقت الفعلي': [
            'مراقبة الجلسات النشطة',
            'إحصائيات فورية',
            'تنبيهات الأداء',
            'تتبع الاستخدام المتزامن'
        ]
    };

    Object.entries(benefits).forEach(([category, items]) => {
        console.log(`${category}:`);
        items.forEach(item => {
            console.log(`  ✅ ${item}`);
        });
        console.log('');
    });

    console.log('🚀 النتيجة: نظام مراقبة شامل يضمن الأداء الأمثل والتحسين المستمر!');
}
