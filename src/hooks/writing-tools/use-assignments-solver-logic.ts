'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

interface UploadedFile {
  name: string;
  content: string;
}

const assignmentsSolverSchema = z.object({
  text: z.string().min(10, 'Please add at least one file or paste text with a minimum of 10 characters.'),
});

type AssignmentsSolverFormValues = z.infer<typeof assignmentsSolverSchema>;

export function useAssignmentsSolverLogic() {
  const { t } = useLocalization();
  const [solvedAssignments, setSolvedAssignments] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const solveMutation = useWritingTool('/api/writing-tools/solve-assignments', {
    onSuccess: (data: any) => {
        setSolvedAssignments(data.solutions);
        toast({ title: t('writingTools.assignmentsSolver.successToast') });
    },
    onError: (error) => {
         toast({ title: t('writingTools.assignmentsSolver.errorToast'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<AssignmentsSolverFormValues>({
    resolver: zodResolver(assignmentsSolverSchema),
    defaultValues: { text: '' },
  });

  const onFileUpload = (fileContent: string, fileName: string) => {
    const newFile = { name: fileName, content: fileContent };
    const updatedFiles = [...uploadedFiles, newFile];
    setUploadedFiles(updatedFiles);
    
    const combinedText = updatedFiles.map(f => f.content).join('\n\n---\n\n');
    form.setValue('text', combinedText, { shouldValidate: true });
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    const combinedText = updatedFiles.map(f => f.content).join('\n\n---\n\n');
    form.setValue('text', combinedText, { shouldValidate: true });
  };

  const onSubmit = (data: AssignmentsSolverFormValues) => {
    solveMutation.mutate(data);
  };

  const handleCopy = () => {
    if (!solvedAssignments) return;
    navigator.clipboard.writeText(solvedAssignments).then(() => {
        setIsCopied(true);
        toast({ title: 'Solutions copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!solvedAssignments) return;
    
    const blob = new Blob([solvedAssignments], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment-solutions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Solutions downloaded successfully!' });
  };

  return {
    t,
    form,
    solveMutation,
    isUploading,
    setIsUploading,
    onFileUpload,
    onSubmit,
    solvedAssignments,
    isCopied,
    handleCopy,
    handleDownload,
    uploadedFiles,
    removeFile,
  };
}
