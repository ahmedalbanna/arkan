'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, ServerCrash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ApiEndpoint } from '@/config/api-docs';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

interface ApiTesterProps {
  endpoint: ApiEndpoint;
}

export function ApiTester({ endpoint }: ApiTesterProps) {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [body, setBody] = useState(
    endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : ''
  );
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      let token: string | undefined;
      if (endpoint.auth !== 'public' && firebaseUser) {
        token = await firebaseUser.getIdToken();
      } else if (endpoint.auth !== 'public') {
        throw new Error('Authentication required for this endpoint.');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint.path, {
        method: endpoint.method,
        headers,
        body: endpoint.method !== 'GET' && body ? body : undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setResponse(data);

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'API Request Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Send className="w-4 h-4" />
        Live API Tester
      </h4>
      
      {endpoint.method !== 'GET' && (
        <div className="space-y-2">
          <Label htmlFor="api-tester-body">Request Body</Label>
          <Textarea
            id="api-tester-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="font-mono text-xs"
            placeholder="Enter JSON request body..."
            disabled={isLoading}
          />
        </div>
      )}

      <Button onClick={handleSendRequest} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Send Request
      </Button>

      {(response || error) && (
        <div className="space-y-2 pt-4 border-t">
          <Label>Response</Label>
          <ScrollArea className="h-64 rounded-md border p-2 bg-background">
            {error ? (
              <div className="p-4 text-center text-destructive">
                <ServerCrash className="mx-auto h-8 w-8 mb-2" />
                <p>{error}</p>
              </div>
            ) : (
              <ReactJson
                src={response}
                theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'}
                collapsed={false}
                displayDataTypes={false}
                name={false}
                style={{ background: 'transparent' }}
              />
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
