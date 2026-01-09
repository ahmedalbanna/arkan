
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '../useBuilderStore';
import { Project, Chapter, Section, defaultControls, type ProjectProperties } from '@/lib/models';

const createSoftwareDesignTemplate = (): ProjectProperties => ({
    id: 'sdd-template',
    name: "System Design Document (IEEE 1016)",
    content: [
      new Chapter({
        id: 'ch-intro',
        title: "1. Introduction",
        sections: [
          new Section({
            id: 'sec-purpose',
            title: "Design Purpose",
            type: 'report',
            prompt: "Define the specific purpose of this design document.",
            controls: { formality: 90, tone: 'professional' },
          })
        ]
      })
    ]
});


// Reset store before each test
beforeEach(() => {
  act(() => {
    // Reset the store to its initial state before each test
    useBuilderStore.getState().newSession();
  });
});

describe('useBuilderStore', () => {
  it('should initialize with a default, empty project', () => {
    const { result } = renderHook(() => useBuilderStore());

    expect(result.current.project).toBeInstanceOf(Project);
    expect(result.current.project?.name).toBe('Untitled Project');
    expect(result.current.project?.content).toHaveLength(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should load an existing project into the store', () => {
    const { result } = renderHook(() => useBuilderStore());

    const projectData = {
      id: 'test-project-1',
      name: 'My Test Project',
      content: [new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [] })],
    };

    act(() => {
      result.current.loadProject(projectData);
    });

    expect(result.current.project?.id).toBe('test-project-1');
    expect(result.current.project?.name).toBe('My Test Project');
    expect(result.current.project?.content).toHaveLength(1);
    expect(result.current.project?.content[0]).toBeInstanceOf(Chapter);
    expect((result.current.project?.content[0] as Chapter).title).toBe('Chapter 1');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should update the project state and mark changes as unsaved', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.updateProject((p) => p.with({ name: 'Updated Project Name' }));
    });

    expect(result.current.project?.name).toBe('Updated Project Name');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });
  
  it('should correctly update a section\'s content', () => {
    const { result } = renderHook(() => useBuilderStore());
    const initialProject = new Project({
      content: [new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [new Section({ id: 'sec1', title: 'Section 1', type: 'report', content: 'Initial content' })] })]
    });

    act(() => {
      result.current.loadProject(initialProject.toStateObject());
    });

    act(() => {
      result.current.updateProject(p => p.updateSection('sec1', s => s.with({ content: 'Updated content' })));
    });

    expect(result.current.project?.getSection('sec1')?.content).toBe('Updated content');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should reset the session to a new empty project', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    // Load a project first
    act(() => {
      result.current.loadProject({ id: 'test-id', name: 'Old Project' });
    });
    
    expect(result.current.project?.name).toBe('Old Project');

    // Start a new session
    act(() => {
      result.current.newSession();
    });

    expect(result.current.project?.name).toBe('Untitled Project');
    expect(result.current.project?.id).not.toBe('test-id');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should manage external context files', () => {
    const { result } = renderHook(() => useBuilderStore());
    const file = { fileName: 'test.txt', content: 'hello', type: 'context' as const };
    
    act(() => {
      result.current.updateProject(p => p.addExternalContext(file));
    });

    expect(result.current.project?.externalContext).toHaveLength(1);
    expect(result.current.project?.externalContext[0].fileName).toBe('test.txt');

    act(() => {
      result.current.updateProject(p => p.removeExternalContext(0));
    });

    expect(result.current.project?.externalContext).toHaveLength(0);
  });

  it('should add and remove chapters', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.updateProject(p => p.addChapter('My First Chapter'));
    });

    expect(result.current.project?.content).toHaveLength(1);
    expect((result.current.project?.content[0] as Chapter).title).toBe('My First Chapter');
    const chapterId = result.current.project!.content[0].id;

    act(() => {
      result.current.updateProject(p => p.removeChapter(chapterId));
    });

    expect(result.current.project?.content).toHaveLength(0);
  });

  it('should correctly find a section by its ID', () => {
    const section = new Section({ id: 'sec-1', title: 'Find Me', type: 'report' });
    const project = new Project({ content: [new Chapter({ title: 'Chapter 1', sections: [section] })] });
    
    const found = project.findSection('sec-1');
    expect(found).toBeDefined();
    expect(found?.section.title).toBe('Find Me');
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
    
    const chapter = jsonObject.content![0] as any;
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
