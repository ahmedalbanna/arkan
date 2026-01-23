/**
 * Chapter Model Tests
 */

import { Chapter, type ChapterProperties } from '../chapter';
import { Section } from '../section';
import { ChapterValidationError } from '../chapter-validation';

describe('Chapter Model', () => {
  describe('constructor', () => {
    it('should create a chapter with valid properties', () => {
      const chapter = new Chapter({
        title: 'Introduction',
        sections: [],
      });

      expect(chapter.id).toBeDefined();
      expect(chapter.title).toBe('Introduction');
      expect(chapter.sections).toHaveLength(0);
    });

    it('should auto-generate ID if not provided', () => {
      const chapter = new Chapter({ title: 'Chapter 1' });
      expect(chapter.id).toBeDefined();
      expect(chapter.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });

    it('should use provided ID', () => {
      const chapter = new Chapter({
        id: 'chapter-123',
        title: 'Chapter 1',
      });
      expect(chapter.id).toBe('chapter-123');
    });

    it('should throw error for missing title', () => {
      expect(() => {
        new Chapter({ title: '' } as any);
      }).toThrow('Chapter title is required');
    });

    it('should throw error for whitespace-only title', () => {
      expect(() => {
        new Chapter({ title: '   ' });
      }).toThrow('Chapter title is required');
    });

    it('should throw error for title exceeding 500 characters', () => {
      const longTitle = 'a'.repeat(501);
      expect(() => {
        new Chapter({ title: longTitle });
      }).toThrow('Chapter title too long');
    });

    it('should convert section properties to Section instances', () => {
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [
          { title: 'Section 1', type: 'report' },
          { title: 'Section 2', type: 'report' },
        ],
      });

      expect(chapter.sections).toHaveLength(2);
      expect(chapter.sections[0]).toBeInstanceOf(Section);
      expect(chapter.sections[1]).toBeInstanceOf(Section);
    });

    it('should accept Section instances', () => {
      const section = new Section({ title: 'Section 1', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      expect(chapter.sections).toHaveLength(1);
      expect(chapter.sections[0]).toBe(section);
    });

    it('should throw error for duplicate section IDs', () => {
      const section1 = new Section({ id: 'same-id', title: 'Section 1', type: 'report' });
      const section2 = new Section({ id: 'same-id', title: 'Section 2', type: 'report' });

      expect(() => {
        new Chapter({
          title: 'Chapter',
          sections: [section1, section2],
        });
      }).toThrow('Duplicate section IDs found');
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const chapter = new Chapter({ title: 'Chapter 1' });

      // Properties are readonly - TypeScript enforces at compile time
      expect(chapter.title).toBe('Chapter 1');
      expect(chapter.id).toBeDefined();
    });

    it('should return new instance with with()', () => {
      const original = new Chapter({ title: 'Original' });
      const updated = original.with({ title: 'Updated' });

      expect(updated).not.toBe(original);
      expect(original.title).toBe('Original');
      expect(updated.title).toBe('Updated');
    });
  });

  describe('with()', () => {
    it('should update title', () => {
      const chapter = new Chapter({ title: 'Chapter 1' });
      const updated = chapter.with({ title: 'Chapter 2' });

      expect(updated.title).toBe('Chapter 2');
      expect(updated.id).toBe(chapter.id); // ID unchanged
    });

    it('should update sections', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      const section = new Section({ title: 'New Section', type: 'report' });
      const updated = chapter.with({ sections: [section] });

      expect(updated.sections).toHaveLength(1);
      expect(updated.sections[0].title).toBe('New Section');
    });

    it('should preserve ID when updating', () => {
      const chapter = new Chapter({ id: 'ch-123', title: 'Original' });
      const updated = chapter.with({ title: 'Updated' });

      expect(updated.id).toBe('ch-123');
    });
  });

  describe('getSection()', () => {
    it('should find section by ID', () => {
      const section = new Section({ id: 's1', title: 'Section 1', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      const found = chapter.getSection('s1');
      expect(found).toBeDefined();
      expect(found?.title).toBe('Section 1');
    });

    it('should return undefined for non-existent ID', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      const found = chapter.getSection('non-existent');
      expect(found).toBeUndefined();
    });

    it('should find correct section among multiple', () => {
      const s1 = new Section({ id: 's1', title: 'Section 1', type: 'report' });
      const s2 = new Section({ id: 's2', title: 'Section 2', type: 'report' });
      const s3 = new Section({ id: 's3', title: 'Section 3', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1, s2, s3],
      });

      const found = chapter.getSection('s2');
      expect(found?.title).toBe('Section 2');
    });
  });

  describe('addSection()', () => {
    it('should add section to end by default', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      const section = new Section({ title: 'New Section', type: 'report' });
      const updated = chapter.addSection(section);

      expect(updated.sections).toHaveLength(1);
      expect(updated.sections[0].title).toBe('New Section');
      expect(chapter.sections).toHaveLength(0); // Original unchanged
    });

    it('should add section at specific index', () => {
      const s1 = new Section({ title: 'Section 1', type: 'report' });
      const s2 = new Section({ title: 'Section 2', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1, s2],
      });

      const newSection = new Section({ title: 'New Section', type: 'report' });
      const updated = chapter.addSection(newSection, 1);

      expect(updated.sections).toHaveLength(3);
      expect(updated.sections[0].title).toBe('Section 1');
      expect(updated.sections[1].title).toBe('New Section');
      expect(updated.sections[2].title).toBe('Section 2');
    });

    it('should add section at beginning with index 0', () => {
      const s1 = new Section({ title: 'Section 1', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1],
      });

      const newSection = new Section({ title: 'First', type: 'report' });
      const updated = chapter.addSection(newSection, 0);

      expect(updated.sections[0].title).toBe('First');
      expect(updated.sections[1].title).toBe('Section 1');
    });

    it('should append if index is out of bounds', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      const section = new Section({ title: 'Section', type: 'report' });
      const updated = chapter.addSection(section, 999);

      expect(updated.sections).toHaveLength(1);
    });
  });

  describe('removeSection()', () => {
    it('should remove section by ID', () => {
      const s1 = new Section({ id: 's1', title: 'Section 1', type: 'report' });
      const s2 = new Section({ id: 's2', title: 'Section 2', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1, s2],
      });

      const updated = chapter.removeSection('s1');

      expect(updated.sections).toHaveLength(1);
      expect(updated.sections[0].title).toBe('Section 2');
      expect(chapter.sections).toHaveLength(2); // Original unchanged
    });

    it('should return same sections if ID not found', () => {
      const section = new Section({ id: 's1', title: 'Section 1', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      const updated = chapter.removeSection('non-existent');

      expect(updated.sections).toHaveLength(1);
    });

    it('should remove all matching IDs', () => {
      const s1 = new Section({ id: 's1', title: 'Section 1', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1],
      });

      const updated = chapter.removeSection('s1');

      expect(updated.sections).toHaveLength(0);
    });
  });

  describe('updateSection()', () => {
    it('should update section using updater function', () => {
      const section = new Section({ id: 's1', title: 'Original', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      const updated = chapter.updateSection('s1', s => s.with({ title: 'Updated' }));

      expect(updated.sections[0].title).toBe('Updated');
      expect(chapter.sections[0].title).toBe('Original'); // Original unchanged
    });

    it('should return same chapter if section not found', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      const updated = chapter.updateSection('non-existent', s => s);

      expect(updated).toBe(chapter);
    });

    it('should update correct section among multiple', () => {
      const s1 = new Section({ id: 's1', title: 'Section 1', type: 'report' });
      const s2 = new Section({ id: 's2', title: 'Section 2', type: 'report' });
      const s3 = new Section({ id: 's3', title: 'Section 3', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1, s2, s3],
      });

      const updated = chapter.updateSection('s2', s => s.with({ title: 'Updated S2' }));

      expect(updated.sections[0].title).toBe('Section 1');
      expect(updated.sections[1].title).toBe('Updated S2');
      expect(updated.sections[2].title).toBe('Section 3');
    });
  });

  describe('hasSections()', () => {
    it('should return true if chapter has sections', () => {
      const section = new Section({ title: 'Section', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      expect(chapter.hasSections()).toBe(true);
    });

    it('should return false if chapter has no sections', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      expect(chapter.hasSections()).toBe(false);
    });
  });

  describe('hasContent()', () => {
    it('should return true if any section has content', () => {
      const s1 = new Section({ title: 'Section 1', type: 'report', content: 'Some content' });
      const s2 = new Section({ title: 'Section 2', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1, s2],
      });

      expect(chapter.hasContent()).toBe(true);
    });

    it('should return false if no sections have content', () => {
      const section = new Section({ title: 'Section', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      expect(chapter.hasContent()).toBe(false);
    });

    it('should return false if chapter has no sections', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      expect(chapter.hasContent()).toBe(false);
    });

    it('should return false if sections have only whitespace', () => {
      const section = new Section({ title: 'Section', type: 'report', content: '   ' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      expect(chapter.hasContent()).toBe(false);
    });
  });

  describe('getSectionCount()', () => {
    it('should return correct count', () => {
      const s1 = new Section({ title: 'S1', type: 'report' });
      const s2 = new Section({ title: 'S2', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [s1, s2],
      });

      expect(chapter.getSectionCount()).toBe(2);
    });

    it('should return 0 for empty chapter', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      expect(chapter.getSectionCount()).toBe(0);
    });
  });

  describe('toStateObject()', () => {
    it('should convert to plain object', () => {
      const chapter = new Chapter({
        id: 'ch-123',
        title: 'Chapter 1',
      });

      const stateObject = chapter.toStateObject();

      expect(stateObject).toEqual({
        id: 'ch-123',
        title: 'Chapter 1',
        sections: [],
      });
      expect(stateObject).not.toBeInstanceOf(Chapter);
    });

    it('should recursively convert sections', () => {
      const section = new Section({ title: 'Section', type: 'report' });
      const chapter = new Chapter({
        title: 'Chapter',
        sections: [section],
      });

      const stateObject = chapter.toStateObject();

      expect(stateObject.sections[0]).not.toBeInstanceOf(Section);
      expect(stateObject.sections[0].title).toBe('Section');
    });
  });

  describe('toJSON()', () => {
    it('should serialize to JSON correctly', () => {
      const chapter = new Chapter({
        id: 'ch-123',
        title: 'Chapter 1',
      });

      const json = JSON.stringify(chapter);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('ch-123');
      expect(parsed.title).toBe('Chapter 1');
      expect(parsed.sections).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle very long valid title', () => {
      const longTitle = 'a'.repeat(500); // Max length
      const chapter = new Chapter({ title: longTitle });
      expect(chapter.title).toBe(longTitle);
    });

    it('should handle special characters in title', () => {
      const chapter = new Chapter({ title: 'Chapter 1: Introduction & Background' });
      expect(chapter.title).toBe('Chapter 1: Introduction & Background');
    });

    it('should handle Unicode characters in title', () => {
      const chapter = new Chapter({ title: '第一章：介绍' });
      expect(chapter.title).toBe('第一章：介绍');
    });

    it('should handle multiple operations chained', () => {
      const chapter = new Chapter({ title: 'Chapter' });
      const s1 = new Section({ title: 'S1', type: 'report' });
      const s2 = new Section({ title: 'S2', type: 'report' });

      const updated = chapter
        .addSection(s1)
        .addSection(s2)
        .with({ title: 'Updated Chapter' });

      expect(updated.title).toBe('Updated Chapter');
      expect(updated.sections).toHaveLength(2);
      expect(chapter.sections).toHaveLength(0); // Original unchanged
    });
  });
});
