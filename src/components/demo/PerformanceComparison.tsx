'use client';

/**
 * Performance Comparison Component
 * Compares performance with/without caching and reranking
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BenchmarkResult {
  scenario: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  cacheHits: number;
  totalQueries: number;
}

export function PerformanceComparison() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runBenchmark = async () => {
    setLoading(true);
    setProgress(0);
    setResults([]);

    try {
      const response = await fetch('/api/demo/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              
              if (data.progress) {
                setProgress(data.progress);
              }
              
              if (data.result) {
                setResults(prev => [...prev, data.result]);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpeedupPercent = (baseline: number, optimized: number) => {
    return ((baseline - optimized) / baseline * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
        <CardDescription>
          Benchmark different configurations to see the impact of caching and re-ranking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Run multiple queries with different configurations
            </p>
          </div>
          <Button onClick={runBenchmark} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Benchmark
              </>
            )}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {results.map((result, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{result.scenario}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{result.avgTime.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">Avg Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{result.minTime.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">Min Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{result.maxTime.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">Max Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {result.cacheHits}/{result.totalQueries}
                        </div>
                        <div className="text-xs text-muted-foreground">Cache Hits</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.length >= 2 && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>With Cache vs Without:</span>
                      <Badge variant="default" className="text-lg">
                        {getSpeedupPercent(results[0].avgTime, results[1].avgTime)}% faster
                      </Badge>
                    </div>
                    {results.length >= 3 && (
                      <div className="flex items-center justify-between">
                        <span>With Re-ranking:</span>
                        <Badge variant="secondary" className="text-lg">
                          +{(results[2].avgTime - results[1].avgTime).toFixed(0)}ms overhead
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
