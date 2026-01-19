'use client';

/**
 * File Upload Zone Component
 * Drag-and-drop file upload interface
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { IndexingOptions } from './DocumentIndexerInterface';

interface FileWithPreview extends File {
  preview?: string;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  chunksCreated?: number;
}

interface Props {
  indexingOptions: IndexingOptions;
  onOptionsChange: (options: IndexingOptions) => void;
}

export function FileUploadZone({ indexingOptions, onOptionsChange }: Props) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map(file => 
      Object.assign(file, { status: 'pending' as const })
    );
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!indexingOptions.projectId.trim()) {
      alert('Please enter a Project ID');
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const } : f
      ));

      try {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('projectId', indexingOptions.projectId);
        formData.append('chunkSize', String(indexingOptions.chunkSize));
        formData.append('overlap', String(indexingOptions.overlap));
        formData.append('type', indexingOptions.type);
        if (indexingOptions.userId) {
          formData.append('userId', indexingOptions.userId);
        }

        const response = await fetch('/api/admin/rag/index', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'success' as const,
              chunksCreated: result.chunksCreated 
            } : f
          ));
        } else {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error' as const,
              error: result.error || 'Upload failed'
            } : f
          ));
        }
      } catch (error) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : f
        ));
      }
    }

    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (!file || !file.name) return '📎';
    
    const filename = file.name.toLowerCase();
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.docx') || filename.endsWith('.doc')) return '📝';
    if (filename.endsWith('.txt') || filename.endsWith('.md')) return '📃';
    
    // Fallback to checking MIME type if available
    if (file.type) {
      if (file.type.includes('pdf')) return '📄';
      if (file.type.includes('word')) return '📝';
      if (file.type.includes('text')) return '📃';
    }
    
    return '📎';
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Drag and drop files or click to browse. Supported: PDF, DOCX, TXT, MD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project ID Input */}
        <div className="space-y-2">
          <Label htmlFor="projectId">
            Project ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="projectId"
            placeholder="e.g., my-project, documentation, research"
            value={indexingOptions.projectId}
            onChange={(e) => onOptionsChange({ ...indexingOptions, projectId: e.target.value })}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">
            Documents will be indexed under this project for filtering
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to select files
          </p>
          <input
            type="file"
            id="file-input"
            className="hidden"
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileInput}
            disabled={uploading}
          />
          <Button
            onClick={() => document.getElementById('file-input')?.click()}
            variant="outline"
            disabled={uploading}
          >
            Browse Files
          </Button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Selected Files ({files.length})</h3>
              {successCount > 0 && (
                <Badge variant="default">
                  {successCount} indexed
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                >
                  <div className="text-2xl">{getFileIcon(file)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{file.name}</p>
                      {file.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {file.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.chunksCreated && (
                        <Badge variant="outline" className="text-xs">
                          {file.chunksCreated} chunks
                        </Badge>
                      )}
                    </div>
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>

                  {file.status === 'pending' && (
                    <Button
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="sm"
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && pendingCount > 0 && (
          <div className="space-y-3">
            <Button
              onClick={uploadFiles}
              className="w-full"
              disabled={uploading || !indexingOptions.projectId.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Indexing {files.findIndex(f => f.status === 'uploading') + 1} of {pendingCount}...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Index {pendingCount} Document{pendingCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {errorCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorCount} file{errorCount !== 1 ? 's' : ''} failed to index. Check the errors above.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Summary */}
        {files.length > 0 && pendingCount === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All files processed! {successCount} successfully indexed, {errorCount} failed.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
