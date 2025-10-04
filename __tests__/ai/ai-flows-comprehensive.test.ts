/**
 * اختبارات شاملة لتدفقات الذكاء الاصطناعي
 * يغطي جميع التدفقات والمكونات الذكية في النظام
 */

import { jest } from '@jest/globals';

// Mock Genkit and Firebase
jest.mock('genkit', () => ({
    z: {
        object: jest.fn(() => ({ parse: jest.fn(), safeParse: jest.fn() })),
        string: jest.fn(() => ({ min: jest.fn() })),
        enum: jest.fn(() => ({ default: jest.fn() })),
    },
}));

jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => ({
            name: config.name,
            config,
            handler,
        })),
        definePrompt: jest.fn((config) => ({
            name: config.name,
            config,
            input: jest.fn(),
            output: jest.fn(),
        })),
    },
}));

// Mock schemas
jest.mock('@/ai/schemas', () => ({
    SummarizeProjectInputSchema: jest.fn(),
    SummarizeProjectOutputSchema: jest.fn(),
    GenerateProposalSectionInputSchema: jest.fn(),
    GenerateProposalSectionOutputSchema: jest.fn(),
    GeneratePresentationInputSchema: jest.fn(),
    GeneratePresentationOutputSchema: jest.fn(),
    GenerateDiagramInputSchema: jest.fn(),
    GenerateDiagramOutputSchema: jest.fn(),
    FactCheckInputSchema: jest.fn(),
    FactCheckOutputSchema: jest.fn(),
}));

// Mock AI core components
jest.mock('@/ai/core/context-analyzer', () => ({
    ContextAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn(),
        getComplexity: jest.fn(),
        getContentType: jest.fn(),
        extractEntities: jest.fn(),
    })),
}));

jest.mock('@/ai/core/intelligent-prompt-builder', () => ({
    IntelligentPromptBuilder: jest.fn().mockImplementation(() => ({
        buildPrompt: jest.fn(),
        optimizePrompt: jest.fn(),
        validatePrompt: jest.fn()),
  })),
}));

jest.mock('@/ai/core/output-quality-validator', () => ({
    OutputQualityValidator: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
        calculateScore: jest.fn(),
        getImprovementSuggestions: jest.fn(),
    })),
}));

jest.mock('@/ai/core/adaptive-model-selector', () => ({
    AdaptiveModelSelector: jest.fn().mockImplementation(() => ({
        selectModel: jest.fn(),
        getModelConfig: jest.fn(),
        optimizeParameters: jest.fn(),
    })),
}));

jest.mock('@/ai/core/iterative-improvement-engine', () => ({
    IterativeImprovementEngine: jest.fn().mockImplementation(() => ({
        improve: jest.fn(),
        getIterationCount: jest.fn(),
        getQualityMetrics: jest.fn(),
    })),
}));

import {
    summarizeProject,
    generateProposalSection,
    generatePresentation,
    generateDiagram,
    factCheckText,
    generatePlantUML,
    writeDocument,
    summarizeText,
    topicExplainer,
    generateText,
    plagiarismCheck,
} from '@/ai/flows';

describe('AI Flows Comprehensive Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Summarize Project Flow', () => {
        const mockInput = {
            projectDescription: 'A comprehensive web application built with Next.js and Firebase for AI-powered document generation',
        };

        const mockOutput = {
            summary: 'Advanced web application for AI document generation',
            technologies: ['Next.js', 'Firebase', 'React', 'TypeScript'],
            keyFeatures: ['AI-powered generation', 'Document management'],
        };

        it('should summarize project successfully', async () => {
            const mockPromptGenerator = jest.fn().mockReturnValue({
                input: mockOutput,
            });

            jest.doMock('@/ai/flows/summarize-project', () => ({
                summarizeProject: jest.fn().mockResolvedValue(mockOutput),
            }));

            const result = await summarizeProject(mockInput);

            await expect(result).toEqual(mockOutput);
        });

        it('should handle empty project description', async () => {
            const emptyInput = { projectDescription: '' };

            await expect(summarizeProject(emptyInput)).rejects.toThrow();
        });

        it('should handle invalid input schema', async () => {
            const invalidInput = { description: 'Missing required field' };

            await expect(summarizeProject(invalidInput as any)).rejects.toThrow();
        });

        it('should extract technologies correctly', async () => {
            const techInput = {
                projectDescription: 'Built with React, Node.js, MongoDB, Express.js, and TypeScript',
            };

            const result = await summarizeProject(techInput);

            expect(result.technologies).toContain('React');
            expect(result.technologies).toContain('Node.js');
            expect(result.technologies).toContain('MongoDB');
        });

        it('should generate concise summary within character limit', async () => {
            const result = await summarizeProject(mockInput);

            expect(result.summary.length).toBeLessThanOrEqual(200);
        });
    });

    describe('Generate Proposal Section Flow', () => {
        const mockInput = {
            sectionType: 'executive-summary',
            projectContext: {
                title: 'Test Project',
                description: 'Project description',
                requirements: ['requirement1', 'requirement2'],
            },
            guidelines: 'Follow APA style',
            externalContext: 'Additional context',
            complexity: 'detailed' as const,
        };

        const mockOutput = {
            content: 'Generated proposal section content',
            sections: ['Introduction', 'Methodology', 'Conclusion'],
            metadata: {
                wordCount: 500,
                confidence: 0.95,
                quality: 85,
            },
        };

        it('should generate proposal section with intelligent analysis', async () => {
            // Mock intelligent components
            const mockContextAnalyzer = {
                analyze: jest.fn().mockResolvedValue({
                    contentType: 'proposal',
                    complexity: 'detailed',
                    keyEntities: ['project', 'management'],
                    relationships: [],
                }),
            };

            const mockPromptBuilder = {
                buildPrompt: jest.fn().mockResolvedValue('Intelligent prompt for proposal'),
                optimizePrompt: jest.fn(),
            };

            const result = await generateProposalSection(mockInput);

            await expect(result.content).toBeDefined();
            await expect(result.sections).toBeDefined();
            await expect(result.metadata.quality).toBeGreaterThan(70);
        });

        it('should handle different section types', async () => {
            const sectionTypes = [
                'executive-summary',
                'methodology',
                'budget',
                'timeline',
                'risk-analysis',
            ];

            for (const sectionType of sectionTypes) {
                const input = { ...mockInput, sectionType };
                const result = await generateProposalSection(input);

                await expect(result.content).toBeDefined();
            }
        });

        it('should adapt to different complexity levels', async () => {
            const complexityLevels = ['basic', 'detailed', 'comprehensive'];
            const inputBase = { ...mockInput };

            for (const complexity of complexityLevels) {
                const input = { ...inputBase, complexity };
                const result = await generateProposalSection(input);

                await expect(result.metadata.quality).toBeGreaterThan(60);

                if (complexity === 'comprehensive') {
                    await expect(result.content.length).toBeGreaterThan(500);
                }
            }
        });

        it('should validate output quality', async () => {
            const result = await generateProposalSection(mockInput);

            await expect(result.metadata.quality).toBeGreaterThan(75);
            await expect(result.metadata.confidence).toBeGreaterThan(0.8);
            await expect(result.content).not.toBe('');
        });

        it('should handle iterative improvement when quality is low', async () => {
            // Mock low quality initial output
            const mockLowQualityOutput = {
                content: 'Brief content',
                quality: 60,
            };

            const result = await generateProposalSection(mockInput);

            // Should have improved quality after iteration
            await expect(result.metadata.quality).toBeGreaterThan(60);
        });

        it('should integrate external context appropriately', async () => {
            const inputWithContext = {
                ...mockInput,
                externalContext: 'Previous project data and client requirements',
            };

            const result = await generateProposalSection(inputWithContext);

            await expect(result.content).toBeDefined();
            expect(result.content.toLowerCase()).toContain('project');
        });
    });

    describe('Generate Presentation Flow', () => {
        const mockInput = {
            title: 'Project Presentation',
            proposal: {
                title: 'Test Proposal',
                sections: [{ title: 'Introduction', content: 'Introduction content' }],
            },
            projectPlan: {
                phases: [{ name: 'Phase 1', duration: '4 weeks' }],
                milestones: ['M1', 'M2'],
            },
            diagrams: [
                { type: 'flowchart', content: 'Diagram content' },
            ],
            context: 'Additional context',
            slides: [
                { title: 'Slide 1', content: ['Point 1'], layout: 'title_and_content' },
                { title: 'Summary', content: [], layout: 'title_only' },
            ],
        };

        const mockOutput = {
            slides: [
                {
                    title: 'Introduction',
                    content: ['Welcome to presentation'],
                    layout: 'title_and_content',
                    notes: 'Speaker notes',
                },
            ],
        };

        it('should generate presentation with proper structure', async () => {
            const result = await generatePresentation(mockInput);

            await expect(result.slides).toBeDefined();
            await expect(result.slides.length).toBeGreaterThan(7);
            await expect(result.slides.length).toBeLessThan(12);
        });

        it('should synthesize proposal into presentation', async () => {
            const result = await generatePresentation(mockInput);

            const introSlide = result.slides.find(slide =>
                slide.title.toLowerCase().includes('intro')
            );

            await expect(introSlide).toBeDefined();
        });

        it('should create logical slide flow', async () => {
            const result = await generatePresentation(mockInput);

            const hasIntro = result.slides.some(slide =>
                slide.title.toLowerCase().includes('intro')
            );
            const hasConclusion = result.slides.some(slide =>
                slide.title.toLowerCase().includes('conclusion') ||
                slide.title.toLowerCase().includes('summary')
            );

            await expect(hasIntro).toBe(true);
            await expect(hasConclusion).toBe(true);
        });

        it('should include speaker notes', async () => {
            const result = await generatePresentation(mockInput);

            const slidesWithNotes = result.slides.filter(slide => slide.notes);

            await expect(slidesWithNotes.length).toBeGreaterThan(0);
            await expect(slidesWithNotes[0].notes).toContain('presenter');
        });

        it('should handle empty inputs gracefully', async () => {
            const emptyInput = {
                title: '',
                proposal: null,
                projectPlan: null,
                diagrams: [],
                context: '',
            };

            const result = await generatePresentation(emptyInput);

            await expect(result.slides).toBeDefined();
            await expect(result.slides.length).toBeGreaterThan(0);
        });
    });

    describe('Generate Diagram Flow', () => {
        const mockInput = {
            type: 'flowchart',
            title: 'User Flow Diagram',
            description: 'Shows user interaction flow',
            complexity: 'detailed' as const,
            style: 'modern',
            projectContext: {
                title: 'Project',
                requirements: ['user authentication'],
            },
            requirements: 'Show login process',
            language: 'ar' as const,
        };

        const mockOutput = {
            plantUmlCode: 'PlantUML code',
            elements: ['User', 'Auth', 'Dashboard'],
            elementCount: 3,
            metadata: {
                diagramType: 'flowchart',
                complexity: 'detailed',
                quality: 87,
            },
        };

        it('should generate PlantUML diagram code', async () => {
            const result = await generateDiagram(mockInput);

            await expect(result.plantUmlCode).toBeDefined();
            await expect(result.plantUmlCode).toContain('start');

            // Verify PlantUML syntax
            await expect(result.plantUmlCode).toContain('@startuml');
            await expect(result.plantUmlCode).toContain('@enduml');
        });

        it('should handle different diagram types', async () => {
            const diagramTypes = [
                'flowchart',
                'mindmap',
                'gantt',
                'sequence',
                'class',
                'entity-relationship',
            ];

            for (const type of diagramTypes) {
                const input = { ...mockInput, type };
                const result = await generateDiagram(input);

                await expect(result.plantUmlCode).toBeDefined();
                await expect(result.plantUmlCode).toContain('@startuml');
            }
        });

        it('should adapt to complexity levels', async () => {
            const complexityLevels = ['basic', 'detailed', 'comprehensive'];

            for (const complexity of complexityLevels) {
                const input = { ...mockInput, complexity };
                const result = await generateDiagram(input);

                await expect(result.elementCount).toBeGreaterThan(0);

                if (complexity === 'comprehensive') {
                    await expect(result.elements.length).toBeGreaterThan(3);
                }
            }
        });

        it('should include context analysis', async () => {
            const result = await generateDiagram(mockInput);

            await expect(result.data.qualityAnalysis).toBeDefined();
            await expect(result.metadata.quality).toBeGreaterThan(70);
        });

        it('should handle Arabic language requirements', async () => {
            const arabicInput = {
                ...mockInput,
                language: 'ar' as const,
                title: 'مخطط التدفق',
                description: 'يوضح تدفق المستخدم',
            };

            const result = await generateDiagram(arabicInput);

            await expect(result.plantUmlCode).toBeDefined();
        });
    });

    describe('Fact Check Flow', () => {
        const mockInput = {
            text: 'The COVID-19 pandemic started in 2020 and affected millions of people worldwide.',
        };

        const mockOutput = {
            claims: [
                {
                    claim: 'COVID-19 pandemic started in 2020',
                    status: 'verified',
                    source: 'who.int',
                    reasoning: 'WHO confirmed the outbreak in early 2020',
                },
            ],
            originalityScore: '94',
            summary: 'All claims verified',
        };

        it('should verify factual claims', async () => {
            const result = await factCheckText(mockInput);

            await expect(result.claims).toBeDefined();
            await expect(result.claims.length).toBeGreaterThan(0);

            const verifiedClaims = result.claims.filter(claim => claim.status === 'verified');
            await expect(verifiedClaims.length).toBeGreaterThan(0);
        });

        it('should provide source verification', async () => {
            const result = await factCheckText(mockInput);

            result.claims.forEach(claim => {
                await expect(claim.source).toBeDefined();
                await expect(claim.reasoning).toBeDefined();
            });
        });

        it('should calculate originality score', async () => {
            const result = await factCheckText(mockInput);

            await expect(result.originalityScore).toBeDefined();
            const score = parseInt(result.originalityScore);
            await expect(score).toBeGreaterThan(0);
            await expect(score).toBeLessThanOrEqual(100);
        });

        it('should categorize claim statuses', async () => {
            const testText = 'The moon is made of cheese. The Earth orbits the Sun.';

            const result = await factCheckText({ text: testText });

            const statuses = result.claims.map(claim => claim.status);

            await expect(statuses).toContain('verified');
            await expect(statuses).toContain('false');
        });

        it('should handle empty text input', async () => {
            const emptyInput = { text: '' };

            await expect(factCheckText(emptyInput)).rejects.toThrow();
        });

        it('should process Arabic text', async () => {
            const arabicInput = {
                text: 'بدأت جائحة كوفيد-19 في عام 2020 وأثرت على الملايين في جميع أنحاء العالم.',
            };

            const result = await factUrl(arabicInput);

            await expect(result.claims).toBeDefined();
            await expect(result.summary).toBeDefined();
        });
    });

    describe('Additional AI Flows', () => {
        const mockWritingInput = {
            text: 'Sample text for processing',
            instruction: 'Make it more formal',
            language: 'en',
        };

        const mockWritingOutput = {
            result: 'Formally processed text',
            metadata: {
                wordCount: 15,
                confidence: 0.92,
            },
        };

        it('should generate text content', async () => {
            const input = {
                prompt: 'Write a brief introduction to AI',
                maxWords: 50,
                style: 'professional',
            };

            const result = await generateText(input);

            await expect(result.content).toBeDefined();
            await expect(result.content.length).toBeGreaterThan(0);
        });

        it('should summarize text effectively', async () => {
            const input = {
                text: 'Long detailed text that needs summarization...',
                maxSentences: 3,
                language: 'en',
            };

            const result = await summarizeText(input);

            await expect(result.summary).toBeDefined();
            await expect(result.summary.length).toBeLessThan(input.text.length);
        });

        it('should explain topics clearly', async () => {
            const input = {
                topic: 'Quantum Computing',
                context: 'Educational content',
                language: 'en',
                complexity: 'medium',
            };

            const result = await topicExplainer(input);

            await expect(result.explanation).toBeDefined();
            await expect(result.keyPoints.length).toBeGreaterThan(0);
        });

        it('should check for plagiarism', async () => {
            const input = {
                text: 'Some content to check for originality',
            };

            const result = await plagiarismCheck(input);

            await expect(result.originality).toBeDefined();
            await expect(result.originality.score).toBeGreaterThan(0);
        });

        it('should write documents with proper structure', async () => {
            const input = {
                type: 'report',
                title: 'Project Report',
                sections: [
                    { title: 'Introduction', content: 'Introduction text' },
                    { title: 'Conclusion', content: 'Conclusion text' },
                ],
                format: 'markdown',
            };

            const result = await writeDocument(input);

            await expect(result.content).toBeDefined();

            // Check if Markdown formatting is preserved
            await expect(result.content).toContain('# Project Report');
            await expect(result.content).toContain('## Introduction');
        });

        it('should generate PlantUML code', async () => {
            const input = {
                type: 'class',
                description: 'Create a class diagram for User and Admin classes',
            };

            const result = await generatePlantUML(input);

            await expect(result.code).toBeDefined();
            await expect(result.code).toContain('@startuml');
            await expect(result.code).toContain('class');
        });
    });

    describe('Error Handling Tests', () => {
        it('should handle AI model failures gracefully', async () => {
            // Mock AI failure
            const { ai } = require('@/ai/genkit');
            ai.defineFlow.mockImplementation((config, handler) => {
                throw new Error('AI Model Error');
            });

            await expect(summarizeProject({ projectDescription: 'test' }))
                .rejects.toThrow('AI Model Error');
        });

        it('should handle network timeouts', async () => {
            jest.setTimeout(10000);

            // Simulate timeout
            const longRunningOperation = () => new Promise(resolve =>
                setTimeout(resolve, 15000)
            );

            await expect(longRunningOperation()).rejects.toThrow();
        });

        it('should validate input schemas strictly', async () => : {
            const invalidInputs = [
                null,
                undefined,
                {},
                { wrongField: 'value' },
                { projectDescription: null },
            ];

            for(const invalidInput of invalidInputs) {
                await expect(summarizeProject(invalidInput as any))
                    .rejects.toThrow();
            }
        });

        it('should handle malformed AI responses', async () => {
            // Mock malformed response
            const { ai } = require('@/ai/genkit');
            ai.definePrompt.mockImplementation(() => ({
                input: () => Promise.resolve({ output: null }),
            }));

            await expect(summarizeProject({ projectDescription: 'test' }))
                .rejects.toThrow();
        });
    });

    describe('Performance and Quality Tests', () => {
        it('should complete operations within acceptable time limits', async () => {
            const startTime = Date.now();

            await summarizeProject({
                projectDescription: 'Test project for performance measurement',
            });

            const duration = Date.now() - startTime;

            // Should complete within 10 seconds
            expect(duration).toBeLessThan(10000);
        });

        it('should maintain quality standards', async () => {
            const result = await generateProposalSection({
                sectionType: 'executive-summary',
                projectContext: {
                    title: 'Quality Test Project',
                    description: 'Testing quality standards',
                    requirements: ['requirement1'],
                },
                complexity: 'detailed',
            });

            await expect(result.metadata.quality).toBeGreaterThan(75);
            await expect(result.metadata.confidence).toBeGreaterThan(0.8);
        });

        it('should handle concurrent requests efficiently', async () => {
            const requests = Array.from({ length: 5 }, (_, i) =>
                summarizeProject({
                    projectDescription: `Concurrent project ${i}`,
                })
            );

            const startTime = Date.now();
            const results = await Promise.all(requests);
            const totalDuration = Date.now() - startTime;

            // Should process all requests successfully
            expect(results.length).toBe(5);

            // Should not take significantly longer than sequential
            expect(totalDuration).toBeLessThan(30000);
        });

        it('should optimize token usage', async () => {
            const input = {
                projectDescription: 'Brief project description',
            };

            const result = await summarizeProject(input);

            // Should produce concise output
            await expect(result.summary.length).toBeLessThan(200);
            await expect(result.technologies.length).toBeGreaterThan(0);
        });
    });

    describe('Integration Tests', () => {
        it('should maintain consistency across flows', async () => {
            const projectContext = {
                title: 'Integration Test Project',
                description: 'Built with React and Node.js',
                requirements: ['authentication', 'database'],
            };

            // Test multiple related flows
            const summaryResult = await summarizeProject({
                projectDescription: JSON.stringify(projectContext),
            });

            const proposalResult = await generateProposalSection({
                sectionType: 'methodology',
                projectContext,
                complexity: 'detailed',
            });

            // Results should be consistent
            await expect(summaryResult.summary).toBeDefined();
            await expect(proposalResult.content).toBeDefined();

            // Both should mention React
            const mentionsReact =
                summaryResult.summary.toLowerCase().includes('react') ||
                proposalResult.content.toLowerCase().includes('react');

            expect(mentionsReact).toBe(true);
        });

        it('should handle workflow dependencies', async () => {
            // Create presentation based on proposal
            const proposalInput = {
                sectionType: 'executive-summary',
                projectContext: {
                    title: 'Workflow Test',
                    description: 'Testing workflow dependencies',
                    requirements: ['requirement1'],
                },
            };

            const proposalResult = await generateProposalSection(proposalInput);

            const presentationInput = {
                title: 'Workflow Presentation',
                proposal: {
                    title: 'Workflow Test',
                    sections: [{ title: 'Summary', content: proposalResult.content }],
                },
                projectPlan: null,
                diagrams: [],
            };

            const presentationResult = await generatePresentation(presentationInput);

            await expect(presentationResult.slides).toBeDefined();
            await expect(presentationResult.slides.length).toBeGreaterThan(0);
        });

        it('should maintain data integrity through flow chain', async () => {
            const originalData = {
                title: 'Data Integrity Test',
                description: 'Testing data preservation through flows',
            };

            // Chain multiple operations
            const summaryData = await summarizeProject({
                projectDescription: originalData.description,
            });

            const diagramData = await generateDiagram({
                type: 'flowchart',
                title: originalData.title,
                description: summaryData.summary,
            });

            // Data should maintain integrity
            await expect(diagramData.title).toBe(originalData.title);
            await expect(diagramData.description).toContain(summaryData.summary.slice(0, 20));
        });
    });
});
