
'use client';

import { usePptxStyles, useDeletePptxTemplate } from '@/hooks/use-pptx-styles';
import type { PptxTemplateKey } from '@/lib/pptx-styles';

export function usePresentationTemplateManager() {
  const { templates, updateStyle, saveChanges, isSaving, isLoaded, uploadTemplateFile } = usePptxStyles();
  const deleteMutation = useDeletePptxTemplate();


  const handleStyleChange = (key: PptxTemplateKey, path: string, value: string | number | boolean) => {
    updateStyle(key, path, value);
  };

  const handleSave = (key: PptxTemplateKey) => {
    saveChanges(key);
  };

  const handleDelete = (key: PptxTemplateKey) => {
    deleteMutation.mutate(key);
  };

  const handleRefreshImage = (templateId: string, prompt: string) => {

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

    uploadTemplateFile,
    handleStyleChange,
    handleSave,
    handleDelete,
    handleRefreshImage,
    handleFileChange,
  };
}
