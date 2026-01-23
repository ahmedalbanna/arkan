/**
 * Project Model Tests
 */

import { Project, Chapter, Section } from '@/lib/models';

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
      const chapter = new Chapter({ title: 'New Chapter' });

      const updated = project.addChapter(chapter);

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

  describe('findChapter', () => {
    it('should find a chapter by ID', () => {
      const chapter = new Chapter({ id: 'ch1', title: 'Test Chapter' });
      const project = new Project({ content: [chapter] });

      const found = project.findChapter('ch1');

      expect(found).toBeDefined();
      expect(found?.title).toBe('Test Chapter');
    });

    it('should return undefined if chapter not found', () => {
      const project = new Project({});
      const found = project.findChapter('nonexistent');

      expect(found).toBeUndefined();
    });
  });

  describe('findSection', () => {
    it('should find a section by ID', () => {
      const section = new Section({ id: 's1', title: 'Test Section' });
      const chapter = new Chapter({ id: 'ch1', sections: [section] });
      const project = new Project({ content: [chapter] });

      const found = project.findSection('s1');

      expect(found).toBeDefined();
      expect(found?.title).toBe('Test Section');
    });

    it('should return undefined if section not found', () => {
      const project = new Project({});
      const found = project.findSection('nonexistent');

      expect(found).toBeUndefined();
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
    it('should remove external context by filename', () => {
      const project = new Project({
        externalContext: [
          { fileName: 'file1.pdf', content: 'Content 1', type: 'context' },
          { fileName: 'file2.pdf', content: 'Content 2', type: 'context' },
        ],
      });

      const updated = project.removeExternalContext('file1.pdf');

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
      const section = new Section({ id: 's1', title: 'Section' });
      const chapter = new Chapter({ id: 'ch1', sections: [section] });
      const project = new Project({ content: [chapter] });

      const stateObject = project.toStateObject();

      expect(stateObject.content[0]).not.toBeInstanceOf(Chapter);
      expect(stateObject.content[0].sections[0]).not.toBeInstanceOf(Section);
    });
  });
});
