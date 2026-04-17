'use client';

/**
 * Indexing Settings Component
 * Configure chunking and indexing parameters
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IndexingOptions } from './types';

interface Props {
  options: IndexingOptions;
  onChange: (options: IndexingOptions) => void;
}

export function IndexingSettings({ options, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indexing Settings</CardTitle>
        <CardDescription>
          Configure how documents are processed and indexed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chunk Size */}
        <div className="space-y-2">
          <Label>Chunk Size: {options.chunkSize} characters</Label>
          <Slider
            value={[options.chunkSize]}
            onValueChange={([value]) => onChange({ ...options, chunkSize: value })}
            min={100}
            max={1000}
            step={50}
          />
          <p className="text-xs text-muted-foreground">
            Smaller chunks = more precise search, but more chunks. Recommended: 300-500
          </p>
        </div>

        {/* Overlap */}
        <div className="space-y-2">
          <Label>Chunk Overlap: {options.overlap} characters</Label>
          <Slider
            value={[options.overlap]}
            onValueChange={([value]) => onChange({ ...options, overlap: value })}
            min={0}
            max={200}
            step={10}
          />
          <p className="text-xs text-muted-foreground">
            Overlap helps maintain context between chunks. Recommended: 50-100
          </p>
        </div>

        {/* Document Type */}
        <div className="space-y-2">
          <Label>Document Type</Label>
          <Select
            value={options.type}
            onValueChange={(value: any) => onChange({ ...options, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="context">Context (General Knowledge)</SelectItem>
              <SelectItem value="reference">Reference (Documentation)</SelectItem>
              <SelectItem value="report">Report (Generated Content)</SelectItem>
              <SelectItem value="user_upload">User Upload</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Type helps organize and filter documents
          </p>
        </div>

        {/* User ID (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="userId">User ID (Optional)</Label>
          <Input
            id="userId"
            placeholder="Optional: associate with a user"
            value={options.userId || ''}
            onChange={(e) => onChange({ ...options, userId: e.target.value })}
          />
        </div>

        {/* Embedding Info */}
        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
          <h4 className="font-semibold">Embedding Configuration:</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Model: <strong>nomic-embed-text</strong></li>
            <li>• Dimensions: <strong>768</strong></li>
            <li>• Provider: <strong>Ollama</strong></li>
            <li>• Distance: <strong>Cosine Similarity</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
