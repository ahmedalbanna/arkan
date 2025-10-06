
"use client";

import { toast } from "@/hooks";
import { Project, type ProjectProperties } from "@/lib/models/project";
import { browserCacheManager } from "@/lib/services/browser-cache-manager";
import type { ContextFileType, ReportGenerationMode, SavedProject } from "@/lib/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// The new state is dramatically simplified
export interface BuilderState {
  project: Project | null;
  hasUnsavedChanges: boolean;
}

interface BuilderActions {
  newSession: () => void;
  loadProject: (savedProject: SavedProject) => void;
  setProject: (project: Project) => void; // To update the project instance
  updateProject: (updater: (project: Project) => void) => void;
  setHasUnsavedChanges: (status: boolean) => void;
  // Add new actions for direct manipulation, which will call the updater
  addExternalContext: (fileName: string, content: string, type: ContextFileType) => void;
  replaceExternalContext: (index: number, newItem: { fileName: string, content: string, type: ContextFileType }) => void;
  // Report Generation Mode actions
  setReportGenerationMode: (mode: ReportGenerationMode) => void;
  getCurrentReportGenerationMode: () => ReportGenerationMode;
  // Browser cache management
  loadTempProject: (projectId: string) => boolean;
  getAllTempProjects: () => Project[];
  clearAllTempProjects: () => void;
  getCacheStats: () => { totalCachedProjects: number; expiredProjects: number; activeProjects: number; storageSize: number };
}

const initialState: BuilderState = {
  project: null,
  hasUnsavedChanges: false,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      newSession: () => {
        const newProject = new Project({
          id: `temp-${Date.now()}`,
          userId: 'anonymous',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as ProjectProperties);

        // حفظ المشروع الجديد في المتصفح
        browserCacheManager.saveTempProject(newProject);

        set({ project: newProject, hasUnsavedChanges: false });
        toast({
          title: "New Session Started",
          description: "All project content has been cleared.",
        });
      },

      loadProject: (savedProject) => {
        const project = new Project(savedProject as ProjectProperties);
        set({
          project: project,
          hasUnsavedChanges: false,
        });
        toast({
          title: "Project Loaded",
          description: `Successfully loaded "${project.name || "project"}".`,
        });
      },

      setProject: (project) => {
        set({ project, hasUnsavedChanges: true });
      },

      updateProject: (updater) => {
        const currentProject = get().project ?? new Project({
          id: `temp-${Date.now()}`,
          userId: 'anonymous',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as ProjectProperties);

        updater(currentProject);

        // إنشاء مثيل جديد وتحديث الحالة
        const updatedProject = new Project(currentProject.toJSON() as ProjectProperties);

        // حفظ المشروع المحدث في المتصفح إذا كان مؤقتاً
        if (updatedProject.id.startsWith('temp-')) {
          browserCacheManager.saveTempProject(updatedProject);
        }

        set({ project: updatedProject, hasUnsavedChanges: true });
      },

      addExternalContext: (fileName: string, content: string, type: ContextFileType) => {
        get().updateProject(p => p.addExternalContext(fileName, content, type));
      },

      replaceExternalContext: (index: number, newItem: { fileName: string, content: string, type: ContextFileType }) => {
        get().updateProject(p => {
          if (p.externalContext) {
            p.externalContext[index] = newItem;
          }
        });
      },

      // Report Generation Mode methods
      setReportGenerationMode: (mode: ReportGenerationMode) => {
        get().updateProject(p => p.setReportGenerationMode(mode));
        toast({
          title: "تم تحديث نوع التقرير",
          description: `النوع المحدد الآن: ${mode === 'traditional' ? 'تقليدي' : mode === 'intelligent' ? 'ذكي' : 'مختلط'}`,
        });
      },

      getCurrentReportGenerationMode: () => {
        return get().project?.getReportGenerationMode() ?? 'traditional';
      },

      // Browser cache management functions
      loadTempProject: (projectId: string) => {
        const tempProject = browserCacheManager.getTempProject(projectId);
        if (tempProject) {
          set({ project: tempProject, hasUnsavedChanges: false });
          toast({
            title: "Project Loaded",
            description: `Successfully loaded "${tempProject.name || "project"}" from cache.`,
          });
          return true;
        }
        return false;
      },

      getAllTempProjects: () => {
        return browserCacheManager.getAllTempProjects();
      },

      clearAllTempProjects: () => {
        browserCacheManager.clearAllTempProjects();
        toast({
          title: "Cache Cleared",
          description: "All temporary projects have been cleared from browser cache.",
        });
      },

      getCacheStats: () => {
        return browserCacheManager.getCacheStats();
      },

      setHasUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),
    }),
    {
      name: "arkan-builder-state-v3",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        project: state.project?.toJSON(),
      }),

      merge: (persistedState: any, currentState) => {
        if (persistedState?.project) {
          const project = new Project(persistedState.project as ProjectProperties);
          return {
            ...currentState,
            project,
            hasUnsavedChanges: false,
          };
        }
        return currentState;
      },
    }
  )
);
