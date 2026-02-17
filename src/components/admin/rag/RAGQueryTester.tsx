'use client';

/**
 * RAG Query Tester
 * 
 * Interactive tool for testing RAG queries and viewing results
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SearchResult {
  content: string;
  score: number;
  sourceFile?: string;
  projectId?: string;
  chunkIndex: number;
}

export function RAGQueryTester() {
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0.5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/rag/retrieve-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          projectId: projectId || undefined,
          topK,
          minScore,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.sources || []);
      setSearchTime(Date.now() - startTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Tester</CardTitle>
        <CardDescription>
          Test RAG queries and view search results in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Query Input */}
        <div className="space-y-2">
          <Label htmlFor="query">Search Query</Label>
          <div className="flex gap-2">
            <Input
              id="query"
              placeholder="What is machine learning?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID (Optional)</Label>
            <Input
              id="projectId"
              placeholder="filter-by-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Top K Results: {topK}</Label>
            <Slider
              value={[topK]}
              onValueChange={([value]) => setTopK(value)}
              min={1}
              max={20}
              step={1}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Min Score: {minScore.toFixed(2)}</Label>
            <Slider
              value={[minScore]}
              onValueChange={([value]) => setMinScore(value)}
              min={0}
              max={1}
              step={0.05}
              disabled={loading}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Search Results ({results.length})
              </h3>
              {searchTime && (
                <Badge variant="outline">
                  {searchTime}ms
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {results.map((result, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              Score: {result.score.toFixed(3)}
                            </Badge>
                            {result.sourceFile && (
                              <Badge variant="outline">
                                {result.sourceFile}
                              </Badge>
                            )}
                            {result.projectId && (
                              <Badge variant="outline">
                                {result.projectId}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {result.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            No results found. Try adjusting your query or filters.
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !query && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Enter a query to test the RAG system
          </div>
        )}
      </CardContent>
    </Card>
  );
}
