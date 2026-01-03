
'use client';

import { Chapter, Project, Section, TocSection, type ProjectProperties, User } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from '../util/use-toast';
import { useEditorStore } from './use-editor-store';
import { marked } from 'marked';
import { parseMarkdownToContent } from '../util/useMarkdownParser';

interface BuilderState {
    project: Project | null;
    userProfile: User | null; // Add userProfile to the store state
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    
    initializeStore: () => void;
    setUserProfile: (userProfile: User | null) => void; // Action to set the user profile
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => void) => void;
    updateSection: (sectionId: string, updater: (section: Section) => Section) => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocData: TocSection[]) => void;
    setContentFromMarkdown: (markdown: string) => void;
}

const createNewTemporaryProject = (): Project => new Project({});

const useBuilderStore = create<BuilderState>((set, get) => ({
    project: null,
    userProfile: null, // Initialize userProfile as null
    hasUnsavedChanges: false,
    isStoreInitialized: false,
    initializeStore: () => {
        if (get().isStoreInitialized) return;
        const lastProjectId = localStorage.getItem('lastActiveProjectId');
        if (lastProjectId) {
            localProjectService.getProject(lastProjectId).then(projectData => {
                if (projectData) {
                    set({ project: new Project(projectData), isStoreInitialized: true });
                } else {
                    set({ project: createNewTemporaryProject(), isStoreInitialized: true });
                }
            }).catch(() => {
                set({ project: createNewTemporaryProject(), isStoreInitialized: true });
            });
        } else {
            set({ project: createNewTemporaryProject(), isStoreInitialized: true });
        }
    },

    setUserProfile: (userProfile) => set({ userProfile }), // Implement the setter

    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

    updateProject: (updater) => {
        set(state => {
            if (!state.project) return {};
            // The 'with' method creates a new Project instance, ensuring immutability.
            const newProject = state.project.with({});
            updater(newProject);
            return { project: newProject, hasUnsavedChanges: true };
        });
    },

    updateSection: (sectionId, updater) => {
        get().updateProject(p => {
           const section = p.getSection(sectionId);
           if (section) {
               const newSection = updater(section);
               const chapter = p.findSection(sectionId)?.chapter;
               if (chapter) {
                    chapter.updateSection(sectionId, () => newSection);
               }
           }
        });
    },

    loadProject: (projectData) => {
        const newProject = projectData instanceof Project ? projectData : new Project(projectData);
        localStorage.setItem('lastActiveProjectId', newProject.id);
        set({ project: newProject, hasUnsavedChanges: false });

        // Also update the editor content
        const editor = useEditorStore.getState().activeEditor;
        if (editor && !editor.isDestroyed) {
          const html = marked.parse(newProject.fullMarkdownContent) as string;
          editor.commands.setContent(html, false);
        }
    },

    loadProjectFromFile: async (file: File) => {
        try {
            const newProject = await Project.fromFile(file);
            get().loadProject(newProject.toStateObject());
            toast({ title: 'Project Loaded', description: `Successfully loaded "${newProject.name}".` });
        } catch (err) {
            toast({ title: 'Load Failed', description: (err as Error).message, variant: 'destructive' });
        }
    },

    newSession: () => {
        if (typeof window !== 'undefined' && window.confirm('Are you sure you want to start a new session? Any unsaved changes will be lost.')) {
            localStorage.removeItem('lastActiveProjectId');
            set({ project: createNewTemporaryProject(), hasUnsavedChanges: false });
            // Also clear the editor
            const editor = useEditorStore.getState().activeEditor;
            if (editor && !editor.isDestroyed) {
                editor.commands.clearContent();
            }
        }
    },

    applyTableOfContents: (tocData) => {
        get().updateProject(p => {
            const newContent = tocData.map(chapterData => {
                const sections = chapterData.sections.map(sectionTitle => new Section({ title: sectionTitle, type: 'report' }));
                return new Chapter({ title: chapterData.title, sections });
            });
            p.content = newContent;
        });

        toast({
            title: 'Table of Contents Applied',
            description: `${tocData.length} chapters and their sections have been created.`,
        });
    },
    
    setContentFromMarkdown: (markdown: string) => {
        const currentProject = get().project;
        if (!currentProject) return;

        // Ensure markdown is a string before trimming
        const incomingMarkdown = typeof markdown === 'string' ? markdown : '';
        const currentMarkdown = currentProject.fullMarkdownContent || '';

        if (incomingMarkdown.trim() !== currentMarkdown.trim()) {
          set(state => {
            if (!state.project) return {};
            const newProject = state.project.updateContentFromMarkdown(incomingMarkdown);
            return { project: newProject, hasUnsavedChanges: true };
          });
        }
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
