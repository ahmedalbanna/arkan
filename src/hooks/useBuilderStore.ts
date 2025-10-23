
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Project, ProjectProperties } from '@/lib/models/project';
import type { SavedProject } from '@/lib/types';

// =============================================================================
// STATE & ACTIONS
// =============================================================================

export type BuilderTab = 'idea' | 'proposal' | 'report' | 'diagram' | 'plan' | 'presentation' | 'code' | 'solver';

interface BuilderState {
    project: Project | null;
    activeTab: BuilderTab;
    hasUnsavedChanges: boolean;
}

interface BuilderActions {
    setActiveTab: (tab: BuilderTab) => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    /**
     * Loads a project from raw properties, creating a new Project instance.
     * This is the primary way to get a project into the store.
     */
    loadProject: (props: SavedProject) => void;
    /**
     * Creates a new, empty project session, replacing the current one.
     * Instantiates a new Project with default values.
     */
    newSession: (defaultProps: Partial<ProjectProperties>) => void;
    /**
     * Provides a safe way to update the current project instance.
     * The function receives a mutable clone of the project to apply changes to.
     */
    updateProject: (updater: (project: Project) => void) => void;
    reset: () => void;
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

const initialState: BuilderState = {
    project: null,
    activeTab: 'idea',
    hasUnsavedChanges: false,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
    immer((set, get) => ({
        ...initialState,

        setActiveTab: (tab) => set((state) => {
            state.activeTab = tab;
        }),

        setHasUnsavedChanges: (hasChanges) => set((state) => {
            state.hasUnsavedChanges = hasChanges;
        }),

        loadProject: (props) => set((state) => {
            state.project = new Project(props);
            state.hasUnsavedChanges = false; // Loading a project is a clean state
        }),

        newSession: (defaultProps) => set((state) => {
            state.project = new Project(defaultProps);
            state.hasUnsavedChanges = true; // A new project is inherently an unsaved change
            state.activeTab = 'idea';
        }),

        /**
         * This implementation avoids the pitfalls of using Immer with class instances.
         * 1. It uses `get()` to retrieve the original, non-drafted `Project` instance.
         * 2. It creates a deep clone of the project by serializing and deserializing it.
         * 3. It runs the user-provided `updater` function on this safe, mutable clone.
         * 4. It then uses `set` to place the newly updated clone back into the state, 
         *    triggering a re-render while maintaining immutability.
         */
        updateProject: (updater) => {
            const currentProject = get().project;
            if (currentProject) {
                // Create a deep clone to mutate safely.
                const projectClone = new Project(currentProject.toJSON());
                
                // Apply the updates to the clone.
                updater(projectClone);

                // Set the new state with the updated clone.
                set({
                    project: projectClone,
                    hasUnsavedChanges: true,
                });
            }
        },

        reset: () => set(initialState),
    }))
);
