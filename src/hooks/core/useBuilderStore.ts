// Replaced the file with a clean implementation below
'use client';

import { create } from 'zustand';
import { Project, type ProjectProperties } from '@/lib/models/project';

interface BuilderState {
  project: Project | null;
  loadProject: (projectData: ProjectProperties) => void;
  updateProject: (updater: (project: Project) => void) => void;
  newSession: () => void;
  // Local cache flags and helpers
  isLocalDirty: boolean;
  saveLocalCache: () => void;
  clearLocalCache: () => void;
  // Local cache utility methods
  getLocalCache: (projectId: string) => { savedProject: ProjectProperties; unsynced: boolean } | null;
  writeLocalCache: (project: Project, unsynced: boolean) => void;
  removeLocalCache: (projectId: string) => void;
  mergeLocalOrderInto: (projectData: ProjectProperties) => void;
}

const createNewTemporaryProject = (): Project => {
    return new Project({
        id: '', // No ID for a new, unsaved project
        userId: '', // Will be assigned on save
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: 'Untitled Project',
        projectIdea: '',
        sections: {},
        sectionsOrder: [],
        externalContext: [],
    });
};

const useBuilderStore = create<BuilderState>((set, get) => {
  // Helpers for localStorage keys and operations
  const storageKey = (projectId: string) => `arkan_project_${projectId}`;

  const readLocalCache = (projectId: string) => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(storageKey(projectId));
      if (!raw) return null;
      return JSON.parse(raw) as { savedProject: ProjectProperties; unsynced: boolean };
    } catch (e) {
      console.warn('Failed to read local cache', e);
      return null;
    }
  };

  const writeLocalCache = (project: Project, unsynced: boolean) => {
    try {
      if (typeof window === 'undefined') return;
      const payload = { savedProject: project.toStateObject(), unsynced };
      localStorage.setItem(storageKey(project.id), JSON.stringify(payload));
      localStorage.setItem('arkan_last_project_id', project.id);
    } catch (e) {
      console.warn('Failed to write project cache', e);
    }
  };

  const removeLocalCache = (projectId: string) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(storageKey(projectId));
    } catch (e) {
      console.warn('Failed to remove project cache', e);
    }
  };

  const mergeLocalOrderInto = (projectData: ProjectProperties) => {
    try {
      if (typeof window === 'undefined' || !projectData?.id) return;
      const cached = readLocalCache(projectData.id);
      if (cached?.savedProject?.sectionsOrder && (!projectData.sectionsOrder || projectData.sectionsOrder.length === 0)) {
        projectData.sectionsOrder = cached.savedProject.sectionsOrder;
      }
    } catch (e) {
      console.warn('Failed to merge local order into project data', e);
    }
  };

  // Attempt to rehydrate initial project from last project pointer
  let initialProject: Project | null = null;
  let initialIsLocalDirty = false;
  try {
    if (typeof window !== 'undefined') {
      const lastId = localStorage.getItem('arkan_last_project_id');
      if (lastId) {
        const cached = readLocalCache(lastId);
        if (cached && cached.savedProject) {
          initialProject = new Project(cached.savedProject);
          initialIsLocalDirty = !!cached.unsynced;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to rehydrate project from localStorage', e);
  }

  return {
    project: initialProject,
    isLocalDirty: initialIsLocalDirty,

    loadProject: (projectData: ProjectProperties) => {
      try {
        const cached = projectData?.id ? readLocalCache(projectData.id) : null;
        if (cached && cached.savedProject) {
          if (cached.unsynced) {
            // prefer local unsynced copy
            set({ project: new Project(cached.savedProject), isLocalDirty: true });
            return;
          }
          // merge order when server copy lacks it
          if (cached.savedProject.sectionsOrder && (!projectData.sectionsOrder || projectData.sectionsOrder.length === 0)) {
            projectData.sectionsOrder = cached.savedProject.sectionsOrder;
          }
        }
        if (typeof window !== 'undefined' && projectData?.id) {
          localStorage.setItem('arkan_last_project_id', projectData.id);
        }
      } catch (e) {
        console.warn('Failed while handling local cache during loadProject', e);
      }
      set({ project: new Project(projectData), isLocalDirty: false });
    },

    updateProject: (updater) => {
      const currentProject = get().project;
      if (!currentProject) return;
      const newProjectInstance = new Project(currentProject.toStateObject());
      updater(newProjectInstance);
      newProjectInstance.hasUnsavedChanges = true;
      set({ project: newProjectInstance, isLocalDirty: true });
      // persist locally
      writeLocalCache(newProjectInstance, true);
    },

    newSession: () => {
        if (typeof window !== 'undefined') {
            const lastId = localStorage.getItem('arkan_last_project_id');
            if (lastId) {
                localStorage.removeItem(storageKey(lastId));
                localStorage.removeItem('arkan_last_project_id');
            }
        }
        set({ project: createNewTemporaryProject(), isLocalDirty: false });
    },

    saveLocalCache: () => {
      const p = get().project;
      if (!p) return;
      writeLocalCache(p, !!p.hasUnsavedChanges);
      set({ isLocalDirty: !!p.hasUnsavedChanges });
    },

    clearLocalCache: () => {
      const p = get().project;
      if (!p) return;
      removeLocalCache(p.id);
      set({ isLocalDirty: false });
    },

    // utilities
    getLocalCache: (projectId: string) => readLocalCache(projectId),
    writeLocalCache: (project: Project, unsynced: boolean) => writeLocalCache(project, unsynced),
    removeLocalCache: (projectId: string) => removeLocalCache(projectId),
    mergeLocalOrderInto: (projectData: ProjectProperties) => mergeLocalOrderInto(projectData),
  };
});

export { useBuilderStore };
