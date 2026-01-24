'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const projectBlueprintSchema = z.object({
  projectName: z.string().min(2, 'Project name must be at least 2 characters long.'),
  projectType: z.string().min(1, 'Please select a project type.'),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 characters).'),
  targetAudience: z.string().min(10, 'Please describe your target audience (at least 10 characters).'),
  complexity: z.enum(['Simple', 'Medium', 'Complex', 'Enterprise'], {
    required_error: 'Please select a complexity level.',
  }),
  features: z.string().min(10, 'Please list the desired features (at least 10 characters).'),
  techStack: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type ProjectBlueprintFormValues = z.infer<typeof projectBlueprintSchema>;

export function useProjectBlueprintLogic() {
  const { t } = useLocalization();
  const [blueprint, setBlueprint] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const generateMutation = useWritingTool('/api/writing-tools/project-blueprint', {
    onSuccess: (data: any) => {
      setBlueprint(data.blueprint);
      toast({ title: t('writingTools.projectBlueprint.successToast') });
    },
    onError: (error) => {
      toast({ title: t('writingTools.projectBlueprint.errorToast'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<ProjectBlueprintFormValues>({
    resolver: zodResolver(projectBlueprintSchema),
    defaultValues: {
      projectName: '',
      projectType: '',
      description: '',
      targetAudience: '',
      features: '',
      techStack: '',
      budget: '',
      timeline: '',
    },
  });

  const onSubmit = (data: ProjectBlueprintFormValues) => {
    generateMutation.mutate(data);
  };

  const handleCopy = () => {
    if (!blueprint) return;
    navigator.clipboard.writeText(blueprint).then(() => {
      setIsCopied(true);
      toast({ title: 'Project blueprint copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!blueprint) return;

    const blob = new Blob([blueprint], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.getValues('projectName') || 'project'}-blueprint.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Project blueprint downloaded successfully!' });
  };

  return {
    t,
    form,
    generateMutation,
    onSubmit,
    blueprint,
    isCopied,
    handleCopy,
    handleDownload,
  };
}
