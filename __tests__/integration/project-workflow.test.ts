import { generateProposal } from '@/ai/flows/proposal-generation';
import { exportToDocx } from '@/lib/docx-exporter';
import { Project } from '@/lib/models/project';
import { exportToPptx } from '@/lib/pptx-exporter';

// Mock external dependencies
jest.mock('@/ai/flows/proposal-generation');
jest.mock('@/lib/docx-exporter');
jest.mock('@/lib/pptx-exporter');

const mockGenerateProposal = generateProposal as jest.MockedFunction<typeof generateProposal>;
const mockExportToDocx = exportToDocx as jest.MockedFunction<typeof exportToDocx>;
const mockExportToPptx = exportToPptx as jest.MockedFunction<typeof exportToPptx>;

describe('Project Workflow Integration', () => {
    let project: Project;

    beforeEach(() => {
        jest.clearAllMocks();

        project = new Project({
            title: 'Integration Test Project',
            description: 'A comprehensive test of project workflows',
            content: '',
            sections: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    });

    describe('Complete Project Creation Workflow', () => {
        it('should handle end-to-end project creation and AI generation', async () => {
            // 1. Create project with basic information
            expect(project.title).toBe('Integration Test Project');
            expect(project.sections).toHaveLength(0);

            // 2. Add external context
            project.addExternalFile({
                name: 'requirements.pdf',
                content: 'Project requirements document',
                type: 'pdf',
                size: 1024,
            });

            project.addExternalUrl({
                url: 'https://example.com/docs',
                title: 'Documentation',
                description: 'External documentation',
                content: 'Documentation content',
            });

            expect(project.externalContext.files).toHaveLength(1);
            expect(project.externalContext.urls).toHaveLength(1);

            // 3. Mock AI generation
            const mockAIGeneration = {
                success: true,
                data: {
                    content: 'Generated proposal content with AI',
                    sections: [
                        { title: 'Executive Summary', content: 'Summary content' },
                        { title: 'Methodology', content: 'Methodology content' },
                        { title: 'Timeline', content: 'Timeline content' },
                        { title: 'Budget', content: 'Budget content' },
                    ],
                    metadata: {
                        wordCount: 800,
                        estimatedReadingTime: 4,
                        generatedAt: new Date().toISOString(),
                    },
                },
                error: null,
            };

            mockGenerateProposal.mockResolvedValue(mockAIGeneration);

            // 4. Generate proposal using AI
            const proposalInput = {
                title: project.title,
                description: project.description,
                sections: ['Executive Summary', 'Methodology', 'Timeline', 'Budget'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'long',
                includeReferences: true,
                externalContext: project.externalContext,
            };

            const aiResult = await generateProposal(proposalInput);

            expect(aiResult.success).toBe(true);
            expect(aiResult.data?.sections).toHaveLength(4);

            // 5. Update project with AI-generated content
            project.updateContent(aiResult.data?.content || '');
            expect(project.content).toBe('Generated proposal content with AI');

            // 6. Add AI-generated sections to project
            aiResult.data?.sections.forEach((section, index) => {
                project.addSection({
                    id: `section-${index + 1}`,
                    title: section.title,
                    content: section.content,
                    order: index + 1,
                });
            });

            expect(project.sections).toHaveLength(4);
            expect(project.sections[0].title).toBe('Executive Summary');

            // 7. Update project metadata
            project.updateMetadata({
                aiGenerated: true,
                wordCount: aiResult.data?.metadata.wordCount,
                estimatedReadingTime: aiResult.data?.metadata.estimatedReadingTime,
                generationDate: aiResult.data?.metadata.generatedAt,
            });

            expect(project.metadata.aiGenerated).toBe(true);
            expect(project.metadata.wordCount).toBe(800);
        });

        it('should handle AI generation failures gracefully', async () => {
            // Mock AI failure
            mockGenerateProposal.mockResolvedValue({
                success: false,
                data: null,
                error: 'AI service temporarily unavailable',
            });

            const proposalInput = {
                title: project.title,
                description: project.description,
                sections: ['Introduction'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: project.externalContext,
            };

            const aiResult = await generateProposal(proposalInput);

            expect(aiResult.success).toBe(false);
            expect(aiResult.error).toBe('AI service temporarily unavailable');

            // Project should remain in valid state even after AI failure
            expect(project.title).toBe('Integration Test Project');
            expect(project.sections).toHaveLength(0);
        });
    });

    describe('Project Export Workflow', () => {
        beforeEach(() => {
            // Set up project with content and sections
            project.updateContent('Project content for export testing');

            project.addSection({
                id: 'section-1',
                title: 'Introduction',
                content: 'Introduction content',
                order: 1,
            });

            project.addSection({
                id: 'section-2',
                title: 'Conclusion',
                content: 'Conclusion content',
                order: 2,
            });
        });

        it('should export project to DOCX format', async () => {
            const mockDocxExport = {
                success: true,
                data: {
                    filename: 'project.docx',
                    blob: new Blob(['DOCX content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
                    size: 1024,
                },
                error: null,
            };

            mockExportToDocx.mockResolvedValue(mockDocxExport);

            const exportResult = await exportToDocx(project);

            expect(exportResult.success).toBe(true);
            expect(exportResult.data?.filename).toBe('project.docx');
            expect(mockExportToDocx).toHaveBeenCalledWith(project);
        });

        it('should export project to PPTX format', async () => {
            const mockPptxExport = {
                success: true,
                data: {
                    filename: 'project.pptx',
                    blob: new Blob(['PPTX content'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }),
                    size: 2048,
                },
                error: null,
            };

            mockExportToPptx.mockResolvedValue(mockPptxExport);

            const exportResult = await exportToPptx(project);

            expect(exportResult.success).toBe(true);
            expect(exportResult.data?.filename).toBe('project.pptx');
            expect(mockExportToPptx).toHaveBeenCalledWith(project);
        });

        it('should handle export failures gracefully', async () => {
            mockExportToDocx.mockResolvedValue({
                success: false,
                data: null,
                error: 'Export service unavailable',
            });

            const exportResult = await exportToDocx(project);

            expect(exportResult.success).toBe(false);
            expect(exportResult.error).toBe('Export service unavailable');
        });
    });

    describe('Project Collaboration Workflow', () => {
        it('should handle multiple users working on the same project', () => {
            // Simulate user 1 creating project
            const user1Project = new Project({
                title: 'Collaborative Project',
                description: 'A project for collaboration testing',
                content: '',
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            user1Project.updateContent('Initial content from user 1');
            user1Project.addSection({
                id: 'section-1',
                title: 'User 1 Section',
                content: 'Content from user 1',
                order: 1,
            });

            // Simulate user 2 making changes
            const user2Project = Project.fromJSON(user1Project.toJSON());
            user2Project.updateContent('Updated content from user 2');
            user2Project.addSection({
                id: 'section-2',
                title: 'User 2 Section',
                content: 'Content from user 2',
                order: 2,
            });

            // Verify both users' changes are preserved
            expect(user2Project.content).toBe('Updated content from user 2');
            expect(user2Project.sections).toHaveLength(2);
            expect(user2Project.sections[0].title).toBe('User 1 Section');
            expect(user2Project.sections[1].title).toBe('User 2 Section');
        });

        it('should handle concurrent section modifications', () => {
            // Add initial sections
            project.addSection({
                id: 'section-1',
                title: 'Original Title',
                content: 'Original content',
                order: 1,
            });

            project.addSection({
                id: 'section-2',
                title: 'Second Section',
                content: 'Second content',
                order: 2,
            });

            // Simulate concurrent updates
            project.updateSection('section-1', { title: 'Updated Title' });
            project.updateSection('section-2', { content: 'Updated content' });

            expect(project.sections[0].title).toBe('Updated Title');
            expect(project.sections[1].content).toBe('Updated content');
            expect(project.sections[0].updatedAt).toBeDefined();
            expect(project.sections[1].updatedAt).toBeDefined();
        });
    });

    describe('Project Versioning and History', () => {
        it('should track project changes over time', () => {
            const initialTime = new Date();
            project.updateContent('Initial content');

            // Simulate time passing
            jest.advanceTimersByTime(1000);

            project.updateContent('Updated content');
            project.addSection({
                id: 'section-1',
                title: 'New Section',
                content: 'New section content',
                order: 1,
            });

            expect(project.updatedAt.getTime()).toBeGreaterThan(initialTime.getTime());
            expect(project.content).toBe('Updated content');
            expect(project.sections).toHaveLength(1);
        });

        it('should maintain project integrity across serialization', () => {
            // Add complex project data
            project.updateContent('Complex project content');
            project.addSection({
                id: 'section-1',
                title: 'Complex Section',
                content: 'Complex section content',
                order: 1,
            });
            project.addExternalFile({
                name: 'complex.pdf',
                content: 'Complex file content',
                type: 'pdf',
                size: 2048,
            });
            project.updateMetadata({
                category: 'complex',
                priority: 'high',
                tags: ['important', 'urgent'],
            });
            project.addTags(['complex', 'integration']);

            // Serialize and deserialize
            const serialized = project.toJSON();
            const deserialized = Project.fromJSON(serialized);

            // Verify all data is preserved
            expect(deserialized.title).toBe(project.title);
            expect(deserialized.content).toBe(project.content);
            expect(deserialized.sections).toEqual(project.sections);
            expect(deserialized.externalContext).toEqual(project.externalContext);
            expect(deserialized.metadata).toEqual(project.metadata);
            expect(deserialized.tags).toEqual(project.tags);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle large projects efficiently', () => {
            const startTime = performance.now();

            // Create a large project
            project.updateContent('Large project content '.repeat(1000));

            // Add many sections
            for (let i = 0; i < 100; i++) {
                project.addSection({
                    id: `section-${i}`,
                    title: `Section ${i}`,
                    content: `Content for section ${i}`,
                    order: i + 1,
                });
            }

            // Add many external files
            for (let i = 0; i < 50; i++) {
                project.addExternalFile({
                    name: `file${i}.pdf`,
                    content: `File content ${i}`,
                    type: 'pdf',
                    size: 1024,
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(project.sections).toHaveLength(100);
            expect(project.externalContext.files).toHaveLength(50);
        });

        it('should handle rapid updates efficiently', () => {
            const startTime = performance.now();

            // Perform many rapid updates
            for (let i = 0; i < 1000; i++) {
                project.updateContent(`Content update ${i}`);
                project.updateMetadata({ updateCount: i });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(500); // Should complete within 500ms
            expect(project.content).toBe('Content update 999');
            expect(project.metadata.updateCount).toBe(999);
        });
    });

    describe('Error Recovery and Resilience', () => {
        it('should recover from partial failures', async () => {
            // Mock partial AI success
            mockGenerateProposal.mockResolvedValue({
                success: true,
                data: {
                    content: 'Partial content',
                    sections: [
                        { title: 'Section 1', content: 'Content 1' },
                        // Missing other sections due to partial failure
                    ],
                    metadata: {
                        wordCount: 100,
                        estimatedReadingTime: 1,
                        generatedAt: new Date().toISOString(),
                    },
                },
                error: null,
            });

            const proposalInput = {
                title: project.title,
                description: project.description,
                sections: ['Section 1', 'Section 2', 'Section 3'],
                targetAudience: 'Business stakeholders',
                tone: 'professional',
                length: 'medium',
                includeReferences: false,
                externalContext: project.externalContext,
            };

            const aiResult = await generateProposal(proposalInput);

            expect(aiResult.success).toBe(true);
            expect(aiResult.data?.sections).toHaveLength(1); // Only one section generated

            // Project should still be updated with available content
            project.updateContent(aiResult.data?.content || '');
            expect(project.content).toBe('Partial content');
        });

        it('should maintain data integrity during errors', () => {
            const originalContent = 'Original content';
            const originalSections = [
                { id: 'section-1', title: 'Original Section', content: 'Original content', order: 1 },
            ];

            project.updateContent(originalContent);
            project.addSection(originalSections[0]);

            // Simulate an error during update
            try {
                project.updateContent(''); // This might cause issues
                project.updateSection('section-1', { content: '' });
            } catch (error) {
                // Error occurred, but original data should be preserved
            }

            // Original data should still be intact
            expect(project.content).toBe(originalContent);
            expect(project.sections[0].content).toBe('Original content');
        });
    });
});
