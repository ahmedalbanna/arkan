
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '@/hooks';
import { Project, Chapter, Section, defaultControls, type ProjectProperties } from '@/lib/types';

// Mock function to create a software design template for testing
const createSoftwareDesignTemplate = (): ProjectProperties => ({
    id: 'sdd-template',
    name: "System Design Document (IEEE 1016)",
    content: [
      {
        id: 'ch-intro',
        title: "1. Introduction",
        sections: [
          {
            id: 'sec-purpose',
            title: "Design Purpose",
            type: 'report',
            prompt: "Define the specific purpose of this design document.",
            controls: { formality: 90, tone: 'professional' },
          }
        ]
      }
    ]
});


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
    expect((project.content[0] as Chapter).title).toBe('Chapter 1');
  });

  it('should add a new chapter immutably', () => {
    const project = new Project({});
    const newProject = project.addChapter('New Chapter');
    
    expect(project.content).toHaveLength(0); // Original is unchanged
    expect(newProject.content).toHaveLength(1);
    expect((newProject.content[0] as Chapter).title).toBe('New Chapter');
  });
  
  it('should correctly find a section by its ID', () => {
    const section = new Section({ id: 'sec-1', title: 'Find Me', type: 'report' });
    const project = new Project({ content: [new Chapter({ title: 'Chapter 1', sections: [section] })] });
    
    const found = project.findSection('sec-1');
    expect(found).toBeDefined();
    expect(found?.section.title).toBe('Find Me');
    // The chapterId is part of the chapter, not the returned find result
    expect(found?.chapter.id).toBeDefined();

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
    
    const chapter = jsonObject.content?.[0] as any;
    expect(chapter.title).toBe('Chapter One');
    expect(chapter).not.toBeInstanceOf(Chapter);

    const section = chapter.sections[0];
    expect(section).not.toBeInstanceOf(Section);
    expect(section.content).toBe('Hello World');
    expect(section.controls?.formality).toBe(75);
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
      
      const firstSectionId = (result.current.project!.content[0] as Chapter).sections[0].id;

      act(() => {
        result.current.updateProject(p => 
          p.updateChapter((p.content[0] as Chapter).id, c => 
            c.updateSection(firstSectionId, s => s.with({ title: "UPDATED TITLE" }))
          )
        );
      });

      const updatedProject = result.current.project;
      expect((updatedProject?.content[0] as Chapter).sections[0].title).toBe("UPDATED TITLE");
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
});
