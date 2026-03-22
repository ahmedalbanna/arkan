'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/infrastructure/api/ApiService';

interface HealthCheck {
  status: 'ok' | 'error' | 'unknown';
  details: unknown;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  checks: {
    config: HealthCheck;
    vectorStore: HealthCheck;
    ollama: HealthCheck;
  };
  config: {
    provider: string;
    embeddingModel: string;
    vectorDimension: number;
  };
}

const checkLabels: Record<keyof HealthStatus['checks'], string> = {
  config: 'Configuration',
  vectorStore: 'Vector Store',
  ollama: 'Ollama',
};

const getStatusIcon = (status: string): React.ReactNode => {
  if (status === 'ok' || status === 'healthy') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }

  if (status === 'error') {
    return <XCircle className="h-5 w-5 text-red-500" />;
  }

  return <AlertCircle className="h-5 w-5 text-yellow-500" />;
};

const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  if (status === 'ok' || status === 'healthy') {
    return 'default';
  }

  if (status === 'error') {
    return 'destructive';
  }

  if (status === 'degraded') {
    return 'secondary';
  }

  return 'outline';
};

export function RAGHealthMonitor(): React.JSX.Element {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService<undefined, HealthStatus>({ endpoint: '/api/rag/health' });
      setHealth(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void fetchHealth();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading health status: {error}
        </AlertDescription>
        <Button onClick={() => void fetchHealth()} variant="outline" size="sm" className="mt-2 w-fit">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">RAG Health Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Monitor the status of your RAG system components
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => void fetchHealth()} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh((current) => !current)}
            size="sm"
            variant={autoRefresh ? 'default' : 'outline'}
          >
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {loading && !health ? (
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Loading health status...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Checking RAG services
          </CardContent>
        </Card>
      ) : null}

      {health ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="md:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(health.status)}
                  System Status
                </CardTitle>
                <CardDescription>Overall health of the RAG stack</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant={getStatusBadgeVariant(health.status)}>
                  {health.status.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(health.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 xl:col-span-3">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Active runtime configuration</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">Provider</p>
                  <p className="text-sm text-muted-foreground">{health.config.provider}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Embedding Model</p>
                  <p className="text-sm text-muted-foreground">{health.config.embeddingModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vector Dimension</p>
                  <p className="text-sm text-muted-foreground">{health.config.vectorDimension}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(health.checks).map(([key, check]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <span>{checkLabels[key as keyof HealthStatus['checks']]}</span>
                    {getStatusIcon(check.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant={getStatusBadgeVariant(check.status)}>
                    {check.status.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {typeof check.details === 'string'
                      ? check.details
                      : 'Component responded successfully.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
