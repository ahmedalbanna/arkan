'use client';

import { useState } from 'react';
import { Search, Image, MapPin, ShoppingCart, Newspaper, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type {
  GoogleSearchToolOutput,
  SearchResult,
  ImageResult,
  MapResult,
  ShoppingResult,
  NewsResult,
} from '@/ai/tools/schemas';

interface GoogleSearchToolProps {
  onSearch?: (results: GoogleSearchToolOutput) => void;
}

export function GoogleSearchTool({ onSearch }: GoogleSearchToolProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'web' | 'images' | 'maps' | 'shopping' | 'news'>('web');
  const [maxResults, setMaxResults] = useState(10);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GoogleSearchToolOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          searchType,
          maxResults,
          language,
          safeSearch: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform search');
      }

      const data: GoogleSearchToolOutput = await response.json();
      setResults(data);
      onSearch?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWebResults = (results: SearchResult[]) => (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                {result.title}
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardTitle>
            {result.displayUrl && (
              <CardDescription className="text-green-700">{result.displayUrl}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{result.snippet}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderImageResults = (results: ImageResult[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {results.map((result, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            <div className="aspect-square relative bg-muted">
              <img
                src={result.thumbnailUrl}
                alt={result.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate">{result.title}</p>
              {result.source && (
                <p className="text-xs text-muted-foreground truncate">{result.source}</p>
              )}
              {result.width && result.height && (
                <p className="text-xs text-muted-foreground">
                  {result.width} × {result.height}
                </p>
              )}
            </CardContent>
          </a>
        </Card>
      ))}
    </div>
  );

  const renderMapResults = (results: MapResult[]) => (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  {result.name}
                </CardTitle>
                <CardDescription>{result.address}</CardDescription>
              </div>
              {result.rating && (
                <Badge variant="secondary" className="ml-2">
                  ⭐ {result.rating.toFixed(1)}
                  {result.reviewCount && ` (${result.reviewCount})`}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.category && (
              <p className="text-sm text-muted-foreground">{result.category}</p>
            )}
            {result.phone && (
              <p className="text-sm">
                <span className="font-medium">Phone:</span> {result.phone}
              </p>
            )}
            {result.website && (
              <a
                href={result.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderShoppingResults = (results: ShoppingResult[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((result, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          {result.imageUrl && (
            <div className="aspect-square relative bg-muted">
              <img
                src={result.imageUrl}
                alt={result.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className="pb-3">
            <CardTitle className="text-base line-clamp-2">{result.title}</CardTitle>
            <CardDescription>{result.merchant}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {result.price} {result.currency}
              </span>
              {result.rating && (
                <Badge variant="secondary">
                  ⭐ {result.rating.toFixed(1)}
                </Badge>
              )}
            </div>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full" size="sm">
                View Product
              </Button>
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderNewsResults = (results: NewsResult[]) => (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            {result.imageUrl && (
              <div className="w-32 h-32 flex-shrink-0 bg-muted">
                <img
                  src={result.imageUrl}
                  alt={result.title}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {result.title}
                    </a>
                  </CardTitle>
                  <Badge variant="outline" className="flex-shrink-0">
                    <Newspaper className="h-3 w-3 mr-1" />
                    {result.source}
                  </Badge>
                </div>
                {result.publishedDate && (
                  <CardDescription className="text-xs">
                    {new Date(result.publishedDate).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {result.snippet}
                </p>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <Search className="h-4 w-4" />;
      case 'images':
        return <Image className="h-4 w-4" />;
      case 'maps':
        return <MapPin className="h-4 w-4" />;
      case 'shopping':
        return <ShoppingCart className="h-4 w-4" />;
      case 'news':
        return <Newspaper className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Google Search Tool
          </CardTitle>
          <CardDescription>
            Access real-time search results from Google including web, images, maps, shopping, and news
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchType">Search Type</Label>
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger id="searchType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Web Search
                    </div>
                  </SelectItem>
                  <SelectItem value="images">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Image Search
                    </div>
                  </SelectItem>
                  <SelectItem value="maps">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Maps Search
                    </div>
                  </SelectItem>
                  <SelectItem value="shopping">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Shopping Search
                    </div>
                  </SelectItem>
                  <SelectItem value="news">
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4" />
                      News Search
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxResults">Max Results</Label>
              <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))}>
                <SelectTrigger id="maxResults">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 results</SelectItem>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="15">15 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                {getSearchTypeIcon(searchType)}
                <span className="ml-2">Search</span>
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {results.totalResults} results for "{results.query}"
                  {results.searchTime && ` in ${results.searchTime}ms`}
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                {getSearchTypeIcon(results.searchType)}
                {results.searchType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {results.searchType === 'web' && renderWebResults(results.results as SearchResult[])}
            {results.searchType === 'images' && renderImageResults(results.results as ImageResult[])}
            {results.searchType === 'maps' && renderMapResults(results.results as MapResult[])}
            {results.searchType === 'shopping' && renderShoppingResults(results.results as ShoppingResult[])}
            {results.searchType === 'news' && renderNewsResults(results.results as NewsResult[])}

            {results.relatedSearches && results.relatedSearches.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3">Related Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {results.relatedSearches.map((relatedQuery, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setQuery(relatedQuery)}
                    >
                      {relatedQuery}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
