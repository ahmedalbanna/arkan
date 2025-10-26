
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getJob } from '@/lib/job-store'; // Assume this is now client-callable for polling

interface JobStatus {
    status: 'pending' | 'completed' | 'failed';
    result?: any;
    error?: string;
}

export default function WebhookTestPage() {
    const [jobId, setJobId] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('Create a simple marketing plan for a new coffee shop.');
    const { toast } = useToast();

    const { data: jobStatus, isLoading, refetch } = useQuery<JobStatus>({
        queryKey: ['job', jobId],
        queryFn: async () => {
            if (!jobId) return { status: 'pending' };
            const response = await fetch(`/api/generate/status?jobId=${jobId}`);
            if (!response.ok) throw new Error("Failed to fetch job status");
            return response.json();
        },
        enabled: !!jobId,
        refetchInterval: (query) => {
            const data = query.state.data as JobStatus | undefined;
            return data?.status === 'pending' ? 2000 : false;
        },
        refetchOnWindowFocus: false,
    });


    const handleStartGeneration = async () => {
        setJobId(null);
        try {
            const response = await fetch('/api/generate/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, outputFormat: 'json' }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            const { jobId: newJobId } = await response.json();
            setJobId(newJobId);
            toast({ title: 'Generation Started', description: `Job ID: ${newJobId}` });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Webhook Generation Test</h1>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                <Button onClick={handleStartGeneration} disabled={isLoading}>
                    Start Generation
                </Button>
            </div>

            {jobId && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold">Job Status: {jobId}</h2>
                    <p>Status: {jobStatus?.status}</p>
                    {jobStatus?.status === 'completed' && (
                        <pre className="mt-4 p-4 bg-gray-100 rounded-md">
                            {JSON.stringify(jobStatus.result, null, 2)}
                        </pre>
                    )}
                     {jobStatus?.status === 'failed' && (
                        <p className="text-red-500 mt-2">Error: {jobStatus.error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
