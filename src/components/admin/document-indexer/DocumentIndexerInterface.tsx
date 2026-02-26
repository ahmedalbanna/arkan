'use client';

/**
 * Document Indexer Interface
 * Main component for uploading and indexing documents
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadZone } from './FileUploadZone';
import { IndexingProgress } from './IndexingProgress';
import { IndexedDocumentsList } from './IndexedDocumentsList';
import { IndexingSettings } from './IndexingSettings';
import { useDocumentIndexing } from '@/hooks/admin/useDocumentIndexing';
import type { IndexingOptions } from '@/hooks/admin/useDocumentIndexing';

export type { IndexingOptions };

export function DocumentIndexerInterface() {
  const { activeTab, setActiveTab, indexingOptions, setIndexingOptions } = useDocumentIndexing();

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
