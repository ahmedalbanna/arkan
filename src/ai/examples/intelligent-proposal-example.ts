/**
 * مثال عملي لاستخدام النظام الذكي المحسن لتوليد المقترحات
 * يوضح كيفية استخدام جميع مكونات النظام الجديد
 */

import { AIHelpers, IntelligentAISystem } from '../core';

/**
 * مثال شامل لتوليد مقترح مشروع باستخدام النظام الذكي
 */
export async function demonstrateIntelligentProposalGeneration() {
    console.log('🚀 بدء مثال النظام الذكي لتوليد المقترحات...\n');

    // 1. مثال على مدخل بسيط
    const simpleInput = "تطوير تطبيق جوال لإدارة المهام الشخصية";

    console.log('📝 المدخل البسيط:', simpleInput);
    console.log('='.repeat(50));

    // 2. تحليل سريع للمدخل
    console.log('🔍 التحليل السريع:');
    const quickAnalysis = await AIHelpers.quickAnalyze(simpleInput);
    console.log('- نوع المحتوى:', quickAnalysis.contentType);
    console.log('- مستوى التعقيد:', quickAnalysis.complexity);
    console.log('- الجمهور المستهدف:', quickAnalysis.audience);
    console.log('- اللغة:', quickAnalysis.language);
    console.log('- النموذج المقترح:', quickAnalysis.recommendedModel);
    console.log('');

    // 3. اقتراح النموذج المناسب
    console.log('🤖 اقتراح النموذج:');
    const modelSuggestion = await AIHelpers.suggestModel(simpleInput, 'generation');
    console.log('- النموذج:', modelSuggestion.model);
    console.log('- السبب:', modelSuggestion.reasoning);
    console.log('- درجة الحرارة:', modelSuggestion.temperature);
    console.log('- أقصى عدد رموز:', modelSuggestion.maxTokens);
    console.log('');

    // 4. تشغيل التدفق الذكي الكامل
    console.log('🧠 تشغيل التدفق الذكي الكامل...');

    const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: simpleInput,
        taskType: 'generation',
        domain: 'mobile-app-proposals',
        qualityThreshold: 80,
        maxIterations: 2,
        enableIterativeImprovement: true,
        guidelines: [
            'يجب أن يتضمن المقترح تحليل السوق',
            'أضف تفاصيل تقنية عن التطوير',
            'حدد الميزانية والجدول الزمني'
        ]
    });

    console.log('✅ انتهى التدفق الذكي!');
    console.log('- نقاط الجودة النهائية:', result.qualityScore);
    console.log('- عدد التكرارات:', result.iterations);
    console.log('- النموذج المستخدم:', result.modelUsed);
    console.log('');

    // 5. تقييم سريع للنتيجة
    console.log('📊 التقييم السريع للنتيجة:');
    const validation = await AIHelpers.quickValidate(result.output, simpleInput);
    console.log('- النقاط:', validation.score);
    console.log('- جودة جيدة؟', validation.isGood ? 'نعم' : 'لا');
    console.log('- يحتاج تحسين؟', validation.needsImprovement ? 'نعم' : 'لا');
    if (validation.mainIssues.length > 0) {
        console.log('- المشاكل الرئيسية:');
        validation.mainIssues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
        });
    }
    console.log('');

    return result;
}

/**
 * مثال متقدم مع سياق خارجي
 */
export async function demonstrateAdvancedProposalGeneration() {
    console.log('🚀 مثال متقدم مع سياق خارجي...\n');

    const complexInput = "تطوير منصة تجارة إلكترونية متكاملة للشركات الصغيرة والمتوسطة في الشرق الأوسط";

    // سياق خارجي محاكى
    const externalContext = [
        {
            fileName: "market-research.pdf",
            content: `تحليل السوق:
      - حجم السوق: 2.5 مليار دولار
      - النمو السنوي: 15%
      - المنافسون الرئيسيون: أمازون، نون، سوق
      - الفجوات: نقص في الحلول المخصصة للشركات الصغيرة
      - التحديات: اللوجستيات، المدفوعات، الثقة الرقمية`,
            type: "context"
        },
        {
            fileName: "technical-requirements.docx",
            content: `المتطلبات التقنية:
      - دعم 10,000 مستخدم متزامن
      - تكامل مع بوابات الدفع المحلية
      - دعم اللغة العربية والإنجليزية
      - تطبيق جوال أصلي
      - لوحة تحكم إدارية
      - نظام إدارة المخزون
      - تحليلات وتقارير متقدمة`,
            type: "context"
        }
    ];

    console.log('📋 المدخل المعقد:', complexInput);
    console.log('📁 عدد ملفات السياق:', externalContext.length);
    console.log('='.repeat(50));

    // تشغيل التدفق الذكي مع السياق الخارجي
    const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: complexInput,
        taskType: 'generation',
        domain: 'e-commerce-platforms',
        externalContext,
        qualityThreshold: 85,
        maxIterations: 3,
        enableIterativeImprovement: true,
        guidelines: [
            'استخدم البيانات من تحليل السوق',
            'راعي المتطلبات التقنية المحددة',
            'ركز على السوق المحلي',
            'أضف استراتيجية تسويقية',
            'حدد مراحل التطوير بالتفصيل'
        ]
    });

    console.log('✅ انتهى المثال المتقدم!');
    console.log('- نقاط الجودة النهائية:', result.qualityScore);
    console.log('- عدد التكرارات:', result.iterations);
    console.log('- تحليل السياق:');
    console.log('  - نوع المحتوى:', result.contextAnalysis.contentType);
    console.log('  - مستوى التعقيد:', result.contextAnalysis.complexityLevel);
    console.log('  - الجمهور المستهدف:', result.contextAnalysis.targetAudience);
    console.log('  - السياق الثقافي:', result.contextAnalysis.culturalContext);

    return result;
}

/**
 * مثال على التحسين التكراري
 */
export async function demonstrateIterativeImprovement() {
    console.log('🔄 مثال على التحسين التكراري...\n');

    const input = "إنشاء نظام إدارة علاقات العملاء (CRM) للشركات الناشئة";

    console.log('📝 المدخل:', input);
    console.log('='.repeat(50));

    // تشغيل مع تحسين تكراري مكثف
    const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: input,
        taskType: 'generation',
        domain: 'crm-systems',
        qualityThreshold: 90, // معيار جودة عالي
        maxIterations: 4, // تكرارات أكثر
        enableIterativeImprovement: true,
        guidelines: [
            'يجب أن يكون النظام قابل للتطوير',
            'ركز على سهولة الاستخدام',
            'أضف ميزات الذكاء الاصطناعي',
            'حدد نموذج الاشتراك والتسعير'
        ]
    });

    console.log('✅ انتهى مثال التحسين التكراري!');

    if ('session' in result && result.session) {
        console.log('📈 تفاصيل جلسة التحسين:');
        console.log('- حالة الجلسة:', result.session.status);
        console.log('- نقاط التحسين الإجمالية:', result.session.totalImprovementScore);
        console.log('- تفاصيل التكرارات:');

        result.session.iterations.forEach((iteration, index) => {
            console.log(`  التكرار ${iteration.iterationNumber}:`);
            console.log(`    - النقاط: ${iteration.qualityScore}`);
            console.log(`    - عدد المشاكل: ${iteration.issues.length}`);
            console.log(`    - النموذج: ${iteration.modelUsed}`);
        });
    }

    return result;
}

/**
 * تشغيل جميع الأمثلة
 */
export async function runAllExamples() {
    console.log('🎯 تشغيل جميع أمثلة النظام الذكي...\n');

    try {
        // المثال البسيط
        console.log('1️⃣ المثال البسيط:');
        await demonstrateIntelligentProposalGeneration();
        console.log('\n' + '='.repeat(80) + '\n');

        // المثال المتقدم
        console.log('2️⃣ المثال المتقدم:');
        await demonstrateAdvancedProposalGeneration();
        console.log('\n' + '='.repeat(80) + '\n');

        // مثال التحسين التكراري
        console.log('3️⃣ مثال التحسين التكراري:');
        await demonstrateIterativeImprovement();
        console.log('\n' + '='.repeat(80) + '\n');

        console.log('🎉 انتهت جميع الأمثلة بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في تشغيل الأمثلة:', error);
    }
}

/**
 * مقارنة بين النظام القديم والجديد
 */
export function compareOldVsNewSystem() {
    console.log('📊 مقارنة بين النظام القديم والجديد:\n');

    const comparison = {
        'تحليل السياق': {
            'القديم': 'بسيط - يعتمد على النص فقط',
            'الجديد': 'ذكي - يحلل نوع المحتوى والتعقيد والجمهور'
        },
        'اختيار النموذج': {
            'القديم': 'ثابت - نموذج واحد لجميع المهام',
            'الجديد': 'تكيفي - يختار النموذج الأنسب للمهمة'
        },
        'بناء الـ Prompts': {
            'القديم': 'قالب ثابت',
            'الجديد': 'ديناميكي - يبني prompts محسنة حسب السياق'
        },
        'جودة المخرجات': {
            'القديم': 'لا يوجد تقييم',
            'الجديد': 'تقييم شامل مع مقاييس متعددة'
        },
        'التحسين': {
            'القديم': 'لا يوجد',
            'الجديد': 'تحسين تكراري ذكي'
        },
        'معالجة الأخطاء': {
            'القديم': 'أساسية',
            'الجديد': 'متقدمة مع استراتيجيات احتياطية'
        },
        'الشفافية': {
            'القديم': 'محدودة',
            'الجديد': 'عالية - تفسير كامل للقرارات'
        }
    };

    Object.entries(comparison).forEach(([feature, details]) => {
        console.log(`🔹 ${feature}:`);
        console.log(`   القديم: ${details['القديم']}`);
        console.log(`   الجديد: ${details['الجديد']}`);
        console.log('');
    });

    console.log('📈 الفوائد المتوقعة:');
    console.log('✅ جودة أعلى للمخرجات (تحسن 30-50%)');
    console.log('✅ فهم أفضل للمتطلبات');
    console.log('✅ اختيار أمثل للنماذج');
    console.log('✅ تحسين تكراري للنتائج');
    console.log('✅ شفافية أكبر في العملية');
    console.log('✅ معالجة أفضل للأخطاء');
}
