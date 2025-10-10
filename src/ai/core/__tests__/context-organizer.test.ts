import { ContextItem, ContextOrganizer } from '../context-organizer';

describe('ContextOrganizer', () => {
    describe('organizeContexts', () => {
        it('should organize context correctly for business domain', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'project-data.xlsx',
                    content: 'بيانات المشروع المالية والإحصائية',
                    type: 'context'
                },
                {
                    fileName: 'meeting-notes.txt',
                    content: 'ملاحظات الاجتماع الأخير',
                    type: 'context'
                },
                {
                    fileName: 'guidelines.txt',
                    content: 'استخدم البيانات المالية المرفقة، ركز على الإنجازات والتحديات',
                    type: 'guidelines'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'executive-summary', [
                'استخدم البيانات المالية المرفقة',
                'ركز على الإنجازات والتحديات'
            ]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(3);
        });

        it('should organize context correctly for technical domain', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'system-architecture.pdf',
                    content: 'مخططات النظام والمعمارية',
                    type: 'textbook'
                },
                {
                    fileName: 'code-samples.js',
                    content: 'أمثلة على الكود المستخدم',
                    type: 'example'
                },
                {
                    fileName: 'guidelines.txt',
                    content: 'استخدم المخططات المرفقة، اشرح الكود بالتفصيل',
                    type: 'guidelines'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'technical-details', [
                'استخدم المخططات المرفقة',
                'اشرح الكود بالتفصيل'
            ]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(3);
        });

        it('should organize context correctly for academic domain', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'research-papers.pdf',
                    content: 'أوراق بحثية عن الذكاء الاصطناعي',
                    type: 'textbook'
                },
                {
                    fileName: 'bibliography.txt',
                    content: 'قائمة المراجع والمصادر',
                    type: 'context'
                },
                {
                    fileName: 'guidelines.txt',
                    content: 'استخدم المراجع الأكاديمية، اتبع معايير الكتابة الأكاديمية',
                    type: 'guidelines'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'literature-review', [
                'استخدم المراجع الأكاديمية',
                'اتبع معايير الكتابة الأكاديمية'
            ]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(3);
        });

        it('should organize context correctly for creative domain', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'character-profiles.txt',
                    content: 'ملفات الشخصيات الرئيسية',
                    type: 'context'
                },
                {
                    fileName: 'plot-outline.txt',
                    content: 'مخطط القصة والأحداث',
                    type: 'example'
                },
                {
                    fileName: 'guidelines.txt',
                    content: 'استخدم الشخصيات المحددة، اتبع مخطط القصة',
                    type: 'guidelines'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'chapter-two', [
                'استخدم الشخصيات المحددة',
                'اتبع مخطط القصة'
            ]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(3);
        });

        it('should handle empty context array', async () => {
            const result = ContextOrganizer.organizeContexts([]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(0);
        });

        it('should handle different context types', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'document.pdf',
                    content: 'مستند PDF',
                    type: 'textbook'
                },
                {
                    fileName: 'spreadsheet.xlsx',
                    content: 'جدول بيانات',
                    type: 'context'
                },
                {
                    fileName: 'code.js',
                    content: 'كود JavaScript',
                    type: 'example'
                },
                {
                    fileName: 'question.txt',
                    content: 'سؤال للتفكير',
                    type: 'question'
                },
                {
                    fileName: 'guidelines.txt',
                    content: 'استخدم جميع الملفات المرفقة',
                    type: 'guidelines'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'main-content', [
                'استخدم جميع الملفات المرفقة'
            ]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(5);
        });

        it('should handle contexts with different knowledge levels', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'definition.txt',
                    content: 'definition of artificial intelligence',
                    type: 'textbook'
                },
                {
                    fileName: 'theory.txt',
                    content: 'theory of machine learning',
                    type: 'textbook'
                },
                {
                    fileName: 'steps.txt',
                    content: 'step by step process',
                    type: 'example'
                },
                {
                    fileName: 'analysis.txt',
                    content: 'analysis and evaluation',
                    type: 'question'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(4);
        });

        it('should handle contexts with different priorities', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'critical.txt',
                    content: 'critical information',
                    type: 'guidelines'
                },
                {
                    fileName: 'important.txt',
                    content: 'important information',
                    type: 'textbook'
                },
                {
                    fileName: 'supporting.txt',
                    content: 'supporting information',
                    type: 'context'
                },
                {
                    fileName: 'reference.txt',
                    content: 'reference information',
                    type: 'question'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(4);
        });

        it('should handle contexts with metadata', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'document.txt',
                    content: 'محتوى المستند',
                    type: 'context',
                    relevance: 0.8,
                    knowledgeLevel: 'conceptual',
                    priority: 'important',
                    metadata: {
                        wordCount: 100,
                        complexity: 'medium',
                        domain: 'business',
                        language: 'ar'
                    }
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle very large context array', async () => {
            const largeContexts: ContextItem[] = Array.from({ length: 100 }, (_, i) => ({
                fileName: `file-${i}.txt`,
                content: `محتوى الملف ${i}`,
                type: 'context' as const
            }));

            const result = ContextOrganizer.organizeContexts(largeContexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(100);
        });

        it('should handle empty user requirements', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'data.txt',
                    content: 'بيانات مفيدة',
                    type: 'context'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'main-content', []);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(1);
        });

        it('should handle special characters in file names', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'file-with-special-chars-@#$%.txt',
                    content: 'محتوى الملف',
                    type: 'context'
                },
                {
                    fileName: 'file-with-spaces and-dashes.txt',
                    content: 'محتوى الملف الثاني',
                    type: 'context'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(2);
        });

        it('should handle different content lengths', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'short.txt',
                    content: 'نص قصير',
                    type: 'context'
                },
                {
                    fileName: 'long.txt',
                    content: 'نص طويل جداً '.repeat(1000),
                    type: 'context'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(2);
        });

        it('should handle multilingual content', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'arabic.txt',
                    content: 'نص باللغة العربية',
                    type: 'context'
                },
                {
                    fileName: 'english.txt',
                    content: 'Text in English',
                    type: 'context'
                },
                {
                    fileName: 'mixed.txt',
                    content: 'نص مختلط Mixed text',
                    type: 'context'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(3);
        });

        it('should handle undefined target section', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'data.txt',
                    content: 'بيانات مفيدة',
                    type: 'context'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, undefined, [
                'استخدم البيانات المرفقة'
            ]);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(1);
        });

        it('should handle undefined user requirements', async () => {
            const contexts: ContextItem[] = [
                {
                    fileName: 'data.txt',
                    content: 'بيانات مفيدة',
                    type: 'context'
                }
            ];

            const result = ContextOrganizer.organizeContexts(contexts, 'main-content', undefined);

            expect(result).toBeDefined();
            expect(result.foundational).toBeDefined();
            expect(result.conceptual).toBeDefined();
            expect(result.procedural).toBeDefined();
            expect(result.reference).toBeDefined();
            expect(result.guidelines).toBeDefined();
            expect(result.statistics).toBeDefined();
            expect(result.statistics.totalItems).toBe(1);
        });
    });
});
