/**
 * اختبارات التكامل الشاملة لـ AI Flows
 * تتحقق من التفاعل بين التدفقات المختلفة ونظام الذكاء الاصطناعي الرئيسي
 */

import {
    analyzeAcademicDocument,
    createLectureUnit,
    generateSessionPlan,
    generateTheoreticalLecture,
    solveAcademicDocument
} from '../academic';

import {
    aiResearcher,
    analyzeContext,
    evaluateReport,
    factCheckText
} from '../analysis';

import {
    generateCode,
    generateCodebase,
    generateIdeas,
    generateText
} from '../content-generation';

import {
    UnifiedFlowRequest,
    UnifiedFlows
} from '../unified';

import {
    FlowRegistry
} from '../registry';

import {
    AIResearcherInput,
    AnalyzeContextInput,
    AnalyzeDocumentInput,
    CreateLectureUnitInput,
    EvaluateReportInput,
    FactCheckInput,
    GenerateCodeInput,
    GenerateCodebaseInput,
    GenerateSessionPlanInput,
    GenerateTextInput,
    GenerateTheoreticalLectureInput,
    IdeaGenerationInput,
    SolveDocumentInput
} from '@/ai/schemas';

// Mock the AI system for integration tests
jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => handler)
    }
}));

// Mock all prompts for integration testing
jest.mock('@/ai/prompts/academic-solver', () => ({
    analysisPrompt: jest.fn(),
    solvePrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-theoretical-lecture', () => ({
    generateTheoreticalLecturePrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-session-plan', () => ({
    generateSessionPlanPrompt: jest.fn()
}));

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

jest.mock('@/ai/prompts/generate-text', () => ({
    generateTextPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-ideas', () => ({
    generateIdeasPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-code', () => ({
    generateCodePrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-codebase', () => ({
    generateCodebasePrompt: jest.fn()
}));

describe('AI Flows Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        FlowRegistry.clear();
    });

    describe('Academic Flows Integration', () => {
        it('should integrate academic document analysis and solution workflow', async () => {
            // Arrange
            const analysisInput: AnalyzeDocumentInput = {
                documentType: 'exam',
                markdownContent: '# امتحان الرياضيات\n\nالسؤال الأول: احسب المشتقة...'
            };

            const mockAnalysisResult = {
                documentType: 'exam' as const,
                subject: 'الرياضيات',
                title: 'امتحان الرياضيات النهائي',
                structuredContent: '# امتحان الرياضيات\n\nالسؤال الأول: احسب المشتقة...',
                language: 'ar'
            };

            const mockSolutionResult = {
                solutions: [
                    {
                        question: 'احسب المشتقة',
                        solution: 'الحل: المشتقة تساوي...'
                    }
                ]
            };

            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            const { solvePrompt } = require('@/ai/prompts/academic-solver');

            analysisPrompt.mockResolvedValue({ output: mockAnalysisResult });
            solvePrompt.mockResolvedValue({ output: mockSolutionResult });

            // Act
            const analysisResult = await analyzeAcademicDocument(analysisInput);
            const solutionInput: SolveDocumentInput = {
                analyzedDocument: analysisResult,
                contextMarkdown: 'سياق إضافي'
            };
            const solutionResult = await solveAcademicDocument(solutionInput);

            // Assert
            expect(analysisPrompt).toHaveBeenCalled();
            expect(solvePrompt).toHaveBeenCalled();
            expect(analysisResult.documentType).toBe('exam');
            expect(solutionResult.solutions).toHaveLength(1);
            expect(solutionResult.solutions[0].question).toBe('احسب المشتقة');
        });

        it('should integrate theoretical lecture and session plan workflow', async () => {
            // Arrange
            const lectureInput: GenerateTheoreticalLectureInput = {
                lectureTopic: 'مقدمة في الذكاء الاصطناعي',
                subTopics: ['تعريف الذكاء الاصطناعي', 'أنواع الذكاء الاصطناعي'],
                professorNotes: 'ملاحظات الأستاذ',
                targetAudience: 'طلاب الجامعة'
            };

            const mockLectureResult = {
                lectureContent: '# مقدمة في الذكاء الاصطناعي\n\nمحتوى المحاضرة النظرية مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم. يتضمن المحتوى شرحاً مفصلاً للخوارزميات الأساسية وتطبيقاتها في الحياة العملية.'
            };

            const mockSessionResult = {
                sessionTitle: 'جلسة تفاعلية حول الذكاء الاصطناعي',
                sessionGoals: ['فهم أساسيات الذكاء الاصطناعي'],
                learningObjectives: ['تحديد أنواع الذكاء الاصطناعي'],
                activities: [
                    {
                        title: 'نشاط تفاعلي',
                        objective: 'فهم المفاهيم',
                        duration: 30,
                        type: 'group-discussion' as const,
                        instructions: 'ناقش المفاهيم',
                        discussion: ['ما هي المفاهيم؟']
                    }
                ],
                closingSummary: 'ملخص الجلسة'
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');

            generateTheoreticalLecturePrompt.mockResolvedValue({ output: mockLectureResult });
            generateSessionPlanPrompt.mockResolvedValue({ output: mockSessionResult });

            // Act
            const lectureResult = await generateTheoreticalLecture(lectureInput);
            const sessionInput: GenerateSessionPlanInput = {
                chapterContent: lectureResult.lectureContent,
                sessionDuration: 90,
                numActivities: 3,
                targetAudience: 'طلاب الجامعة'
            };
            const sessionResult = await generateSessionPlan(sessionInput);

            // Assert
            expect(generateTheoreticalLecturePrompt).toHaveBeenCalledWith(lectureInput);
            expect(generateSessionPlanPrompt).toHaveBeenCalledWith(sessionInput);
            expect(lectureResult.lectureContent).toContain('الذكاء الاصطناعي');
            expect(sessionResult.sessionTitle).toContain('الذكاء الاصطناعي');
            expect(sessionResult.activities).toHaveLength(1);
        });

        it('should integrate complete lecture unit workflow', async () => {
            // Arrange
            const lectureUnitInput: CreateLectureUnitInput = {
                lectureTopic: 'مقدمة في الذكاء الاصطناعي',
                subTopics: ['تعريف الذكاء الاصطناعي'],
                professorNotes: 'ملاحظات الأستاذ',
                targetAudience: 'طلاب الجامعة',
                sessionDuration: 90,
                numActivities: 3
            };

            const mockLectureResult = {
                lectureContent: '# مقدمة في الذكاء الاصطناعي\n\nمحتوى المحاضرة النظرية مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم. يتضمن المحتوى شرحاً مفصلاً للخوارزميات الأساسية وتطبيقاتها في الحياة العملية.'
            };

            const mockSessionResult = {
                sessionTitle: 'جلسة تفاعلية',
                sessionGoals: ['فهم الأساسيات'],
                learningObjectives: ['تحديد المفاهيم'],
                activities: [],
                closingSummary: 'ملخص'
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');

            generateTheoreticalLecturePrompt.mockResolvedValue({ output: mockLectureResult });
            generateSessionPlanPrompt.mockResolvedValue({ output: mockSessionResult });

            // Act
            const result = await createLectureUnit(lectureUnitInput);

            // Assert
            expect(generateTheoreticalLecturePrompt).toHaveBeenCalled();
            expect(generateSessionPlanPrompt).toHaveBeenCalled();
            expect(result.theoreticalLecture).toBeDefined();
            expect(result.practicalSession).toBeDefined();
        });
    });

    describe('Analysis Flows Integration', () => {
        it('should integrate context analysis and fact checking workflow', async () => {
            // Arrange
            const contextInput: AnalyzeContextInput = {
                prompt: 'استخرج المعلومات الرئيسية',
                contextFiles: [
                    {
                        fileName: 'document.txt',
                        content: 'محتوى المستند',
                        type: 'context'
                    }
                ]
            };

            const mockContextResult = {
                schema: 'z.object({ summary: z.string() })',
                data: { summary: 'ملخص المعلومات' }
            };

            const factCheckInput: FactCheckInput = {
                text: 'هذا نص يحتوي على معلومات للتحقق منها'
            };

            const mockFactCheckResult = {
                claims: [
                    {
                        statement: 'معلومة للتحقق',
                        status: 'Verified' as const,
                        source: 'https://example.com/source',
                        explanation: 'تم التحقق من المعلومة'
                    }
                ],
                originalityScore: 85
            };

            const { analysisPrompt } = require('@/ai/prompts/analyze-context');
            const { factCheckPrompt } = require('@/ai/prompts/fact-checker');

            analysisPrompt.mockResolvedValue({ output: mockContextResult });
            factCheckPrompt.mockResolvedValue({ output: mockFactCheckResult });

            // Act
            const contextResult = await analyzeContext(contextInput);
            const factCheckResult = await factCheckText(factCheckInput);

            // Assert
            expect(analysisPrompt).toHaveBeenCalled();
            expect(factCheckPrompt).toHaveBeenCalledWith(factCheckInput);
            expect(contextResult.data.summary).toBe('ملخص المعلومات');
            expect(factCheckResult.claims[0].status).toBe('Verified');
        });

        it('should integrate research and report evaluation workflow', async () => {
            // Arrange
            const researchInput: AIResearcherInput = {
                topic: 'الذكاء الاصطناعي في التعليم'
            };

            const mockResearchResult = {
                summary: 'تأثير الذكاء الاصطناعي على التعليم',
                keyPoints: ['التعلم الشخصي', 'التقييم التلقائي'],
                sources: ['https://example.com/research1', 'https://example.com/research2']
            };

            const evaluationInput: EvaluateReportInput = {
                reportSections: {
                    introduction: 'مقدمة التقرير',
                    conclusion: 'خاتمة التقرير'
                },
                acceptanceCriteria: [
                    'يجب أن يحتوي التقرير على مقدمة واضحة',
                    'يجب أن يحتوي التقرير على خاتمة شاملة'
                ]
            };

            const mockEvaluationResult = {
                evaluationScore: 85,
                feedback: [
                    {
                        point: 'المقدمة واضحة',
                        status: 'Acceptable' as const,
                        sectionKey: 'introduction'
                    }
                ],
                summary: 'التقرير جيد بشكل عام'
            };

            const { aiResearcherPrompt } = require('@/ai/prompts/ai-researcher');
            const { evaluateReportPrompt } = require('@/ai/prompts/evaluate-report');

            aiResearcherPrompt.mockResolvedValue({ output: mockResearchResult });
            evaluateReportPrompt.mockResolvedValue({ output: mockEvaluationResult });

            // Act
            const researchResult = await aiResearcher(researchInput);
            const evaluationResult = await evaluateReport(evaluationInput);

            // Assert
            expect(aiResearcherPrompt).toHaveBeenCalledWith(researchInput);
            expect(evaluateReportPrompt).toHaveBeenCalledWith(evaluationInput);
            expect(researchResult.keyPoints).toHaveLength(2);
            expect(evaluationResult.evaluationScore).toBe(85);
        });
    });

    describe('Content Generation Flows Integration', () => {
        it('should integrate text generation and idea generation workflow', async () => {
            // Arrange
            const ideasInput: IdeaGenerationInput = {
                specialization: 'تطوير البرمجيات',
                domain: 'التجارة الإلكترونية',
                region: 'الشرق الأوسط'
            };

            const mockIdeasResult = {
                ideas: [
                    {
                        title: 'منصة تجارة إلكترونية محلية',
                        description: 'منصة تسمح للبائعين المحليين ببيع منتجاتهم'
                    }
                ]
            };

            const textInput: GenerateTextInput = {
                prompt: 'اكتب مقالاً عن منصة التجارة الإلكترونية المحلية'
            };

            const mockTextResult = {
                generatedText: '# منصة التجارة الإلكترونية المحلية\n\nمقدمة عن أهمية دعم التجارة المحلية...'
            };

            const { generateIdeasPrompt } = require('@/ai/prompts/generate-ideas');
            const { generateTextPrompt } = require('@/ai/prompts/generate-text');

            generateIdeasPrompt.mockResolvedValue({ output: mockIdeasResult });
            generateTextPrompt.mockResolvedValue({ output: mockTextResult });

            // Act
            const ideasResult = await generateIdeas(ideasInput);
            const textResult = await generateText(textInput);

            // Assert
            expect(generateIdeasPrompt).toHaveBeenCalledWith(ideasInput);
            expect(generateTextPrompt).toHaveBeenCalledWith(textInput);
            expect(ideasResult.ideas[0].title).toContain('تجارة إلكترونية');
            expect(textResult.generatedText).toContain('التجارة المحلية');
        });

        it('should integrate code generation and codebase generation workflow', async () => {
            // Arrange
            const codeInput: GenerateCodeInput = {
                prompt: 'أنشئ مكون React لعرض المنتجات'
            };

            const mockCodeResult = {
                html: '<div class="product-list">...</div>',
                css: '.product-list { padding: 20px; }',
                javascript: 'function ProductList({ products }) { ... }'
            };

            const codebaseInput: GenerateCodebaseInput = {
                proposal: {
                    title: 'منصة التجارة الإلكترونية',
                    category: 'تطوير البرمجيات',
                    projectDescription: 'منصة شاملة للتجارة الإلكترونية',
                    techStack: ['React', 'Node.js', 'MongoDB'],
                    architecture: 'MVC'
                }
            };

            const mockCodebaseResult = {
                codebase: 'Generated codebase content...'
            };

            const { generateCodePrompt } = require('@/ai/prompts/generate-code');
            const { generateCodebasePrompt } = require('@/ai/prompts/generate-codebase');

            generateCodePrompt.mockResolvedValue({ output: mockCodeResult });
            generateCodebasePrompt.mockResolvedValue({ output: mockCodebaseResult });

            // Act
            const codeResult = await generateCode(codeInput);
            const codebaseResult = await generateCodebase(codebaseInput);

            // Assert
            expect(generateCodePrompt).toHaveBeenCalledWith(codeInput);
            expect(generateCodebasePrompt).toHaveBeenCalledWith(codebaseInput);
            expect(codeResult.html).toContain('product-list');
            expect(codebaseResult).toEqual(mockCodebaseResult);
        });
    });

    describe('Unified Flows Integration', () => {
        it('should integrate with FlowRegistry', async () => {
            // Arrange
            const testFlow = {
                name: 'integration-test-flow',
                description: 'تدفق اختبار التكامل',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({
                    output: `تم تنفيذ التدفق مع المدخل: ${input.test}`,
                    metadata: { executed: true }
                }))
            };

            FlowRegistry.register(testFlow);

            const request: UnifiedFlowRequest = {
                flowName: 'integration-test-flow',
                input: { test: 'integration test' },
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data.output).toBe('تم تنفيذ التدفق مع المدخل: integration test');
            expect(result.data.metadata.executed).toBe(true);
        });

        it('should handle multiple flows in registry', () => {
            // Arrange
            const flow1 = {
                name: 'multi-flow-1',
                description: 'التدفق الأول',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            const flow2 = {
                name: 'multi-flow-2',
                description: 'التدفق الثاني',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            // Act
            FlowRegistry.register(flow1);
            FlowRegistry.register(flow2);
            const allFlows = FlowRegistry.getAll();

            // Assert
            expect(allFlows.size).toBe(2);
            expect(allFlows.get('multi-flow-1')).toBeDefined();
            expect(allFlows.get('multi-flow-2')).toBeDefined();
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle errors gracefully across different flows', async () => {
            // Arrange
            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            analysisPrompt.mockResolvedValue({ output: null });

            const analysisInput: AnalyzeDocumentInput = {
                documentType: 'exam',
                markdownContent: 'test content'
            };

            // Act & Assert
            await expect(analyzeAcademicDocument(analysisInput)).rejects.toThrow('Analysis failed to produce an output.');
        });

        it('should handle validation errors across flows', async () => {
            // Arrange
            const invalidInput = {
                documentType: 'invalid',
                markdownContent: ''
            };

            // Act & Assert
            await expect(analyzeAcademicDocument(invalidInput as any)).rejects.toThrow();
        });

        it('should handle unified flow errors', async () => {
            // Arrange
            const errorFlow = {
                name: 'error-flow',
                description: 'تدفق ينتج خطأ',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async () => {
                    throw new Error('خطأ في التدفق الموحد');
                })
            };

            FlowRegistry.register(errorFlow);

            const request: UnifiedFlowRequest = {
                flowName: 'error-flow',
                input: {},
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('خطأ في التدفق الموحد');
        });
    });
});
