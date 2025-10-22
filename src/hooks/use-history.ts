
import { useBuilderStore } from '@/hooks';
import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { type ProjectProperties } from '@/lib/models/project';

// A custom hook to manage undo/redo functionality for the project state.
export const useHistory = () => {
    const { project, loadProject, setHasUnsavedChanges } = useBuilderStore(
        (state) => ({ 
            project: state.project,
            loadProject: state.loadProject, 
            setHasUnsavedChanges: state.setHasUnsavedChanges 
        }),
        shallow
    );

    // State to hold the history of project states.
    const [history, setHistory] = useState<ProjectProperties[]>([]);
    // State to track the current position in the history.
    const [current, setCurrent] = useState(-1);

    // Add the current project state to history whenever it changes.
    useEffect(() => {
        if (project) {
            const currentState = project.toJSON();
            // Prevent adding duplicate states to the history.
            if (current >= 0 && JSON.stringify(history[current]) === JSON.stringify(currentState)) {
                return;
            }
            // Add new state and update the current position.
            setHistory(produce(draft => {
                draft.splice(current + 1);
                draft.push(currentState);
            }));
            setCurrent(prev => prev + 1);
        }
    }, [project]);

    // Function to travel to a specific point in history.
    const go = useCallback((index: number) => {
        if (index >= 0 && index < history.length) {
            loadProject(history[index]);
            setCurrent(index);
            setHasUnsavedChanges(true); // Changing history means there are unsaved changes.
        }
    }, [history, loadProject, setHasUnsavedChanges]);

    // Function to go to the next state in history (redo).
    const next = useCallback(() => {
        go(current + 1);
    }, [current, go]);

    // Function to go to the previous state in history (undo).
    const back = useCallback(() => {
        go(current - 1);
    }, [current, go]);

    return {
        history,
        current,
        // Boolean flags to determine if undo/redo is possible.
        canUndo: current > 0,
        canRedo: current < history.length - 1,
        go,
        next,
        back,
    };
};
