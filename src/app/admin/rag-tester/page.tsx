/**
 * Admin RAG Query Tester Page
 * 
 * Real-time testing interface for RAG queries
 * - Test search queries
 * - View detailed results
 * - Monitor performance
 * - Compare strategies
 */

import { RAGQueryTesterInterface } from '@/components/admin/rag-tester/RAGQueryTesterInterface';

export default function RAGTesterPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">RAG Query Tester</h1>
          <p className="text-muted-foreground">
            Test RAG queries in real-time, view search results, and monitor performance with Ollama + Qdrant
          </p>
        </div>

        {/* Main Interface */}
        <RAGQueryTesterInterface />

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-semibold text-lg">🔍 Semantic Search</h3>
            <p className="text-sm text-muted-foreground">
              Queries are converted to 768d vectors using Ollama's nomic-embed-text model for semantic matching.
            </p>
          </div>
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-semibold text-lg">⚡ Real-Time</h3>
            <p className="text-sm text-muted-foreground">
              See search results instantly with relevance scores, source files, and performance metrics.
            </p>
          </div>
          <div className="rounded-lg border p-6 space-y-2">
            <h3 className="font-semibold text-lg">🎯 Advanced Options</h3>
            <p className="text-sm text-muted-foreground">
              Filter by project, adjust relevance threshold, enable caching and re-ranking for optimal results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
