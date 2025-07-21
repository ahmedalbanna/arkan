
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent, useUpdateAgent } from '@/hooks/use-agents';
import type { Agent, AgentPrompt, AgentData } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';

function AgentEditorSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-40 w-full" />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  )
}

interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
}

export default function AgentEditor({ agentId, initialData }: AgentEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const updateAgentMutation = useUpdateAgent();

  const [name, setName] = useState(initialData.name || '');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      const agentPrompt = initialData.prompt;
      if (typeof agentPrompt === 'string') {
        setPrompt(agentPrompt);
      } else if (typeof agentPrompt === 'object' && agentPrompt.base) {
        setPrompt(agentPrompt.base);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgentMutation.mutate({
      agentId,
      payload: { name, prompt }
    }, {
      onSuccess: () => {
        router.push('/manage-agents');
      }
    });
  };

  const isComplexPrompt = typeof initialData.prompt === 'object' && initialData.prompt !== null && 'guidelines' in initialData.prompt;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {initialData.icon && <initialData.icon className="w-8 h-8 text-primary" />}
            <div>
              <CardTitle className="font-headline">{initialData.name}</CardTitle>
              <CardDescription>
                {t('agentEditor.idLabel')}: {initialData.id} | {t('agentEditor.categoryLabel')}: {initialData.category}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">{t('agentEditor.nameLabel')}</Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={updateAgentMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-prompt">
              {isComplexPrompt ? t('agentEditor.basePromptLabel') : t('agentEditor.promptLabel')}
            </Label>
            {isComplexPrompt && (
              <p className="text-xs text-muted-foreground">
                {t('agentEditor.complexPromptNote')}
              </p>
            )}
            <Textarea
              id="agent-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={20}
              className="font-mono text-sm"
              disabled={updateAgentMutation.isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={updateAgentMutation.isPending || !name || !prompt} className="font-headline">
            {updateAgentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('agentEditor.saveButton')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
