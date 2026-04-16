'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { generateAgentConfig } from '@/infrastructure/ai/agent-flows';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks';
import { useAgentManager } from '@/hooks/use-agent-store';
import { type AgentProperties } from '@/modules/ai/domain/entities/Agent';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebounce } from '@/hooks';

const generateSchema = z.object({
  prompt: z.string().min(10, 'Please describe the agent you want to create in more detail.'),
  includeJsonOutput: z.boolean().default(false),
});

const saveSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/, "ID must use only lowercase letters, numbers, and hyphens."),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  prompt: z.string().min(1),
  guidelines: z.array(z.string()).optional(),
});

type GenerateFormValues = z.infer<typeof generateSchema>;
type SaveFormValues = z.infer<typeof saveSchema>;

export function AgentGeneratorDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<'generate' | 'review'>('generate');
  const { toast } = useToast();
  const { createAgent } = useAgentManager();

  const generateForm = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: { prompt: '', includeJsonOutput: false },
  });

  const saveForm = useForm<SaveFormValues>({
    resolver: zodResolver(saveSchema),
  });

  const debouncedId = useDebounce(saveForm.watch('id'), 500);

  const generateMutation = useMutation({
    mutationFn: generateAgentConfig,
    onSuccess: (data) => {
      saveForm.reset({
        id: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name: data.name,
        description: data.description,
        category: 'Custom',
        prompt: data.instructions,
        guidelines: data.guidelines.split('\n').map(g => g.replace(/^- /, '')).filter(Boolean),
      });
      setStep('review');
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message, variant: 'destructive' });
    }
  });

  const createMutation = useMutation({
    mutationFn: (agentData: AgentProperties) => createAgent(agentData),
    onSuccess: (newAgent) => {
      toast({ title: "Agent Created", description: `"${newAgent.name}" has been successfully created.` });
      onOpenChange(false);
      setStep('generate');
      generateForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Creation Failed", description: error.message, variant: 'destructive' });
    }
  });

  function onGenerateSubmit(data: GenerateFormValues) {
    generateMutation.mutate(data);
  }

  function onSaveSubmit(data: SaveFormValues) {
    createMutation.mutate(data as AgentProperties);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        {step === 'generate' ? (
          <>
            <DialogHeader>
              <DialogTitle>Generate New AI Agent</DialogTitle>
              <DialogDescription>
                Describe the agent you want to create. Be as specific as possible.
              </DialogDescription>
            </DialogHeader>
            <Form {...generateForm}>
              <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)} className="space-y-4">
                <FormField
                  control={generateForm.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={6}
                          placeholder="e.g., An agent that writes professional marketing copy for social media posts. It should have a witty and engaging tone."
                          disabled={generateMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generateForm.control}
                  name="includeJsonOutput"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={generateMutation.isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Require JSON Output?</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit" disabled={generateMutation.isPending}>
                    {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Configuration
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Review Generated Agent</DialogTitle>
              <DialogDescription>
                Review the configuration generated by the AI. You can make changes before saving.
              </DialogDescription>
            </DialogHeader>
            <Form {...saveForm}>
              <form onSubmit={saveForm.handleSubmit(onSaveSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField control={saveForm.control} name="id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent ID</FormLabel>
                    <FormControl><Input {...field} disabled={createMutation.isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={saveForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} disabled={createMutation.isPending} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={saveForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} disabled={createMutation.isPending} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={saveForm.control} name="prompt" render={({ field }) => (
                  <FormItem><FormLabel>System Prompt (Instructions)</FormLabel><FormControl><Textarea {...field} rows={5} disabled={createMutation.isPending} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={saveForm.control} name="guidelines" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guidelines</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value?.join('\n') || ''}
                        onChange={(e) => field.onChange(e.target.value.split('\n'))}
                        rows={4}
                        disabled={createMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={saveForm.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} disabled={createMutation.isPending} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter className="sticky bottom-0 bg-background pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep('generate')}>Back</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Save Agent
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}