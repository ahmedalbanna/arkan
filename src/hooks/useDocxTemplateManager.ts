'use client';

import { useState, useEffect } from 'react';
import { useDocxStyles, useDeleteDocxTemplate } from '@/hooks';
import type { DocxTemplateKey  } from '@/lib/types';
import { useMutation } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';
import { refreshTemplateImage } from '@/services/template-service'; // Assuming this service exists

export function useDocxTemplateManager() {
  const { templates, updateStyle, saveChanges, isSaving, isLoaded, activeTemplateKey, setActiveTemplateKey } = useDocxStyles();
  const deleteMutation = useDeleteDocxTemplate();
  const { firebaseUser } = useAuth();

  const refreshImageMutation = useMutation({
    mutationFn: async ({ templateId, prompt }: { templateId: string, prompt: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return refreshTemplateImage({ templateType: 'docx', templateId, prompt }, token);
    },
    onSuccess: () => {
      toast({ title: 'Image Refreshed', description: 'Template image has been successfully refreshed.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: `Failed to refresh image: ${error.message}` });
    },
  });

  const [changeQueue, setChangeQueue] = useState<{ key: DocxTemplateKey , path: string, value: any } | null>(null);

  // When a change is queued, set the active template key.
  // This will trigger a re-render.
  useEffect(() => {
    if (changeQueue) {
      setActiveTemplateKey(changeQueue.key as any);
    }
  }, [changeQueue, setActiveTemplateKey]);

  // After the re-render, if the active key matches the queued change, apply the update.
  useEffect(() => {
    if (changeQueue && activeTemplateKey === changeQueue.key) {
      updateStyle(changeQueue.path, changeQueue.value);
      setChangeQueue(null); // Clear the queue
    }
  }, [activeTemplateKey, changeQueue, updateStyle]);

  const handleStyleChange = (key: DocxTemplateKey , path: string, value: string | number | boolean) => {
    setChangeQueue({ key: key , path, value });
  };

  const handleSave = (key: DocxTemplateKey ) => {
    saveChanges(key);
  };

  const handleDelete = (key: DocxTemplateKey ) => {
    deleteMutation.mutate(key);
  };

  const handleRefreshImage = (templateId: string, prompt: string) => {
    refreshImageMutation.mutate({ templateId, prompt, templateType: 'docx' });
  };

  return {
    templates,
    isLoaded,
    isSaving,
    deleteMutation,
    refreshImageMutation,
    handleStyleChange,
    handleSave,
    handleDelete,
    handleRefreshImage,
  };
}


