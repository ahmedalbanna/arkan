/**
 * اختبار بسيط لـ academic-literature-review flow المحسّن
 */

import { academicLiteratureReviewFlow } from './src/ai/flows/academic-literature-review';

async function testAcademicLiteratureReview() {
    console.log('🧪 بدء اختبار academic-literature-review...\n');

    const testCases = [
        {
            name: 'مراجعة أدبية قصيرة - تعليم إلكتروني',
            input: {
                topic: 'The Impact of E-Learning on Student Performance',
                keywords: ['e-learning', 'online education', 'student performance', 'distance learning'],
                citationStyle: 'APA',
                focusAreas: [
                    'Effectiveness of online platforms',
                    'Student engagement strategies',
                    'Assessment methods in e-learning'
                ],
                minLength: 500,
                includeGaps: true,
            }
        },
        {
            name: 'مراجعة أدبية - الذكاء الاصطناعي',
            input: {
                topic: 'Artificial Intelligence in Healthcare',
                keywords: ['AI', 'healthcare', 'machine learning', 'medical diagnosis'],
                citationStyle: 'IEEE',
                focusAreas: [
                    'AI diagnostic tools',
                    'Patient care automation',
                    'Ethical considerations'
                ],
                minLength: 800,
                includeGaps: true,
            }
        }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const testCase of testCases) {
        try {
            console.log(`\n📝 اختبار: ${testCase.name}`);
            console.log(`📚 الموضوع: ${testCase.input.topic}`);
            console.log(`📏 الحد الأدنى للطول: ${testCase.input.minLength} كلمة`);
            console.log(`📖 نمط الاستشهاد: ${testCase.input.citationStyle}\n`);

            const startTime = Date.now();
            const result = await academicLiteratureReviewFlow(testCase.input);
            const endTime = Date.now();

            console.log('✅ نجح الاختبار!');
            console.log(`⏱️  الوقت المستغرق: ${endTime - startTime}ms`);
            console.log(`\n📊 النتائج:`);
            console.log(`  - عدد الكلمات: ${result.metadata.wordCount}`);
            console.log(`  - عدد الاستشهادات: ${result.metadata.citationCount}`);
            console.log(`  - الاستشهادات الصحيحة: ${result.citations.validCitations}`);
            console.log(`  - قوة الحجة: ${result.qualityMetrics.argumentStrength}`);
            console.log(`  - نتيجة التدفق المنطقي: ${result.qualityMetrics.logicalFlowScore}`);
            
            console.log(`\n📋 البنية:`);
            console.log(`  - المقدمة: ${result.structure.introduction ? '✓' : '✗'}`);
            console.log(`  - المتن: ${result.structure.mainBody ? '✓' : '✗'}`);
            console.log(`  - الفجوات البحثية: ${result.structure.researchGaps ? '✓' : '✗'}`);
            console.log(`  - الخاتمة: ${result.structure.conclusion ? '✓' : '✗'}`);

            if (result.qualityMetrics.recommendations.length > 0) {
                console.log(`\n💡 التوصيات:`);
                result.qualityMetrics.recommendations.slice(0, 3).forEach((rec, i) => {
                    console.log(`  ${i + 1}. ${rec}`);
                });
            }

            console.log(`\n📄 بداية المراجعة الأدبية:`);
            console.log(result.literatureReview.substring(0, 300) + '...');
            console.log('---'.repeat(30));

            successCount++;
        } catch (error) {
            console.error(`❌ فشل الاختبار: ${testCase.name}`);
            console.error(`الخطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
            if (error instanceof Error && error.stack) {
                console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
            }
            console.log('---'.repeat(30));
            failCount++;
        }
    }

    console.log('\n\n📊 ملخص النتائج:');
    console.log(`✅ نجح: ${successCount}/${testCases.length}`);
    console.log(`❌ فشل: ${failCount}/${testCases.length}`);
    console.log(`📈 نسبة النجاح: ${((successCount / testCases.length) * 100).toFixed(1)}%`);
    
    if (successCount === testCases.length) {
        console.log('\n🎉 جميع الاختبارات نجحت!');
    } else if (successCount > 0) {
        console.log('\n⚠️  بعض الاختبارات فشلت، راجع التفاصيل أعلاه.');
    } else {
        console.log('\n❌ جميع الاختبارات فشلت!');
    }
}

// تشغيل الاختبار
console.log('════════════════════════════════════════════════════════════════');
console.log('     اختبار Academic Literature Review Flow المحسّن');
console.log('════════════════════════════════════════════════════════════════\n');

testAcademicLiteratureReview()
    .then(() => {
        console.log('\n✅ انتهى الاختبار بنجاح');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ فشل الاختبار:', error);
        process.exit(1);
    });
