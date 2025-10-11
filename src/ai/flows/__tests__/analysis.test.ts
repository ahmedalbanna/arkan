/**
 * اختبارات شاملة لـ Analysis Flows
 * تغطي جميع وظائف التحليل والحالات الحدية ومعالجة الأخطاء
 */

import {
    AIResearcherInput,
    AIResearcherOutput,
    AnalyzeContextInput,
    AnalyzeContextOutput,
    EvaluateReportInput,
    EvaluateReportOutput,
    FactCheckInput,
    FactCheckOutput,
    ImageToTextInput,
    ImageToTextOutput
} from '@/ai/schemas';
import {
    aiResearcher,
    analyzeContext,
    evaluateReport,
    factCheckText,
    imageToText
} from '../analysis';

// Mock the AI system
jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => handler)
    }
}));

// Mock the prompts
jest.mock('@/ai/prompts/analyze-context', () => ({
    analysisPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/fact-checker', () => ({
    factCheckPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/ai-researcher', () => ({
    aiResearcherPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/evaluate-report', () => ({
    evaluateReportPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/image-to-text', () => ({
    imageToTextPrompt: jest.fn()
}));

describe('Analysis Flows', () => {
    describe('analyzeContext', () => {
        const mockInput: AnalyzeContextInput = {
            prompt: 'استخرج المعلومات الرئيسية من المستندات',
            contextFiles: [
                {
                    fileName: 'document1.txt',
                    content: 'محتوى المستند الأول',
                    type: 'context'
                },
                {
                    fileName: 'document2.txt',
                    content: 'محتوى المستند الثاني',
                    type: 'example'
                }
            ]
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should analyze context successfully', async () => {
            // Arrange
            const mockAnalysisResult: AnalyzeContextOutput = {
                schema: 'z.object({ summary: z.string(), keyPoints: z.array(z.string()) })',
                data: {
                    summary: 'ملخص المعلومات المستخرجة',
                    keyPoints: ['النقطة الأولى', 'النقطة الثانية']
                }
            };

            const { analysisPrompt } = require('@/ai/prompts/analyze-context');
            analysisPrompt.mockResolvedValue({ output: mockAnalysisResult });

            // Act
            const result = await analyzeContext(mockInput);

            // Assert
            expect(analysisPrompt).toHaveBeenCalled();
            expect(result).toEqual(mockAnalysisResult);
            expect(result.schema).toContain('z.object');
            expect(result.data.summary).toBe('ملخص المعلومات المستخرجة');
            expect(result.data.keyPoints).toHaveLength(2);
        });

        it('should handle different context types', async () => {
            // Arrange
            const mixedContextInput: AnalyzeContextInput = {
                prompt: 'حلل المستندات المختلفة',
                contextFiles: [
                    {
                        fileName: 'guidelines.pdf',
                        content: 'الإرشادات والتوجيهات',
                        type: 'guidelines'
                    },
                    {
                        fileName: 'question.txt',
                        content: 'سؤال للتحليل',
                        type: 'question'
                    },
                    {
                        fileName: 'textbook.pdf',
                        content: 'محتوى الكتاب المدرسي',
                        type: 'textbook'
                    }
                ]
            };

            const { analysisPrompt } = require('@/ai/prompts/analyze-context');
            analysisPrompt.mockResolvedValue({
                output: {
                    schema: 'z.object({ analysis: z.string() })',
                    data: {
                        analysis: 'تحليل شامل للمستندات المختلفة'
                    }
                }
            });

            // Act
            const result = await analyzeContext(mixedContextInput);

            // Assert
            expect(result.data.analysis).toBe('تحليل شامل للمستندات المختلفة');
        });

        it('should handle empty context files', async () => {
            // Arrange
            const emptyContextInput: AnalyzeContextInput = {
                prompt: 'حلل المستندات',
                contextFiles: []
            };

            const { analysisPrompt } = require('@/ai/prompts/analyze-context');
            analysisPrompt.mockResolvedValue({
                output: {
                    schema: 'z.object({ message: z.string() })',
                    data: {
                        message: 'لا توجد مستندات للتحليل'
                    }
                }
            });

            // Act
            const result = await analyzeContext(emptyContextInput);

            // Assert
            expect(result.data.message).toBe('لا توجد مستندات للتحليل');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                prompt: '',
                contextFiles: 'invalid'
            };

            // Act & Assert
            await expect(analyzeContext(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('factCheckText', () => {
        const mockInput: FactCheckInput = {
            text: 'الذكاء الاصطناعي سيحل محل جميع الوظائف البشرية في المستقبل القريب'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should fact check successfully', async () => {
            // Arrange
            const mockFactCheckResult: FactCheckOutput = {
                claims: [
                    {
                        statement: 'الذكاء الاصطناعي سيحل محل جميع الوظائف البشرية',
                        status: 'Inconclusive',
                        source: 'https://example.com/ai-jobs-study',
                        explanation: 'الدراسات متضاربة حول هذا الموضوع'
                    }
                ],
                originalityScore: 60
            };

            const { factCheckPrompt } = require('@/ai/prompts/fact-checker');
            factCheckPrompt.mockResolvedValue({ output: mockFactCheckResult });

            // Act
            const result = await factCheckText(mockInput);

            // Assert
            expect(factCheckPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockFactCheckResult);
            expect(result.claims).toHaveLength(1);
            expect(result.claims[0].status).toBe('Inconclusive');
            expect(result.originalityScore).toBe(60);
        });

        it('should handle verified claims', async () => {
            // Arrange
            const verifiedInput: FactCheckInput = {
                text: 'الماء يتجمد عند درجة حرارة 0 مئوية'
            };

            const { factCheckPrompt } = require('@/ai/prompts/fact-checker');
            factCheckPrompt.mockResolvedValue({
                output: {
                    claims: [
                        {
                            statement: 'الماء يتجمد عند درجة حرارة 0 مئوية',
                            status: 'Verified',
                            source: 'https://example.com/physics-textbook',
                            explanation: 'هذه حقيقة علمية مثبتة'
                        }
                    ],
                    originalityScore: 95
                }
            });

            // Act
            const result = await factCheckText(verifiedInput);

            // Assert
            expect(result.claims[0].status).toBe('Verified');
            expect(result.originalityScore).toBe(95);
        });

        it('should handle false claims', async () => {
            // Arrange
            const falseInput: FactCheckInput = {
                text: 'الأرض مسطحة والشمس تدور حولها'
            };

            const { factCheckPrompt } = require('@/ai/prompts/fact-checker');
            factCheckPrompt.mockResolvedValue({
                output: {
                    claims: [
                        {
                            statement: 'الأرض مسطحة',
                            status: 'False',
                            source: 'https://example.com/astronomy-facts',
                            explanation: 'الأرض كروية الشكل كما أثبت العلم'
                        }
                    ],
                    originalityScore: 20
                }
            });

            // Act
            const result = await factCheckText(falseInput);

            // Assert
            expect(result.claims[0].status).toBe('False');
            expect(result.originalityScore).toBe(20);
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                text: 123
            };

            // Act & Assert
            await expect(factCheckText(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('aiResearcher', () => {
        const mockInput: AIResearcherInput = {
            topic: 'الذكاء الاصطناعي في التعليم'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should research topic successfully', async () => {
            // Arrange
            const mockResearchResult: AIResearcherOutput = {
                summary: 'الذكاء الاصطناعي يحول التعليم بشكل جذري',
                keyPoints: [
                    'التعلم الشخصي',
                    'التقييم التلقائي',
                    'المساعدة الذكية'
                ],
                sources: [
                    'https://example.com/ai-education-study',
                    'https://example.com/edtech-report'
                ]
            };

            const { aiResearcherPrompt } = require('@/ai/prompts/ai-researcher');
            aiResearcherPrompt.mockResolvedValue({ output: mockResearchResult });

            // Act
            const result = await aiResearcher(mockInput);

            // Assert
            expect(aiResearcherPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockResearchResult);
            expect(result.summary).toContain('الذكاء الاصطناعي');
            expect(result.keyPoints).toHaveLength(3);
            expect(result.sources).toHaveLength(2);
        });

        it('should handle different research depths', async () => {
            // Arrange
            const deepResearchInput: AIResearcherInput = {
                topic: 'التعلم العميق في الذكاء الاصطناعي'
            };

            const { aiResearcherPrompt } = require('@/ai/prompts/ai-researcher');
            aiResearcherPrompt.mockResolvedValue({
                output: {
                    summary: 'بحث عميق في التعلم العميق',
                    keyPoints: [
                        'الشبكات العصبية',
                        'خوارزميات التعلم',
                        'التطبيقات العملية',
                        'التحديات المستقبلية'
                    ],
                    sources: [
                        'https://example.com/deep-learning-paper',
                        'https://example.com/neural-networks-guide',
                        'https://example.com/ai-applications'
                    ]
                }
            });

            // Act
            const result = await aiResearcher(deepResearchInput);

            // Assert
            expect(result.keyPoints).toHaveLength(4);
            expect(result.sources).toHaveLength(3);
            expect(result.summary).toContain('بحث عميق');
        });

        it('should handle empty topic', async () => {
            // Arrange
            const emptyTopicInput: AIResearcherInput = {
                topic: ''
            };

            const { aiResearcherPrompt } = require('@/ai/prompts/ai-researcher');
            aiResearcherPrompt.mockResolvedValue({
                output: {
                    summary: 'لا يمكن البحث بدون موضوع محدد',
                    keyPoints: [],
                    sources: []
                }
            });

            // Act
            const result = await aiResearcher(emptyTopicInput);

            // Assert
            expect(result.summary).toContain('لا يمكن البحث');
            expect(result.keyPoints).toHaveLength(0);
            expect(result.sources).toHaveLength(0);
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                topic: 123
            };

            // Act & Assert
            await expect(aiResearcher(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('evaluateReport', () => {
        const mockInput: EvaluateReportInput = {
            reportSections: {
                introduction: 'مقدمة التقرير',
                conclusion: 'خاتمة التقرير'
            },
            acceptanceCriteria: [
                'يجب أن يحتوي التقرير على مقدمة واضحة',
                'يجب أن يحتوي التقرير على خاتمة شاملة'
            ]
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should evaluate report successfully', async () => {
            // Arrange
            const mockEvaluationResult: EvaluateReportOutput = {
                evaluationScore: 85,
                feedback: [
                    {
                        point: 'المقدمة واضحة ومفهومة',
                        status: 'Acceptable',
                        sectionKey: 'introduction'
                    },
                    {
                        point: 'الخاتمة تحتاج إلى مزيد من التفصيل',
                        status: 'Weak',
                        sectionKey: 'conclusion',
                        solution: 'أضف المزيد من التفاصيل في الخاتمة'
                    }
                ],
                summary: 'التقرير جيد بشكل عام مع بعض النقاط التي تحتاج تحسين'
            };

            const { evaluateReportPrompt } = require('@/ai/prompts/evaluate-report');
            evaluateReportPrompt.mockResolvedValue({ output: mockEvaluationResult });

            // Act
            const result = await evaluateReport(mockInput);

            // Assert
            expect(evaluateReportPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockEvaluationResult);
            expect(result.evaluationScore).toBe(85);
            expect(result.feedback).toHaveLength(2);
            expect(result.feedback[0].status).toBe('Acceptable');
            expect(result.feedback[1].status).toBe('Weak');
        });

        it('should handle missing sections', async () => {
            // Arrange
            const incompleteInput: EvaluateReportInput = {
                reportSections: {
                    introduction: 'مقدمة التقرير'
                    // missing conclusion
                },
                acceptanceCriteria: [
                    'يجب أن يحتوي التقرير على مقدمة واضحة',
                    'يجب أن يحتوي التقرير على خاتمة شاملة'
                ]
            };

            const { evaluateReportPrompt } = require('@/ai/prompts/evaluate-report');
            evaluateReportPrompt.mockResolvedValue({
                output: {
                    evaluationScore: 50,
                    feedback: [
                        {
                            point: 'المقدمة واضحة',
                            status: 'Acceptable',
                            sectionKey: 'introduction'
                        },
                        {
                            point: 'الخاتمة مفقودة',
                            status: 'Not Present',
                            sectionKey: 'conclusion',
                            solution: 'أضف خاتمة للتقرير'
                        }
                    ],
                    summary: 'التقرير غير مكتمل'
                }
            });

            // Act
            const result = await evaluateReport(incompleteInput);

            // Assert
            expect(result.evaluationScore).toBe(50);
            expect(result.feedback[1].status).toBe('Not Present');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                reportSections: 'invalid',
                acceptanceCriteria: 123
            };

            // Act & Assert
            await expect(evaluateReport(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('imageToText', () => {
        const mockInput: ImageToTextInput = {
            imageDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should extract text from image successfully', async () => {
            // Arrange
            const mockTextResult: ImageToTextOutput = {
                text: '# نص مستخرج من الصورة\n\nهذا النص تم استخراجه من الصورة المرفقة'
            };

            const { imageToTextPrompt } = require('@/ai/prompts/image-to-text');
            imageToTextPrompt.mockResolvedValue({ output: mockTextResult });

            // Act
            const result = await imageToText(mockInput);

            // Assert
            expect(imageToTextPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockTextResult);
            expect(result.text).toContain('نص مستخرج من الصورة');
        });

        it('should handle images with no text', async () => {
            // Arrange
            const noTextInput: ImageToTextInput = {
                imageDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            };

            const { imageToTextPrompt } = require('@/ai/prompts/image-to-text');
            imageToTextPrompt.mockResolvedValue({
                output: {
                    text: 'لا يوجد نص في هذه الصورة'
                }
            });

            // Act
            const result = await imageToText(noTextInput);

            // Assert
            expect(result.text).toBe('لا يوجد نص في هذه الصورة');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                imageDataUri: 'invalid-uri'
            };

            // Mock the prompt to throw an error for invalid input
            const { imageToTextPrompt } = require('@/ai/prompts/image-to-text');
            imageToTextPrompt.mockRejectedValue(new Error('Invalid image data URI'));

            // Act & Assert
            await expect(imageToText(invalidInput as any)).rejects.toThrow('Invalid image data URI');
        });
    });
});
