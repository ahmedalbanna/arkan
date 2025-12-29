import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '@/hooks';
import { Project, Chapter, Section, defaultControls } from '@/lib/models';

// Reset store before each test
beforeEach(() => {
  act(() => {
    // Reset the store to its initial state before each test
    useBuilderStore.getState().newSession();
  });
});

describe('Project Model', () => {
  it('should initialize with default values', () => {
    const project = new Project({});
    expect(project.name).toBe('Untitled Project');
    expect(project.description).toBe('');
    expect(project.content).toEqual([]);
    expect(project.externalContext).toEqual([]);
    expect(project.id).toBeDefined();
  });

  it('should initialize with provided properties', () => {
    const projectData = {
      id: 'proj-1',
      name: 'Test Project',
      content: [new Chapter({ id: 'ch-1', title: 'Chapter 1', sections: [] })],
    };
    const project = new Project(projectData);
    expect(project.id).toBe('proj-1');
    expect(project.name).toBe('Test Project');
    expect(project.content).toHaveLength(1);
    expect(project.content[0]).toBeInstanceOf(Chapter);
    expect(project.content[0].title).toBe('Chapter 1');
  });

  // --- Chapter Management ---
  it('should add a new chapter', () => {
    let project = new Project({});
    project = project.addChapter(new Chapter({title: 'New Chapter'}));
    expect(project.content).toHaveLength(1);
    expect(project.content[0].title).toBe('New Chapter');
  });
  
  it('should get a section by its ID regardless of chapter', () => {
    const section = new Section({ id: 'sec-1', title: 'Find Me', type: 'report' });
    const project = new Project({ content: [new Chapter({ sections: [section] })] });
    const found = project.allSections.find(s => s.id === 'sec-1');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Find Me');
  });

  // --- Serialization ---
  it('should correctly serialize to a plain object', () => {
    const project = new Project({
        id: 'proj-123',
        name: 'Serialization Test',
        content: [
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
    expect(Array.isArray(jsonObject.content)).toBe(true);
    expect(jsonObject.content[0].title).toBe('Chapter One');
    // Ensure nested objects are also plain objects, not class instances
    expect(jsonObject.content[0]).not.toBeInstanceOf(Chapter);
    expect(jsonObject.content[0].sections[0]).not.toBeInstanceOf(Section);
    expect(jsonObject.content[0].sections[0].content).toBe('Hello World');
    expect(jsonObject.content[0].sections[0].controls?.formality).toBe(75);
  });
});
