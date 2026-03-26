/**
 * Admin Document Indexer Page
 * 
 * Allows admins to upload and index documents into the RAG system
 * - Upload PDF, DOCX, TXT, MD files
 * - Configure indexing options
 * - Monitor indexing progress
 * - Manage indexed documents
 */

import { DocumentIndexerInterface } from '@/modules/rag/adapters/components/document-indexer/DocumentIndexerInterface';

export default function DocumentIndexerPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Document Indexer</h1>
          <p className="text-muted-foreground">
            Upload and index documents into the RAG system using Ollama (nomic-embed-text)
          </p>
        </div>

        {/* Main Interface */}
        <DocumentIndexerInterface />

        {/* Info Card */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="font-semibold mb-3">ℹ️ How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>1. Upload:</strong> Select PDF, DOCX, TXT, or Markdown files
            </li>
            <li>
              <strong>2. Processing:</strong> Text is extracted and split into chunks
            </li>
            <li>
              <strong>3. Embedding:</strong> Each chunk is converted to a 768-dimensional vector using Ollama's nomic-embed-text model
            </li>
            <li>
              <strong>4. Storage:</strong> Vectors are stored in Qdrant for semantic search
            </li>
            <li>
              <strong>5. Ready:</strong> Documents are now searchable in the RAG system
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
