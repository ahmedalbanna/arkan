
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateAgent, useDeleteAgent } from '@/hooks/use-agents';
import { type Agent, AGENTS } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
}

export default function AgentEditor({ agentId, initialData }: AgentEditorProps) {
  const router = useRouter();
  const { t } = useLocalization();
  
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();

  const [name, setName] = useState(initialData.name || '');
  const [prompt, setPrompt] = useState('');

  // Find the static agent config to get the non-configurable parts like the icon
  const staticAgentConfig = AGENTS.find(a => a.id === agentId);
  const Icon = staticAgentConfig ? staticAgentConfig.icon : AlertCircle;
  const isDefaultAgent = AGENTS.some(a => a.id === agentId);


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
        router.push('/admin/manage-agents');
      }
    });
  };

  const handleDelete = () => {
    deleteAgentMutation.mutate(agentId, {
        onSuccess: () => {
            router.push('/admin/manage-agents');
        }
    });
  };

  const isComplexPrompt = typeof initialData.prompt === 'object' && initialData.prompt !== null && 'guidelines' in initialData.prompt;
  const isProcessing = updateAgentMutation.isPending || deleteAgentMutation.isPending;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              {Icon && <Icon className="w-8 h-8 text-primary" />}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
             <Button asChild variant="outline">
              <Link href="/admin/manage-agents">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Manage Agents
              </Link>
            </Button>
            <Button type="submit" disabled={isProcessing || !name || !prompt} className="font-headline">
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

       {!isDefaultAgent && (
         <div className="mt-8 pt-6 border-t border-destructive/20">
            <h3 className="text-lg font-semibold text-destructive">{t('editUser.dangerZoneTitle')}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
               Deleting a custom agent is a permanent action and cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={isProcessing}>
                      {deleteAgentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Delete Agent
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the agent "{name}".
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                  </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      )}
    </>
  );
}
