'use client';

/**
 * Main RAG Demo Interface Component
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchDemo } from './SearchDemo';
import { PerformanceComparison } from './PerformanceComparison';
import { CacheDemo } from './CacheDemo';
import { RerankingDemo } from './RerankingDemo';

export function RAGDemoInterface() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">🔍 Search Demo</TabsTrigger>
          <TabsTrigger value="performance">⚡ Performance</TabsTrigger>
          <TabsTrigger value="cache">💾 Caching</TabsTrigger>
          <TabsTrigger value="reranking">🎯 Re-ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <SearchDemo />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceComparison />
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CacheDemo />
        </TabsContent>

        <TabsContent value="reranking" className="space-y-4">
          <RerankingDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
