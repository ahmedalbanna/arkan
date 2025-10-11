/**
 * اختبارات شاملة لتدفقات المحتوى المرئي
 * تتحقق من جميع وظائف توليد المخططات والرسوم البيانية
 */

import {
    generateDiagram,
    generatePlantUML
} from '../visual';

describe('Visual Flows', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateDiagram', () => {
        it('should generate diagram successfully', async () => {
            // Arrange
            const mockInput = {
                diagramToGenerate: 'flowchart' as const,
                guidelines: ['استخدم ألوان واضحة', 'اجعل المخطط بسيطاً'],
                instructionText: 'أنشئ مخطط تدفق للعمليات'
            };

            // Act
            const result = await generateDiagram(mockInput);

            // Assert
            expect(result).toBeDefined();
        });

        it('should handle different diagram types', async () => {
            // Arrange
            const mockInput = {
                diagramToGenerate: 'class' as const,
                guidelines: ['استخدم UML standards'],
                instructionText: 'أنشئ مخطط فئات للنظام'
            };

            // Act
            const result = await generateDiagram(mockInput);

            // Assert
            expect(result).toBeDefined();
        });

        it('should handle complex diagrams', async () => {
            // Arrange
            const mockInput = {
                diagramToGenerate: 'sequence' as const,
                guidelines: ['أظهر التفاعلات بوضوح'],
                instructionText: 'أنشئ مخطط تسلسل للتفاعل بين الأنظمة',
                externalContext: [
                    {
                        fileName: 'system-specs.txt',
                        content: 'مواصفات النظام',
                        type: 'context' as const
                    }
                ]
            };

            // Act
            const result = await generateDiagram(mockInput);

            // Assert
            expect(result).toBeDefined();
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                diagramToGenerate: 'invalid-type' as any,
                guidelines: [],
                instructionText: 'وصف'
            };

            // Act & Assert
            await expect(generateDiagram(invalidInput)).rejects.toThrow();
        });
    });

    describe('generatePlantUML', () => {
        it('should generate PlantUML successfully', async () => {
            // Arrange
            const mockInput = {
                diagramType: 'class' as const,
                title: 'نظام إدارة المستخدمين',
                description: 'مخطط PlantUML لفئات نظام إدارة المستخدمين',
                classes: [
                    {
                        name: 'User',
                        attributes: [
                            { name: 'id', type: 'int', visibility: 'private' },
                            { name: 'name', type: 'string', visibility: 'private' },
                            { name: 'email', type: 'string', visibility: 'private' }
                        ],
                        methods: [
                            { name: 'getId', returnType: 'int', visibility: 'public' },
                            { name: 'getName', returnType: 'string', visibility: 'public' },
                            { name: 'setEmail', parameters: ['string email'], returnType: 'void', visibility: 'public' }
                        ]
                    },
                    {
                        name: 'UserService',
                        attributes: [],
                        methods: [
                            { name: 'createUser', parameters: ['User user'], returnType: 'User', visibility: 'public' },
                            { name: 'deleteUser', parameters: ['int id'], returnType: 'boolean', visibility: 'public' }
                        ]
                    }
                ],
                relationships: [
                    {
                        from: 'UserService',
                        to: 'User',
                        type: 'association',
                        label: 'manages'
                    }
                ],
                options: {
                    showMethods: true,
                    showAttributes: true,
                    showVisibility: true,
                    theme: 'default'
                }
            };

            // Act
            const result = await generatePlantUML(mockInput);

            // Assert
            expect(result).toBeDefined();
        });

        it('should handle sequence diagrams', async () => {
            // Arrange
            const mockInput = {
                diagramType: 'sequence' as const,
                title: 'تفاعل النظام',
                description: 'مخطط تسلسل للتفاعل بين المكونات',
                participants: [
                    { name: 'Client', type: 'actor' },
                    { name: 'Server', type: 'component' },
                    { name: 'Database', type: 'component' }
                ],
                interactions: [
                    {
                        from: 'Client',
                        to: 'Server',
                        message: 'request data',
                        type: 'synchronous'
                    },
                    {
                        from: 'Server',
                        to: 'Database',
                        message: 'query',
                        type: 'synchronous'
                    },
                    {
                        from: 'Database',
                        to: 'Server',
                        message: 'results',
                        type: 'response'
                    },
                    {
                        from: 'Server',
                        to: 'Client',
                        message: 'response',
                        type: 'response'
                    }
                ],
                options: {
                    showActivation: true,
                    showNotes: true,
                    theme: 'modern'
                }
            };

            // Act
            const result = await generatePlantUML(mockInput);

            // Assert
            expect(result).toBeDefined();
        });

        it('should handle use case diagrams', async () => {
            // Arrange
            const mockInput = {
                diagramType: 'useCase' as const,
                title: 'نظام المكتبة',
                description: 'مخطط حالات الاستخدام لنظام المكتبة',
                actors: [
                    { name: 'Librarian', description: 'أمين المكتبة' },
                    { name: 'Member', description: 'عضو المكتبة' }
                ],
                useCases: [
                    { name: 'Add Book', description: 'إضافة كتاب جديد' },
                    { name: 'Borrow Book', description: 'استعارة كتاب' },
                    { name: 'Return Book', description: 'إرجاع كتاب' },
                    { name: 'Search Books', description: 'البحث عن الكتب' }
                ],
                relationships: [
                    {
                        from: 'Librarian',
                        to: 'Add Book',
                        type: 'association'
                    },
                    {
                        from: 'Member',
                        to: 'Borrow Book',
                        type: 'association'
                    },
                    {
                        from: 'Member',
                        to: 'Return Book',
                        type: 'association'
                    },
                    {
                        from: 'Member',
                        to: 'Search Books',
                        type: 'association'
                    }
                ],
                options: {
                    showDescriptions: true,
                    theme: 'default'
                }
            };

            // Act
            const result = await generatePlantUML(mockInput);

            // Assert
            expect(result).toBeDefined();
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                diagramType: 'invalid-type' as any,
                title: 'مخطط غير صحيح',
                description: 'وصف',
                classes: [],
                relationships: [],
                options: {
                    showMethods: true,
                    showAttributes: true,
                    showVisibility: true,
                    theme: 'default'
                }
            };

            // Act & Assert
            await expect(generatePlantUML(invalidInput)).rejects.toThrow();
        });
    });
});
