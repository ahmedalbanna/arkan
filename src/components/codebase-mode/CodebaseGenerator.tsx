
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useToast } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, Sparkles } from 'lucide-react';
import { useState } from 'react';
// import { useCodebaseStore } from '@/hooks'; // Not available
import type { Codebase } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { ProposalData } from '@/core/types/flexible-content-types';
import FileTreeView from './FileTreeView';

async function generateCodebaseApi(variables: { proposal: ProposalData; token: string }): Promise<Codebase> {
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
  const { project } = useBuilderStore();
  const proposal = project?.proposal;
  const [codebase, setCodebase] = useState<Codebase | null>(null);
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
    <div className="relative h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-blue-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

        <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
                <CardTitle className="font-headline">Codebase Scaffolding</CardTitle>
                <CardDescription>Generate a complete boilerplate for your project.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Button onClick={handleGenerate} disabled={!proposal || mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                  {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                  Generate Codebase
                </Button>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
        <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
          {mutation.isPending && (
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <Card variant="glass" className="flex items-center justify-center h-full min-h-[400px] backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <div className="text-center text-muted-foreground p-8">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mb-4 shadow-soft">
                    <Loader2 className="w-16 h-16 mx-auto animate-spin text-white" />
                  </div>
                  <h3 className="text-lg font-semibold font-headline">Generating Codebase...</h3>
                  <p>The AI is building your project structure. This may take a moment.</p>
                </div>
              </Card>
            </AnimatedContainer>
          )}
          {!mutation.isPending && codebase ? (
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <FileTreeView codebase={codebase} />
            </AnimatedContainer>
          ) : (
            !mutation.isPending && (
              <AnimatedContainer animation="fade-in-up" delay={300}>
                <Card variant="glass" className="flex items-center justify-center h-full min-h-[400px] backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                  <div className="text-center text-muted-foreground p-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft">
                      <Package className="w-16 h-16 mx-auto text-white" />
                    </div>
                    <h3 className="text-lg font-semibold font-headline">Your Codebase Will Appear Here</h3>
                    <p>Click &quot;Generate Codebase&quot; to scaffold your project files based on your proposal.</p>
                  </div>
                </Card>
              </AnimatedContainer>
            )
          )}
        </div>
      </div>
    </div>
  );
}
