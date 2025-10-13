
'use client';

import { CreateAgentDialog } from '@/components/admin/users/CreateAgentDialog';
import { CreateCategoryDialog } from '@/components/admin/users/CreateCategoryDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgentCategories, useAgents, useUpdateAgent } from '@/hooks';
import { type Agent } from '@/lib/models/agent';
import { AlertCircle, Bot, GripVertical, Pencil, Search, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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

  const handleToggle = (checked: boolean) => {
    updateAgentMutation.mutate({ agentId: id, payload: { isEnabled: checked } });
  }

  return (
    <AnimatedContainer animation="fade-in-up" delay={100}>
      <Card variant="glass" className="p-6 flex items-center gap-4 hover:shadow-glow transition-all duration-200 group">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 group-hover:from-primary/20 group-hover:to-blue-500/20 transition-all duration-200">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        </div>
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow group-hover:scale-105 transition-transform duration-200">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-lg">{name}</p>
            <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={updateAgentMutation.isPending && updateAgentMutation.variables?.agentId === id}
              aria-label={`Enable ${name}`}
            />
            <Label className="text-sm font-medium">
              {isEnabled ? t('manageFeatures.enabled') : t('manageFeatures.disabled')}
            </Label>
          </div>
          <Button asChild variant="gradient" size="sm" className="hover:shadow-glow">
            <Link href={`/admin/manage-agents/${id}/edit`}>
              <Pencil className="me-2 h-4 w-4"/>
              {t('agentManager.configureButton')}
            </Link>
          </Button>
        </div>
      </Card>
    </AnimatedContainer>
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 space-y-8">
        <AnimatedContainer animation="fade-in-down" delay={200}>
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('agentManager.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 hover:shadow-soft transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" variant="gradient" className="hover:shadow-glow">
                <Link href="/admin/manage-agents/new">
                  <Bot className="me-2 h-4 w-4" />
                  {t('agentManager.newAgentAiButton')}
                </Link>
              </Button>
              <CreateCategoryDialog />
              <CreateAgentDialog />
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={300}>
          <Accordion type="multiple" className="w-full space-y-6" defaultValue={sortedCategories}>
            {sortedCategories.map((category, index) => (
              groupedAgents[category].length > 0 && (
                <AccordionItem
                  value={category}
                  key={category}
                  className="border border-border/50 rounded-xl bg-gradient-to-br from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200"
                >
                  <AccordionTrigger className="font-headline text-lg p-6 hover:no-underline bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xl font-semibold">{category}</span>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {groupedAgents[category].length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0 space-y-4">
                    {groupedAgents[category].map((agent, agentIndex) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )
            ))}
          </Accordion>
        </AnimatedContainer>
      </div>
    </div>
  );
}
