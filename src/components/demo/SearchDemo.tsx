'use client';

/**
 * Basic Search Demo Component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, CheckCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { apiService } from '@/infrastructure/api/ApiService';

interface SearchResult {
  content: string;
  score: number;
  sourceFile?: string;
  type: string;
}

export function SearchDemo() {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0.5);
  const [useCache, setUseCache] = useState(true);
  const [rerank, setRerank] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [cacheHit, setCacheHit] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setCacheHit(false);
    const startTime = Date.now();

    try {
      const data = await apiService<any, any>({
        endpoint: '/api/demo/search',
        method: 'POST',
        data: {
          query,
          topK,
          minScore,
          useCache,
          rerank,
        },
      });

      setResults(data.sources || []);
      setSearchTime(Date.now() - startTime);
      setCacheHit(data.cacheHit || false);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'What is machine learning?',
    'How to build web applications?',
    'Explain vector databases',
    'What is semantic search?',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Demo</CardTitle>
        <CardDescription>
          Test the RAG search system with your own queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="query">Search Query</Label>
          <div className="flex gap-2">
            <Input
              id="query"
              placeholder="Enter your search query..."
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

        {/* Sample Queries */}
        <div className="space-y-2">
          <Label>Try These Queries:</Label>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setQuery(sample)}
              >
                {sample}
              </Badge>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Top K Results: {topK}</Label>
            <Slider
              value={[topK]}
              onValueChange={([value]) => setTopK(value)}
              min={1}
              max={10}
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

        {/* Advanced Options */}
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="cache"
              checked={useCache}
              onCheckedChange={setUseCache}
              disabled={loading}
            />
            <Label htmlFor="cache">Use Cache</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="rerank"
              checked={rerank}
              onCheckedChange={setRerank}
              disabled={loading}
            />
            <Label htmlFor="rerank">Re-ranking</Label>
          </div>
        </div>

        {/* Results */}
        {searchTime !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={cacheHit ? 'default' : 'secondary'}>
              {searchTime}ms
            </Badge>
            {cacheHit && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Cache Hit
              </Badge>
            )}
            <span className="text-muted-foreground">
              Found {results.length} results
            </span>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Score: {result.score.toFixed(3)}
                      </Badge>
                      {result.sourceFile && (
                        <Badge variant="outline">{result.sourceFile}</Badge>
                      )}
                      <Badge variant="outline">{result.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            No results found. Try adjusting your query or filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
