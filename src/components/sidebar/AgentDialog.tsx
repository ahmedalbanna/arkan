'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAgentCategories } from '@/hooks';
import { useAgentManager } from '@/hooks/use-agent-store';
import type { AgentProperties } from '@/lib/models';
import { toast } from '../ui/use-toast';

const formSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens.").optional(),
  name: z.string().min(1, 'Agent name is required.'),
  description: z.string().min(1, 'Agent description is required.'),
  category: z.string().min(1, 'Category is required.'),
  prompt: z.string().min(10, 'Prompt is required.'),
  guidelines: z.array(z.string()).optional(),
});

type AgentFormValues = z.infer<typeof formSchema>;

interface AgentDialogProps {
  agent?: AgentProperties | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentDialog({
  agent,
  isOpen,
  onOpenChange,
}: AgentDialogProps) {
  const { createAgent, updateAgent } = useAgentManager();
  const { categories } = useAgentCategories();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(agent ? {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        prompt: agent.prompt,
        guidelines: agent.guidelines || [],
      } : {
        name: '',
        description: '',
        category: '',
        prompt: '',
        guidelines: [],
      });
    }
  }, [agent, isOpen, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error - useFieldArray name type inference issue
    name: 'guidelines',
  });

  async function onSubmit(data: AgentFormValues) {
    try {
      if (agent) {
        await updateAgent(agent.id, data);
        toast({ title: "Agent Updated", description: `"${data.name}" has been updated.` });
      } else {
        if (!data.id) {
          form.setError("id", { type: "manual", message: "ID is required for new agents." });
          return;
        }
        await createAgent(data as AgentProperties);
        toast({ title: "Agent Created", description: `"${data.name}" has been created.` });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  }

  const isMutating = form.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{agent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
          <DialogDescription>
            {agent ? 'Modify the details of your AI agent.' : 'Define a new AI agent by customizing its persona and commands.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            {!agent && (
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., custom-report-writer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Custom Report Writer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="A short description of what this agent does." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input list="category-suggestions" {...field} placeholder="e.g., Report Generation" />
                  </FormControl>
                  <datalist id="category-suggestions">
                    {categories.map((cat: any) => <option key={cat.id} value={cat.name} />)}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Persona / System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Describe the agent's role, capabilities, and constraints..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="mb-2 block">Guidelines (Optional)</Label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`guidelines.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="e.g., Always use a formal tone." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append('')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Guideline
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {agent ? 'Save Changes' : 'Create Agent'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
