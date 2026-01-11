/**
 * RAG Monitoring Dashboard Page
 * 
 * Admin page for monitoring RAG system health and performance
 */

import { RAGHealthMonitor } from '@/components/admin/rag/RAGHealthMonitor';
import { RAGStatsPanel } from '@/components/admin/rag/RAGStatsPanel';
import { RAGQueryTester } from '@/components/admin/rag/RAGQueryTester';

export default function RAGMonitorPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">RAG System Monitor</h1>
        <p className="text-muted-foreground">
          Monitor and manage your Retrieval-Augmented Generation system
        </p>
      </div>

      {/* Health Monitor */}
      <RAGHealthMonitor />

      {/* Statistics Panel */}
      <RAGStatsPanel />

      {/* Query Tester */}
      <RAGQueryTester />
    </div>
  );
}
