'use client';

/**
 * RAG Statistics Panel
 * 
 * Displays detailed statistics about the RAG system
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, FileText, Zap, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

export function RAGStatsPanel() {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rag/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch RAG stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Chunks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalChunks.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            Indexed document chunks
          </p>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.projects.length || '0'}</div>
          <p className="text-xs text-muted-foreground">
            Projects with indexed data
          </p>
        </CardContent>
      </Card>

      {/* Average Search Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Search Time</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.recentActivity.avgSearchTime || '0'}ms
          </div>
          <p className="text-xs text-muted-foreground">
            Last 100 queries
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats?.recentActivity.indexing || 0) + (stats?.recentActivity.retrieval || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Operations (24h)
          </p>
        </CardContent>
      </Card>

      {/* Project Breakdown */}
      {stats && stats.projects.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Distribution</CardTitle>
                <CardDescription>Chunks per project</CardDescription>
              </div>
              <Button onClick={fetchStats} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.projects.map((project) => {
                const percentage = (project.count / stats.totalChunks) * 100;
                return (
                  <div key={project.projectId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{project.projectId}</span>
                      <span className="text-muted-foreground">
                        {project.count.toLocaleString()} chunks ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
