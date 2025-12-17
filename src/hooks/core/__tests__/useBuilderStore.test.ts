import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '../useBuilderStore';
import { Project, Chapter, Section } from '@/lib/models';

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
    expect(result.current.project?.chapters).toHaveLength(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should load an existing project into the store', () => {
    const { result } = renderHook(() => useBuilderStore());

    const projectData = {
      id: 'test-project-1',
      name: 'My Test Project',
      chapters: [{ id: 'ch1', title: 'Chapter 1', sections: [] }],
    };

    act(() => {
      result.current.loadProject(projectData);
    });

    expect(result.current.project?.id).toBe('test-project-1');
    expect(result.current.project?.name).toBe('My Test Project');
    expect(result.current.project?.chapters).toHaveLength(1);
    expect(result.current.project?.chapters[0]).toBeInstanceOf(Chapter);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should update the project state and mark changes as unsaved', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.updateProject((p) => {
        p.name = 'Updated Project Name';
      });
    });

    expect(result.current.project?.name).toBe('Updated Project Name');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });
  
  it('should correctly update a section\'s content', () => {
    const { result } = renderHook(() => useBuilderStore());
    const initialProject = new Project({
      chapters: [new Chapter({ id: 'ch1', title: 'Chapter 1', sections: [new Section({ id: 'sec1', title: 'Section 1', type: 'report', content: 'Initial content' })] })]
    });

    act(() => {
      result.current.loadProject(initialProject.toStateObject());
    });

    act(() => {
      result.current.updateProject(p => {
        const section = p.getSection('sec1');
        if (section) {
          section.content = 'Updated content';
        }
      });
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
      result.current.updateProject(p => {
        p.addChapter('My First Chapter');
      });
    });

    expect(result.current.project?.chapters).toHaveLength(1);
    expect(result.current.project?.chapters[0].title).toBe('My First Chapter');
    const chapterId = result.current.project!.chapters[0].id;

    act(() => {
      result.current.updateProject(p => {
        p.removeChapter(chapterId);
      });
    });

    expect(result.current.project?.chapters).toHaveLength(0);
  });
});
