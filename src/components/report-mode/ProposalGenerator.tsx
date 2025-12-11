
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Loader2, Sparkles, Wand } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useBuilderStore, useToast } from '@/hooks';

const proposalSchema = z.object({
  mainSubject: z.string().min(10, 'Please provide a more detailed project idea.'),
  customGuidelines: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function ProposalGenerator() {
  const { t } = useLocalization();
  const { updateProject, project } = useBuilderStore();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/generate/proposal', {
    onSuccess: (data: any) => {
        // Here, we update the project description with the generated proposal.
        // The builder is designed to work from the `projectDescription` field.
        updateProject(p => {
            p.projectDescription = data.proposal;
        });
        toast({ title: t('builder.toasts.generationSuccessTitle'), description: t('builder.toasts.generationSuccessDesc', { item: 'Proposal' }) });
    },
    onError: (error) => {
        toast({ title: t('builder.toasts.generationFailed'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      mainSubject: project?.projectDescription || '',
      customGuidelines: '',
    },
  });

  const onSubmit = (data: ProposalFormValues) => {
    mutation.mutate({
      ...data,
      // Convert custom guidelines string into an array
      guidelines: data.customGuidelines?.split('\n').filter(g => g.trim()),
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{t('builder.proposalGenerator.toolsTitle')}</CardTitle>
        <CardDescription>{t('builder.proposalGenerator.toolsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="main-subject">{t('builder.proposalGenerator.mainSubjectLabel')}</Label>
            <Textarea
              id="main-subject"
              {...form.register('mainSubject')}
              placeholder={t('builder.proposalGenerator.placeholder')}
              rows={5}
              disabled={mutation.isPending}
            />
            {form.formState.errors.mainSubject && <p className="text-sm text-destructive">{form.formState.errors.mainSubject.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-guidelines">{t('builder.proposalGenerator.customGuidelinesLabel')}</Label>
            <Textarea
              id="custom-guidelines"
              {...form.register('customGuidelines')}
              placeholder={t('builder.proposalGenerator.addGuidelinePlaceholder')}
              rows={3}
              disabled={mutation.isPending}
            />
          </div>
          
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('builder.proposalGenerator.generateButton')} (2 Credits)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
