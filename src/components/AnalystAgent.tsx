
'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReportStore } from '@/hooks/useReportStore';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { analyzeContextApi } from '@/services/context-service';
import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, BrainCircuit, Wand2, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

const analysisSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
});

type AnalysisFormValues = z.infer<typeof analysisSchema>;

export default function AnalystAgent() {
    const { externalContext, addExternalContext } = useReportStore();
    const { firebaseUser, refetchUser } = useAuth();
    const { resolvedTheme } = useTheme();

    const form = useForm<AnalysisFormValues>({
        resolver: zodResolver(analysisSchema),
        defaultValues: { prompt: '' },
    });

    const mutation = useMutation({
        mutationFn: analyzeContextApi,
        onSuccess: () => {
            refetchUser(); // To update credits
            toast({ title: 'Analysis Complete', description: 'The AI has analyzed the context and generated structured data.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
        }
    });
    
    const onSubmit = async (data: AnalysisFormValues) => {
        if (externalContext.length === 0) {
            toast({ title: 'Context Required', description: 'Please upload at least one context file to analyze.', variant: 'destructive' });
            return;
        }
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ prompt: data.prompt, contextFiles: externalContext, token });
    };

    const handleSaveAnalysis = () => {
        if (!mutation.data || !form.getValues('prompt')) return;

        const fileName = form.getValues('prompt').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 50) + '.json';
        const fileContent = JSON.stringify(mutation.data.data, null, 2);

        addExternalContext(fileName, fileContent, 'context');
        toast({ title: "Analysis Saved", description: `"${fileName}" has been added to your context files.` });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Analyst Agent</CardTitle>
                <CardDescription>Ask a question or give an instruction based on the managed context files. The AI will generate a structured JSON response.</CardDescription>
            </CardHeader>
            <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
                    <CardContent className="space-y-4 flex-grow flex flex-col min-h-0">
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="e.g., 'List all project stakeholders and their main interests.'"
                                            {...field}
                                            rows={4}
                                            disabled={mutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Run Analysis
                        </Button>
                        
                        {mutation.data && (
                            <div className="space-y-4 pt-4 border-t flex-grow flex flex-col min-h-0">
                                <div className="space-y-2 flex-grow flex flex-col min-h-0">
                                    <h4 className="font-semibold text-sm">Generated Data</h4>
                                     <ScrollArea className="flex-grow border rounded-md bg-muted text-xs p-2">
                                        <ReactJson 
                                            src={mutation.data.data} 
                                            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
                                            collapsed={false}
                                            displayDataTypes={false}
                                            name={false}
                                        />
                                     </ScrollArea>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    {mutation.data && (
                        <CardFooter>
                            <Button variant="secondary" onClick={handleSaveAnalysis}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Save Result as Context File
                            </Button>
                        </CardFooter>
                    )}
                 </form>
            </Form>
        </Card>
    );
}

