
'use client';

import { useWritingTool } from '@/hooks/use-writing-tools';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GenerateSessionPlanOutput } from '@/ai/schemas/lecture-generator';

const formSchema = z.object({
  chapterContent: z.string().min(100, 'Please provide at least 100 characters of chapter content.').max(100000, 'Content cannot exceed 10,000 characters.'),
  sessionDuration: z.number().min(10, 'Session must be at least 10 minutes.').max(240, 'Session cannot exceed 4 hours.'),
  numActivities: z.number().min(1, 'Must have at least one activity.').max(10, 'Cannot have more than 10 activities.'),
  targetAudience: z.string().max(100, 'Target audience description is too long.').optional(),
});

type SessionPlanFormValues = z.infer<typeof formSchema>;

export function useSessionPlanGeneratorLogic() {
  const [result, setResult] = useState<GenerateSessionPlanOutput | null>(null);

  const mutation = useWritingTool<GenerateSessionPlanOutput, SessionPlanFormValues>('/api/writing-tools/generate-session-plan', {
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const form = useForm<SessionPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chapterContent: '',
      sessionDuration: 60,
      numActivities: 3,
      targetAudience: '',
    },
  });

  const onSubmit = (values: SessionPlanFormValues) => {
    setResult(null);
    mutation.mutate(values);
  };

  return {
    form,
    mutation,
    result,
    onSubmit,
  };
}
