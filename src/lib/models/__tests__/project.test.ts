/**
 * Project Model Tests
 * 
 * Tests for Project class and its methods
 */

import { Project, type ProjectProperties } from '../project';
import { Chapter } from '../chapter';
import { Section } from '../section';
import { ExternalContext } from '../external-context';

describe('Project Model', () => {
  // ============================================================================
  // Constructor and Initialization
  // ============================================================================

  describe('Constructor', () => {
    it('should create project with default values', () => {
      const project = new Project({});

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Untitled Project');
      expect(project.description).toBe('');
      expect(project.content).toEqual([]);
      expect(project.externalContext).toEqual([]);
    });

    it('should create project with provided values', () => {
      const props: ProjectProperties = {
        id: 'project-123',
        name: 'My Project',
        description: 'Test project description',
        projectType: 'Research',
        specialization: 'Computer Science',
      };

      const project = new Project(props);

      expect(project.id).toBe('project-123');
      expect(project.name).toBe('My Project');
      expect(project.description).toBe('Test project description');
      expect(project.projectType).toBe('Research');
      expect(project.specialization).toBe('Computer Science');
    });

    it('should generate unique ID if not provided', () => {
      const project1 = new Project({});
      const project2 = new Project({});

      expect(project1.id).toBeDefined();
      expect(project2.id).toBeDefined();
      expect(project1.id).not.toBe(project2.id);
    });

    it('should initialize metadata with defaults', () => {
      const project = new Project({});

      expect(project.meta).toBeDefined();
      expect(project.meta.author).toBe('Unknown');
      expect(project.meta.version).toBe('1.0.0');
      expect(project.meta.created).toBeDefined();
      expect(project.meta.updated).toBeDefined();
    });

    it('should accept custom metadata', () => {
      const props: ProjectProperties = {
        meta: {
          author: 'John Doe',
          version: '2.0.0',
          created: '2024-01-01',
          updated: '2024-01-15',
        },
      };

      const project = new Project(props);

      expect(project.meta.author).toBe('John Doe');
      expect(project.meta.version).toBe('2.0.0');
      expect(project.meta.created).toBe('2024-01-01');
      expect(project.meta.updated).toBe('2024-01-15');
    });

    it('should normalize content to Chapter and Section instances', () => {
      const props: ProjectProperties = {
        content: [
          { id: 'ch1', title: 'Chapter 1', content: '', type: 'chapter' },
          { id: 'sec1', title: 'Section 1', content: '', type: 'section' },
        ],
      };

      const project = new Project(props);

      expect(project.content[0]).toBeInstanceOf(Chapter);
      expect(project.content[1]).toBeInstanceOf(Section);
    });

    it('should initialize external context', () => {
      const props: ProjectProperties = {
        externalContext: [
          { id: 'ctx1', type: 'reference', content: 'Reference 1' },
        ],
      };

      const project = new Project(props);

      expect(project.externalContext).toHaveLength(1);
      expect(project.externalContext[0]).toBeInstanceOf(ExternalContext);
    });
  });

  // ============================================================================
  // Academic Information
  // ============================================================================

  describe('Academic information', () => {
    it('should store university information', () => {
      const props: ProjectProperties = {
        university: 'MIT',
        course: 'CS101',
        educationalLevel: 'Undergraduate',
        supervisor: 'Dr. Smith',
      };

      const project = new Project(props);

      expect(project.university).toBe('MIT');
      expect(project.course).toBe('CS101');
      expect(project.educationalLevel).toBe('Undergraduate');
      expect(project.supervisor).toBe('Dr. Smith');
    });

    it('should store team members', () => {
      const props: ProjectProperties = {
        teamMembers: ['Alice', 'Bob', 'Charlie'],
      };

      const project = new Project(props);

      expect(project.teamMembers).toEqual(['Alice', 'Bob', 'Charlie']);
      expect(project.teamMembers).toHaveLength(3);
    });

    it('should handle empty team members', () => {
      const project = new Project({});

      expect(project.teamMembers).toBeUndefined();
    });
  });

  // ============================================================================
  // Content Management
  // ============================================================================

  describe('Content management', () => {
    it('should add chapter to project', () => {
      const project = new Project({});
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });

      const updated = project.addContent(chapter);

      expect(updated.content).toHaveLength(1);
      expect(updated.content[0]).toBeInstanceOf(Chapter);
      expect(updated.content[0].title).toBe('Chapter 1');
    });

    it('should add section to project', () => {
      const project = new Project({});
      const section = new Section({ id: 'sec1', title: 'Section 1', content: '' });

      const updated = project.addContent(section);

      expect(updated.content).toHaveLength(1);
      expect(updated.content[0]).toBeInstanceOf(Section);
    });

    it('should add multiple content items', () => {
      const project = new Project({});
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });
      const section = new Section({ id: 'sec1', title: 'Section 1', content: '' });

      const updated = project.addContent(chapter).addContent(section);

      expect(updated.content).toHaveLength(2);
    });

    it('should update existing content', () => {
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: 'Original' });
      const project = new Project({ content: [chapter] });

      const updatedChapter = new Chapter({ id: 'ch1', title: 'Updated Chapter', content: 'Updated' });
      const updated = project.updateContent('ch1', updatedChapter);

      expect(updated.content[0].title).toBe('Updated Chapter');
      expect((updated.content[0] as Chapter).content).toBe('Updated');
    });

    it('should remove content by id', () => {
      const chapter1 = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });
      const chapter2 = new Chapter({ id: 'ch2', title: 'Chapter 2', content: '' });
      const project = new Project({ content: [chapter1, chapter2] });

      const updated = project.removeContent('ch1');

      expect(updated.content).toHaveLength(1);
      expect(updated.content[0].id).toBe('ch2');
    });

    it('should return same project if content not found', () => {
      const project = new Project({});

      const updated = project.updateContent('non-existent', new Chapter({ id: 'ch1', title: 'Test', content: '' }));

      expect(updated).toBe(project);
    });

    it('should get content by id', () => {
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: 'Test' });
      const project = new Project({ content: [chapter] });

      const found = project.getContent('ch1');

      expect(found).toBeDefined();
      expect(found?.id).toBe('ch1');
    });

    it('should return undefined for non-existent content', () => {
      const project = new Project({});

      const found = project.getContent('non-existent');

      expect(found).toBeUndefined();
    });
  });

  // ============================================================================
  // Content Reordering
  // ============================================================================

  describe('Content reordering', () => {
    it('should move content up', () => {
      const ch1 = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });
      const ch2 = new Chapter({ id: 'ch2', title: 'Chapter 2', content: '' });
      const ch3 = new Chapter({ id: 'ch3', title: 'Chapter 3', content: '' });
      const project = new Project({ content: [ch1, ch2, ch3] });

      const updated = project.moveContent(2, 0);

      expect(updated.content[0].id).toBe('ch3');
      expect(updated.content[1].id).toBe('ch1');
      expect(updated.content[2].id).toBe('ch2');
    });

    it('should move content down', () => {
      const ch1 = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });
      const ch2 = new Chapter({ id: 'ch2', title: 'Chapter 2', content: '' });
      const ch3 = new Chapter({ id: 'ch3', title: 'Chapter 3', content: '' });
      const project = new Project({ content: [ch1, ch2, ch3] });

      const updated = project.moveContent(0, 2);

      expect(updated.content[0].id).toBe('ch2');
      expect(updated.content[1].id).toBe('ch3');
      expect(updated.content[2].id).toBe('ch1');
    });

    it('should handle invalid indices', () => {
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });
      const project = new Project({ content: [chapter] });

      const updated = project.moveContent(0, 10);

      expect(updated.content).toHaveLength(1);
    });
  });

  // ============================================================================
  // External Context
  // ============================================================================

  describe('External context', () => {
    it('should add external context', () => {
      const project = new Project({});
      const context = new ExternalContext({ id: 'ctx1', type: 'reference', content: 'Test' });

      const updated = project.addExternalContext(context);

      expect(updated.externalContext).toHaveLength(1);
      expect(updated.externalContext[0].content).toBe('Test');
    });

    it('should remove external context', () => {
      const ctx1 = new ExternalContext({ id: 'ctx1', type: 'reference', content: 'Context 1' });
      const ctx2 = new ExternalContext({ id: 'ctx2', type: 'note', content: 'Context 2' });
      const project = new Project({ externalContext: [ctx1, ctx2] });

      const updated = project.removeExternalContext('ctx1');

      expect(updated.externalContext).toHaveLength(1);
      expect(updated.externalContext[0].id).toBe('ctx2');
    });

    it('should update external context', () => {
      const ctx = new ExternalContext({ id: 'ctx1', type: 'reference', content: 'Original' });
      const project = new Project({ externalContext: [ctx] });

      const updatedCtx = new ExternalContext({ id: 'ctx1', type: 'reference', content: 'Updated' });
      const updated = project.updateExternalContext('ctx1', updatedCtx);

      expect(updated.externalContext[0].content).toBe('Updated');
    });
  });

  // ============================================================================
  // Global Settings
  // ============================================================================

  describe('Global settings', () => {
    it('should store language setting', () => {
      const props: ProjectProperties = {
        language: 'en',
      };

      const project = new Project(props);

      expect(project.language).toBe('en');
    });

    it('should store complexity setting', () => {
      const props: ProjectProperties = {
        complexity: 75,
      };

      const project = new Project(props);

      expect(project.complexity).toBe(75);
    });

    it('should store formality setting', () => {
      const props: ProjectProperties = {
        formality: 80,
      };

      const project = new Project(props);

      expect(project.formality).toBe(80);
    });

    it('should store tone setting', () => {
      const props: ProjectProperties = {
        tone: 'professional',
      };

      const project = new Project(props);

      expect(project.tone).toBe('professional');
    });

    it('should store behaviors', () => {
      const props: ProjectProperties = {
        behaviors: ['detailed', 'analytical'],
      };

      const project = new Project(props);

      expect(project.behaviors).toEqual(['detailed', 'analytical']);
    });

    it('should store rules and constraints', () => {
      const props: ProjectProperties = {
        rules: ['Use APA style', 'Include references'],
        constraints: ['Maximum 5000 words', 'No plagiarism'],
      };

      const project = new Project(props);

      expect(project.rules).toEqual(['Use APA style', 'Include references']);
      expect(project.constraints).toEqual(['Maximum 5000 words', 'No plagiarism']);
    });

    it('should store citation style', () => {
      const props: ProjectProperties = {
        citationStyle: 'APA',
      };

      const project = new Project(props);

      expect(project.citationStyle).toBe('APA');
    });
  });

  // ============================================================================
  // Table of Contents
  // ============================================================================

  describe('Table of contents', () => {
    it('should store TOC markdown', () => {
      const props: ProjectProperties = {
        tableOfContentsMarkdown: '# Table of Contents\n\n1. Chapter 1\n2. Chapter 2',
      };

      const project = new Project(props);

      expect(project.tableOfContentsMarkdown).toBe('# Table of Contents\n\n1. Chapter 1\n2. Chapter 2');
    });

    it('should update TOC markdown', () => {
      const project = new Project({});
      const newTOC = '## Contents\n\n- Introduction\n- Conclusion';

      const updated = project.with({ tableOfContentsMarkdown: newTOC });

      expect(updated.tableOfContentsMarkdown).toBe(newTOC);
    });
  });

  // ============================================================================
  // Immutability
  // ============================================================================

  describe('Immutability', () => {
    it('should return new instance when adding content', () => {
      const project = new Project({});
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: '' });

      const updated = project.addContent(chapter);

      expect(updated).not.toBe(project);
      expect(project.content).toHaveLength(0);
      expect(updated.content).toHaveLength(1);
    });

    it('should return new instance when updating content', () => {
      const chapter = new Chapter({ id: 'ch1', title: 'Original', content: '' });
      const project = new Project({ content: [chapter] });

      const updated = project.updateContent('ch1', new Chapter({ id: 'ch1', title: 'Updated', content: '' }));

      expect(updated).not.toBe(project);
      expect(project.content[0].title).toBe('Original');
      expect(updated.content[0].title).toBe('Updated');
    });

    it('should return new instance when using with()', () => {
      const project = new Project({ name: 'Original' });

      const updated = project.with({ name: 'Updated' });

      expect(updated).not.toBe(project);
      expect(project.name).toBe('Original');
      expect(updated.name).toBe('Updated');
    });

    it('should preserve other properties when updating', () => {
      const project = new Project({
        name: 'My Project',
        description: 'Test',
        university: 'MIT',
      });

      const updated = project.with({ name: 'Updated Project' });

      expect(updated.name).toBe('Updated Project');
      expect(updated.description).toBe('Test');
      expect(updated.university).toBe('MIT');
    });
  });

  // ============================================================================
  // Logo Management
  // ============================================================================

  describe('Logo management', () => {
    it('should store project logo URL', () => {
      const props: ProjectProperties = {
        logoUrl: 'https://example.com/logo.png',
      };

      const project = new Project(props);

      expect(project.logoUrl).toBe('https://example.com/logo.png');
    });

    it('should store university logo URL', () => {
      const props: ProjectProperties = {
        universityLogoUrl: 'https://example.com/uni-logo.png',
      };

      const project = new Project(props);

      expect(project.universityLogoUrl).toBe('https://example.com/uni-logo.png');
    });

    it('should update logo URLs', () => {
      const project = new Project({});

      const updated = project.with({
        logoUrl: 'https://example.com/new-logo.png',
        universityLogoUrl: 'https://example.com/new-uni-logo.png',
      });

      expect(updated.logoUrl).toBe('https://example.com/new-logo.png');
      expect(updated.universityLogoUrl).toBe('https://example.com/new-uni-logo.png');
    });
  });

  // ============================================================================
  // Serialization
  // ============================================================================

  describe('Serialization', () => {
    it('should convert to plain object', () => {
      const project = new Project({
        name: 'Test Project',
        description: 'Test description',
      });

      const plain = project.toJSON();

      expect(plain).toEqual(
        expect.objectContaining({
          name: 'Test Project',
          description: 'Test description',
        })
      );
    });

    it('should include all properties in JSON', () => {
      const chapter = new Chapter({ id: 'ch1', title: 'Chapter 1', content: 'Test' });
      const project = new Project({
        name: 'Project',
        content: [chapter],
        university: 'MIT',
        language: 'en',
      });

      const json = project.toJSON();

      expect(json.name).toBe('Project');
      expect(json.content).toHaveLength(1);
      expect(json.university).toBe('MIT');
      expect(json.language).toBe('en');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty project name', () => {
      const project = new Project({ name: '' });

      expect(project.name).toBe('');
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(1000);
      const project = new Project({ name: longName });

      expect(project.name.length).toBe(1000);
    });

    it('should handle Unicode in project properties', () => {
      const props: ProjectProperties = {
        name: '我的项目 مشروعي',
        description: 'Проект description 🚀',
        university: '清华大学',
      };

      const project = new Project(props);

      expect(project.name).toBe('我的项目 مشروعي');
      expect(project.description).toBe('Проект description 🚀');
      expect(project.university).toBe('清华大学');
    });

    it('should handle many content items', () => {
      const content = Array.from({ length: 100 }, (_, i) =>
        new Chapter({ id: `ch${i}`, title: `Chapter ${i}`, content: '' })
      );
      const project = new Project({ content });

      expect(project.content).toHaveLength(100);
    });

    it('should handle many team members', () => {
      const teamMembers = Array.from({ length: 50 }, (_, i) => `Member ${i}`);
      const project = new Project({ teamMembers });

      expect(project.teamMembers).toHaveLength(50);
    });

    it('should handle complex nested content', () => {
      const chapter = new Chapter({
        id: 'ch1',
        title: 'Chapter 1',
        content: 'Main content',
        sections: [
          { id: 'sec1', title: 'Section 1', content: 'Section content' },
        ],
      });

      const project = new Project({ content: [chapter] });

      expect(project.content).toHaveLength(1);
      expect((project.content[0] as Chapter).sections).toHaveLength(1);
    });
  });
});
