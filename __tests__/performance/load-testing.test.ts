import { generateProposal } from '@/ai/flows/proposal-generation';
import { exportToDocx } from '@/lib/docx-exporter';
import { Project } from '@/lib/models/project';
import { measurePerformance, stressTest } from '../helpers/test-helpers';

// Mock external dependencies
jest.mock('@/ai/flows/proposal-generation');
jest.mock('@/lib/docx-exporter');

const mockGenerateProposal = generateProposal as jest.MockedFunction<typeof generateProposal>;
const mockExportToDocx = exportToDocx as jest.MockedFunction<typeof exportToDocx>;

describe('Performance and Load Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful responses
        mockGenerateProposal.mockResolvedValue({
            success: true,
            data: {
                content: 'Generated content',
                sections: [{ title: 'Section 1', content: 'Content 1' }],
                metadata: { wordCount: 100, estimatedReadingTime: 1 },
            },
            error: null,
        });

        mockExportToDocx.mockResolvedValue({
            success: true,
            data: {
                filename: 'test.docx',
                blob: new Blob(['content']),
                size: 1024,
            },
            error: null,
        });
    });

    describe('Project Model Performance', () => {
        it('should handle large projects efficiently', async () => {
            const project = new Project({
                title: 'Large Project',
                description: 'Performance test project',
                content: '',
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const { duration } = await measurePerformance(async () => {
                // Add large content
                project.updateContent('Large content '.repeat(10000));

                // Add many sections
                for (let i = 0; i < 1000; i++) {
                    project.addSection({
                        id: `section-${i}`,
                        title: `Section ${i}`,
                        content: `Content for section ${i}`,
                        order: i + 1,
                    });
                }

                // Add many external files
                for (let i = 0; i < 100; i++) {
                    project.addExternalFile({
                        name: `file${i}.pdf`,
                        content: `File content ${i}`,
                        type: 'pdf',
                        size: 1024,
                    });
                }
            });

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(project.sections).toHaveLength(1000);
            expect(project.externalContext.files).toHaveLength(100);
        });

        it('should handle rapid updates efficiently', async () => {
            const project = new Project({
                title: 'Rapid Update Test',
                description: 'Testing rapid updates',
                content: '',
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const { duration } = await measurePerformance(async () => {
                // Perform 1000 rapid updates
                for (let i = 0; i < 1000; i++) {
                    project.updateContent(`Content update ${i}`);
                    project.updateMetadata({ updateCount: i });
                }
            });

            expect(duration).toBeLessThan(500); // Should complete within 500ms
            expect(project.content).toBe('Content update 999');
            expect(project.metadata.updateCount).toBe(999);
        });

        it('should serialize large projects efficiently', async () => {
            const project = new Project({
                title: 'Serialization Test',
                description: 'Testing serialization performance',
                content: 'Large content '.repeat(5000),
                sections: Array.from({ length: 500 }, (_, i) => ({
                    id: `section-${i}`,
                    title: `Section ${i}`,
                    content: `Content ${i}`,
                    order: i + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const { duration } = await measurePerformance(async () => {
                const serialized = project.toJSON();
                const deserialized = Project.fromJSON(serialized);

                // Verify data integrity
                expect(deserialized.title).toBe(project.title);
                expect(deserialized.sections).toHaveLength(500);
            });

            expect(duration).toBeLessThan(200); // Should complete within 200ms
        });
    });

    describe('AI Generation Performance', () => {
        it('should handle concurrent AI generation requests', async () => {
            const { results, errors, successRate } = await stressTest(
                async () => {
                    const proposalInput = {
                        title: 'Concurrent Test Proposal',
                        description: 'Testing concurrent AI generation',
                        sections: ['Introduction', 'Conclusion'],
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

                    return await generateProposal(proposalInput);
                },
                20, // 20 iterations
                5   // 5 concurrent requests
            );

            expect(successRate).toBeGreaterThan(0.95); // 95% success rate
            expect(errors).toHaveLength(0);
            expect(results).toHaveLength(20);
        });

        it('should handle large context efficiently', async () => {
            const largeContext = {
                files: Array.from({ length: 50 }, (_, i) => ({
                    name: `file${i}.pdf`,
                    content: 'Large file content '.repeat(1000),
                    type: 'pdf',
                    size: 1024 * 1024,
                })),
                urls: Array.from({ length: 20 }, (_, i) => ({
                    url: `https://example${i}.com`,
                    title: `Document ${i}`,
                    description: 'Document description',
                    content: 'Document content '.repeat(500),
                })),
                embeddings: [],
            };

            const { duration } = await measurePerformance(async () => {
                const proposalInput = {
                    title: 'Large Context Proposal',
                    description: 'Testing with large context',
                    sections: ['Introduction', 'Methodology', 'Conclusion'],
                    targetAudience: 'Business stakeholders',
                    tone: 'professional',
                    length: 'long',
                    includeReferences: true,
                    externalContext: largeContext,
                };

                const result = await generateProposal(proposalInput);
                expect(result.success).toBe(true);
            });

            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
        });

        it('should cache AI responses efficiently', async () => {
            const proposalInput = {
                title: 'Cache Test Proposal',
                description: 'Testing AI response caching',
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
            const { duration: firstCall } = await measurePerformance(async () => {
                await generateProposal(proposalInput);
            });

            // Second call (should be cached)
            const { duration: secondCall } = await measurePerformance(async () => {
                await generateProposal(proposalInput);
            });

            expect(secondCall).toBeLessThan(firstCall * 0.5); // Should be at least 50% faster
            expect(mockGenerateProposal).toHaveBeenCalledTimes(1); // Should only call AI once
        });
    });

    describe('Export Performance', () => {
        it('should export large projects efficiently', async () => {
            const project = new Project({
                title: 'Large Export Project',
                description: 'Testing export performance',
                content: 'Large content '.repeat(10000),
                sections: Array.from({ length: 100 }, (_, i) => ({
                    id: `section-${i}`,
                    title: `Section ${i}`,
                    content: `Content for section ${i}`,
                    order: i + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const { duration } = await measurePerformance(async () => {
                const result = await exportToDocx(project);
                expect(result.success).toBe(true);
            });

            expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
        });

        it('should handle concurrent exports', async () => {
            const projects = Array.from({ length: 10 }, (_, i) => {
                const project = new Project({
                    title: `Concurrent Export Project ${i}`,
                    description: 'Testing concurrent exports',
                    content: `Content for project ${i}`,
                    sections: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                return project;
            });

            const { duration } = await measurePerformance(async () => {
                const exportPromises = projects.map(project => exportToDocx(project));
                const results = await Promise.all(exportPromises);

                expect(results).toHaveLength(10);
                expect(results.every(result => result.success)).toBe(true);
            });

            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });

    describe('Memory Usage', () => {
        it('should not leak memory during operations', async () => {
            const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

            // Perform many operations
            for (let i = 0; i < 100; i++) {
                const project = new Project({
                    title: `Memory Test Project ${i}`,
                    description: 'Testing memory usage',
                    content: 'Test content',
                    sections: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                project.updateContent('Updated content');
                project.addSection({
                    id: `section-${i}`,
                    title: `Section ${i}`,
                    content: `Content ${i}`,
                    order: 1,
                });

                const serialized = project.toJSON();
                const deserialized = Project.fromJSON(serialized);

                // Clear references
                project.sections = [];
                project.externalContext = { files: [], urls: [], embeddings: [] };
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });

        it('should handle large data structures efficiently', async () => {
            const largeData = {
                content: 'Large content '.repeat(100000), // ~1.3MB of text
                sections: Array.from({ length: 10000 }, (_, i) => ({
                    id: `section-${i}`,
                    title: `Section ${i}`,
                    content: `Content for section ${i}`,
                    order: i + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
            };

            const { duration, memoryDelta } = await measurePerformance(async () => {
                const project = new Project({
                    title: 'Large Data Project',
                    description: 'Testing large data handling',
                    content: largeData.content,
                    sections: largeData.sections,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                // Perform operations on large data
                project.updateContent('Updated large content');
                project.addSection({
                    id: 'new-section',
                    title: 'New Section',
                    content: 'New content',
                    order: 10001,
                });

                const serialized = project.toJSON();
                const deserialized = Project.fromJSON(serialized);
            });

            expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
            expect(memoryDelta).toBeLessThan(100 * 1024 * 1024); // Should use less than 100MB
        });
    });

    describe('Network Performance', () => {
        it('should handle slow network responses gracefully', async () => {
            // Mock slow response
            mockGenerateProposal.mockImplementation(() =>
                new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            success: true,
                            data: {
                                content: 'Slow response content',
                                sections: [],
                                metadata: {},
                            },
                            error: null,
                        });
                    }, 2000); // 2 second delay
                })
            );

            const { duration } = await measurePerformance(async () => {
                const proposalInput = {
                    title: 'Slow Network Test',
                    description: 'Testing slow network handling',
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

                const result = await generateProposal(proposalInput);
                expect(result.success).toBe(true);
            });

            expect(duration).toBeLessThan(3000); // Should complete within 3 seconds (including 2s delay)
        });

        it('should handle network timeouts', async () => {
            // Mock timeout
            mockGenerateProposal.mockImplementation(() =>
                new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Request timeout'));
                    }, 1000);
                })
            );

            const startTime = performance.now();

            try {
                const proposalInput = {
                    title: 'Timeout Test',
                    description: 'Testing timeout handling',
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

                await generateProposal(proposalInput);
            } catch (error) {
                expect(error.message).toBe('Request timeout');
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(2000); // Should timeout within 2 seconds
        });
    });

    describe('Stress Testing', () => {
        it('should handle extreme load', async () => {
            const { results, errors, successRate } = await stressTest(
                async () => {
                    const project = new Project({
                        title: 'Stress Test Project',
                        description: 'Testing extreme load',
                        content: '',
                        sections: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    // Perform multiple operations
                    project.updateContent('Stress test content');
                    project.addSection({
                        id: 'stress-section',
                        title: 'Stress Section',
                        content: 'Stress content',
                        order: 1,
                    });

                    const serialized = project.toJSON();
                    const deserialized = Project.fromJSON(serialized);

                    return deserialized;
                },
                1000, // 1000 iterations
                50    // 50 concurrent requests
            );

            expect(successRate).toBeGreaterThan(0.99); // 99% success rate
            expect(errors).toHaveLength(0);
            expect(results).toHaveLength(1000);
        });

        it('should maintain performance under continuous load', async () => {
            const durations: number[] = [];

            for (let i = 0; i < 100; i++) {
                const { duration } = await measurePerformance(async () => {
                    const project = new Project({
                        title: `Continuous Load Test ${i}`,
                        description: 'Testing continuous load',
                        content: '',
                        sections: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    project.updateContent(`Content ${i}`);
                    project.addSection({
                        id: `section-${i}`,
                        title: `Section ${i}`,
                        content: `Content ${i}`,
                        order: 1,
                    });
                });

                durations.push(duration);
            }

            const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
            const maxDuration = Math.max(...durations);
            const minDuration = Math.min(...durations);

            expect(averageDuration).toBeLessThan(50); // Average should be under 50ms
            expect(maxDuration).toBeLessThan(200); // Max should be under 200ms
            expect(minDuration).toBeGreaterThan(0); // Min should be positive
        });
    });
});
