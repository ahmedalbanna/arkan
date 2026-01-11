/**
 * Interactive RAG Demo Page
 * 
 * A comprehensive demonstration of the RAG system with:
 * - Real-time search testing
 * - Performance comparison
 * - Caching demonstration
 * - Re-ranking comparison
 */

import { RAGDemoInterface } from '@/components/demo/RAGDemoInterface';

export default function RAGDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            RAG System Interactive Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Experience the power of Retrieval-Augmented Generation with real-time search, 
            intelligent caching, and advanced re-ranking.
          </p>
        </div>

        {/* Demo Interface */}
        <RAGDemoInterface />

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-semibold text-lg">🚀 Vector Search</h3>
            <p className="text-sm text-muted-foreground">
              Find semantically similar content using 768-dimensional embeddings 
              powered by Qdrant and Ollama.
            </p>
          </div>
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-semibold text-lg">💾 Smart Caching</h3>
            <p className="text-sm text-muted-foreground">
              LRU cache for embeddings and search results reduces latency by up to 90% 
              for repeated queries.
            </p>
          </div>
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-semibold text-lg">🎯 Re-ranking</h3>
            <p className="text-sm text-muted-foreground">
              Hybrid re-ranking combines semantic similarity, BM25 keyword matching, 
              and recency for optimal results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
