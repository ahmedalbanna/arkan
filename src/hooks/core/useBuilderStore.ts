'use client';

import { Chapter, Project, Section, TocSection, type ProjectProperties, User } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from '../util/use-toast';
import { useEditorStore } from './use-editor-store';
import { projectFromFile } from '@/lib/project/io'; // Import from new location

/**
 * Builder Store State Interface
 * 
 * Central state management for the Builder/Report Mode application.
 * Manages project data, user profile, and UI state.
 */
interface BuilderState {
    /** Current active project */
    project: Project | null;
    
    /** Current user profile */
    userProfile: User | null;
    
    /** Flag indicating if there are unsaved changes */
    hasUnsavedChanges: boolean;
    
    /** Flag indicating if the store has been initialized from localStorage */
    isStoreInitialized: boolean;
    
    /** Version counter for tracking project updates (optimistic updates) */
    version: number;
    
    /** Currently selected file ID for file manager */
    selectedFileId: string | null;

    /** Initialize the store from localStorage */
    initializeStore: () => void;
    
    /** Set the current user profile */
    setUserProfile: (userProfile: User | null) => void;
    
    /** Update the unsaved changes flag */
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    
    /**
     * Update the project immutably
     * @param updater - Function that receives the current project and returns updated project or void
     */
    updateProject: (updater: (project: Project) => void | Project) => void;
    
    /**
     * Update project structure from markdown content
     * @param markdown - Markdown content to parse and apply
     */
    updateProjectFromMarkdown: (markdown: string) => void;
    
    /**
     * Load a project from data object
     * @param projectData - Project properties to load
     */
    loadProject: (projectData: ProjectProperties) => void;
    
    /**
     * Load a project from a file (JSON)
     * @param file - File object to load
     */
    loadProjectFromFile: (file: File) => Promise<void>;
    
    /** Create a new empty project session */
    newSession: () => void;
    
    /**
     * Apply table of contents markdown to project structure
     * @param tocMarkdown - Markdown formatted table of contents
     */
    applyTableOfContents: (tocMarkdown: string) => void;
    
    /**
     * Select a file in the file manager
     * @param fileId - File ID to select, or null to deselect
     */
    selectFile: (fileId: string | null) => void;
}

const createNewTemporaryProject = (): Project => new Project({});

const useBuilderStore = create<BuilderState>((set, get) => ({
    project: null,
    userProfile: null, // Initialize userProfile as null
    hasUnsavedChanges: false,
    isStoreInitialized: false,
    version: 0,
    selectedFileId: null,

    initializeStore: () => {
        if (get().isStoreInitialized) return;
        
        const load = async () => {
            const lastProjectId = localStorage.getItem('lastActiveProjectId');
            let projectToLoad: ProjectProperties | undefined;
            if (lastProjectId) {
                projectToLoad = await localProjectService.getProject(lastProjectId);
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

    setUserProfile: (userProfile) => set({ userProfile }),

    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

    updateProject: (updater) => {
        set(state => {
            if (!state.project) return {};
            const newProject = new Project(state.project.toStateObject());
            const result = updater(newProject);
            const finalProject = result instanceof Project ? result : newProject;
            
            // Save asynchronously without blocking UI
            localProjectService.saveProject(finalProject.toStateObject()).catch(err => {
                console.error('Failed to save project to local storage:', err);
            });
            localStorage.setItem('lastActiveProjectId', finalProject.id);

            return { 
                project: finalProject, 
                hasUnsavedChanges: true,
                version: state.version + 1 
            };
        });
    },

    updateProjectFromMarkdown: (markdown: string) => {
        get().updateProject(p => p.updateProjectFromMarkdown(markdown));
    },

    loadProject: (projectData) => {
        const newProject = projectData instanceof Project ? projectData : new Project(projectData);
        localStorage.setItem('lastActiveProjectId', newProject.id);
        
        // Save asynchronously without blocking UI
        localProjectService.saveProject(newProject.toStateObject()).catch(err => {
            console.error('Failed to save project to local storage:', err);
        });
        
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
