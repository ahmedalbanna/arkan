

'use client';

import AgentEditor from '@/components/admin/agent-editor/AgentEditor';
import { useLocalization } from '@/context/LocalizationContext';
import { AlertCircle, Bot, MessageSquare } from 'lucide-react';
import React, { use } from 'react';
import { useAgent } from '@/hooks/use-agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function EditAgentPageSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3 border-r p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="col-span-9 p-6 space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// This is the main export, which is a Client Component.
export default function EditAgentPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { t } = useLocalization();
  const { data: agent, isLoading, isError } = useAgent(params.id);

  if (isLoading) {
    return <EditAgentPageSkeleton />;
  }

  if (isError) {
    return (
        <Card className="p-8 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>{t('agentEditor.errorLoading')}</p>
        </Card>
    );
  }

  if (!agent) {
    return (
        <Card className="p-8 text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Agent not found.</p>
        </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <h1 className="text-xl font-semibold">{agent.name}</h1>
        </div>
        <div className="flex items-center gap-2">
           <Button asChild variant="outline" size="sm">
            <Link href={`/admin/chats?agentId=${agent.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
            </Link>
           </Button>
           <Button variant="outline" size="sm" disabled>Share</Button>
        </div>
      </div>
      <AgentEditor agentId={params.id} initialData={agent} />
    </div>
  );
}
