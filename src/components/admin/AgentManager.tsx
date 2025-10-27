
'use client';

import { useAgents, useUpdateAgent, useAgentCategories, useDeleteAgent } from '@/hooks';
import { type Agent } from '@/lib/models/agent';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil, Loader2, AlertCircle, PlusCircle, GripVertical, Search, Bot, Trash2, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreateAgentDialog } from '@/components/admin/users/CreateAgentDialog';
import { Input } from '@/components/ui/input';
import { CategoryManagerDialog } from '@/components/admin/agent-editor/CategoryManagerDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks';


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
  const { id, name, description, isEnabled, isDefault } = agent;
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();
  const { t } = useLocalization();

  const handleToggle = (checked: boolean) => {
    updateAgentMutation.mutate({ agentId: id, payload: { isEnabled: checked } });
  }

  const handleDelete = () => {
    deleteAgentMutation.mutate(id);
  }


  return (
    <Card className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        
        <div className="flex-grow">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
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
            {!isDefault && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={deleteAgentMutation.isPending && deleteAgentMutation.variables === id}>
                             {deleteAgentMutation.isPending && deleteAgentMutation.variables === id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "{name}" agent.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
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
    if (!agents || !categories) return {};

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    const filtered = agents.filter(agent => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const categoryName = categoryMap[agent.category as string] || agent.category;
        return agent.name.toLowerCase().includes(lowercasedTerm) ||
               agent.description.toLowerCase().includes(lowercasedTerm) ||
               categoryName.toLowerCase().includes(lowercasedTerm);
    });

    return filtered.reduce((acc, agent) => {
      const categoryName = categoryMap[agent.category as string] || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(agent);
      return acc;
    }, {} as Record<string, Agent[]>);
  }, [agents, searchTerm, categories]);

  const sortedCategories = Object.keys(groupedAgents).sort();

  const handleExport = () => {
      if (!agents || agents.length === 0) {
          toast({ title: 'No Agents to Export', description: 'There are no agents available to export.', variant: 'destructive' });
          return;
      }
      // Convert agent class instances to plain objects for serialization
      const plainAgents = agents.map(agent => agent.toJSON());
      const jsonString = JSON.stringify(plainAgents, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      saveAs(blob, 'arkan_agents_export.json');
      toast({ title: 'Export Successful', description: 'All agent configurations have been downloaded.' });
  }

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
            <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="me-2 h-4 w-4" />
                Export All
            </Button>
            <Button asChild size="sm">
                <Link href="/admin/manage-agents/new">
                    <Bot className="me-2 h-4 w-4" />
                    {t('agentManager.newAgentAiButton')}
                </Link>
            </Button>
            <CategoryManagerDialog>
                <Button size="sm" variant="outline"><Pencil className="me-2 h-4 w-4" />Manage Categories</Button>
            </CategoryManagerDialog>
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
