'use client';

import { usePptxStyles, useDeletePptxTemplate } from '@/hooks/use-pptx-styles';
import { useRefreshTemplateImage } from '@/hooks';
import type { PptxTemplateKey } from '@/lib/pptx-styles';

export function usePresentationTemplateManager() {
  const { templates, updateStyle, saveChanges, isSaving, isLoaded, uploadTemplateFile } = usePptxStyles();
  const deleteMutation = useDeletePptxTemplate();
  const refreshImageMutation = useRefreshTemplateImage('pptx');

  const handleStyleChange = (templateKey: PptxTemplateKey, path: string, value: string | number | boolean) => {
    updateStyle(templateKey, path, value);
  };

  const handleSave = (key: PptxTemplateKey) => {
    saveChanges(key);
  };

  const handleDelete = (key: PptxTemplateKey) => {
    deleteMutation.mutate(key);
  };

  const handleRefreshImage = (templateId: string, prompt: string) => {
    refreshImageMutation.mutate({ templateId, prompt });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, templateId: string) => {
      const file = e.target.files?.[0];
      if (file) {
          uploadTemplateFile.mutate({ templateId, file });
      }
  };

  return {
    templates,
    isLoaded,
    isSaving,
    deleteMutation,
    refreshImageMutation,
    uploadTemplateFile,
    handleStyleChange,
    handleSave,
    handleDelete,
    handleRefreshImage,
    handleFileChange,
  };
}
