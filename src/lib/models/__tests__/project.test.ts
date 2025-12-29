
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '@/hooks';
import { Project, Chapter, Section, defaultControls } from '@/lib/models';

// Reset store before each test
beforeEach(() => {
  act(() => {
    // Reset the store to its initial state before each test
    // This is a simplified reset. A real implementation might need a dedicated reset function in the store.
    useBuilderStore.setState({ project: new Project({}), hasUnsavedChanges: false });
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
    expect(project.meta.author).toBe('User');
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

  it('should add a new chapter immutably', () => {
    const project = new Project({});
    const newProject = project.addChapter(new Chapter({title: 'New Chapter'}));
    
    expect(project.content).toHaveLength(0); // Original is unchanged
    expect(newProject.content).toHaveLength(1);
    expect(newProject.content[0].title).toBe('New Chapter');
  });
  
  it('should correctly find a section by its ID', () => {
    const section = new Section({ id: 'sec-1', title: 'Find Me', type: 'report' });
    const project = new Project({ content: [new Chapter({ sections: [section] })] });
    
    const found = project.findSection('sec-1');
    expect(found).toBeDefined();
    expect(found?.section.title).toBe('Find Me');
    expect(found?.chapterId).toBeDefined();

    const notFound = project.findSection('sec-nonexistent');
    expect(notFound).toBeNull();
  });

  it('should correctly serialize to a plain JSON object', () => {
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

  describe('useBuilderStore Integration', () => {
    it('should load a project and allow updates', () => {
      const { result } = renderHook(() => useBuilderStore());
      const template = createSoftwareDesignTemplate();
      
      act(() => {
        result.current.loadProject(template);
      });
      
      expect(result.current.project?.name).toBe("System Design Document (IEEE 1016)");
      expect(result.current.project?.content.length).toBeGreaterThan(0);
      
      const firstSectionId = result.current.project!.content[0].sections[0].id;

      act(() => {
        result.current.updateProject(p => 
          p.updateChapter(p.content[0].id, c => 
            c.updateSection(firstSectionId, s => s.with({ title: "UPDATED TITLE" }))
          )
        );
      });

      const updatedProject = result.current.project;
      expect(updatedProject?.content[0].sections[0].title).toBe("UPDATED TITLE");
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
});
