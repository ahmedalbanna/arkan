
'use client';

import { useAgents, useUpdateAgent, useCreateAgent, useCreateAgentCategory, useAgentCategories } from '@/hooks/use-agents';
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
  category: z.string().min(1, "Category is required."),
  pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

const createCategorySchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
});
type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;


function CreateCategoryDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createCategoryMutation = useCreateAgentCategory();

    const form = useForm<CreateCategoryFormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: { id: '', name: '' },
    });

    const onSubmit = (data: CreateCategoryFormValues) => {
        createCategoryMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if(error.errors) {
                    for(const key in error.errors) {
                        form.setError(key as any, { message: error.errors[key][0] });
                    }
                }
            }
        });
    }

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button size="sm" variant="outline"><PlusCircle className="me-2 h-4 w-4" />New Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category to organize your AI agents.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category ID</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., custom-tools" disabled={createCategoryMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Custom Tools" disabled={createCategoryMutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={createCategoryMutation.isPending}>
                                {createCategoryMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                Create Category
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function CreateAgentDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const createAgentMutation = useCreateAgent();
    const { data: categories } = useAgentCategories();

    const form = useForm<CreateAgentFormValues>({
        resolver: zodResolver(createAgentSchema),
        defaultValues: { id: '', name: '', description: '', category: 'content-generation', pageUrl: '/', prompt: '' },
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
                 <Button size="sm"><PlusCircle className="me-2 h-4 w-4" />{t('agentManager.newAgentButton')}</Button>
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
                                            {categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
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
                                {createAgentMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
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
                <Pencil className="me-2 h-4 w-4"/>
                {t('agentManager.configureButton')}
              </Link>
            </Button>
        </div>
    </Card>
  );
}

export default function AgentManager() {
  const { agents, isLoaded, isError } = useAgents();
  const { data: categories, isLoading: categoriesLoading } = useAgentCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLocalization();

  const groupedAgents = useMemo(() => {
    const categoryMap = categories?.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.name }), {} as Record<string, string>) || {};
    
    const filtered = agents.filter(agent => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const categoryName = categoryMap[agent.category] || agent.category;
        return agent.name.toLowerCase().includes(lowercasedTerm) ||
               agent.description.toLowerCase().includes(lowercasedTerm) ||
               categoryName.toLowerCase().includes(lowercasedTerm);
    });

    return filtered.reduce((acc, agent) => {
      const categoryName = categoryMap[agent.category] || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(agent);
      return acc;
    }, {} as Record<string, Agent[]>);
  }, [agents, searchTerm, categories]);

  const sortedCategories = Object.keys(groupedAgents).sort();


  if (!isLoaded || categoriesLoading) {
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
                    <Bot className="me-2 h-4 w-4" />
                    {t('agentManager.newAgentAiButton')}
                </Link>
            </Button>
            <CreateCategoryDialog />
            <CreateAgentDialog />
        </div>
      </div>
       <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedCategories}>
            {sortedCategories.map(category => (
                groupedAgents[category].length > 0 && (
                    <AccordionItem value={category} key={category} className="border rounded-lg bg-card">
                        <AccordionTrigger className="font-headline text-lg p-4 hover:no-underline">
                            <div className="flex items-center gap-2">
                               {category} <Badge variant="secondary">{groupedAgents[category].length}</Badge>
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
