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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Diagnostic Query Lab
            </h3>
        </div>
        <div className="flex items-center gap-2">
            {searchTime !== null && (
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                    Retrieval: {searchTime}ms
                </Badge>
            )}
        </div>
      </header>

      <CardContent className="p-8 md:p-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* Search HUD */}
            <div className="space-y-8">
                <div className="space-y-3">
                    <Label htmlFor="query" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Search Logic</Label>
                    <div className="flex gap-2">
                        <Input
                            id="query"
                            placeholder="Enter system query..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !loading) {
                                    void handleSearch();
                                }
                            }}
                            disabled={loading}
                            className="h-12 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl"
                        />
                        <Button
                            onClick={() => void handleSearch()}
                            disabled={loading}
                            className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Derived Content</h4>
                    </div>

                    <ScrollArea className="h-[500px] rounded-3xl border bg-background/50 shadow-inner relative group">
                        <div className="p-6 space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-40">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Semantic Probe</p>
                                </div>
                            ) : results.length > 0 ? (
                                results.map((result, index) => (
                                    <div key={index} className="group relative flex flex-col p-6 rounded-2xl border border-border/40 bg-card hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold bg-muted/50 text-muted-foreground w-5 h-5 rounded flex items-center justify-center border">{index + 1}</span>
                                                <Badge variant="secondary" className="h-4.5 text-[9px] font-bold tracking-tighter">
                                                    Score: {result.score.toFixed(3)}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {result.sourceFile && <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter border-border/60">{result.sourceFile}</Badge>}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground italic leading-relaxed font-serif">
                                            "{result.content}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center opacity-40 space-y-4">
                                    <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center">
                                        <Search className="h-8 w-8 text-primary/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Probe Pending</h3>
                                        <p className="text-[10px] italic max-w-[200px] mx-auto leading-relaxed">Initialize a query above to begin semantic retrieval.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Parameter Sidebar */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Logic Constraints</Label>

                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl border bg-muted/5 space-y-4">
                            <Label htmlFor="project-id" className="text-[10px] font-bold uppercase opacity-40">Project Filter</Label>
                            <Input
                                id="project-id"
                                placeholder="Identifier..."
                                value={projectId}
                                onChange={(event) => setProjectId(event.target.value)}
                                disabled={loading}
                                className="h-8 text-[11px] bg-background border-none shadow-sm"
                            />
                        </div>

                        <div className="p-5 rounded-2xl border bg-muted/5 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">Top Results</Label>
                                    <Badge variant="secondary" className="h-4.5 text-[9px]">{topK}</Badge>
                                </div>
                                <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[topK]}
                                    onValueChange={(value) => setTopK(value[0] ?? 5)}
                                    disabled={loading}
                                />
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">Min Relevance</Label>
                                    <Badge variant="secondary" className="h-4.5 text-[9px]">{formattedMinScore}</Badge>
                                </div>
                                <Slider
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={[minScore]}
                                    onValueChange={(value) => setMinScore(value[0] ?? 0.5)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border bg-primary/[0.02] border-dashed text-center space-y-2">
                    <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                        Query results are derived from the Qdrant vector store using semantic similarity.
                    </p>
                </div>
            </div>
        </div>
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan Retrieval Engine • Probe Node V1.0
          </p>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                  Vector Topology Verified
              </Badge>
          </div>
      </footer>
    </Card>
  );
}
