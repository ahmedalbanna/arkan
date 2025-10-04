import { generateProposal } from '@/ai/flows/proposal-generation';
import { ProposalInputSchema } from '@/ai/schemas/proposal-schema';
import { Project } from '@/lib/models/project';

// Mock AI services
jest.mock('@genkit-ai/googleai', () => ({
    googleAI: jest.fn(),
}));

jest.mock('@genkit-ai/firebase', () => ({
    firebase: jest.fn(),
}));

// Mock the AI generation function
const mockGenerateText = jest.fn();
jest.mock('genkit', () => ({
    generate: mockGenerateText,
}));

describe('AI Proposal Generation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Input Validation', () => {
        it('should validate proposal input schema', () => {
            const validInput = {
                title: 'Test Proposal',
                description: 'A test proposal for validation',
                sections: ['Introduction', 'Methodology', 'Conclusion'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: true,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            const result = ProposalInputSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should reject invalid proposal input', () => {
            const invalidInput = {
                title: '', // Empty title should fail
                description: 'A test proposal',
                sections: [],
                targetAudience: 'Business stakeholders',
                tone: 'invalid-tone', // Invalid tone
                length: 'invalid-length', // Invalid length
                includeReferences: 'not-boolean', // Should be boolean
            };

            const result = ProposalInputSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
            expect(result.error?.issues).toHaveLength(4); // Multiple validation errors
        });

        it('should validate required fields', () => {
            const incompleteInput = {
                title: 'Test Proposal',
                // Missing required fields
            };

            const result = ProposalInputSchema.safeParse(incompleteInput);
            expect(result.success).toBe(false);
        });
    });

    describe('Proposal Generation Flow', () => {
        it('should generate proposal with valid input', async () => {
            const mockResponse = {
                content: 'Generated proposal content',
                sections: [
                    { title: 'Introduction', content: 'Introduction content' },
                    { title: 'Methodology', content: 'Methodology content' },
                    { title: 'Conclusion', content: 'Conclusion content' },
                ],
                metadata: {
                    wordCount: 500,
                    estimatedReadingTime: 3,
                    generatedAt: new Date().toISOString(),
                },
            };

            mockGenerateText.mockResolvedValue(mockResponse);

            const input = {
                title: 'Test Proposal',
                description: 'A test proposal',
                sections: ['Introduction', 'Methodology', 'Conclusion'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: true,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            const result = await generateProposal(input);

            expect(result).toEqual({
                success: true,
                data: mockResponse,
                error: null,
            });

            expect(mockGenerateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: expect.any(String),
                    prompt: expect.stringContaining('Test Proposal'),
                })
            );
        });

        it('should handle AI generation errors gracefully', async () => {
            const errorMessage = 'AI service temporarily unavailable';
            mockGenerateText.mockRejectedValue(new Error(errorMessage));

            const input = {
                title: 'Test Proposal',
                description: 'A test proposal',
                sections: ['Introduction'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            const result = await generateProposal(input);

            expect(result).toEqual({
                success: false,
                data: null,
                error: errorMessage,
            });
        });

        it('should include external context in generation', async () => {
            const mockResponse = {
                content: 'Generated proposal with context',
                sections: [],
                metadata: {},
            };

            mockGenerateText.mockResolvedValue(mockResponse);

            const input = {
                title: 'Contextual Proposal',
                description: 'A proposal with external context',
                sections: ['Introduction'],
                targetAudience: 'Technical team',
                tone: 'technical',
                length: 'long',
                includeReferences: true,
                externalContext: {
                    files: [
                        {
                            name: 'requirements.pdf',
                            content: 'Project requirements document',
                            type: 'pdf',
                            size: 1024,
                        },
                    ],
                    urls: [
                        {
                            url: 'https://example.com/docs',
                            title: 'Documentation',
                            description: 'External documentation',
                            content: 'Documentation content',
                        },
                    ],
                    embeddings: [],
                },
            };

            await generateProposal(input);

            expect(mockGenerateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: expect.stringContaining('requirements.pdf'),
                })
            );
        });
    });

    describe('Content Quality Validation', () => {
        it('should validate generated content structure', async () => {
            const mockResponse = {
                content: 'Generated proposal content',
                sections: [
                    { title: 'Introduction', content: 'Introduction content' },
                    { title: 'Methodology', content: 'Methodology content' },
                ],
                metadata: {
                    wordCount: 300,
                    estimatedReadingTime: 2,
                    generatedAt: new Date().toISOString(),
                },
            };

            mockGenerateText.mockResolvedValue(mockResponse);

            const input = {
                title: 'Quality Test Proposal',
                description: 'Testing content quality',
                sections: ['Introduction', 'Methodology'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            const result = await generateProposal(input);

            expect(result.success).toBe(true);
            expect(result.data?.sections).toHaveLength(2);
            expect(result.data?.metadata.wordCount).toBeGreaterThan(0);
            expect(result.data?.metadata.estimatedReadingTime).toBeGreaterThan(0);
        });

        it('should reject malformed AI responses', async () => {
            const malformedResponse = {
                // Missing required fields
                content: 'Some content',
            };

            mockGenerateText.mockResolvedValue(malformedResponse);

            const input = {
                title: 'Malformed Response Test',
                description: 'Testing malformed responses',
                sections: ['Introduction'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            const result = await generateProposal(input);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid response structure');
        });
    });

    describe('Performance and Optimization', () => {
        it('should handle large external context efficiently', async () => {
            const largeContext = {
                files: Array.from({ length: 10 }, (_, i) => ({
                    name: `file${i}.pdf`,
                    content: 'Large file content '.repeat(1000),
                    type: 'pdf',
                    size: 1024 * 1024,
                })),
                urls: Array.from({ length: 5 }, (_, i) => ({
                    url: `https://example${i}.com`,
                    title: `Document ${i}`,
                    description: 'Document description',
                    content: 'Document content '.repeat(500),
                })),
                embeddings: [],
            };

            const mockResponse = {
                content: 'Generated with large context',
                sections: [],
                metadata: {},
            };

            mockGenerateText.mockResolvedValue(mockResponse);

            const input = {
                title: 'Large Context Proposal',
                description: 'Testing with large context',
                sections: ['Introduction'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'long',
                includeReferences: true,
                externalContext: largeContext,
            };

            const startTime = performance.now();
            const result = await generateProposal(input);
            const endTime = performance.now();

            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });

        it('should cache repeated requests', async () => {
            const mockResponse = {
                content: 'Cached response',
                sections: [],
                metadata: {},
            };

            mockGenerateText.mockResolvedValue(mockResponse);

            const input = {
                title: 'Cache Test Proposal',
                description: 'Testing caching',
                sections: ['Introduction'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            // First call
            await generateProposal(input);
            // Second call with same input
            await generateProposal(input);

            // Should only call AI service once due to caching
            expect(mockGenerateText).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling and Recovery', () => {
        it('should retry on temporary failures', async () => {
            const mockResponse = {
                content: 'Retry success response',
                sections: [],
                metadata: {},
            };

            // First call fails, second succeeds
            mockGenerateText
                .mockRejectedValueOnce(new Error('Temporary failure'))
                .mockResolvedValueOnce(mockResponse);

            const input = {
                title: 'Retry Test Proposal',
                description: 'Testing retry mechanism',
                sections: ['Introduction'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: {
                    files: [],
                    urls: [],
                    embeddings: [],
                },
            };

            const result = await generateProposal(input);

            expect(result.success).toBe(true);
            expect(mockGenerateText).toHaveBeenCalledTimes(2);
        });

        it('should provide meaningful error messages', async () => {
            const errorCases = [
                { error: new Error('Rate limit exceeded'), expectedMessage: 'Rate limit exceeded' },
                { error: new Error('Invalid API key'), expectedMessage: 'Invalid API key' },
                { error: new Error('Network timeout'), expectedMessage: 'Network timeout' },
            ];

            for (const { error, expectedMessage } of errorCases) {
                mockGenerateText.mockRejectedValueOnce(error);

                const input = {
                    title: 'Error Test Proposal',
                    description: 'Testing error handling',
                    sections: ['Introduction'],
                    targetAudience: 'Business stakeholders',
                    tone: 'professional',
                    length: 'medium',
                    includeReferences: false,
                    externalContext: {
                        files: [],
                        urls: [],
                        embeddings: [],
                    },
                };

                const result = await generateProposal(input);

                expect(result.success).toBe(false);
                expect(result.error).toBe(expectedMessage);
            }
        });
    });

    describe('Integration with Project Model', () => {
        it('should integrate with Project model correctly', async () => {
            const project = new Project({
                title: 'Integration Test Project',
                description: 'Testing AI integration',
                content: '',
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const mockResponse = {
                content: 'Generated proposal content',
                sections: [
                    { title: 'Introduction', content: 'Introduction content' },
                    { title: 'Conclusion', content: 'Conclusion content' },
                ],
                metadata: {
                    wordCount: 400,
                    estimatedReadingTime: 2,
                    generatedAt: new Date().toISOString(),
                },
            };

            mockGenerateText.mockResolvedValue(mockResponse);

            const input = {
                title: project.title,
                description: project.description,
                sections: ['Introduction', 'Conclusion'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: project.externalContext,
            };

            const result = await generateProposal(input);

            expect(result.success).toBe(true);

            // Verify the generated content can be added to the project
            project.updateContent(result.data?.content || '');
            expect(project.content).toBe('Generated proposal content');
        });
    });
});
