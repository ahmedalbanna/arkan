
'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function TaskadeTestPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/taskade/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'Create a simple marketing plan' }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setResult(data);
      toast({
        title: 'Success!',
        description: 'Taskade API call was successful.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Taskade API Test</h1>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Calling API...' : 'Test Taskade API'}
      </Button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
