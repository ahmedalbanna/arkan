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
import { useDocumentIndexing } from '@/modules/admin/adapters/hooks/useDocumentIndexing';

import { Badge } from '@/components/ui/badge';
import { Upload, Database, Settings, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { Card, CardContent } from '@/components/ui/card';

export function DocumentIndexerInterface() {
  const { activeTab, setActiveTab, indexingOptions, setIndexingOptions } = useDocumentIndexing();

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                RAG Ingestion Console
            </h3>
        </div>
        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Qdrant Synchronized
        </Badge>
      </header>

      <CardContent className="p-8 md:p-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="h-11 rounded-xl bg-muted/30 p-1 gap-1 min-w-[500px]">
              <TabsTrigger value="upload" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                <Upload className="h-3.5 w-3.5" />
                Upload & Index
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                <Database className="h-3.5 w-3.5" />
                Manage Library
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                <Settings className="h-3.5 w-3.5" />
                System Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02] bg-[#f8fafc] dark:bg-black/20 shadow-inner p-8">
            <TabsContent value="upload" className="m-0 focus-visible:ring-0 space-y-8 animate-in fade-in duration-500">
              <FileUploadZone
                indexingOptions={indexingOptions}
                onOptionsChange={setIndexingOptions}
              />
              <IndexingProgress />
            </TabsContent>

            <TabsContent value="documents" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
              <IndexedDocumentsList />
            </TabsContent>

            <TabsContent value="settings" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
              <IndexingSettings
                options={indexingOptions}
                onChange={setIndexingOptions}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan Ingestion Engine • RAG Node V1.0
          </p>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                  Vector Dimension: 768
              </Badge>
          </div>
      </footer>
    </Card>
  );
}
