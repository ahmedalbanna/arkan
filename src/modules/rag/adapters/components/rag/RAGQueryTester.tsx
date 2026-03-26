'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { apiService } from '@/infrastructure/api/ApiService';

interface SearchResult {
  content: string;
  score: number;
  sourceFile?: string;
  projectId?: string;
  chunkIndex: number;
}

interface RetrievalResponse {
  sources?: SearchResult[];
}

export function RAGQueryTester(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0.5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const formattedMinScore = useMemo(() => minScore.toFixed(2), [minScore]);

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) {
      setError('Please enter a query');
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(false);
    const startTime = Date.now();

    try {
      const data = await apiService<
        { query: string; projectId?: string; topK: number; minScore: number },
        RetrievalResponse
      >({
        endpoint: '/api/rag/retrieve-context',
        method: 'POST',
        data: {
          query,
          projectId: projectId || undefined,
          topK,
          minScore,
        },
      });

      setResults(data.sources ?? []);
      setSearchTime(Date.now() - startTime);
      setHasSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve context');
      setResults([]);
      setSearchTime(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Tester</CardTitle>
        <CardDescription>Test RAG queries and view search results in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="query">Search Query</Label>
          <div className="flex gap-2">
            <Input
              id="query"
              placeholder="What is machine learning?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !loading) {
                  void handleSearch();
                }
              }}
              disabled={loading}
            />
            <Button onClick={() => void handleSearch()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="sr-only">Run query</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-id">Project ID (optional)</Label>
            <Input
              id="project-id"
              placeholder="project-123"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="top-k">Top results</Label>
              <Badge variant="outline">{topK}</Badge>
            </div>
            <Slider
              id="top-k"
              min={1}
              max={10}
              step={1}
              value={[topK]}
              onValueChange={(value) => setTopK(value[0] ?? 5)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="min-score">Minimum score</Label>
            <Badge variant="outline">{formattedMinScore}</Badge>
          </div>
          <Slider
            id="min-score"
            min={0}
            max={1}
            step={0.05}
            value={[minScore]}
            onValueChange={(value) => setMinScore(value[0] ?? 0.5)}
            disabled={loading}
          />
        </div>

        {searchTime !== null ? (
          <Badge variant="secondary">Search completed in {searchTime}ms</Badge>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {hasSearched && !loading && results.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">No results found for this query.</p>
        ) : null}

        {results.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Results</h3>
              <Badge variant="outline">{results.length} matches</Badge>
            </div>
            {results.map((result, index) => (
              <Card key={`${result.projectId ?? 'project'}-${result.chunkIndex}-${index}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">Result #{index + 1}</CardTitle>
                    <Badge variant="secondary">Score: {result.score.toFixed(3)}</Badge>
                    {result.sourceFile ? <Badge variant="outline">{result.sourceFile}</Badge> : null}
                    {result.projectId ? <Badge variant="outline">{result.projectId}</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
