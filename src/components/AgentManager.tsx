'use client';

import { useAgents } from '@/hooks/use-agents';
import { type Agent } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';
import { ExternalLink, Pencil, Loader2 } from 'lucide-react';

function AgentCard({ agent, onToggle }: { agent: Agent, onToggle: (id: string, isEnabled: boolean) => void }) {
  const { id, name, description, category, icon: Icon, isEnabled, pageUrl } = agent;

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
              onCheckedChange={(checked) => onToggle(id, checked)}
              aria-label={`Enable ${name}`}
            />
            <Label htmlFor={`switch-${id}`}>{isEnabled ? 'مُفعّل' : 'مُعطّل'}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="justify-between">
        <Button asChild variant="ghost" className="font-headline">
          <Link href={pageUrl}>
            الذهاب إلى الأداة
            <ExternalLink className="mr-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="font-headline">
          <Link href={`/manage-agents/${id}/edit`}>
            <Pencil className="ml-2 h-4 w-4" />
            تعديل
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AgentManager() {
  const { agents, isLoaded, updateAgent } = useAgents();

  const handleToggle = (id: string, isEnabled: boolean) => {
    updateAgent(id, { isEnabled });
  };

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><Loader2 className="animate-spin" /></CardHeader></Card>
        <Card><CardHeader><Loader2 className="animate-spin" /></CardHeader></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onToggle={handleToggle} />
      ))}
    </div>
  );
}
