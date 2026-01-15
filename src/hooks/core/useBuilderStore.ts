
'use client';

import { Chapter, Project, Section, TocSection, type ProjectProperties, User } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from '../util/use-toast';
import { useEditorStore } from './use-editor-store';
import { parseMarkdownToContent } from '../util/useMarkdownParser';
import { getFirestore, onSnapshot, doc } from 'firebase/firestore';
import { app } from '@/lib/firebase/client-init';
import { useAuth } from '@/context/AuthContext';


interface BuilderState {
    project: Project | null;
    userProfile: User | null; // Add userProfile to the store state
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    
    initializeStore: (userId: string) => () => void;
    setUserProfile: (userProfile: User | null) => void; // Action to set the user profile
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => void | Project) => void;
    updateProjectFromMarkdown: (markdown: string) => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocMarkdown: string) => void;
}

const createNewTemporaryProject = (): Project => new Project({});

const useBuilderStore = create<BuilderState>((set, get) => ({
    project: null,
    userProfile: null, // Initialize userProfile as null
    hasUnsavedChanges: false,
    isStoreInitialized: false,
    initializeStore: (userId) => {
        if (!userId) {
            set({ project: createNewTemporaryProject(), isStoreInitialized: true });
            return () => {};
        }

        const db = getFirestore(app);
        const projectsRef = doc(db, 'users', userId); // Assuming projects are subcollection or field

        // This is a placeholder. You'd need to adapt this to your actual data structure.
        // For simplicity, let's assume the user doc has a 'projects' field or subcollection.
        // The more robust way is to have a 'projects' collection and query by userId.
        // Let's use a simplified listening logic. We will listen to the LAST active project.
        const lastProjectId = localStorage.getItem('lastActiveProjectId');
        if (lastProjectId) {
            const projectDocRef = doc(db, "projects", lastProjectId);
            const unsubscribe = onSnapshot(projectDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    set({ project: new Project(docSnap.data() as ProjectProperties), isStoreInitialized: true });
                } else {
                     set({ project: createNewTemporaryProject(), isStoreInitialized: true });
                }
            });
            return unsubscribe;
        } else {
            set({ project: createNewTemporaryProject(), isStoreInitialized: true });
            return () => {};
        }
    },

    setUserProfile: (userProfile) => set({ userProfile }), // Implement the setter

    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

    updateProject: (updater) => {
        set(state => {
            if (!state.project) return {};
            const newProject = new Project(state.project.toStateObject());
            const result = updater(newProject);
            const finalProject = result instanceof Project ? result : newProject;
            // The saving logic will now be handled by the useSaveProject hook which uses the API
            // localProjectService.saveProject(finalProject.toStateObject()); 
            localStorage.setItem('lastActiveProjectId', finalProject.id);
            return { project: finalProject, hasUnsavedChanges: true };
        });
    },

    updateProjectFromMarkdown: (markdown: string) => {
        get().updateProject(p => p.updateProjectFromMarkdown(markdown));
    },

    loadProject: (projectData) => {
        const newProject = projectData instanceof Project ? projectData : new Project(projectData);
        localStorage.setItem('lastActiveProjectId', newProject.id);
        set({ project: newProject, hasUnsavedChanges: false });
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
        if (get().hasUnsavedChanges) {
            if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to start a new session? Any unsaved changes will be lost.')) {
                return;
            }
        }
        
        const currentProject = get().project;
        if (currentProject) {
            set({ project: currentProject.reset(), hasUnsavedChanges: false });
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
    const { firebaseUser } = useAuth();
    
    useEffect(() => {
        if (firebaseUser && !isStoreInitialized) {
            const unsubscribe = initializeStore(firebaseUser.uid);
            return () => unsubscribe();
        }
    }, [initializeStore, isStoreInitialized, firebaseUser]);

    return isStoreInitialized;
};

export { useBuilderStore };
