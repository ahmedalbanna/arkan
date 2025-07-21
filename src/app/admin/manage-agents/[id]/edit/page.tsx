
'use client';

import AgentEditor from '@/components/AgentEditor';
import { useLocalization } from '@/context/LocalizationContext';
import { AlertCircle, Pencil } from 'lucide-react';
import React from 'react';
import { useAgent } from '@/hooks/use-agents';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function EditAgentPageSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-10 mx-auto rounded-full" />
        <Skeleton className="h-8 w-48 mt-4 mx-auto" />
        <Skeleton className="h-6 w-64 mt-2 mx-auto" />
      </div>
      <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-40 w-full" />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
    </div>
  );
}

// This is the main export, which is a Client Component.
export default function EditAgentPage({ params }: { params: { id: string } }) {
  const { t } = useLocalization();
  const { data: agent, isLoading, isError } = useAgent(params.id);

  if (isLoading) {
    return <EditAgentPageSkeleton />;
  }

  if (isError) {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
             <Card className="p-8 text-center text-destructive">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('agentEditor.errorLoading')}</p>
            </Card>
        </div>
    );
  }

  if (!agent) {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <Card className="p-8 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Agent not found.</p>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Pencil className="w-10 h-10" />
          {t('agentEditor.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('agentEditor.pageSubtitle')}
        </p>
      </div>
      <AgentEditor agentId={params.id} initialData={agent} />
    </div>
  );
}
