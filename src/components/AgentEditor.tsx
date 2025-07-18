
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent, useUpdateAgent } from '@/hooks/use-agents';
import type { Agent, AgentPrompt } from '@/lib/agents';
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


export default function AgentEditor({ agentId }: { agentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();
  const { data: agent, isLoading: isLoaded, isError } = useAgent(agentId);
  const updateAgentMutation = useUpdateAgent();

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      const agentPrompt = agent.prompt;
      if (typeof agentPrompt === 'string') {
        setPrompt(agentPrompt);
      } else if (typeof agentPrompt === 'object' && agentPrompt.base) {
        setPrompt(agentPrompt.base);
      }
    }
  }, [agent]);
  
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

  if (!isLoaded) {
    return <AgentEditorSkeleton />;
  }
  
  if (isError || !agent) {
    return (
         <Card className="p-8 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>{t('agentEditor.errorLoading')}</p>
        </Card>
    )
  }

  const isComplexPrompt = typeof agent.prompt === 'object' && agent.prompt !== null && 'guidelines' in agent.prompt;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <agent.icon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="font-headline">{agent.name}</CardTitle>
              <CardDescription>
                {t('agentEditor.idLabel')}: {agent.id} | {t('agentEditor.categoryLabel')}: {agent.category}
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
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            {t('agentEditor.saveButton')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
