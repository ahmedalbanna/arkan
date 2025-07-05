'use client';

import { useState } from 'react';
import { AGENTS, type Agent } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

function AgentCard({ agent }: { agent: Agent }) {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <agent.icon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">{agent.name}</CardTitle>
              <Badge variant="outline" className="mt-1">{agent.category}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={`switch-${agent.id}`}
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              aria-label={`Enable ${agent.name}`}
            />
            <Label htmlFor={`switch-${agent.id}`}>{isEnabled ? 'مُفعّل' : 'مُعطّل'}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{agent.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="font-headline">
            <Link href={agent.pageUrl}>
                الذهاب إلى الأداة
                <ExternalLink className="mr-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AgentManager() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {AGENTS.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
