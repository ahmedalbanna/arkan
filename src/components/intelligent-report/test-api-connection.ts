/**
 * ملف اختبار اتصال API للتوليد الذكي
 */

export async function testApiConnection() {
    try {
        console.log('🔍 اختبار اتصال API...');

        const response = await fetch('/api/generate/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operationType: 'single-section',
                sectionToGenerate: 'acknowledgment',
                proposal: {
                    title: 'مشروع تجريبي',
                    description: 'هذا مشروع تجريبي لاختبار API'
                },
                qualityThreshold: 85,
                enableIterativeImprovement: true,
                guidelines: []
            })
        });

        console.log('📡 حالة الاستجابة:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ نتيجة API:', result);

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('❌ خطأ في اختبار API:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'خطأ غير معروف'
        };
    }
}

// دالة لاختبار التقرير الكامل
export async function testCompleteReportApi() {
    try {
        console.log('🔍 اختبار API للتقرير الكامل...');

        const response = await fetch('/api/generate/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operationType: 'complete-report',
                sectionsToGenerate: ['acknowledgment', 'introduction'],
                proposal: {
                    title: 'مشروع تجريبي',
                    description: 'هذا مشروع تجريبي لاختبار API'
                },
                qualityThreshold: 85,
                enableIterativeImprovement: true,
                guidelines: []
            })
        });

        console.log('📡 حالة الاستجابة:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ نتيجة API:', result);

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('❌ خطأ في اختبار API:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'خطأ غير معروف'
        };
    }
}
