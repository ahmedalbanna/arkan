'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { Loader2, UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FileUploadZoneProps {
  onFileUpload: (content: string) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

export function FileUploadZone({ onFileUpload, isUploading, setIsUploading }: FileUploadZoneProps) {
  const { t } = useLocalization();

  function onDrop(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onFileUpload(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      console.error("Error reading file");
      setIsUploading(false);
    };

    const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.md');

    if (isTextFile) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file); // Read as data URI for PDF, DOCX, etc.
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      {isUploading ? (
        <div className="mt-4">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.assignmentsSolver.processingFile')}</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{t('writingTools.assignmentsSolver.dropzoneHint')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('writingTools.assignmentsSolver.supportedFiles')}</p>
        </div>
      )}
    </div>
  );
}
