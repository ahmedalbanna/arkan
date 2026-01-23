/**
 * Project Model Tests
 */

// Mock the markdown-parser to avoid ESM issues with unified
jest.mock('@/lib/project/markdown-parser');
jest.mock('@/lib/project/template');

import { Chapter, Project, Section } from '@/lib/models';

describe('Project Model', () => {
    describe('constructor', () => {
        it('should create a project with default values', () => {
            const project = new Project({});

            expect(project.id).toBeDefined();
            expect(project.name).toBe('Untitled Project');
            expect(project.content).toEqual([]);
            expect(project.externalContext).toEqual([]);
        });

        it('should create a project with provided values', () => {
            const project = new Project({
                id: 'test-id',
                name: 'Test Project',
                description: 'Test Description',
            });

            expect(project.id).toBe('test-id');
            expect(project.name).toBe('Test Project');
            expect(project.description).toBe('Test Description');
        });

        it('should reconstruct chapters and sections from data', () => {
            const projectData = {
                id: 'test',
                name: 'Test',
                content: [
                    {
                        id: 'chapter-1',
                        title: 'Chapter 1',
                        sections: [
                            { id: 'section-1', title: 'Section 1', content: 'Content 1' },
                            { id: 'section-2', title: 'Section 2', content: 'Content 2' },
                        ],
                    },
                ],
            };

            const project = new Project(projectData);

            expect(project.content).toHaveLength(1);
            expect(project.content[0]).toBeInstanceOf(Chapter);
            expect(project.content[0].sections).toHaveLength(2);
            expect(project.content[0].sections[0]).toBeInstanceOf(Section);
        });
    });

    describe('with', () => {
        it('should create a new project with updated properties', () => {
            const original = new Project({ name: 'Original' });
            const updated = original.with({ name: 'Updated' });

            expect(updated).not.toBe(original);
            expect(updated.name).toBe('Updated');
            expect(original.name).toBe('Original');
        });

        it('should maintain other properties when updating', () => {
            const original = new Project({
                name: 'Original',
                description: 'Original Description',
            });
            const updated = original.with({ name: 'Updated' });

            expect(updated.description).toBe('Original Description');
        });
    });

    describe('addChapter', () => {
        it('should add a new chapter to the project', () => {
            const project = new Project({});

            const updated = project.addChapter('New Chapter');

            expect(updated.content).toHaveLength(1);
            expect(updated.content[0].title).toBe('New Chapter');
            expect(updated).not.toBe(project); // Immutability check
        });
    });

    describe('updateChapter', () => {
        it('should update a specific chapter', () => {
            const chapter = new Chapter({ id: 'ch1', title: 'Original' });
            const project = new Project({ content: [chapter] });

            const updated = project.updateChapter('ch1', c => c.with({ title: 'Updated' }));

            expect(updated.content[0].title).toBe('Updated');
            expect(project.content[0].title).toBe('Original');
        });

        it('should return same project if chapter not found', () => {
            const project = new Project({});
            const updated = project.updateChapter('nonexistent', c => c);

            expect(updated).toBe(project);
        });
    });

    describe('getChapter', () => {
        it('should find a chapter by ID', () => {
            const chapter = new Chapter({ id: 'ch1', title: 'Test Chapter' });
            const project = new Project({ content: [chapter] });

            const found = project.getChapter('ch1');

            expect(found).toBeDefined();
            expect(found?.title).toBe('Test Chapter');
        });

        it('should return undefined if chapter not found', () => {
            const project = new Project({});
            const found = project.getChapter('nonexistent');

            expect(found).toBeUndefined();
        });
    });

    describe('getSection', () => {
        it('should find a section by ID', () => {
            const section = new Section({ id: 's1', title: 'Test Section', type: 'report' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [section] });
            const project = new Project({ content: [chapter] });

            const found = project.getSection('s1');

            expect(found).toBeDefined();
            expect(found?.title).toBe('Test Section');
        });

        it('should return undefined if section not found', () => {
            const project = new Project({});
            const found = project.getSection('nonexistent');

            expect(found).toBeUndefined();
        });
    });

    describe('findSectionWithContext', () => {
        it('should find a section with chapter context', () => {
            const section = new Section({ id: 's1', title: 'Test Section', type: 'report' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [section] });
            const project = new Project({ content: [chapter] });

            const result = project.findSectionWithContext('s1');

            expect(result).toBeDefined();
            expect(result?.section.title).toBe('Test Section');
            expect(result?.chapter.title).toBe('Chapter 1');
            expect(result?.chapterIndex).toBe(0);
            expect(result?.sectionIndex).toBe(0);
        });

        it('should return null if section not found', () => {
            const project = new Project({});
            const result = project.findSectionWithContext('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('addExternalContext', () => {
        it('should add external context to the project', () => {
            const project = new Project({});
            const context = {
                fileName: 'test.pdf',
                content: 'Test content',
                type: 'context' as const,
            };

            const updated = project.addExternalContext(context);

            expect(updated.externalContext).toHaveLength(1);
            expect(updated.externalContext[0].fileName).toBe('test.pdf');
        });
    });

    describe('removeExternalContext', () => {
        it('should remove external context by ID', () => {
            const ctx1 = { id: 'ctx1', fileName: 'file1.pdf', content: 'Content 1', type: 'context' as const };
            const ctx2 = { id: 'ctx2', fileName: 'file2.pdf', content: 'Content 2', type: 'context' as const };
            const project = new Project({
                externalContext: [ctx1, ctx2],
            });

            const updated = project.removeExternalContext('ctx1');

            expect(updated.externalContext).toHaveLength(1);
            expect(updated.externalContext[0].fileName).toBe('file2.pdf');
        });
    });

    describe('toStateObject', () => {
        it('should convert project to plain object', () => {
            const project = new Project({
                id: 'test-id',
                name: 'Test Project',
            });

            const stateObject = project.toStateObject();

            expect(stateObject).toEqual(
                expect.objectContaining({
                    id: 'test-id',
                    name: 'Test Project',
                })
            );
            expect(stateObject).not.toBeInstanceOf(Project);
        });

        it('should recursively convert chapters and sections', () => {
            const section = new Section({ id: 's1', title: 'Section', type: 'report' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [section] });
            const project = new Project({ content: [chapter] });

            const stateObject = project.toStateObject();

            expect(stateObject.content[0]).not.toBeInstanceOf(Chapter);
            expect(stateObject.content[0].sections[0]).not.toBeInstanceOf(Section);
        });
    });

    describe('generateTableOfContents', () => {
        it('should generate TOC from chapters and sections', () => {
            const section1 = new Section({ id: 's1', title: 'Background', type: 'report' });
            const section2 = new Section({ id: 's2', title: 'Objectives', type: 'report' });
            const chapter1 = new Chapter({ id: 'ch1', title: 'Introduction', sections: [section1, section2] });

            const section3 = new Section({ id: 's3', title: 'Data Collection', type: 'report' });
            const chapter2 = new Chapter({ id: 'ch2', title: 'Methodology', sections: [section3] });

            const project = new Project({ content: [chapter1, chapter2] });

            const updated = project.generateTableOfContents();

            expect(updated.tableOfContentsMarkdown).toContain('Table of Contents');
            expect(updated.tableOfContentsMarkdown).toContain('Introduction');
            expect(updated.tableOfContentsMarkdown).toContain('Background');
            expect(updated.tableOfContentsMarkdown).toContain('Methodology');
        });
    });

    describe('addSectionToChapter', () => {
        it('should add a section to specific chapter', () => {
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [] });
            const project = new Project({ content: [chapter] });

            const updated = project.addSectionToChapter('ch1', 'New Section', 'Section content');

            expect(updated.content[0].sections).toHaveLength(1);
            expect(updated.content[0].sections[0].title).toBe('New Section');
            expect(updated.content[0].sections[0].content).toBe('Section content');
        });
    });

    describe('updateSectionContent', () => {
        it('should update section content', () => {
            const section = new Section({ id: 's1', title: 'Section', type: 'report', content: 'Old content' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [section] });
            const project = new Project({ content: [chapter] });

            const updated = project.updateSectionContent('s1', 'New content');

            const updatedSection = updated.getSection('s1');
            expect(updatedSection?.content).toBe('New content');
        });
    });

    describe('removeChapter', () => {
        it('should remove chapter by ID', () => {
            const chapter1 = new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [] });
            const chapter2 = new Chapter({ id: 'ch2', title: 'Chapter 2', sections: [] });
            const project = new Project({ content: [chapter1, chapter2] });

            const updated = project.removeChapter('ch1');

            expect(updated.content).toHaveLength(1);
            expect(updated.content[0].title).toBe('Chapter 2');
        });
    });

    describe('getOtherSections', () => {
        it('should return all sections except specified one', () => {
            const section1 = new Section({ id: 's1', title: 'Section 1', type: 'report' });
            const section2 = new Section({ id: 's2', title: 'Section 2', type: 'report' });
            const section3 = new Section({ id: 's3', title: 'Section 3', type: 'report' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [section1, section2, section3] });
            const project = new Project({ content: [chapter] });

            const others = project.getOtherSections('s2');

            expect(others).toHaveLength(2);
            expect(others.find(s => s.id === 's1')).toBeDefined();
            expect(others.find(s => s.id === 's3')).toBeDefined();
            expect(others.find(s => s.id === 's2')).toBeUndefined();
        });
    });

    describe('hasContent', () => {
        it('should return true if project has name', () => {
            const project = new Project({ name: 'My Project' });
            expect(project.hasContent()).toBe(true);
        });

        it('should return true if project has content', () => {
            const section = new Section({ id: 's1', title: 'Section', type: 'report', content: 'Some content' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [section] });
            const project = new Project({ content: [chapter] });
            expect(project.hasContent()).toBe(true);
        });

        it('should return true if project has external context', () => {
            const project = new Project({
                externalContext: [{ fileName: 'file.pdf', content: 'content', type: 'context' }]
            });
            expect(project.hasContent()).toBe(true);
        });

        it('should return false for empty project', () => {
            const project = new Project({});
            expect(project.hasContent()).toBe(false);
        });
    });

    describe('updateExternalContextType', () => {
        it('should update external context type by ID', () => {
            const ctx = { id: 'ctx1', fileName: 'file.pdf', content: 'content', type: 'context' as const };
            const project = new Project({ externalContext: [ctx] });

            const updated = project.updateExternalContextType('ctx1', 'example');

            expect(updated.externalContext[0].type).toBe('example');
        });
    });

    describe('parseAndSetContentFromToc', () => {
        it('should parse numbered TOC format', () => {
            const project = new Project({});
            const toc = `1. Introduction
   1.1. Background
   1.2. Objectives
2. Methodology
   2.1. Data Collection`;

            const content = project.parseAndSetContentFromToc(toc);

            expect(content).toHaveLength(2);
            expect(content[0].title).toBe('Introduction');
            expect(content[0].sections).toHaveLength(2);
            expect(content[0].sections[0].title).toBe('Background');
            expect(content[1].title).toBe('Methodology');
        });

        it('should parse markdown TOC format', () => {
            const project = new Project({});
            const toc = `# Chapter One
- Section A
- Section B
# Chapter Two`;

            const content = project.parseAndSetContentFromToc(toc);

            expect(content).toHaveLength(2);
            expect(content[0].title).toBe('Chapter One');
            expect(content[0].sections).toHaveLength(2);
        });
    });

    describe('validation', () => {
        it('should throw error for empty project name', () => {
            expect(() => {
                new Project({ name: '   ' });
            }).toThrow('Project name cannot be empty');
        });

        it('should throw error for invalid complexity', () => {
            expect(() => {
                new Project({ complexity: 150 });
            }).toThrow('Complexity must be between 0 and 100');
        });

        it('should throw error for invalid formality', () => {
            expect(() => {
                new Project({ formality: -10 });
            }).toThrow('Formality must be between 0 and 100');
        });

        it('should throw error for duplicate IDs', () => {
            const section1 = new Section({ id: 'same-id', title: 'Section 1', type: 'report' });
            const section2 = new Section({ id: 'same-id', title: 'Section 2', type: 'report' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [section1, section2] });

            expect(() => {
                new Project({ content: [chapter] });
            }).toThrow('Duplicate IDs found');
        });

        it('should throw error for invalid content structure', () => {
            expect(() => {
                new Project({ content: [{ invalid: 'object' } as any] });
            }).toThrow('Invalid section');
        });
    });

    describe('deprecation warnings', () => {
        it('should warn when using activeSectionId', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            new Project({ activeSectionId: 'section-1' });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('activeSectionId is deprecated')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('derived state', () => {
        it('chapters getter should return only chapters', () => {
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [] });
            const section = new Section({ id: 's1', title: 'Standalone', type: 'report' });
            const project = new Project({ content: [chapter, section] });

            expect(project.chapters).toHaveLength(1);
            expect(project.chapters[0]).toBeInstanceOf(Chapter);
        });

        it('sections getter should return all sections', () => {
            const s1 = new Section({ id: 's1', title: 'S1', type: 'report' });
            const s2 = new Section({ id: 's2', title: 'S2', type: 'report' });
            const chapter = new Chapter({ id: 'ch1', title: 'Chapter', sections: [s1] });
            const project = new Project({ content: [chapter, s2] });

            expect(project.sections).toHaveLength(2);
        });
    });
});
