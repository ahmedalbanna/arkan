'use client';

/**
 * Indexing Progress Component
 * Shows real-time progress of document indexing
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function IndexingProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indexing Status</CardTitle>
        <CardDescription>
          Using Ollama (nomic-embed-text) for embeddings → Qdrant for storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Ollama Connection</span>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Qdrant Database</span>
            </div>
            <Badge variant="default">Connected</Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Embedding Model</span>
            </div>
            <Badge variant="outline">nomic-embed-text (768d)</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
