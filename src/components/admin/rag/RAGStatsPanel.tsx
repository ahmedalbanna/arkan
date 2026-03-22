'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Database, FileText, RefreshCw, TrendingUp, Zap } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/infrastructure/api/ApiService';

interface RAGStats {
  totalChunks: number;
  projects: { projectId: string; count: number }[];
  averageChunkSize: number;
  recentActivity: {
    indexing: number;
    retrieval: number;
    avgSearchTime: number;
  };
}

export function RAGStatsPanel(): React.JSX.Element {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService<undefined, RAGStats>({ endpoint: '/api/rag/stats' });
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RAG stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin" />
            Loading statistics...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load RAG stats: {error}</AlertDescription>
        <Button onClick={() => void fetchStats()} variant="outline" size="sm" className="mt-2 w-fit">
          Retry
        </Button>
      </Alert>
    );
  }

  const safeStats = stats ?? {
    totalChunks: 0,
    projects: [],
    averageChunkSize: 0,
    recentActivity: { indexing: 0, retrieval: 0, avgSearchTime: 0 },
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalChunks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Indexed document chunks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.projects.length}</div>
            <p className="text-xs text-muted-foreground">Projects with indexed data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Search Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.recentActivity.avgSearchTime}ms</div>
            <p className="text-xs text-muted-foreground">Last 100 queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeStats.recentActivity.indexing + safeStats.recentActivity.retrieval}
            </div>
            <p className="text-xs text-muted-foreground">Operations (24h)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Project Distribution</CardTitle>
              <CardDescription>Chunks per project</CardDescription>
            </div>
            <Button onClick={() => void fetchStats()} variant="outline" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {safeStats.projects.length > 0 ? (
            <div className="space-y-4">
              {safeStats.projects.map((project) => {
                const percentage = safeStats.totalChunks > 0
                  ? (project.count / safeStats.totalChunks) * 100
                  : 0;

                return (
                  <div key={project.projectId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{project.projectId}</span>
                      <span>{project.count} chunks</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No project distribution data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
