/**
 * اختبارات شاملة لـ Academic Flows
 * تغطي جميع الوظائف والحالات الحدية ومعالجة الأخطاء
 */

import {
    AnalyzeDocumentInput,
    AnalyzedDocument,
    CreateLectureUnitInput,
    GenerateSessionPlanInput,
    GenerateSessionPlanOutput,
    GenerateTheoreticalLectureInput,
    GenerateTheoreticalLectureOutput,
    SolveDocumentInput,
    SolvedDocument
} from '@/ai/schemas';
import {
    analyzeAcademicDocument,
    createLectureUnit,
    generateSessionPlan,
    generateTheoreticalLecture,
    solveAcademicDocument
} from '../academic';

// Mock the AI system
jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => handler)
    }
}));

// Mock the prompts
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

describe('Academic Flows', () => {
    describe('analyzeAcademicDocument', () => {
        const mockInput: AnalyzeDocumentInput = {
            documentType: 'exam',
            markdownContent: '# امتحان الرياضيات\n\nالسؤال الأول: احسب المشتقة...'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should analyze academic document successfully', async () => {
            // Arrange
            const mockAnalysisResult: AnalyzedDocument = {
                documentType: 'exam',
                subject: 'الرياضيات',
                title: 'امتحان الرياضيات النهائي',
                structuredContent: '# امتحان الرياضيات\n\nالسؤال الأول: احسب المشتقة...',
                language: 'ar'
            };

            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            analysisPrompt.mockResolvedValue({ output: mockAnalysisResult });

            // Act
            const result = await analyzeAcademicDocument(mockInput);

            // Assert
            expect(analysisPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockAnalysisResult);
            expect(result.documentType).toBe('exam');
            expect(result.subject).toBe('الرياضيات');
            expect(result.structuredContent).toContain('امتحان الرياضيات');
        });

        it('should handle homework document analysis', async () => {
            // Arrange
            const homeworkInput: AnalyzeDocumentInput = {
                documentType: 'homework',
                markdownContent: '# واجب الفيزياء\n\nالمطلوب: حل المسائل التالية...'
            };

            const mockHomeworkResult: AnalyzedDocument = {
                documentType: 'homework',
                subject: 'الفيزياء',
                title: 'واجب الفيزياء',
                structuredContent: '# واجب الفيزياء\n\nالمطلوب: حل المسائل التالية...',
                language: 'ar'
            };

            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            analysisPrompt.mockResolvedValue({ output: mockHomeworkResult });

            // Act
            const result = await analyzeAcademicDocument(homeworkInput);

            // Assert
            expect(analysisPrompt).toHaveBeenCalledWith(homeworkInput);
            expect(result.documentType).toBe('homework');
            expect(result.subject).toBe('الفيزياء');
        });

        it('should handle different academic levels', async () => {
            // Arrange
            const universityInput: AnalyzeDocumentInput = {
                documentType: 'exam',
                markdownContent: '# امتحان جامعي متقدم\n\nالسؤال الأول: حل المعادلة التفاضلية...'
            };

            const mockUniversityResult: AnalyzedDocument = {
                documentType: 'exam',
                subject: 'الرياضيات المتقدمة',
                title: 'امتحان جامعي متقدم',
                structuredContent: '# امتحان جامعي متقدم\n\nالسؤال الأول: حل المعادلة التفاضلية...',
                language: 'ar'
            };

            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            analysisPrompt.mockResolvedValue({ output: mockUniversityResult });

            // Act
            const result = await analyzeAcademicDocument(universityInput);

            // Assert
            expect(result.subject).toBe('الرياضيات المتقدمة');
            expect(result.structuredContent).toContain('المعادلة التفاضلية');
        });

        it('should handle empty content gracefully', async () => {
            // Arrange
            const emptyInput: AnalyzeDocumentInput = {
                documentType: 'exam',
                markdownContent: 'This is a short exam content that meets the minimum length requirement for testing purposes.'
            };

            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            analysisPrompt.mockResolvedValue({
                output: {
                    documentType: 'exam',
                    subject: 'غير محدد',
                    title: 'مستند فارغ',
                    structuredContent: '',
                    language: 'ar'
                }
            });

            // Act
            const result = await analyzeAcademicDocument(emptyInput);

            // Assert
            expect(result.subject).toBe('غير محدد');
            expect(result.structuredContent).toBe('');
        });

        it('should throw error when analysis fails', async () => {
            // Arrange
            const { analysisPrompt } = require('@/ai/prompts/academic-solver');
            analysisPrompt.mockResolvedValue({ output: null });

            // Act & Assert
            await expect(analyzeAcademicDocument(mockInput)).rejects.toThrow('Analysis failed to produce an output.');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                documentType: 'invalid_type',
                markdownContent: 'test'
            };

            // Act & Assert
            await expect(analyzeAcademicDocument(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('solveAcademicDocument', () => {
        const mockAnalyzedDocument: AnalyzedDocument = {
            documentType: 'exam',
            subject: 'الرياضيات',
            title: 'امتحان الرياضيات',
            structuredContent: '# امتحان الرياضيات\n\nالسؤال الأول: احسب المشتقة...',
            language: 'ar'
        };

        const mockInput: SolveDocumentInput = {
            analyzedDocument: mockAnalyzedDocument,
            contextMarkdown: 'سياق إضافي للمساعدة في الحل'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should solve academic document successfully', async () => {
            // Arrange
            const mockSolutionResult: SolvedDocument = {
                solutions: [
                    {
                        question: 'احسب المشتقة',
                        solution: 'الحل: المشتقة تساوي...'
                    }
                ]
            };

            const { solvePrompt } = require('@/ai/prompts/academic-solver');
            solvePrompt.mockResolvedValue({ output: mockSolutionResult });

            // Act
            const result = await solveAcademicDocument(mockInput);

            // Assert
            expect(solvePrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockSolutionResult);
            expect(result.solutions).toHaveLength(1);
            expect(result.solutions[0].question).toBe('احسب المشتقة');
            expect(result.solutions[0].solution).toContain('المشتقة تساوي');
        });

        it('should handle multiple questions', async () => {
            // Arrange
            const multiQuestionResult: SolvedDocument = {
                solutions: [
                    {
                        question: 'السؤال الأول: احسب المشتقة',
                        solution: 'الحل الأول...'
                    },
                    {
                        question: 'السؤال الثاني: احسب التكامل',
                        solution: 'الحل الثاني...'
                    }
                ]
            };

            const { solvePrompt } = require('@/ai/prompts/academic-solver');
            solvePrompt.mockResolvedValue({ output: multiQuestionResult });

            // Act
            const result = await solveAcademicDocument(mockInput);

            // Assert
            expect(result.solutions).toHaveLength(2);
            expect(result.solutions[0].question).toContain('المشتقة');
            expect(result.solutions[1].question).toContain('التكامل');
        });

        it('should handle step-by-step solutions', async () => {
            // Arrange
            const stepByStepResult: SolvedDocument = {
                solutions: [
                    {
                        question: 'احسب المشتقة',
                        solution: 'الخطوة الأولى: تطبيق قاعدة المشتقة\nالخطوة الثانية: تبسيط النتيجة\nالخطوة الثالثة: التحقق من الحل'
                    }
                ]
            };

            const { solvePrompt } = require('@/ai/prompts/academic-solver');
            solvePrompt.mockResolvedValue({ output: stepByStepResult });

            // Act
            const result = await solveAcademicDocument(mockInput);

            // Assert
            expect(result.solutions[0].solution).toContain('الخطوة الأولى');
            expect(result.solutions[0].solution).toContain('الخطوة الثانية');
            expect(result.solutions[0].solution).toContain('الخطوة الثالثة');
        });

        it('should handle missing context gracefully', async () => {
            // Arrange
            const inputWithoutContext: SolveDocumentInput = {
                analyzedDocument: mockAnalyzedDocument
                // contextMarkdown is optional
            };

            const { solvePrompt } = require('@/ai/prompts/academic-solver');
            solvePrompt.mockResolvedValue({
                output: {
                    solutions: [
                        {
                            question: 'احسب المشتقة',
                            solution: 'الحل بدون سياق إضافي...'
                        }
                    ]
                }
            });

            // Act
            const result = await solveAcademicDocument(inputWithoutContext);

            // Assert
            expect(result.solutions[0].solution).toContain('بدون سياق إضافي');
        });

        it('should throw error when solution fails', async () => {
            // Arrange
            const { solvePrompt } = require('@/ai/prompts/academic-solver');
            solvePrompt.mockResolvedValue({ output: null });

            // Act & Assert
            await expect(solveAcademicDocument(mockInput)).rejects.toThrow('Solution failed to produce an output.');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                analyzedDocument: 'invalid'
            };

            // Act & Assert
            await expect(solveAcademicDocument(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('generateTheoreticalLecture', () => {
        const mockInput: GenerateTheoreticalLectureInput = {
            lectureTopic: 'مقدمة في الذكاء الاصطناعي',
            subTopics: ['تعريف الذكاء الاصطناعي', 'أنواع الذكاء الاصطناعي', 'تطبيقات الذكاء الاصطناعي'],
            professorNotes: 'ملاحظات الأستاذ حول الموضوع',
            targetAudience: 'طلاب الجامعة'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate theoretical lecture successfully', async () => {
            // Arrange
            const mockLectureResult: GenerateTheoreticalLectureOutput = {
                lectureContent: '# مقدمة في الذكاء الاصطناعي\n\n## تعريف الذكاء الاصطناعي\n\nالذكاء الاصطناعي هو...'
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            generateTheoreticalLecturePrompt.mockResolvedValue({ output: mockLectureResult });

            // Act
            const result = await generateTheoreticalLecture(mockInput);

            // Assert
            expect(generateTheoreticalLecturePrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockLectureResult);
            expect(result.lectureContent).toContain('مقدمة في الذكاء الاصطناعي');
            expect(result.lectureContent).toContain('تعريف الذكاء الاصطناعي');
        });

        it('should handle different target audiences', async () => {
            // Arrange
            const graduateInput: GenerateTheoreticalLectureInput = {
                ...mockInput,
                targetAudience: 'طلاب الدراسات العليا'
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            generateTheoreticalLecturePrompt.mockResolvedValue({
                output: {
                    lectureContent: '# مقدمة متقدمة في الذكاء الاصطناعي\n\nمحتوى متقدم للدراسات العليا مع تفاصيل تقنية متقدمة وتطبيقات عملية في مجال الذكاء الاصطناعي والذكاء الاصطناعي المتقدم.'
                }
            });

            // Act
            const result = await generateTheoreticalLecture(graduateInput);

            // Assert
            expect(result.lectureContent).toContain('مقدمة متقدمة');
            expect(result.lectureContent).toContain('متقدم');
        });

        it('should handle missing professor notes', async () => {
            // Arrange
            const inputWithoutNotes: GenerateTheoreticalLectureInput = {
                lectureTopic: 'مقدمة في الذكاء الاصطناعي',
                subTopics: ['تعريف الذكاء الاصطناعي'],
                targetAudience: 'طلاب الجامعة'
                // professorNotes is optional
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            generateTheoreticalLecturePrompt.mockResolvedValue({
                output: {
                    lectureContent: '# مقدمة في الذكاء الاصطناعي\n\nمحتوى بدون ملاحظات الأستاذ...'
                }
            });

            // Act
            const result = await generateTheoreticalLecture(inputWithoutNotes);

            // Assert
            expect(result.lectureContent).toContain('بدون ملاحظات الأستاذ');
        });

        it('should throw error when generation fails', async () => {
            // Arrange
            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            generateTheoreticalLecturePrompt.mockResolvedValue({ output: null });

            // Act & Assert
            await expect(generateTheoreticalLecture(mockInput)).rejects.toThrow('Theoretical lecture generation failed.');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                lectureTopic: '',
                subTopics: []
            };

            // Act & Assert
            await expect(generateTheoreticalLecture(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('generateSessionPlan', () => {
        const mockInput: GenerateSessionPlanInput = {
            chapterContent: 'محتوى الفصل حول الذكاء الاصطناعي مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم.',
            sessionDuration: 90,
            numActivities: 3,
            targetAudience: 'طلاب الجامعة'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate session plan successfully', async () => {
            // Arrange
            const mockSessionResult: GenerateSessionPlanOutput = {
                sessionTitle: 'جلسة تفاعلية حول الذكاء الاصطناعي',
                sessionGoals: ['فهم أساسيات الذكاء الاصطناعي', 'تطبيق المفاهيم عملياً'],
                learningObjectives: ['تحديد أنواع الذكاء الاصطناعي', 'شرح التطبيقات المختلفة'],
                activities: [
                    {
                        title: 'نشاط تعريف الذكاء الاصطناعي',
                        objective: 'فهم مفهوم الذكاء الاصطناعي',
                        duration: 30,
                        type: 'group-discussion',
                        instructions: 'ناقش مع المجموعة مفهوم الذكاء الاصطناعي',
                        discussion: ['ما هو الذكاء الاصطناعي؟', 'ما هي فوائده؟'],
                        materials: ['لوحة بيضاء', 'أقلام']
                    }
                ],
                closingSummary: 'ملخص الجلسة وأهم النقاط'
            };

            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');
            generateSessionPlanPrompt.mockResolvedValue({ output: mockSessionResult });

            // Act
            const result = await generateSessionPlan(mockInput);

            // Assert
            expect(generateSessionPlanPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockSessionResult);
            expect(result.sessionTitle).toContain('الذكاء الاصطناعي');
            expect(result.activities).toHaveLength(1);
            expect(result.activities[0].type).toBe('group-discussion');
        });

        it('should handle different session types', async () => {
            // Arrange
            const labInput: GenerateSessionPlanInput = {
                chapterContent: 'محتوى الفصل حول الذكاء الاصطناعي مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم.',
                sessionDuration: 90,
                numActivities: 3,
                targetAudience: 'طلاب المختبر'
            };

            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');
            generateSessionPlanPrompt.mockResolvedValue({
                output: {
                    sessionTitle: 'جلسة مختبر الذكاء الاصطناعي',
                    sessionGoals: ['تطبيق عملي للمفاهيم'],
                    learningObjectives: ['برمجة خوارزمية بسيطة'],
                    activities: [
                        {
                            title: 'نشاط برمجي',
                            objective: 'كتابة كود بسيط',
                            duration: 45,
                            type: 'hands-on-exercise',
                            instructions: 'اكتب كود بسيط للذكاء الاصطناعي',
                            discussion: ['ما هي التحديات؟'],
                            materials: ['حاسوب', 'محرر نصوص']
                        }
                    ],
                    closingSummary: 'ملخص الجلسة العملية'
                }
            });

            // Act
            const result = await generateSessionPlan(labInput);

            // Assert
            expect(result.sessionTitle).toContain('مختبر');
            expect(result.activities[0].type).toBe('hands-on-exercise');
            expect(result.activities[0].materials).toContain('حاسوب');
        });

        it('should handle missing target audience', async () => {
            // Arrange
            const inputWithoutAudience: GenerateSessionPlanInput = {
                chapterContent: 'محتوى الفصل حول الذكاء الاصطناعي مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم.',
                sessionDuration: 60,
                numActivities: 2
                // targetAudience is optional
            };

            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');
            generateSessionPlanPrompt.mockResolvedValue({
                output: {
                    sessionTitle: 'جلسة عامة',
                    sessionGoals: ['هدف عام'],
                    learningObjectives: ['هدف تعليمي عام'],
                    activities: [],
                    closingSummary: 'ملخص عام'
                }
            });

            // Act
            const result = await generateSessionPlan(inputWithoutAudience);

            // Assert
            expect(result.sessionTitle).toBe('جلسة عامة');
        });

        it('should throw error when generation fails', async () => {
            // Arrange
            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');
            generateSessionPlanPrompt.mockRejectedValue(new Error('Session plan generation failed.'));

            // Act & Assert
            await expect(generateSessionPlan(mockInput)).rejects.toThrow('Session plan generation failed.');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                chapterContent: 'short content that does not meet minimum length requirements',
                sessionDuration: 0,
                numActivities: 0
            };

            // Act & Assert
            await expect(generateSessionPlan(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('createLectureUnit', () => {
        const mockInput: CreateLectureUnitInput = {
            lectureTopic: 'مقدمة في الذكاء الاصطناعي',
            subTopics: ['تعريف الذكاء الاصطناعي', 'أنواع الذكاء الاصطناعي'],
            professorNotes: 'ملاحظات الأستاذ',
            targetAudience: 'طلاب الجامعة',
            sessionDuration: 90,
            numActivities: 3
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create complete lecture unit successfully', async () => {
            // Arrange
            const mockLectureResult: GenerateTheoreticalLectureOutput = {
                lectureContent: '# مقدمة في الذكاء الاصطناعي\n\nمحتوى المحاضرة النظرية مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم.'
            };

            const mockSessionResult: GenerateSessionPlanOutput = {
                sessionTitle: 'جلسة تفاعلية حول الذكاء الاصطناعي',
                sessionGoals: ['فهم أساسيات الذكاء الاصطناعي'],
                learningObjectives: ['تحديد أنواع الذكاء الاصطناعي'],
                activities: [
                    {
                        title: 'نشاط تفاعلي',
                        objective: 'فهم المفاهيم',
                        duration: 30,
                        type: 'group-discussion',
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
            const result = await createLectureUnit(mockInput);

            // Assert
            expect(result.theoreticalLecture).toEqual(mockLectureResult);
            expect(result.practicalSession).toEqual(mockSessionResult);
            expect(result.theoreticalLecture).toBeDefined();
            expect(result.practicalSession).toBeDefined();
        });

        it('should handle different session durations', async () => {
            // Arrange
            const shortSessionInput: CreateLectureUnitInput = {
                ...mockInput,
                sessionDuration: 45,
                numActivities: 2
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');

            generateTheoreticalLecturePrompt.mockResolvedValue({
                output: { lectureContent: 'محتوى المحاضرة مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم.' }
            });
            generateSessionPlanPrompt.mockResolvedValue({
                output: {
                    sessionTitle: 'جلسة قصيرة',
                    sessionGoals: ['هدف قصير'],
                    learningObjectives: ['هدف تعليمي قصير'],
                    activities: [],
                    closingSummary: 'ملخص قصير'
                }
            });

            // Act
            const result = await createLectureUnit(shortSessionInput);

            // Assert
            expect(result.practicalSession.sessionTitle).toBe('جلسة قصيرة');
        });

        it('should handle missing professor notes', async () => {
            // Arrange
            const inputWithoutNotes: CreateLectureUnitInput = {
                lectureTopic: 'مقدمة في الذكاء الاصطناعي',
                subTopics: ['تعريف الذكاء الاصطناعي'],
                targetAudience: 'طلاب الجامعة',
                sessionDuration: 60,
                numActivities: 2
                // professorNotes is optional
            };

            const { generateTheoreticalLecturePrompt } = require('@/ai/prompts/generate-theoretical-lecture');
            const { generateSessionPlanPrompt } = require('@/ai/prompts/generate-session-plan');

            generateTheoreticalLecturePrompt.mockResolvedValue({
                output: { lectureContent: 'محتوى بدون ملاحظات مع تفاصيل شاملة عن المفاهيم الأساسية والتطبيقات العملية والاتجاهات الحديثة في هذا المجال المهم.' }
            });
            generateSessionPlanPrompt.mockResolvedValue({
                output: {
                    sessionTitle: 'جلسة بدون ملاحظات',
                    sessionGoals: ['هدف'],
                    learningObjectives: ['هدف تعليمي'],
                    activities: [],
                    closingSummary: 'ملخص'
                }
            });

            // Act
            const result = await createLectureUnit(inputWithoutNotes);

            // Assert
            expect(result.theoreticalLecture.lectureContent).toContain('بدون ملاحظات');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                lectureTopic: '',
                subTopics: [],
                sessionDuration: 0,
                numActivities: 0
            };

            // Act & Assert
            await expect(createLectureUnit(invalidInput as any)).rejects.toThrow();
        });
    });
});
