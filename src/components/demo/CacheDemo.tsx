'use client';

/**
 * Cache Demo Component
 * Shows cache statistics and allows cache management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/infrastructure/api/ApiService';

interface CacheStats {
  embeddings: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  searches: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  total: {
    size: number;
    hitRate: number;
  };
}

export function CacheDemo() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiService<never, CacheStats>({ endpoint: '/api/demo/cache-stats' });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await apiService({ endpoint: '/api/demo/cache-stats', method: 'DELETE' });
      await fetchStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cache Statistics</CardTitle>
            <CardDescription>
              Monitor cache performance and hit rates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={clearCache} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats && (
          <>
            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Cached Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total.size}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Overall Hit Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(stats.total.hitRate * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Performance Gain</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="default" className="text-lg">
                    {(stats.total.hitRate * 90).toFixed(0)}% faster
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Embedding Cache */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Embedding Cache</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.embeddings.size}</div>
                    <div className="text-xs text-muted-foreground">Cached Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.embeddings.hits}</div>
                    <div className="text-xs text-muted-foreground">Cache Hits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.embeddings.misses}</div>
                    <div className="text-xs text-muted-foreground">Cache Misses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {(stats.embeddings.hitRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Efficiency</span>
                    <span>{(stats.embeddings.hitRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.embeddings.hitRate * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Search Cache */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Search Result Cache</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.searches.size}</div>
                    <div className="text-xs text-muted-foreground">Cached Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.searches.hits}</div>
                    <div className="text-xs text-muted-foreground">Cache Hits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.searches.misses}</div>
                    <div className="text-xs text-muted-foreground">Cache Misses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {(stats.searches.hitRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Efficiency</span>
                    <span>{(stats.searches.hitRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.searches.hitRate * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">💡 Cache Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Embedding cache avoids regenerating vectors (saves ~50-100ms per query)</li>
                <li>Search cache returns instant results for repeated queries (90%+ faster)</li>
                <li>LRU eviction keeps memory usage under control</li>
                <li>TTL ensures fresh results (1 hour for searches, 24 hours for embeddings)</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
