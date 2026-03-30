'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, CornerDownLeft, Loader2, Wand2, Zap } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
    mutationFn: (input: { systemPrompt: string; userPrompt: string; token: string }) => runAgentFlow(input),
    onSuccess: (data: any) => {
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
      <div className="flex h-full flex-col items-center justify-center py-12 text-center opacity-40 space-y-4">
        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
            <Bot className="h-10 w-10 text-primary/60" />
        </div>
        <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Neural Canvas Ready</h3>
            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Select a specialized AI node from the registry to begin neural synthesis.</p>
        </div>
      </div>
    );
  }

  const agentResponses = (agent && responses[agent.id]?.[agent.id]) || [];

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between px-8 py-6 border-b bg-muted/5 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 rounded-2xl shadow-xl ring-1 ring-black/5">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{agent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <h1 className="text-base font-bold tracking-tight">{agent.name}</h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-md border border-border/40 w-fit">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Active Connection
            </div>
          </div>
        </div>
        <Badge variant="outline" className="h-6 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Neural Playground
        </Badge>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-8 md:p-12 space-y-10">
            {agentResponses.length > 0 ? (
                <div className="space-y-12 pb-20 max-w-4xl mx-auto">
                    {agentResponses.map((res, index) => (
                        <div key={index} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-2 px-1">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40">Input Signal</Label>
                                <div className="p-4 rounded-2xl border bg-muted/5 text-xs italic text-muted-foreground border-dashed">
                                    "{res.prompt}"
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 px-1">Neural Output</Label>
                                <div className="rounded-[32px] border bg-card p-10 md:p-12 shadow-2xl relative group">
                                    <ResponseDisplay response={res.response} prompt={res.prompt} />
                                    {/* Page Footer Visual */}
                                    <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                        <span>Arkan Neural Engine</span>
                                        <span>LOG_ID: {agent.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex h-full flex-col items-center justify-center py-20 opacity-30">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center mb-4">
                        <Wand2 className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">No Interaction History</p>
                </div>
            )}
        </div>
      </ScrollArea>

      <div className="p-8 border-t bg-muted/5 bg-background/80 backdrop-blur-xl relative z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative max-w-4xl mx-auto">
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`Instruct ${agent.name} to execute synthesis...`}
                      className="min-h-[100px] w-full bg-background shadow-xl rounded-[24px] border-none ring-1 ring-border/60 focus-visible:ring-primary/40 resize-none px-6 py-5 text-sm leading-relaxed pr-24"
                      disabled={mutation.isPending || isGuest}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
                type="submit"
                size="sm"
                className="absolute bottom-4 right-4 h-12 px-6 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2 transition-all active:scale-95"
                disabled={mutation.isPending || isGuest}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 fill-primary-foreground" />
              )}
              {mutation.isPending ? "Syncing" : "Initiate"}
            </Button>
          </form>
        </Form>
        <p className="text-[9px] text-center text-muted-foreground mt-4 font-medium uppercase tracking-tighter opacity-40">
            Neural Node V1.0 Stable • Session Encrypted
        </p>
      </div>
    </div>
  );
}

export default AgentPlayground;
