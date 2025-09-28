
'use client';

import { useAuth } from '@/context/AuthContext';
import { createUIHook } from '@/core';
import { useEffect, useRef } from 'react';
import { useDebounce } from './use-debounce';
import { useUpdateProject } from './use-projects';
import { useBuilderStore } from './useBuilderStore';

/**
 * Custom hook to automatically save project changes to the database.
 * It debounces changes to avoid excessive API calls.
 */
export function useAutosave() {
  const { firebaseUser } = useAuth();
  const {
    project,
    hasUnsavedChanges
  } = useBuilderStore();

  const updateProjectMutation = useUpdateProject();

  // Create a ref to hold the full state to avoid it being a dependency of useEffect
  const projectRef = useRef(project);
  projectRef.current = project; // Always keep it up-to-date

  // Debounce the unsaved changes flag
  const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, 1500); // 1.5-second debounce delay

  useEffect(() => {
    const currentProject = projectRef.current;
    const currentProjectId = currentProject?.id;

    // Trigger save only if there's a current project ID, debounced changes are true, and the user is logged in.
    if (currentProjectId && !currentProjectId.startsWith('temp-') && debouncedHasUnsavedChanges && firebaseUser) {
      // Don't show a toast for autosave, it would be too noisy.
      const stateToSave = currentProject.toStateObject();
      updateProjectMutation.mutate({
        projectId: currentProjectId,
        data: stateToSave,
      });
    }
  }, [debouncedHasUnsavedChanges, firebaseUser, updateProjectMutation]);

}

/**
 * Hook محسن للحفظ التلقائي مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedAutosave() {
  const { firebaseUser } = useAuth();
  const { project, hasUnsavedChanges } = useBuilderStore();
  const updateProjectMutation = useUpdateProject();

  const projectRef = useRef(project);
  projectRef.current = project;

  const uiHook = createUIHook({
    hookName: 'advanced-autosave',
    initialState: {
      isEnabled: true,
      debounceDelay: 1500,
      saveInterval: 30000, // 30 seconds
      lastSaveTime: 0,
      saveCount: 0,
      errorCount: 0,
      isSaving: false,
      saveHistory: [],
    },
    customLogic: (state, setState, toast) => {
      const handleToggleAutosave = () => {
        setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
        toast({
          title: state.isEnabled ? 'Autosave disabled' : 'Autosave enabled',
          description: state.isEnabled ? 'Changes will not be saved automatically' : 'Changes will be saved automatically'
        });
      };

      const handleSetDebounceDelay = (delay: number) => {
        setState(prev => ({ ...prev, debounceDelay: Math.max(500, Math.min(10000, delay)) }));
      };

      const handleSetSaveInterval = (interval: number) => {
        setState(prev => ({ ...prev, saveInterval: Math.max(10000, Math.min(300000, interval)) }));
      };

      const handleForceSave = () => {
        const currentProject = projectRef.current;
        const currentProjectId = currentProject?.id;

        if (currentProjectId && !currentProjectId.startsWith('temp-') && firebaseUser) {
          setState(prev => ({ ...prev, isSaving: true }));

          const stateToSave = currentProject.toStateObject();
          updateProjectMutation.mutate({
            projectId: currentProjectId,
            data: stateToSave,
          }, {
            onSuccess: () => {
              setState(prev => ({
                ...prev,
                isSaving: false,
                lastSaveTime: Date.now(),
                saveCount: prev.saveCount + 1,
                saveHistory: [...prev.saveHistory.slice(-9), { timestamp: Date.now(), success: true }]
              }));
              toast({ title: 'Project saved successfully!' });
            },
            onError: (error) => {
              setState(prev => ({
                ...prev,
                isSaving: false,
                errorCount: prev.errorCount + 1,
                saveHistory: [...prev.saveHistory.slice(-9), { timestamp: Date.now(), success: false, error: error.message }]
              }));
              toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
            }
          });
        }
      };

      const handleClearHistory = () => {
        setState(prev => ({ ...prev, saveHistory: [] }));
      };

      const getSaveStats = () => {
        const totalSaves = state.saveCount + state.errorCount;
        const successRate = totalSaves > 0 ? (state.saveCount / totalSaves) * 100 : 100;
        return {
          totalSaves,
          successRate,
          lastSaveTime: state.lastSaveTime,
          isSaving: state.isSaving,
        };
      };

      return {
        handleToggleAutosave,
        handleSetDebounceDelay,
        handleSetSaveInterval,
        handleForceSave,
        handleClearHistory,
        getSaveStats,
        isEnabled: state.isEnabled,
        debounceDelay: state.debounceDelay,
        saveInterval: state.saveInterval,
        lastSaveTime: state.lastSaveTime,
        saveCount: state.saveCount,
        errorCount: state.errorCount,
        isSaving: state.isSaving,
        saveHistory: state.saveHistory,
      };
    }
  })();

  // Debounce the unsaved changes flag with configurable delay
  const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, uiHook.debounceDelay);

  useEffect(() => {
    const currentProject = projectRef.current;
    const currentProjectId = currentProject?.id;

    if (currentProjectId && !currentProjectId.startsWith('temp-') && debouncedHasUnsavedChanges && firebaseUser && uiHook.isEnabled) {
      const stateToSave = currentProject.toStateObject();
      updateProjectMutation.mutate({
        projectId: currentProjectId,
        data: stateToSave,
      }, {
        onSuccess: () => {
          setState(prev => ({
            ...prev,
            lastSaveTime: Date.now(),
            saveCount: prev.saveCount + 1,
            saveHistory: [...prev.saveHistory.slice(-9), { timestamp: Date.now(), success: true }]
          }));
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            errorCount: prev.errorCount + 1,
            saveHistory: [...prev.saveHistory.slice(-9), { timestamp: Date.now(), success: false, error: error.message }]
          }));
        }
      });
    }
  }, [debouncedHasUnsavedChanges, firebaseUser, updateProjectMutation, uiHook.isEnabled]);

  // Periodic save interval
  useEffect(() => {
    if (!uiHook.isEnabled || !firebaseUser) return;

    const interval = setInterval(() => {
      const currentProject = projectRef.current;
      const currentProjectId = currentProject?.id;
      const now = Date.now();

      if (currentProjectId && !currentProjectId.startsWith('temp-') && hasUnsavedChanges && (now - uiHook.lastSaveTime) > uiHook.saveInterval) {
        uiHook.handleForceSave();
      }
    }, uiHook.saveInterval);

    return () => clearInterval(interval);
  }, [uiHook.isEnabled, uiHook.saveInterval, uiHook.lastSaveTime, hasUnsavedChanges, firebaseUser]);

  return {
    // الوظائف الأساسية
    isEnabled: uiHook.isEnabled,
    isSaving: uiHook.isSaving,

    // الوظائف الجديدة من UI Hook
    ...uiHook,
  };
}
