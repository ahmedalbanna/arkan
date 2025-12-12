
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CornerDownLeft, Loader2, Wand } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { runAgentFlow } from '@/ai/flows/run-agent-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAgentManager } from '@/hooks/use-agent-store';
import type { Agent, Command } from '@/types/agent';
import { useMutation } from '@tanstack/react-query';
import { toast } from '../ui/use-toast';
import { ResponseDisplay } from './ResponseDisplay';

interface AgentPlaygroundProps {
  agent: Agent | null;
}

const formSchema = z.object({
  commandId: z.string().min(1, 'Please select a command.'),
  userPrompt: z.string().min(1, 'Please enter a prompt.'),
});

type PlaygroundFormValues = z.infer<typeof formSchema>;

const AgentPlayground: React.FC<AgentPlaygroundProps> = ({ agent }) => {
  const {
    responses,
    setResponse,
    setSelectedCommandId,
    selectedCommandId,
  } = useAgentManager();

  const form = useForm<PlaygroundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commandId: '',
      userPrompt: '',
    },
  });

  // Handle both old format (agent.data.commands) and new format (agent.commands)
  const commands = agent?.commands || agent?.data?.commands || [];
  const selectedCommand = commands.find(c => c.id === selectedCommandId);

  // Effect to update form when agent or selected command changes
  useEffect(() => {
    if (agent) {
      const commands = agent.commands || agent.data?.commands || [];
      const firstCommandId = commands[0]?.id || '';
      const commandToSelect = selectedCommandId || firstCommandId;
      form.reset({
        commandId: commandToSelect,
        userPrompt: '',
      });
      if (commandToSelect) {
        setSelectedCommandId(commandToSelect);
      }
    } else {
      form.reset({ commandId: '', userPrompt: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, form.reset, setSelectedCommandId]);

  const mutation = useMutation({
    mutationFn: runAgentFlow,
    onSuccess: (data) => {
      if (agent && selectedCommandId) {
        setResponse(agent.id, selectedCommandId, { response: data, prompt: form.getValues('userPrompt') });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error Running Agent',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: PlaygroundFormValues) => {
    if (!agent || !selectedCommand) return;
    const description = agent.description || agent.data?.description || '';
    const systemPrompt = `${description}\n\nCOMMAND: ${selectedCommand.name}\nPROMPT: ${selectedCommand.prompt}`;
    mutation.mutate({ systemPrompt, userPrompt: values.userPrompt });
  };

  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <Wand className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Select an Agent</h2>
          <p className="mt-1 text-muted-foreground">Choose an agent from the sidebar to start testing.</p>
        </div>
      </div>
    );
  }

  const handleCommandChange = (commandId: string) => {
    form.setValue('commandId', commandId);
    setSelectedCommandId(commandId);
  };

  const agentResponses = (agent && selectedCommandId && responses[agent.id]?.[selectedCommandId]) || [];

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b bg-background p-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{agent.icon || agent.data?.avatar?.data?.value || agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold">{agent.name}</h1>
          <p className="text-sm text-muted-foreground">{agent.description || agent.data?.description}</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {agentResponses.length > 0 ? (
          <div className="space-y-6">
            {agentResponses.map((res, index) => (
              <ResponseDisplay key={index} response={res.response} prompt={res.prompt} />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No responses yet for this command.</p>
          </div>
        )}
      </div>
      <div className="border-t bg-background p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="userPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <Textarea
                        {...field}
                        placeholder={selectedCommand?.prompt || 'Enter your test prompt here...'}
                        className="min-h-[80px] w-full resize-none"
                        disabled={mutation.isPending}
                      />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="commandId"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={handleCommandChange} value={field.value} disabled={mutation.isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a command" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commands.map((cmd: Command) => (
                            <SelectItem key={cmd.id} value={cmd.id}>
                              {cmd.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                  )}
                  Run Agent
                </Button>
              </div>
            </div>
            {form.formState.errors.userPrompt && (
              <p className="text-sm text-destructive">{form.formState.errors.userPrompt.message}</p>
            )}
            {form.formState.errors.commandId && (
              <p className="text-sm text-destructive">{form.formState.errors.commandId.message}</p>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AgentPlayground;
