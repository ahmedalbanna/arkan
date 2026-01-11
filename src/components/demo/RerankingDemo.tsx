'use client';

/**
 * Re-ranking Demo Component
 * Compare different re-ranking strategies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight } from 'lucide-react';

interface ComparisonResult {
  strategy: string;
  results: Array<{
    content: string;
    score: number;
    sourceFile?: string;
  }>;
  avgScore: number;
  time: number;
}

export function RerankingDemo() {
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);

  const runComparison = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/demo/rerank-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, strategy }),
      });

      const data = await response.json();
      setComparisons(data.comparisons || []);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const strategyLabels: Record<string, string> = {
    'cross-encoder': '🎯 Cross-Encoder',
    'bm25': '🔤 BM25 (Keyword)',
    'hybrid': '🌟 Hybrid',
    'all': '📊 All Strategies',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Re-ranking Comparison</CardTitle>
        <CardDescription>
          Compare how different re-ranking strategies affect search results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rerank-query">Search Query</Label>
            <Input
              id="rerank-query"
              placeholder="Enter your query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runComparison()}
            />
          </div>

          <div className="space-y-2">
            <Label>Re-ranking Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Compare All</SelectItem>
                <SelectItem value="cross-encoder">Cross-Encoder</SelectItem>
                <SelectItem value="bm25">BM25</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={runComparison} disabled={loading || !query.trim()} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Comparing...
            </>
          ) : (
            'Run Comparison'
          )}
        </Button>

        {/* Results */}
        {comparisons.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Comparison Results</h3>
              <Badge variant="outline">{comparisons.length} strategies</Badge>
            </div>

            {comparisons.map((comparison, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {strategyLabels[comparison.strategy] || comparison.strategy}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Avg Score: {comparison.avgScore.toFixed(3)}
                      </Badge>
                      <Badge variant="outline">{comparison.time}ms</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {comparison.results.slice(0, 3).map((result, resultIdx) => (
                      <div
                        key={resultIdx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                      >
                        <Badge variant="outline" className="mt-1">
                          #{resultIdx + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.score.toFixed(3)}
                            </Badge>
                            {result.sourceFile && (
                              <span className="text-xs text-muted-foreground truncate">
                                {result.sourceFile}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Strategy Explanation */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">📚 Strategy Explanations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>🎯 Cross-Encoder:</strong> Uses a more accurate model to directly score query-document pairs. Best for precision.
                </div>
                <div>
                  <strong>🔤 BM25:</strong> Classic keyword-based ranking using term frequency and inverse document frequency. Fast and interpretable.
                </div>
                <div>
                  <strong>🌟 Hybrid:</strong> Combines semantic similarity (50%), keyword matching (30%), and recency (20%) for balanced results.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
