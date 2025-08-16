
'use client';

import { useAgents, useUpdateAgent, useCreateAgent } from '@/hooks/use-agents';
import {AgentCategory} from '@/lib/agents';
import { AGENTS, type Agent, type AgentData } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil, Loader2, AlertCircle, PlusCircle, GripVertical, Search, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

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
    const { t } = useLocalization();
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
                 <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />{t('agentManager.newAgentButton')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{t('agentManager.createDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('agentManager.createDialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.idLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.idPlaceholder')} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.nameLabel')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('agentManager.createDialog.namePlaceholder')} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.descriptionLabel')}</FormLabel>
                                <FormControl><Textarea {...field} rows={2} disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.categoryLabel')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={createAgentMutation.isPending}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('agentManager.createDialog.selectCategoryPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {agentCategories.map(cat => <SelectItem key={cat} value={cat}>{t(`agentManager.categories.${cat}`)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="pageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('agentManager.createDialog.pageUrlLabel')}</FormLabel>
                                    <FormControl><Input {...field} placeholder={t('agentManager.createDialog.pageUrlPlaceholder')} disabled={createAgentMutation.isPending} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name="prompt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('agentManager.createDialog.promptLabel')}</FormLabel>
                                <FormControl><Textarea {...field} rows={5} className="font-mono text-xs" disabled={createAgentMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">{t('editUser.cancelButton')}</Button></DialogClose>
                            <Button type="submit" disabled={createAgentMutation.isPending}>
                                {createAgentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('agentManager.createDialog.createButton')}
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
    <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
  );
}


function AgentCard({ agent }: { agent: Agent }) {
  const { id, name, description, isEnabled } = agent;
  const updateAgentMutation = useUpdateAgent();
  const { t } = useLocalization();
  
  const localAgentConfig = AGENTS.find(a => a.id === id);
  const Icon = localAgentConfig ? localAgentConfig.icon : AlertCircle;
  
  const handleToggle = (checked: boolean) => {
    updateAgentMutation.mutate({ agentId: id, payload: { isEnabled: checked } });
  }


  return (
    <Card className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        <Icon className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-grow">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-4">
             <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={updateAgentMutation.isPending && updateAgentMutation.variables?.agentId === id}
                aria-label={`Enable ${name}`}
            />
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/manage-agents/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4"/>
                {t('agentManager.configureButton')}
              </Link>
            </Button>
        </div>
    </Card>
  );
}

export default function AgentManager() {
  const { agents, isLoaded, isError } = useAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLocalization();
  
  const groupedAgents = useMemo(() => {
    const groupedAgents: Record<AgentCategory, Agent[]> = {
        [AgentCategory.ContentGeneration]: [],
        [AgentCategory.ProposalGeneration]: [],
        [AgentCategory.ReportGeneration]: [],
        [AgentCategory.DiagramGeneration]: [],
        [AgentCategory.PresentationGeneration]: [],
        [AgentCategory.CodeGeneration]: [],
        [AgentCategory.Marketing]: [],
        [AgentCategory.Legal]: [],
        [AgentCategory.AdminTools]: []
    };

    const filtered = agents.filter(agent => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return agent.name.toLowerCase().includes(lowercasedTerm) ||
               agent.description.toLowerCase().includes(lowercasedTerm) ||
               agent.category.toLowerCase().includes(lowercasedTerm);
    }).filter((agent): agent is Agent => agent !== undefined && agent !== null); // Ensure agents are not undefined or null after filtering

    return filtered.reduce((acc, agent: Agent) => {
 const category = agent.category || AgentCategory.ContentGeneration;
 if (!acc[category]) {
 acc[category] = [];
      }
      acc[category].push(agent as Agent);
 return acc;
    }, Object.values(AgentCategory).reduce((acc, category) => ({ ...acc, [category]: [] }), {} as Record<AgentCategory, Agent[]>));

  }, [agents, searchTerm]);

  const sortedCategories = Object.keys(groupedAgents).sort() as AgentCategory[];


  if (!isLoaded) {
    return (
      <div className="space-y-4">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder={t('agentManager.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <div className="flex items-center gap-2">
            <Button asChild size="sm">
                <Link href="/admin/manage-agents/new">
                    <Bot className="mr-2 h-4 w-4" />
                    {t('agentManager.newAgentAiButton')}
                </Link>
            </Button>
            <CreateAgentDialog />
        </div>
      </div>
       <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedCategories}>
            {sortedCategories.map(category => (
                groupedAgents[category].length > 0 && (
                    <AccordionItem value={category} key={category} className="border rounded-lg bg-card">
                        <AccordionTrigger className="font-headline text-lg p-4 hover:no-underline">
                            <div className="flex items-center gap-2">
                               {t(`agentManager.categories.${category}`)} <Badge variant="secondary">{groupedAgents[category].length}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0 space-y-2">
                            {groupedAgents[category].map(agent => (
                               <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )
            ))}
       </Accordion>
    </div>
  );
}
