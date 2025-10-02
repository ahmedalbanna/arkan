/**
 * ملف تجريبي للتحقق من عمل نظام أقسام المقترح
 */

// تجربة استدعاء API مباشرة
const testData = {
    "type": "executive_summary",
    "projectContext": {
        "title": "صديق ذوي الإعاقة",
        "description": "يهدف المشروع إلى تطوير منصة رقمية شاملة لدمج ذوي الإعاقة في المجتمع، وذلك من خلال تسهيل حصولهم على المساعدة من المتطوعين القريبين",
        "domain": "صحة",
        "industry": "",
        "targetAudience": "",
        "budget": 1000,
        "duration": 5,
        "teamSize": 10,
        "objectives": [
            "آلية مطابقة فورية",
            "دعم معايير سهولة الوصول",
            "نظام جدولة متكامل"
        ],
        "requirements": [],
        "constraints": [],
        "stakeholders": [],
        "technologies": []
    },
    "referenceContent": {
        "guidelines": "اكتب محتوى احترافي ومفصل يناسب سياق المشروع"
    },
    "style": {
        "tone": "formal",
        "length": "standard",
        "format": "structured",
        "language": "ar"
    },
    "complexity": "detailed",
    "intelligentSettings": {
        "enableContextAnalysis": true,
        "enableIterativeImprovement": true,
        "enablePerformanceMonitoring": true,
        "qualityThreshold": 80,
        "maxIterations": 3,
        "adaptiveModelSelection": true
    },
    "outputPreferences": {
        "includeOutline": true,
        "includeKeyPoints": true,
        "generateSuggestions": true,
        "validateContent": true
    }
};

// دالة الاختبار
async function testProposalGeneration() {
    try {
        console.log('🔄 بدء اختبار توليد قسم المقترح...');
        console.log('📤 البيانات المرسلة:', JSON.stringify(testData, null, 2));

        const response = await fetch('/api/generate/proposal-section', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log('📨 حالة الاستجابة:', response.status);

        const result = await response.json();
        console.log('📥 الاستجابة الكاملة:', JSON.stringify(result, null, 2));

        if (result.success && result.data) {
            console.log('✅ تم التوليد بنجاح!');
            console.log('📋 العنوان:', result.data.title);
            console.log('📝 عدد الكلمات:', result.data.wordCount);
            console.log('📊 نقاط الجودة:', result.data.qualityScore);
            console.log('⏱️ وقت التنفيذ:', result.metadata?.executionTime || 'غير متاح');
        } else {
            console.error('❌ فشل في التوليد:', result.error || 'خطأ غير معروف');
        }

    } catch (error) {
        console.error('💥 خطأ في الاختبار:', error);
    }
}

// تصدير للاستخدام في Console
if (typeof window !== 'undefined') {
    window.testProposalGeneration = testProposalGeneration;
    window.testData = testData;
    console.log('🧪 أدوات الاختبار جاهزة! استخدم:');
    console.log('- testProposalGeneration() لاختبار التوليد');
    console.log('- testData لمراجعة البيانات التجريبية');
}

module.exports = { testProposalGeneration, testData };
