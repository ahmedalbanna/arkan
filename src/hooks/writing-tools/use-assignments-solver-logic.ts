'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import { useDropzone } from 'react-dropzone';
import { useLocalization } from '@/context/LocalizationContext';

const assignmentsSolverSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters for the assignment content.'),
});

type AssignmentsSolverFormValues = z.infer<typeof assignmentsSolverSchema>;

export function useAssignmentsSolverLogic() {
  const { t } = useLocalization();
  const [solvedAssignments, setSolvedAssignments] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to process files.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = await firebaseUser.getIdToken();
        const result = await processFileApi(formData, token);
        form.setValue('text', result.markdown, { shouldValidate: true });
        toast({ title: t('writingTools.assignmentsSolver.fileProcessedToast'), description: `Assignment extracted from ${file.name}.` });
        refetchUser();
    } catch (error: any) {
        toast({ title: "File Processing Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  }, [firebaseUser, form, refetchUser, toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

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
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    solvedAssignments,
    isCopied,
    handleCopy,
    handleDownload,
  };
}