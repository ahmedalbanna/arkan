/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '../useBuilderStore';
import { Project } from '@/lib/models';

// Mock dependencies
jest.mock('@/services/local-project-service', () => ({
  localProjectService: {
    getProject: jest.fn(),
    saveProject: jest.fn(() => Promise.resolve()),
    deleteProject: jest.fn(() => Promise.resolve()),
    getAllProjects: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../use-editor-store', () => ({
  useEditorStore: {
    getState: jest.fn(() => ({ activeEditor: null })),
  },
}));

describe('useBuilderStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset the store state
    const { result } = renderHook(() => useBuilderStore());
    act(() => {
      result.current.newSession();
    });
  });

  describe('initializeStore', () => {
    it('should initialize with a new project if no stored project', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.initializeStore();
      });

      expect(result.current.project).toBeInstanceOf(Project);
      expect(result.current.isStoreInitialized).toBe(true);
    });

    it('should not reinitialize if already initialized', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.initializeStore();
      });

      const firstProject = result.current.project;

      act(() => {
        result.current.initializeStore();
      });

      expect(result.current.project).toBe(firstProject);
    });
  });

  describe('updateProject', () => {
    it('should update project immutably', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.initializeStore();
      });

      const originalProject = result.current.project;

      act(() => {
        result.current.updateProject(p => p.with({ name: 'New Project Name' }));
      });

      expect(result.current.project).not.toBe(originalProject);
      expect(result.current.project?.name).toBe('New Project Name');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should increment version on update', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.initializeStore();
      });

      const initialVersion = result.current.version;

      act(() => {
        result.current.updateProject(p => p.with({ name: 'Updated' }));
      });

      expect(result.current.version).toBe(initialVersion + 1);
    });

    it('should handle updater functions that return void', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.initializeStore();
      });

      act(() => {
        result.current.updateProject(p => {
          p.name = 'Modified'; // Direct mutation (not recommended but handled)
        });
      });

      expect(result.current.project).toBeInstanceOf(Project);
    });
  });

  describe('loadProject', () => {
    it('should load a new project', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const projectData = {
        id: 'test-project-id',
        name: 'Test Project',
        content: [],
      };

      act(() => {
        result.current.loadProject(projectData);
      });

      expect(result.current.project?.id).toBe('test-project-id');
      expect(result.current.project?.name).toBe('Test Project');
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.version).toBe(0);
    });

    it('should reset selectedFileId when loading project', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.selectFile('some-file-id');
      });

      expect(result.current.selectedFileId).toBe('some-file-id');

      act(() => {
        result.current.loadProject({ id: 'new-project' });
      });

      expect(result.current.selectedFileId).toBeNull();
    });
  });

  describe('setHasUnsavedChanges', () => {
    it('should update unsaved changes flag', () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setHasUnsavedChanges(true);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.setHasUnsavedChanges(false);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('selectFile', () => {
    it('should update selected file ID', () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.selectFile('file-123');
      });

      expect(result.current.selectedFileId).toBe('file-123');

      act(() => {
        result.current.selectFile(null);
      });

      expect(result.current.selectedFileId).toBeNull();
    });
  });

  describe('setUserProfile', () => {
    it('should update user profile', () => {
      const { result } = renderHook(() => useBuilderStore());

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      } as any;

      act(() => {
        result.current.setUserProfile(mockUser);
      });

      expect(result.current.userProfile).toBe(mockUser);
    });
  });

  describe('newSession', () => {
    it('should create a new empty project', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.loadProject({ id: 'old-project', name: 'Old Project' });
      });

      const oldProject = result.current.project;

      // Mock window.confirm to always return true
      global.confirm = jest.fn(() => true);

      act(() => {
        result.current.newSession();
      });

      expect(result.current.project).not.toBe(oldProject);
      expect(result.current.project?.id).not.toBe('old-project');
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.version).toBe(0);
    });

    it('should not create new session if user cancels', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.loadProject({ id: 'old-project' });
        result.current.setHasUnsavedChanges(true);
      });

      const oldProject = result.current.project;

      // Mock window.confirm to return false
      global.confirm = jest.fn(() => false);

      act(() => {
        result.current.newSession();
      });

      expect(result.current.project).toBe(oldProject);
    });
  });
});
