'use client';

/**
 * Document Indexer Interface
 * Main component for uploading and indexing documents
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadZone } from './FileUploadZone';
import { IndexingProgress } from './IndexingProgress';
import { IndexedDocumentsList } from './IndexedDocumentsList';
import { IndexingSettings } from './IndexingSettings';

export interface IndexingOptions {
  projectId: string;
  userId?: string;
  chunkSize: number;
  overlap: number;
  type: 'report' | 'reference' | 'context' | 'user_upload';
}

export function DocumentIndexerInterface() {
  const [activeTab, setActiveTab] = useState('upload');
  const [indexingOptions, setIndexingOptions] = useState<IndexingOptions>({
    projectId: '',
    chunkSize: 400,
    overlap: 50,
    type: 'context',
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">📤 Upload & Index</TabsTrigger>
          <TabsTrigger value="documents">📚 Manage Documents</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <FileUploadZone 
            indexingOptions={indexingOptions}
            onOptionsChange={setIndexingOptions}
          />
          <IndexingProgress />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <IndexedDocumentsList />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <IndexingSettings
            options={indexingOptions}
            onChange={setIndexingOptions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
