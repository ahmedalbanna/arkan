/**
 * Main hook for Creative Studio functionality
 * Hook رئيسي لإدارة استوديو المحتوى الإبداعي
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreativeContentConfig, 
  ContentType, 
  GenerationStep,
  StepConfig,
  StepResult,
  ContentMetadata,
} from '@/lib/models/creative-content-config';

interface UseCreativeStudioReturn {
  // State
  currentProject: CreativeContentConfig | null;
  currentStep: GenerationStep | null;
  currentStepIndex: number;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  createProject: (type: ContentType, metadata: ContentMetadata, templateId?: string) => void;
  loadProject: (projectId: string) => Promise<void>;
  saveProject: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Step Navigation
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Generation
  generateStep: (stepId: string, config?: Partial<StepConfig>) => Promise<void>;
  regenerateStep: (stepId: string) => Promise<void>;
  skipStep: (stepId: string) => void;
  
  // Step Management
  updateStepConfig: (stepId: string, config: Partial<StepConfig>) => void;
  updateStepResult: (stepId: string, result: StepResult) => void;
  
  // Metadata
  updateMetadata: (metadata: Partial<ContentMetadata>) => void;
}

export function useCreativeStudio(): UseCreativeStudioReturn {
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState<CreativeContentConfig | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = currentProject?.generationSteps[currentStepIndex] || null;

  // Create new project
  const createProject = useCallback((
    type: ContentType,
    metadata: ContentMetadata,
    templateId?: string
  ) => {
    // Implementation will call API to create project
    // For now, create local structure
    const newProject: CreativeContentConfig = {
      id: `project-${Date.now()}`,
      userId: 'current-user', // Get from auth
      type,
      metadata,
      generationSteps: [], // Will be populated based on template
      currentStepIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCurrentProject(newProject);
    setCurrentStepIndex(0);
    setError(null);
  }, []);

  // Load existing project
  const loadProject = useCallback(async (projectId: string) => {
    try {
      setIsGenerating(true);
      // API call to load project
      // const response = await fetch(`/api/creative-studio/projects/${projectId}`);
      // const project = await response.json();
      // setCurrentProject(project);
      setError(null);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Save project
  const saveProject = useCallback(async () => {
    if (!currentProject) return;
    
    try {
      setIsGenerating(true);
      // API call to save project
      // await fetch(`/api/creative-studio/projects/${currentProject.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(currentProject),
      // });
      setError(null);
    } catch (err) {
      setError('Failed to save project');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [currentProject]);

  // Delete project
  const deleteProject = useCallback(async (projectId: string) => {
    try {
      // API call to delete project
      setCurrentProject(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  }, []);

  // Navigation
  const goToStep = useCallback((stepIndex: number) => {
    if (!currentProject) return;
    if (stepIndex >= 0 && stepIndex < currentProject.generationSteps.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, [currentProject]);

  const nextStep = useCallback(() => {
    if (!currentProject) return;
    if (currentStepIndex < currentProject.generationSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentProject, currentStepIndex]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Generate step
  const generateStep = useCallback(async (
    stepId: string,
    config?: Partial<StepConfig>
  ) => {
    if (!currentProject) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const step = currentProject.generationSteps.find(s => s.id === stepId);
      if (!step) throw new Error('Step not found');
      
      // Update step status
      const updatedSteps = currentProject.generationSteps.map(s =>
        s.id === stepId ? { ...s, status: 'in-progress' as const } : s
      );
      setCurrentProject({ ...currentProject, generationSteps: updatedSteps });
      
      // API call to generate
      const response = await fetch('/api/creative-studio/generate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          stepId,
          config: { ...step.config, ...config },
          previousSteps: currentProject.generationSteps
            .filter(s => s.order < step.order && s.result)
            .map(s => ({ id: s.id, result: s.result })),
        }),
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const result: StepResult = await response.json();
      
      // Update step with result
      const completedSteps = currentProject.generationSteps.map(s =>
        s.id === stepId
          ? { ...s, status: 'completed' as const, result }
          : s
      );
      setCurrentProject({ 
        ...currentProject, 
        generationSteps: completedSteps,
        updatedAt: new Date().toISOString(),
      });
      
    } catch (err) {
      setError('Failed to generate step');
      console.error(err);
      
      // Revert step status
      if (currentProject) {
        const revertedSteps = currentProject.generationSteps.map(s =>
          s.id === stepId ? { ...s, status: 'pending' as const } : s
        );
        setCurrentProject({ ...currentProject, generationSteps: revertedSteps });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [currentProject]);

  // Regenerate step
  const regenerateStep = useCallback(async (stepId: string) => {
    if (!currentProject) return;
    
    // Reset step result and regenerate
    const resetSteps = currentProject.generationSteps.map(s =>
      s.id === stepId ? { ...s, result: undefined, status: 'pending' as const } : s
    );
    setCurrentProject({ ...currentProject, generationSteps: resetSteps });
    
    await generateStep(stepId);
  }, [currentProject, generateStep]);

  // Skip step
  const skipStep = useCallback((stepId: string) => {
    if (!currentProject) return;
    
    const skippedSteps = currentProject.generationSteps.map(s =>
      s.id === stepId ? { ...s, status: 'skipped' as const } : s
    );
    setCurrentProject({ ...currentProject, generationSteps: skippedSteps });
  }, [currentProject]);

  // Update step config
  const updateStepConfig = useCallback((
    stepId: string,
    config: Partial<StepConfig>
  ) => {
    if (!currentProject) return;
    
    const updatedSteps = currentProject.generationSteps.map(s =>
      s.id === stepId
        ? { ...s, config: { ...s.config, ...config } }
        : s
    );
    setCurrentProject({ ...currentProject, generationSteps: updatedSteps });
  }, [currentProject]);

  // Update step result (for manual editing)
  const updateStepResult = useCallback((
    stepId: string,
    result: StepResult
  ) => {
    if (!currentProject) return;
    
    const updatedSteps = currentProject.generationSteps.map(s =>
      s.id === stepId ? { ...s, result } : s
    );
    setCurrentProject({ ...currentProject, generationSteps: updatedSteps });
  }, [currentProject]);

  // Update metadata
  const updateMetadata = useCallback((
    metadata: Partial<ContentMetadata>
  ) => {
    if (!currentProject) return;
    
    setCurrentProject({
      ...currentProject,
      metadata: { ...currentProject.metadata, ...metadata },
    });
  }, [currentProject]);

  // Auto-save on changes
  useEffect(() => {
    if (!currentProject) return;
    
    const timer = setTimeout(() => {
      saveProject();
    }, 2000); // Debounce 2 seconds
    
    return () => clearTimeout(timer);
  }, [currentProject, saveProject]);

  return {
    currentProject,
    currentStep,
    currentStepIndex,
    isGenerating,
    error,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    goToStep,
    nextStep,
    previousStep,
    generateStep,
    regenerateStep,
    skipStep,
    updateStepConfig,
    updateStepResult,
    updateMetadata,
  };
}
