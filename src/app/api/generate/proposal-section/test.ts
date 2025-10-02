/**
 * اختبارات بسيطة للـ API endpoints
 * يمكن تشغيلها للتأكد من عمل الـ endpoints
 */

// هذا الملف للاختبار فقط - لا يتم تشغيله في الإنتاج

const BASE_URL = 'http://localhost:3000/api/generate/proposal-section';

interface TestResult {
    endpoint: string;
    method: string;
    status: 'success' | 'error';
    message: string;
    responseTime?: number;
}

class APITester {
    private results: TestResult[] = [];

    async testEndpoint(
        endpoint: string,
        method: 'GET' | 'POST',
        body?: any
    ): Promise<TestResult> {
        const startTime = Date.now();

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body ? JSON.stringify(body) : undefined
            });

            const responseTime = Date.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                return {
                    endpoint,
                    method,
                    status: 'success',
                    message: `✅ نجح الطلب - Status: ${response.status}`,
                    responseTime
                };
            } else {
                return {
                    endpoint,
                    method,
                    status: 'error',
                    message: `❌ فشل الطلب - Status: ${response.status}`,
                    responseTime
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                endpoint,
                method,
                status: 'error',
                message: `❌ خطأ في الشبكة: ${error}`,
                responseTime
            };
        }
    }

    async runAllTests(): Promise<TestResult[]> {
        console.log('🧪 بدء اختبار API endpoints...\n');

        // اختبار الإحصائيات
        const statsTest = await this.testEndpoint('/stats', 'GET');
        this.results.push(statsTest);
        console.log(`📊 Stats: ${statsTest.message} (${statsTest.responseTime}ms)`);

        // اختبار القوالب
        const templatesTest = await this.testEndpoint('/templates', 'GET');
        this.results.push(templatesTest);
        console.log(`📋 Templates: ${templatesTest.message} (${templatesTest.responseTime}ms)`);

        // اختبار القوالب بنوع محدد
        const templatesTypeTest = await this.testEndpoint('/templates?type=executive_summary', 'GET');
        this.results.push(templatesTypeTest);
        console.log(`📋 Templates (Type): ${templatesTypeTest.message} (${templatesTypeTest.responseTime}ms)`);

        // اختبار التحقق من الصحة
        const validateTest = await this.testEndpoint('/validate', 'POST', {
            type: 'executive_summary',
            content: 'هذا محتوى تجريبي للاختبار. يحتوي على عدة جمل لاختبار التحقق من الصحة.'
        });
        this.results.push(validateTest);
        console.log(`🔍 Validate: ${validateTest.message} (${validateTest.responseTime}ms)`);

        // اختبار التحسين
        const improveTest = await this.testEndpoint('/improve', 'POST', {
            type: 'executive_summary',
            content: 'محتوى بسيط يحتاج تحسين',
            improvementAreas: ['clarity', 'detail']
        });
        this.results.push(improveTest);
        console.log(`🔧 Improve: ${improveTest.message} (${improveTest.responseTime}ms)`);

        // اختبار التوليد الرئيسي (قد يستغرق وقتاً أطول)
        const generateTest = await this.testEndpoint('', 'POST', {
            type: 'executive_summary',
            projectContext: {
                title: 'مشروع اختبار',
                description: 'وصف تجريبي للمشروع'
            },
            style: {
                tone: 'professional',
                length: 'moderate',
                format: 'structured',
                language: 'ar'
            }
        });
        this.results.push(generateTest);
        console.log(`⚡ Generate: ${generateTest.message} (${generateTest.responseTime}ms)`);

        console.log('\n📈 ملخص النتائج:');
        const successCount = this.results.filter(r => r.status === 'success').length;
        const totalCount = this.results.length;
        console.log(`✅ نجح: ${successCount}/${totalCount}`);
        console.log(`❌ فشل: ${totalCount - successCount}/${totalCount}`);

        const avgResponseTime = this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / this.results.length;
        console.log(`⏱️ متوسط وقت الاستجابة: ${avgResponseTime.toFixed(0)}ms`);

        return this.results;
    }
}

// تصدير للاستخدام في الاختبارات
export { APITester };

// مثال على الاستخدام (يمكن تشغيله في وحدة التحكم)
/*
const tester = new APITester();
tester.runAllTests().then(results => {
  console.log('اكتملت جميع الاختبارات:', results);
});
*/
