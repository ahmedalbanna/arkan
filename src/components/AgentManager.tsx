
'use client';

import { useAgents, useUpdateAgent } from '@/hooks/use-agents';
import { AGENTS, type Agent } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil, Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';

function AgentSkeleton() {
  return (
    <Card>
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
          <div className="flex items-center space-x-2">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
