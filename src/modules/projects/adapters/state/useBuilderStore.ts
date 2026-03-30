'use client';

import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { User } from '@/modules/users/domain/entities/User';
import { TocSection } from '@/modules/ai-content/domain/entities/TOC';;
import { LocalProjectService } from '@/modules/projects/adapters/local-storage/LocalProjectService';
import { container } from '@/infrastructure/di/container';
import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from '@/hooks/util/use-toast';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { projectFromFile } from '@/modules/projects/infrastructure/io/io';
import { v4 as uuidv4 } from 'uuid';

interface BuilderState {
    project: Project | null;
    userProfile: User | null; // Add userProfile to the store state
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    version: number; // To track project updates
    selectedFileId: string | null;
    comparisonSnapshotId: string | null;
    historyStack: ProjectProperties[];

    initializeStore: () => void;
    setUserProfile: (userProfile: User | null) => void; // Action to set the user profile
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => void | Project) => void;
    undo: () => void;
    updateProjectFromMarkdown: (markdown: string) => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocMarkdown: string) => void;
    selectFile: (fileId: string | null) => void;
    setComparisonSnapshotId: (snapshotId: string | null) => void;
}

const createNewTemporaryProject = (): Project => new Project({
    id: uuidv4(),
    meta: {
        author: 'User',
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    }
} as any);
const MAX_HISTORY_SIZE = 50;

const useBuilderStore = create<BuilderState>((set, get) => ({
    project: null,
    userProfile: null, // Initialize userProfile as null
    hasUnsavedChanges: false,
    isStoreInitialized: false,
    version: 0,
    selectedFileId: null,
    comparisonSnapshotId: null,
    historyStack: [],

    initializeStore: () => {
        if (get().isStoreInitialized) return;
        
        const load = async () => {
            const lastProjectId = localStorage.getItem('lastActiveProjectId');
            let projectToLoad: ProjectProperties | undefined;
            const service = container.resolve(LocalProjectService);
            if (lastProjectId) {
                projectToLoad = await service.getProject(lastProjectId);
            }
            
            if (projectToLoad) {
                set({ project: new Project(projectToLoad), isStoreInitialized: true, version: 0, selectedFileId: null });
            } else {
                set({ project: createNewTemporaryProject(), isStoreInitialized: true, version: 0, selectedFileId: null });
            }
        };
        
        load();
    },

    selectFile: (fileId) => set({ selectedFileId: fileId }),
    setComparisonSnapshotId: (snapshotId: string | null) => set({ comparisonSnapshotId: snapshotId }),

    setUserProfile: (userProfile) => set({ userProfile }),

    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

    updateProject: (updater) => {
        const currentProject = get().project;
        const currentHistory = get().historyStack;

        set(state => {
            if (!state.project) return {};
            
            // Push to history before updating
            const newHistory = [...currentHistory, state.project.toStateObject()].slice(-MAX_HISTORY_SIZE);

            const newProject = new Project(state.project.toStateObject());
            const result = updater(newProject);
            const finalProject = result instanceof Project ? result : newProject;
            
            const service = container.resolve(LocalProjectService);
            service.saveProject(finalProject.toStateObject()); 
            localStorage.setItem('lastActiveProjectId', finalProject.id);

            return { 
                project: finalProject, 
                historyStack: newHistory,
                hasUnsavedChanges: true,
                version: state.version + 1 
            };
        });
    },

    undo: () => {
        const history = get().historyStack;
        if (history.length === 0) return;

        const previousState = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        const restoredProject = new Project(previousState);
        const service = container.resolve(LocalProjectService);
        service.saveProject(restoredProject.toStateObject());

        set({ 
            project: restoredProject, 
            historyStack: newHistory,
            hasUnsavedChanges: true,
            version: get().version + 1 
        });

        toast({ title: 'Undo Successful', description: 'Reverted to previous state.' });
    },

    updateProjectFromMarkdown: (markdown: string) => {
        const { parseMarkdownToContent } = require('@/modules/projects/infrastructure/io/markdown-parser');
        get().updateProject(p => p.updateProjectFromMarkdown(markdown, parseMarkdownToContent));
    },

    loadProject: (projectData) => {
        const newProject = projectData instanceof Project ? projectData : new Project(projectData);
        localStorage.setItem('lastActiveProjectId', newProject.id);
        const service = container.resolve(LocalProjectService);
        service.saveProject(newProject.toStateObject());
        set({ project: newProject, hasUnsavedChanges: false, version: 0, selectedFileId: null });
    },

    loadProjectFromFile: async (file: File) => {
        try {
            const newProject = await projectFromFile(file); // Use the new service function
            get().loadProject(newProject.toStateObject());
            toast({ title: 'Project Loaded', description: `Successfully loaded "${newProject.name}".` });
        } catch (err) {
            toast({ title: 'Load Failed', description: (err as Error).message, variant: 'destructive' });
        }
    },

    newSession: () => {
        if (get().hasUnsavedChanges) {
            if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to start a new session? Any unsaved changes will be lost.')) {
                return;
            }
        }
        
        const currentProject = get().project;
        if (currentProject) {
            set({ project: createNewTemporaryProject(), hasUnsavedChanges: false, version: 0, selectedFileId: null });
            localStorage.removeItem('lastActiveProjectId');

            const editor = useEditorStore.getState().activeEditor;
            if (editor && !editor.isDestroyed) {
                editor.commands.clearContent(true);
            }
            toast({ title: 'New Project Started', description: 'Your workspace has been cleared.' });
        }
    },

    applyTableOfContents: (tocMarkdown: string) => {
        get().updateProject(p => {
          if (!p) return p;
          const newContent = p.parseAndSetContentFromToc(tocMarkdown);
          return p.with({ content: [...newContent] });
        });
    
        toast({
          title: 'Table of Contents Applied',
          description: 'The project structure has been updated.',
        });
    },
}));

export function useInitializeBuilderStore() {
    const { initializeStore, isStoreInitialized } = useBuilderStore();
    
    useEffect(() => {
        if (!isStoreInitialized) {
            initializeStore();
        }
    }, [initializeStore, isStoreInitialized]);

    return isStoreInitialized;
};

export { useBuilderStore };
