'use client';

import React, { useState, useCallback } from 'react';
import { 
    FileText, 
    Pencil, 
    Plus, 
    Trash2, 
    UploadCloud, 
    Link as LinkIcon, 
    Database, 
    ArrowRight, 
    Check, 
    X,
    FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/infrastructure/utils/cn';
import { useBuilderStore } from '@/hooks';
import { useFileUpload } from '@/hooks/util/useFileUpload';
import { ExternalContext } from '@/modules/ai-content/domain/entities/ExternalContext';
import { ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { FileNodeItem } from './FileNodeItem';

/**
 * SourceManager — High-fidelity HUD for integrating and managing neural source context.
 * Supports file uploads, raw text ingestion, and context classification.
 */

const FILE_TYPES: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

// ── Unified File/Text Editor ───────────────────────────────────────────────────
interface SourceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialContent?: string;
  onSave: (name: string, content: string) => void;
  mode: 'add' | 'edit';
}

function SourceEditor({ isOpen, onClose, initialName = '', initialContent = '', onSave, mode }: SourceEditorProps) {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setContent(initialContent);
    }
  }, [isOpen, initialName, initialContent]);

  const handleSave = () => {
    if (name.trim() && content.trim()) {
      onSave(name.trim(), content.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-primary/10 shadow-2xl rounded-[28px] bg-background/80 backdrop-blur-3xl p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 border-b border-primary/10 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div>
                <DialogTitle className="text-[14px] font-black uppercase tracking-tight">
                    {mode === 'add' ? 'Integrate Source Matrix' : 'Update Cognitive Vector'}
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">
                    Raw data ingestion protocol
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Source Identifier</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Reference_Data_Matrix_01"
              className="h-11 bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Content Payloads</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw research data, guidelines, or reference text here..."
              className="min-h-[240px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl resize-none p-4 font-serif italic text-[13px] leading-relaxed shadow-inner"
            />
          </div>
        </div>

        <DialogFooter className="px-8 py-4 bg-primary/[0.02] border-t border-primary/10">
          <Button variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest rounded-xl h-10 px-6">Abort</Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || !content.trim()}
            className="text-[10px] font-black uppercase tracking-[0.2em] rounded-xl h-10 px-8 shadow-xl shadow-primary/10 ring-1 ring-inset ring-white/20"
          >
            {mode === 'add' ? 'Initialize Vector' : 'Commit Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SourceManager() {
    const { project, updateProject } = useBuilderStore();
    const { getRootProps, getInputProps } = useFileUpload((_field, val) => {
        if (val && typeof val === 'string') {
            updateProject(p => p.addExternalContext({
                fileName: 'Extracted Content',
                content: val,
                type: 'context'
            }, String(Date.now())));
        }
    }, { fieldName: 'text' });
    
    const [isAddingText, setIsAddingText] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const onAddText = (name: string, content: string) => {
        updateProject(p => p.addExternalContext({
            fileName: name,
            content,
            type: 'context'
        }, String(Date.now())));
    };

    const onUpdateText = (name: string, content: string) => {
        if (editingIndex === null) return;
        updateProject(p => {
            const current = p.externalContext[editingIndex];
            const updated = (p.externalContext as any).map((c: any, i: number) => 
                i === editingIndex ? c.withProps({ fileName: name, content }) : c
            );
            return p.withProps({ externalContext: updated });
        });
        setEditingIndex(null);
    };

    const removeContext = (index: number) => {
        updateProject(p => p.removeExternalContext(index));
    };

    const updateContextType = (index: number, type: ExternalContextType) => {
        updateProject(p => p.updateExternalContextType(index, type));
    };

    const handleManualUpload = () => {
        // Dropzone handle via getRootProps/getInputProps in the UI
    };

    if (!project) return null;

    return (
        <div className="flex flex-col h-full gap-6 pt-2">
            <div className="space-y-1.5 px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                    <Database className="h-3.5 w-3.5" />
                    Context Matrix
                </h4>
                <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
                    Manage the intellectual input vectors for the AI core.
                </p>
            </div>

            {/* Quick Ingestion Hub */}
            <div className="grid grid-cols-2 gap-2.5">
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Button 
                        variant="outline" 
                        className="h-14 w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/5 hover:border-primary/40 transition-all group/up"
                    >
                        <UploadCloud className="h-4 w-4 text-primary/40 group-hover/up:text-primary group-hover/up:scale-110 transition-all" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover/up:text-primary transition-colors">Import File</span>
                    </Button>
                </div>
                <Button 
                    variant="outline" 
                    className="h-14 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/5 hover:border-primary/40 transition-all group/txt"
                    onClick={() => setIsAddingText(true)}
                >
                    <Plus className="h-4 w-4 text-primary/40 group-hover/txt:text-primary group-hover/txt:scale-110 transition-all" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover/txt:text-primary transition-colors">Raw Logic</span>
                </Button>
            </div>

            {/* Matrix Stack — High-Density Node List */}
            <div className="flex-1 space-y-3 relative">
                {/* Depth architectural line */}
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                
                {project.externalContext.length > 0 ? (
                    project.externalContext.map((item, index) => (
                        <div key={item.id} className="space-y-2">
                            <FileNodeItem 
                                item={item} 
                                onEdit={() => setEditingIndex(index)}
                                onDelete={() => removeContext(index)}
                            />
                            
                            <div className="flex items-center gap-2 pl-3">
                                <ArrowRight className="h-2.5 w-2.5 text-primary/20" />
                                <Select 
                                    value={item.type} 
                                    onValueChange={(v) => updateContextType(index, v as any)}
                                >
                                    <SelectTrigger className="h-6 w-auto min-w-[90px] border-none bg-primary/5 hover:bg-primary/10 text-[8px] font-black uppercase tracking-widest text-primary/60 transition-all px-2 rounded-lg focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                        {FILE_TYPES.map(t => (
                                            <SelectItem key={t} value={t} className="text-[9px] font-black uppercase tracking-widest py-2">
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                        <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                            <Database className="h-10 w-10 text-muted-foreground stroke-[1]" />
                        </div>
                        <div className="space-y-1.5 px-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Source Core Empty</p>
                            <p className="text-[9px] font-medium leading-relaxed italic">Incorporate external data matrices to enhance AI neural accuracy.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <SourceEditor 
                isOpen={isAddingText} 
                onClose={() => setIsAddingText(false)} 
                onSave={onAddText} 
                mode="add" 
            />
            <SourceEditor 
                isOpen={editingIndex !== null} 
                onClose={() => setEditingIndex(null)} 
                initialName={editingIndex !== null ? project.externalContext[editingIndex].fileName : ''}
                initialContent={editingIndex !== null ? project.externalContext[editingIndex].content : ''}
                onSave={onUpdateText} 
                mode="edit" 
            />
        </div>
    );
}
