
'use client';

import { useAgents, useUpdateAgent, useAgentCategories } from '@/hooks/use-agents';
import { type Agent, type AgentData } from '@/lib/types';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { CreateAgentDialog, CreateCategoryDialog } from './admin/users/CreateAgentDialog';
import { Input } from './ui/input';

// ...


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
  const { agents, isLoaded } = useAgents();

  const localAgentConfig = agents.find(a => a.id === id);
  const Icon = localAgentConfig ? localAgentConfig.icon : AlertCircle;

  const handleToggle = (checked: boolean) => {
    updateAgentMutation.mutate({ agentId: id, payload: { isEnabled: checked } });
  }


  return (
    <Card className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        <Icon className="w-8 h-8 text-primary shrink-0" />
        <div className="grow">
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
    if (!agents || !categories) return {};

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

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
        <div className="relative grow">
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
