'use client';

/**
 * RAG Health Monitor Component
 * 
 * Displays the health status of the RAG system for admins
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HealthCheck {
  status: 'ok' | 'error' | 'unknown';
  details: any;
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

export function RAGHealthMonitor() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/rag/health');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ok: 'default' as const,
      healthy: 'default' as const,
      error: 'destructive' as const,
      degraded: 'secondary' as const,
      unknown: 'outline' as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading health status: {error}
        </AlertDescription>
        <Button onClick={fetchHealth} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RAG Health Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Monitor the status of your RAG system components
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchHealth}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
            variant={autoRefresh ? 'default' : 'outline'}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
        </div>
      </div>

      {health && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.status)}
                  <CardTitle>Overall Status</CardTitle>
                </div>
                {getStatusBadge(health.status)}
              </div>
              <CardDescription>
                Last updated: {new Date(health.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Provider</div>
                  <div className="font-mono">{health.config.provider}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Embedding Model</div>
                  <div className="font-mono">{health.config.embeddingModel}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Vector Dimension</div>
                  <div className="font-mono">{health.config.vectorDimension}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Check */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.checks.config.status)}
                  <CardTitle>Configuration</CardTitle>
                </div>
                {getStatusBadge(health.checks.config.status)}
              </div>
            </CardHeader>
            <CardContent>
              {health.checks.config.details.errors?.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {health.checks.config.details.errors.map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Vector Store Check */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.checks.vectorStore.status)}
                  <CardTitle>Vector Store</CardTitle>
                </div>
                {getStatusBadge(health.checks.vectorStore.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {health.checks.vectorStore.details.type && (
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    <span className="font-mono">{health.checks.vectorStore.details.type}</span>
                  </div>
                )}
                {health.checks.vectorStore.details.url && (
                  <div>
                    <span className="font-medium">URL:</span>{' '}
                    <span className="font-mono">{health.checks.vectorStore.details.url}</span>
                  </div>
                )}
                {health.checks.vectorStore.details.collection && (
                  <div>
                    <span className="font-medium">Collection:</span>{' '}
                    <span className="font-mono">{health.checks.vectorStore.details.collection}</span>
                  </div>
                )}
                {health.checks.vectorStore.details.totalChunks !== undefined && (
                  <div>
                    <span className="font-medium">Total Chunks:</span>{' '}
                    <span className="font-mono">{health.checks.vectorStore.details.totalChunks.toLocaleString()}</span>
                  </div>
                )}
                {health.checks.vectorStore.details.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{health.checks.vectorStore.details.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ollama Check */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.checks.ollama.status)}
                  <CardTitle>Ollama Embedding Service</CardTitle>
                </div>
                {getStatusBadge(health.checks.ollama.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {health.checks.ollama.details.url && (
                  <div>
                    <span className="font-medium">URL:</span>{' '}
                    <span className="font-mono">{health.checks.ollama.details.url}</span>
                  </div>
                )}
                {health.checks.ollama.details.model && (
                  <div>
                    <span className="font-medium">Model:</span>{' '}
                    <span className="font-mono">{health.checks.ollama.details.model}</span>
                  </div>
                )}
                {health.checks.ollama.details.modelAvailable !== undefined && (
                  <div>
                    <span className="font-medium">Model Available:</span>{' '}
                    <span className="font-mono">
                      {health.checks.ollama.details.modelAvailable ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {health.checks.ollama.details.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{health.checks.ollama.details.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
