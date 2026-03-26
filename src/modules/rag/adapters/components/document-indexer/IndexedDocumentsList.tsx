'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, Trash2, Search, FileText } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { apiService } from '@/infrastructure/api/ApiService';

interface IndexedDocument {
  id: string;
  projectId: string;
  sourceFile: string;
  chunksCount: number;
  timestamp: number;
  type: string;
}

export function IndexedDocumentsList() {
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiService<undefined, { documents?: IndexedDocument[] }>({ endpoint: '/api/admin/rag/documents' });
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (projectId: string) => {
    try {
      await apiService<undefined, unknown>({ endpoint: `/api/admin/rag/documents?projectId=${projectId}`, method: 'DELETE' });
      fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const filteredDocuments = safeDocuments.filter((doc) => 
    doc.sourceFile?.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (!filterProject || doc.projectId === filterProject)
  );
  const projects = Array.from(new Set(safeDocuments.map((d) => d.projectId)));
  const totalChunks = safeDocuments.reduce((sum, d) => sum + (d.chunksCount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle>Indexed Documents</CardTitle><CardDescription>{documents.length} documents with {totalChunks.toLocaleString()} chunks</CardDescription></div>
          <Button onClick={fetchDocuments} variant="outline" size="sm" disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}><option value="">All Projects</option>{projects.map((project) => <option key={project} value={project}>{project}</option>)}</select></div>
        {loading ? <div className="text-center py-8 text-muted-foreground">Loading documents...</div> : filteredDocuments.length === 0 ? <div className="text-center py-8 text-muted-foreground">No documents found</div> : <div className="space-y-2">{filteredDocuments.map((doc) => <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"><div className="flex items-center gap-3 flex-1 min-w-0"><FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" /><div className="flex-1 min-w-0"><p className="font-medium truncate">{doc.sourceFile}</p><div className="flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline">{doc.projectId}</Badge><span>•</span><span>{doc.chunksCount} chunks</span><span>•</span><span>{new Date(doc.timestamp).toLocaleDateString()}</span></div></div></div><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Document?</AlertDialogTitle><AlertDialogDescription>This will remove all chunks from project "{doc.projectId}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteDocument(doc.projectId)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>)}</div>}
      </CardContent>
    </Card>
  );
}
