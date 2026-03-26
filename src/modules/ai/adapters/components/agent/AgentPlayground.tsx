'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CornerDownLeft, Loader2, Wand2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { runAgentFlow } from '@/modules/ai/infrastructure/flows/generation/run-agent-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useAgentManager } from '@/hooks/use-agent-store';
import type { AgentProperties } from '@/modules/ai/domain/entities/Agent';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { ResponseDisplay } from './ResponseDisplay';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/modules/users/domain/utils/authUtils';

interface AgentPlaygroundProps {
  agent: AgentProperties | null;
}

const formSchema = z.object({
  userPrompt: z.string().min(1, 'Please enter a prompt.'),
});

type PlaygroundFormValues = z.infer<typeof formSchema>;

function AgentPlayground({ agent }: AgentPlaygroundProps) {
  const { responses, setResponse } = useAgentManager();
  const { user, isGuest } = useAuth();

  const form = useForm<PlaygroundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPrompt: '',
    },
  });

  useEffect(() => {
    form.reset({ userPrompt: '' });
  }, [agent, form]);

  const mutation = useMutation({
    // @ts-expect-error - Genkit Action type vs MutationFunction type mismatch
    mutationFn: runAgentFlow,
    onSuccess: (data) => {
      if (agent) {
        setResponse(agent.id, agent.id, { response: data, prompt: form.getValues('userPrompt') });
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

  async function onSubmit(values: PlaygroundFormValues) {
    if (!agent || !user) return;
    const token = await getAuthenticatedToken(user);
    const systemPrompt = `${agent.prompt}\n\n${(agent.guidelines || []).join('\n')}`;
    mutation.mutate({ systemPrompt, userPrompt: values.userPrompt, token });
  }

  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Select an Agent</h2>
          <p className="mt-1 text-muted-foreground">Choose an agent from the sidebar to start testing.</p>
        </div>
      </div>
    );
  }

  const agentResponses = (agent && responses[agent.id]?.[agent.id]) || [];

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b bg-background p-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold">{agent.name}</h1>
          <p className="text-sm text-muted-foreground">{agent.description}</p>
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
            <p className="text-muted-foreground">No responses yet for this agent.</p>
          </div>
        )}
      </div>
      <div className="border-t bg-background p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`Ask ${agent.name} to do something...`}
                      className="min-h-[80px] w-full resize-none pr-20"
                      disabled={mutation.isPending || isGuest}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" className="absolute bottom-3 right-3" disabled={mutation.isPending || isGuest}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CornerDownLeft className="mr-2 h-4 w-4" />
              )}
              Run
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AgentPlayground;
