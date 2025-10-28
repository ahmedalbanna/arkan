'use client';

import { useWritingTool } from './use-writing-tool';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GenerateSessionPlanOutput, GenerateSessionPlanInputSchema } from '@/ai/schemas/lecture-generator';

type SessionPlanFormValues = z.infer<typeof GenerateSessionPlanInputSchema>;

export function useSessionPlanGeneratorLogic() {
  const [result, setResult] = useState<GenerateSessionPlanOutput | null>(null);

  const mutation = useWritingTool<GenerateSessionPlanOutput, SessionPlanFormValues>('/api/writing-tools/generate-session-plan', {
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const form = useForm<SessionPlanFormValues>({
    resolver: zodResolver(GenerateSessionPlanInputSchema),
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
