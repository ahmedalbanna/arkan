// A file-based store for tracking job statuses using Firebase Realtime Database.
import { adminRealtimeDb } from '@/lib/firebase/admin';
import { randomBytes } from 'crypto';

interface Job {
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: number;
  token?: string;
}

function getJobRef(jobId: string) {
    return adminRealtimeDb.ref(`jobs/${jobId}`);
}

export async function createJob(jobId: string): Promise<void> {
  const jobRef = getJobRef(jobId);
  const newJob: Job = {
    status: 'pending',
    createdAt: Date.now(),
  };
  await jobRef.set(newJob);
}

export async function updateJob(jobId: string, status: 'completed' | 'failed', data: any): Promise<void> {
    const jobRef = getJobRef(jobId);
    const updateData: Partial<Job> = {
        status,
    };
    if (status === 'completed') {
        updateData.result = data;
    } else {
        updateData.error = data;
    }
    await jobRef.update(updateData);
}

export async function getJob(jobId: string): Promise<Job | null> {
    const jobRef = getJobRef(jobId);
    const snapshot = await jobRef.get();
    if (snapshot.exists()) {
        return snapshot.val() as Job;
    }
    return null;
}

export async function generateJobToken(jobId: string): Promise<string> {
    const token = randomBytes(16).toString('hex');
    const jobRef = getJobRef(jobId);
    await jobRef.update({ token });
    return token;
}
