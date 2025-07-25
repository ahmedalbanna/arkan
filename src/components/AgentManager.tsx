
'use client';

import { useAgents, useUpdateAgent, useCreateAgent } from '@/hooks/use-agents';
import { AGENTS, type Agent, type AgentData } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
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

const createAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

const agentCategories = [...new Set(AGENTS.map(a => a.category))];

function CreateAgentDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const createAgentMutation = useCreateAgent();

    const form = useForm<CreateAgentFormValues>({
        resolver: zodResolver(createAgentSchema),
        defaultValues: { id: '', name: '', description: '', category: '', pageUrl: '/', prompt: '' },
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
                 <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Create New Agent</Button>
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
    <Card role="listitem">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </CardContent>
      <CardFooter className="justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  )
}


function AgentCard({ agent }: { agent: Agent }) {
  const { t } = useLocalization();
  const { id, name, description, category, isEnabled, pageUrl } = agent;
  const updateAgentMutation = useUpdateAgent();
  
  const localAgentConfig = AGENTS.find(a => a.id === id);
  const Icon = localAgentConfig ? localAgentConfig.icon : AlertCircle;


  const handleToggle = (checked: boolean) => {
    updateAgentMutation.mutate({ agentId: id, payload: { isEnabled: checked } });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Icon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">{name}</CardTitle>
              <Badge variant="outline" className="mt-1">{category}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`switch-${id}`}
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={updateAgentMutation.isPending}
              aria-label={`Enable ${name}`}
            />
            <Label htmlFor={`switch-${id}`}>{isEnabled ? t('agentManager.enabled') : t('agentManager.disabled')}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="justify-between">
        <Button asChild variant="ghost" className="font-headline">
          <Link href={pageUrl}>
            {t('agentManager.goToTool')}
            <ExternalLink className="mx-2 rtl:mx-0 rtl:mr-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="font-headline">
          <Link href={`/admin/manage-agents/${id}/edit`}>
            <Pencil className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4" />
            {t('agentManager.editButton')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AgentManager() {
  const { t } = useLocalization();
  const { agents, isLoaded, isError } = useAgents();

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p>{t('agentManager.errorLoading')}</p>
        </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <CreateAgentDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </>
  );
}
