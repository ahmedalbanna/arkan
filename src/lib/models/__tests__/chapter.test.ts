
import { Chapter, Section } from '@/lib/types';

describe('Chapter Model', () => {
  it('should initialize with a title and empty sections', () => {
    const chapter = new Chapter({ title: 'Test Chapter' });
    expect(chapter.title).toBe('Test Chapter');
    expect(chapter.sections).toEqual([]);
    expect(chapter.id).toBeDefined();
  });

  it('should add a section immutably', () => {
    const chapter = new Chapter({ title: 'Test Chapter' });
    const section = new Section({ title: 'New Section', type: 'report' });
    const newChapter = chapter.addSection(section);

    expect(chapter.sections).toHaveLength(0); // Original is unchanged
    expect(newChapter.sections).toHaveLength(1);
    expect(newChapter.sections[0].title).toBe('New Section');
  });

  it('should remove a section immutably', () => {
    const section1 = new Section({ id: 's1', title: 'Section 1', type: 'report' });
    const section2 = new Section({ id: 's2', title: 'Section 2', type: 'report' });
    const chapter = new Chapter({ title: 'Test Chapter', sections: [section1, section2] });
    
    const newChapter = chapter.removeSection('s1');

    expect(chapter.sections).toHaveLength(2); // Original is unchanged
    expect(newChapter.sections).toHaveLength(1);
    expect(newChapter.sections[0].id).toBe('s2');
  });

  it('should update a section immutably', () => {
    const section = new Section({ id: 's1', title: 'Original Title', type: 'report' });
    const chapter = new Chapter({ title: 'Test Chapter', sections: [section] });
    
    const newChapter = chapter.updateSection('s1', s => s.with({ title: 'Updated Title' }));

    expect(chapter.sections[0].title).toBe('Original Title'); // Original is unchanged
    expect(newChapter.sections[0].title).toBe('Updated Title');
  });

  it('should return the same chapter instance if section to update is not found', () => {
    const section = new Section({ id: 's1', title: 'Original Title', type: 'report' });
    const chapter = new Chapter({ title: 'Test Chapter', sections: [section] });
    
    const newChapter = chapter.updateSection('non-existent-id', s => s.with({ title: 'Updated Title' }));

    expect(newChapter).toBe(chapter); // Should return the original chapter instance
  });

  it('should serialize to a plain object', () => {
    const section = new Section({ title: 'Section', type: 'report', content: 'content' });
    const chapter = new Chapter({ title: 'Chapter', sections: [section] });
    const stateObject = chapter.toStateObject();

    expect(stateObject.title).toBe('Chapter');
    expect(stateObject.sections).toHaveLength(1);
    expect(stateObject.sections?.[0]).not.toBeInstanceOf(Section);
    expect(stateObject.sections?.[0].title).toBe('Section');
  });
});
