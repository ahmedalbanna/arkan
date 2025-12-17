
import { Project } from '../project';
import { Chapter } from '../chapter';
import { Section } from '../section';
import { defaultControls } from '../section';

describe('Project Model', () => {
  it('should initialize with default values', () => {
    const project = new Project({});
    expect(project.name).toBe('Untitled Project');
    expect(project.projectDescription).toBe('Simple Project');
    expect(project.chapters).toEqual([]);
    expect(project.externalContext).toEqual([]);
    expect(project.id).toBeDefined();
  });

  it('should initialize with provided properties', () => {
    const projectData = {
      id: 'proj-1',
      name: 'Test Project',
      projectDescription: 'A test description.',
      chapters: [new Chapter({ id: 'ch-1', title: 'Chapter 1', sections: [] })],
    };
    const project = new Project(projectData);
    expect(project.id).toBe('proj-1');
    expect(project.name).toBe('Test Project');
    expect(project.chapters).toHaveLength(1);
    expect(project.chapters[0]).toBeInstanceOf(Chapter);
    expect(project.chapters[0].title).toBe('Chapter 1');
  });

  // --- Chapter Management ---
  it('should add a new chapter', () => {
    const project = new Project({});
    project.addChapter('New Chapter');
    expect(project.chapters).toHaveLength(1);
    expect(project.chapters[0].title).toBe('New Chapter');
  });

  it('should remove a chapter', () => {
    const project = new Project({ chapters: [new Chapter({ id: 'ch-1', title: 'Chapter 1' })] });
    project.removeChapter('ch-1');
    expect(project.chapters).toHaveLength(0);
  });

  it('should retrieve a chapter by its ID', () => {
    const chapter = new Chapter({ id: 'ch-1', title: 'Find Me' });
    const project = new Project({ chapters: [chapter] });
    const found = project.getChapter('ch-1');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Find Me');
  });

  // --- Section Management ---
  it('should add a section to a chapter', () => {
    const project = new Project({});
    const chapterId = project.addChapter('Chapter 1');
    project.addSectionToChapter(chapterId, 'New Section');

    expect(project.chapters[0].sections).toHaveLength(1);
    expect(project.chapters[0].sections[0].title).toBe('New Section');
  });

  it('should get a section by its ID', () => {
    const section = new Section({ id: 'sec-1', title: 'Section 1', type: 'report' });
    const project = new Project({ chapters: [new Chapter({ sections: [section] })] });
    const found = project.getSection('sec-1');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Section 1');
  });

  it('should update a section\'s content', () => {
    const section = new Section({ id: 'sec-1', title: 'Section 1', type: 'report', content: 'Old' });
    const project = new Project({ chapters: [new Chapter({ sections: [section] })] });
    project.updateSectionContent('sec-1', 'New Content');
    expect(project.getSection('sec-1')?.content).toBe('New Content');
  });
  
  it('should move a section up within a chapter', () => {
    const project = new Project({
      chapters: [
        new Chapter({
          id: 'ch1',
          sections: [
            new Section({ id: 's1', title: 'Sec 1', type: 'report' }),
            new Section({ id: 's2', title: 'Sec 2', type: 'report' }),
          ],
        }),
      ],
    });

    project.moveSectionUp('s2');
    expect(project.chapters[0].sections.map(s => s.id)).toEqual(['s2', 's1']);
  });

  it('should move a section down within a chapter', () => {
    const project = new Project({
      chapters: [
        new Chapter({
          id: 'ch1',
          sections: [
            new Section({ id: 's1', title: 'Sec 1', type: 'report' }),
            new Section({ id: 's2', title: 'Sec 2', type: 'report' }),
          ],
        }),
      ],
    });

    project.moveSectionDown('s1');
    expect(project.chapters[0].sections.map(s => s.id)).toEqual(['s2', 's1']);
  });

  it('should move a section between chapters', () => {
    const project = new Project({
      chapters: [
        new Chapter({
          id: 'ch1', title: 'Chapter 1',
          sections: [new Section({ id: 's1', title: 'Sec 1', type: 'report' })],
        }),
        new Chapter({
          id: 'ch2', title: 'Chapter 2',
          sections: [],
        }),
      ],
    });

    project.moveSectionToChapter('s1', 'ch1', 'ch2');
    expect(project.getChapter('ch1')?.sections).toHaveLength(0);
    expect(project.getChapter('ch2')?.sections).toHaveLength(1);
    expect(project.getChapter('ch2')?.sections[0].id).toBe('s1');
  });

  // --- Serialization ---
  it('should correctly serialize to a plain object', () => {
    const project = new Project({
        id: 'proj-123',
        name: 'Serialization Test',
        chapters: [
            new Chapter({
                id: 'ch-123',
                title: 'Chapter One',
                sections: [
                    new Section({
                        id: 'sec-123',
                        title: 'Section One',
                        type: 'report',
                        content: 'Hello World',
                        controls: { ...defaultControls, formality: 75 },
                    }),
                ],
            }),
        ],
    });

    const jsonObject = project.toJSON();

    expect(jsonObject.id).toBe('proj-123');
    expect(jsonObject.name).toBe('Serialization Test');
    expect(Array.isArray(jsonObject.chapters)).toBe(true);
    expect(jsonObject.chapters[0].title).toBe('Chapter One');
    // Ensure nested objects are also plain objects, not class instances
    expect(jsonObject.chapters[0]).not.toBeInstanceOf(Chapter);
    expect(jsonObject.chapters[0].sections[0]).not.toBeInstanceOf(Section);
    expect(jsonObject.chapters[0].sections[0].content).toBe('Hello World');
    expect(jsonObject.chapters[0].sections[0].controls?.formality).toBe(75);
  });
});
