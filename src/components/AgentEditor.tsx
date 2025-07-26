
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateAgent, useDeleteAgent, type UpdateAgentPayload } from '@/hooks/use-agents';
import { type Agent, AGENTS, AgentPrompt } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, AlertCircle, ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';


interface AgentEditorProps {
  agentId: string;
  initialData: Agent;
}

const agentGuidelineSchema = z.object({
  text: z.string().min(1, 'Guideline text cannot be empty.'),
  isDefault: z.boolean(),
});

const agentPromptSchema = z.object({
  base: z.string().min(10, "Base prompt must be at least 10 characters."),
  guidelines: z.array(agentGuidelineSchema).optional(),
});

const agentEditorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  prompt: z.union([
    z.string().min(10, "Prompt must be at least 10 characters"),
    agentPromptSchema
  ])
});

type AgentEditorFormValues = z.infer<typeof agentEditorSchema>;

export default function AgentEditor({ agentId, initialData }: AgentEditorProps) {
  const router = useRouter();
  const { t } = useLocalization();
  
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();

  const form = useForm<AgentEditorFormValues>({
      resolver: zodResolver(agentEditorSchema),
      defaultValues: {
          name: initialData.name,
          prompt: initialData.prompt,
      }
  });

  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "prompt.guidelines"
  });

  // Find the static agent config to get the non-configurable parts like the icon
  const staticAgentConfig = AGENTS.find(a => a.id === agentId);
  const Icon = staticAgentConfig ? staticAgentConfig.icon : AlertCircle;
  const isDefaultAgent = AGENTS.some(a => a.id === agentId);

  useEffect(() => {
    form.reset({
      name: initialData.name,
      prompt: initialData.prompt,
    })
  }, [initialData, form]);

  const handleSubmit = (data: AgentEditorFormValues) => {
    const payload: UpdateAgentPayload = {
      name: data.name,
      prompt: data.prompt as any, // Pass the whole prompt object/string
    };
    updateAgentMutation.mutate({ agentId, payload }, {
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

  const isComplexPrompt = typeof form.getValues().prompt === 'object' && form.getValues().prompt !== null;
  const isProcessing = updateAgentMutation.isPending || deleteAgentMutation.isPending;

  return (
    <>
      <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('agentEditor.nameLabel')}</FormLabel>
                    <FormControl><Input {...field} required disabled={isProcessing} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isComplexPrompt ? (
                <>
                   <FormField
                    control={form.control}
                    name="prompt.base"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('agentEditor.basePromptLabel')}</FormLabel>
                        <FormControl><Textarea {...field} required rows={10} className="font-mono text-sm" disabled={isProcessing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label>Guidelines</Label>
                    <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                           <FormField
                            control={form.control}
                            name={`prompt.guidelines.${index}.text`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormControl><Input {...field} disabled={isProcessing} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={isProcessing}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', isDefault: false })} disabled={isProcessing}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Guideline
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                 <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('agentEditor.promptLabel')}</FormLabel>
                      <FormControl><Textarea {...field} value={field.value as string} required rows={20} className="font-mono text-sm" disabled={isProcessing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

          </CardContent>
          <CardFooter className="justify-between">
             <Button asChild variant="outline">
              <Link href="/admin/manage-agents">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Manage Agents
              </Link>
            </Button>
            <Button type="submit" disabled={isProcessing || !form.formState.isDirty} className="font-headline">
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
      </FormProvider>

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
                      This action cannot be undone. This will permanently delete the agent "{form.getValues().name}".
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
