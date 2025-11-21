'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle, Save } from 'lucide-react';
import React, { useEffect } from 'react';
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
import { useAgentStore } from '@/hooks/use-agent-store';
import type { Agent } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '../ui/use-toast';

const commandSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Command name is required.'),
  prompt: z.string().min(1, 'Command prompt is required.'),
  mode: z.literal('default'),
});

const formSchema = z.object({
  name: z.string().min(1, 'Agent name is required.'),
  description: z.string().min(1, 'Agent description is required.'),
  avatar: z.object({
    type: z.literal('emoji'),
    data: z.object({
      value: z.string().min(1, 'Emoji is required.'),
    }),
  }),
  commands: z.array(commandSchema).min(1, 'At least one command is required.'),
});

type AgentFormValues = z.infer<typeof formSchema>;

interface AgentDialogProps {
  agent?: Agent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const AgentDialog: React.FC<AgentDialogProps> = ({
  agent,
  isOpen,
  onOpenChange,
}) => {
  const { addAgent, updateAgent } = useAgentStore();
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: agent ? {
        name: agent.name,
        description: agent.description || agent.data?.description || '',
        avatar: agent.data?.avatar || { type: 'emoji', data: { value: agent.icon || '' } },
        commands: (agent.commands || agent.data?.commands || []).map(c => ({...c, mode: 'default'}))
    } : {
      name: '',
      description: '',
      avatar: { type: 'emoji', data: { value: '🤖' } },
      commands: [
        { id: uuidv4(), name: 'Default Command', prompt: 'You are a helpful assistant.', mode: 'default' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'commands',
  });

  useEffect(() => {
    if (agent) {
        form.reset({
            name: agent.name,
            description: agent.description || agent.data?.description || '',
            avatar: agent.data?.avatar || { type: 'emoji', data: { value: agent.icon || '' } },
            commands: (agent.commands || agent.data?.commands || []).map(c => ({...c, mode: 'default'}))
        });
    } else {
        form.reset({
            name: '',
            description: '',
            avatar: { type: 'emoji', data: { value: '🤖' } },
            commands: [
                { id: uuidv4(), name: 'Default Command', prompt: 'You are a helpful assistant.', mode: 'default' },
            ],
        });
    }
  }, [agent, form, isOpen]);

  const onSubmit = (data: AgentFormValues) => {
    if (agent) {
        // Update existing agent
        const updatedAgent: Agent = {
            ...agent,
            name: data.name,
            data: {
                ...agent.data,
                name: data.name,
                description: data.description,
                avatar: data.avatar,
                commands: data.commands.map(c => ({id: c.id, name: c.name, prompt: c.prompt, mode: 'default'}))
            }
        };
        updateAgent(updatedAgent);
        toast({ title: "Agent Updated", description: `"${data.name}" has been updated.` });
    } else {
        // Create new agent
        const newAgent: Agent = {
            id: uuidv4(),
            name: data.name,
            space_id: 'local',
            data: {
                name: data.name,
                description: data.description,
                avatar: data.avatar,
                commands: data.commands.map(c => ({id: c.id, name: c.name, prompt: c.prompt, mode: 'default'}))
            }
        };
        addAgent(newAgent);
        toast({ title: "Agent Created", description: `"${data.name}" has been created.` });
    }
    onOpenChange(false);
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="avatar.data.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-16 h-16 text-4xl text-center p-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Marketing Assistant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
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
              <Label className="mb-2 block">Commands</Label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border p-4 space-y-2 relative">
                    <FormField
                      control={form.control}
                      name={`commands.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Command Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Write a tweet" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`commands.${index}.prompt`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Command Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="e.g., Write a tweet about {{topic}} for a {{audience}} audience."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>Remove</Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ id: uuidv4(), name: '', prompt: '', mode: 'default' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Command
                </Button>
                {form.formState.errors.commands?.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.commands.root.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {agent ? 'Save Changes' : 'Create Agent'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
