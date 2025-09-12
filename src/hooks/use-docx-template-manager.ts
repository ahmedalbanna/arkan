
'use client';

import { useState, useEffect } from 'react';
import { useDocxStyles, useDeleteDocxTemplate, useRefreshTemplateImage } from '@/hooks';
import type { DocxTemplateKey } from '@/lib/types';
import { useLocalization } from '@/context/LocalizationContext';

export function useDocxTemplateManager() {
  const { t } = useLocalization();
  const { templates, updateStyle, saveChanges, isSaving, isLoaded, activeTemplateKey, setActiveTemplateKey } = useDocxStyles();
  const deleteMutation = useDeleteDocxTemplate();
  const refreshImageMutation = useRefreshTemplateImage('docx');

  const [changeQueue, setChangeQueue] = useState<{ key: DocxTemplateKey, path: string, value: any } | null>(null);

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

  const handleStyleChange = (key: DocxTemplateKey, path: string, value: string | number | boolean) => {
    setChangeQueue({ key: key, path, value });
  };

  const handleSave = (key: DocxTemplateKey) => {
    saveChanges(key);
  };

  const handleDelete = (key: DocxTemplateKey) => {
    deleteMutation.mutate(key);
  };

  const handleRefreshImage = (templateId: string, prompt: string) => {
      refreshImageMutation.mutate({ templateId, prompt });
  };

  return {
    templates,
    isLoaded,
    isSaving,
    deleteMutation,
    refreshImageMutation, // This was missing from the return object.
    handleStyleChange,
    handleSave,
    handleDelete,
    handleRefreshImage,
    t,
  };
}
