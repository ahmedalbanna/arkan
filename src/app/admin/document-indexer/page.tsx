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

import { Badge } from '@/components/ui/badge';
import { Database, Upload, Cpu, Save, Search, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

export default function DocumentIndexerPage() {
  const protocolNodes = [
    { step: "01", icon: Upload, title: "Upload", desc: "Select PDF, DOCX, TXT, or MD" },
    { step: "02", icon: Search, title: "Processing", desc: "Extract and chunk text" },
    { step: "03", icon: Cpu, title: "Embedding", desc: "nomic-embed-text (768d)" },
    { step: "04", icon: Save, title: "Storage", desc: "Qdrant Vector Database" },
    { step: "05", icon: CheckCircle2, title: "Ready", desc: "Semantic search active" }
  ];

  return (
    <div className="flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">RAG Core</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1.5">
                <Database className="h-3 w-3 fill-primary" />
                Knowledge Ingestion
              </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-foreground flex items-center gap-4">
              <Database className="w-10 h-10 text-primary animate-pulse" />
              Document Indexer
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
              Propagate your semantic knowledge base by indexing technical and academic documents into the Arkan RAG system.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-background border shadow-sm flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Vector Node</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1 uppercase tracking-tighter">
                    Ollama Synchronized
                </span>
            </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        <DocumentIndexerInterface />
      </div>

      <div className="space-y-6 pt-10">
        <div className="flex items-center gap-3 px-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Ingestion Protocol</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {protocolNodes.map((node, index) => (
                <div key={index} className="group relative bg-muted/5 border border-border/40 p-6 rounded-2xl hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                            <node.icon className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/40">{node.step}</span>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-1.5">{node.title}</h4>
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">{node.desc}</p>
                    
                    {index < protocolNodes.length - 1 && (
                        <div className="absolute top-1/2 -right-2 translate-x-1/2 -translate-y-1/2 z-20 hidden md:block opacity-20">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
