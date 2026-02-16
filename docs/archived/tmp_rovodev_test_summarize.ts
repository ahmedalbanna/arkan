/**
 * اختبار بسيط لـ summarize-text flow المحسّن
 */

import { summarizeText } from './src/ai/flows/summarize-text';

async function testSummarizeText() {
    console.log('🧪 بدء اختبار summarize-text...\n');

    const testCases = [
        {
            name: 'ملخص قصير - نص عربي',
            input: {
                flow: 'summarize' as const,
                text: `الذكاء الاصطناعي هو فرع من علوم الحاسوب يهتم بإنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً. 
                يشمل ذلك التعلم الآلي، معالجة اللغة الطبيعية، والرؤية الحاسوبية. تستخدم تقنيات الذكاء الاصطناعي في مجالات متعددة 
                مثل الطب، التعليم، الأمن، والتجارة الإلكترونية. يتطور هذا المجال بسرعة كبيرة مع ظهور نماذج لغوية متقدمة.`,
                length: 'short' as const,
            }
        },
        {
            name: 'ملخص متوسط - نص إنجليزي',
            input: {
                flow: 'summarize' as const,
                text: `Artificial Intelligence (AI) has revolutionized various industries in recent years. From healthcare to finance, 
                AI-powered systems are making significant impacts on how we work and live. Machine learning algorithms can now analyze 
                vast amounts of data, identify patterns, and make predictions with remarkable accuracy. Natural Language Processing (NLP) 
                enables computers to understand and generate human language, powering applications like chatbots, translation services, 
                and content generation. Computer vision allows machines to interpret and understand visual information from the world, 
                enabling applications in autonomous vehicles, medical imaging, and security systems. As AI continues to advance, 
                it's crucial to address ethical considerations, including bias, privacy, and the societal impact of automation.`,
                length: 'medium' as const,
            }
        },
        {
            name: 'ملخص طويل - نص مختلط',
            input: {
                flow: 'summarize' as const,
                text: `The intersection of technology and education has created unprecedented opportunities for learning. 
                التعليم الإلكتروني أصبح جزءاً أساسياً من النظام التعليمي الحديث. Online learning platforms provide access 
                to quality education for students worldwide, breaking geographical and economic barriers. تقنيات مثل الواقع الافتراضي 
                والواقع المعزز توفر تجارب تعليمية تفاعلية وغامرة. Adaptive learning systems use AI to personalize the educational 
                experience for each student, identifying their strengths and weaknesses. However, challenges remain, including the digital 
                divide, the need for effective online pedagogy, and ensuring student engagement in virtual environments.`,
                length: 'long' as const,
            }
        }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const testCase of testCases) {
        try {
            console.log(`\n📝 اختبار: ${testCase.name}`);
            console.log(`📏 الطول المطلوب: ${testCase.input.length}`);
            console.log(`📄 طول النص الأصلي: ${testCase.input.text.length} حرف\n`);

            const startTime = Date.now();
            const result = await summarizeText(testCase.input);
            const endTime = Date.now();

            console.log('✅ نجح الاختبار!');
            console.log(`⏱️  الوقت المستغرق: ${endTime - startTime}ms`);
            console.log(`📊 طول الملخص: ${result.summary.length} حرف`);
            console.log(`\n📋 الملخص:\n${result.summary}\n`);
            console.log('---'.repeat(20));

            successCount++;
        } catch (error) {
            console.error(`❌ فشل الاختبار: ${testCase.name}`);
            console.error(`الخطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
            console.log('---'.repeat(20));
            failCount++;
        }
    }

    console.log('\n\n📊 ملخص النتائج:');
    console.log(`✅ نجح: ${successCount}/${testCases.length}`);
    console.log(`❌ فشل: ${failCount}/${testCases.length}`);
    console.log(`📈 نسبة النجاح: ${((successCount / testCases.length) * 100).toFixed(1)}%`);
}

// تشغيل الاختبار
testSummarizeText()
    .then(() => {
        console.log('\n✅ انتهى الاختبار بنجاح');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ فشل الاختبار:', error);
        process.exit(1);
    });
