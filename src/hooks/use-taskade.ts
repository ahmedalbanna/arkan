
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { startGenerationApi } from '@/services/taskade-service';
import { toast } from './use-toast';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebaseConfig';

type JobStatus = 'idle' | 'pending' | 'completed' | 'failed';

export function useTaskadeGeneration() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { firebaseUser } = useAuth();

  const startGeneration = useCallback(async (inputContent: string | object) => {
    setStatus('pending');
    setResult(null);
    setError(null);
    setJobId(null);
    try {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await startGenerationApi(inputContent, token);
      setJobId(data.jobId);
      toast({ title: 'Job Started', description: `Your task is now running.` });
    } catch (err: any) {
      setStatus('failed');
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const db = getDatabase(app);
    const jobRef = ref(db, `jobs/${jobId}`);

    // Listen for changes to the job status in the Realtime Database
    const unsubscribe = onValue(jobRef, (snapshot) => {
        const jobData = snapshot.val();
        if (jobData) {
            setStatus(jobData.status);
            if (jobData.status === 'completed') {
                setResult(jobData.result);
                toast({ title: 'Success!', description: 'Generation task completed.' });
            } else if (jobData.status === 'failed') {
                setError(jobData.error || 'An unknown error occurred.');
                toast({ title: 'Error', description: 'Generation task failed.', variant: 'destructive' });
            }
        }
    });

    // Cleanup listener on component unmount or when jobId changes
    return () => off(jobRef, 'value', unsubscribe);

  }, [jobId]);

  return { startGeneration, status, result, error, jobId };
}
