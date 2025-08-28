
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useCodebaseStore } from '@/hooks/useCodebaseStore';
import type { Codebase } from '@/ai/schemas';
import FileTreeView from './FileTreeView';
import { useLocalization } from '@/context/LocalizationContext';

async function generateCodebaseApi(variables: { proposal: any; token: string }): Promise<Codebase> {
  const response = await fetch('/api/generate-codebase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${variables.token}`,
    },
    body: JSON.stringify({ proposal: variables.proposal }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate codebase');
  }
  return response.json();
}

export default function CodebaseGenerator() {
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const { proposal } = useBuilderStore();
  const { codebase, setCodebase } = useCodebaseStore();
  const { t, locale } = useLocalization();
  const mutation = useMutation({
    mutationFn: generateCodebaseApi,
    onSuccess: (data) => {
      setCodebase(data);
      refetchUser(); // To update credits
      toast({
        title: 'Codebase Generated',
        description: 'Your project structure has been scaffolded.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleGenerate = () => {
    if (!proposal || !firebaseUser) {
      toast({
        title: 'Cannot Generate Codebase',
        description: 'A project proposal must be generated first.',
        variant: 'destructive',
      });
      return;
    }
    const token = firebaseUser.getIdToken();
    token.then(t => mutation.mutate({ proposal, token: t }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader>
            <CardTitle>Codebase Scaffolding</CardTitle>
            <CardDescription>Generate a complete boilerplate for your project.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerate} disabled={!proposal || mutation.isPending} className="w-full">
              {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
              Generate Codebase
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
        {mutation.isPending && (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold">Generating Codebase...</h3>
              <p>The AI is building your project structure. This may take a moment.</p>
            </div>
          </Card>
        )}
        {!mutation.isPending && codebase ? (
          <FileTreeView codebase={codebase} />
        ) : (
          !mutation.isPending && (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8">
                <Package className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Your Codebase Will Appear Here</h3>
                <p>Click "Generate Codebase" to scaffold your project files based on your proposal.</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
