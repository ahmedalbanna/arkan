
'use client';

import { useAgents, useUpdateAgent, useCreateAgent } from '@/hooks/use-agents';
import { AGENTS, type Agent, type AgentData } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil, Loader2, AlertCircle, PlusCircle, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AgentCategory } from '@/lib/agents';

const createAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(AgentCategory),
  pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

const agentCategories = Object.values(AgentCategory);

function CreateAgentDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const createAgentMutation = useCreateAgent();

    const form = useForm<CreateAgentFormValues>({
        resolver: zodResolver(createAgentSchema),
        defaultValues: { id: '', name: '', description: '', category: AgentCategory.ContentGeneration, pageUrl: '/', prompt: '' },
    });

    const onSubmit = (data: CreateAgentFormValues) => {
        createAgentMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateAgentFormValues, { message: error.errors[key][0] });
                    }
                }
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />New Agent</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Create New AI Agent</DialogTitle>
                    <DialogDescription>
                        Define a new custom agent. This agent will become available in the application once created.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., my-custom-agent" disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Custom Report Agent" disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} rows={2} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={createAgentMutation.isPending}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {agentCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="pageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Page URL</FormLabel>
                                    <FormControl><Input {...field} placeholder="/generate" disabled={createAgentMutation.isPending} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name="prompt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl><Textarea {...field} rows={5} className="font-mono text-xs" disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createAgentMutation.isPending}>
                                {createAgentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Agent
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function AgentSkeleton() {
  return (
    <Card role="listitem" className="p-4 flex items-center gap-4 animate-pulse">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-9 w-24" />
    </Card>
  );
}


function AgentCard({ agent }: { agent: Agent }) {
  const { id, name, description } = agent;
  
  const localAgentConfig = AGENTS.find(a => a.id === id);
  const Icon = localAgentConfig ? localAgentConfig.icon : AlertCircle;

  return (
    <Card className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        <Icon className="w-8 h-8 text-primary" />
        <div className="flex-grow">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/manage-agents/${id}/edit`}>
            Configure
          </Link>
        </Button>
    </Card>
  );
}

export default function AgentManager() {
  const { agents, isLoaded, isError } = useAgents();

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <AgentSkeleton />
        <AgentSkeleton />
        <AgentSkeleton />
        <AgentSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
        <Card className="p-8 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Failed to load agent configurations.</p>
        </Card>
    );
  }

  // Filter for agents that generate content, as per the design's focus
  const completionAgents = agents.filter(agent => 
    agent.category === AgentCategory.ReportGeneration ||
    agent.category === AgentCategory.ProposalGeneration ||
    agent.category === AgentCategory.DiagramGeneration
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateAgentDialog />
      </div>
      <div className="space-y-4">
        {completionAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
       <div className="flex justify-center mt-8">
        <Button size="lg">Run Agents</Button>
      </div>
    </div>
  );
}
