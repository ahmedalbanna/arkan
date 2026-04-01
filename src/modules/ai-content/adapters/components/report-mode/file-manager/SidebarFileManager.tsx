'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/infrastructure/utils/cn';
import { useBuilderStore, useToast } from '@/hooks';
import { type ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react';

const FILE_TYPES: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

// ---------------------------------------------------------------------------
// File Editor Dialog — used for both "New file" and "Edit file"
// ---------------------------------------------------------------------------
interface FileEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialContent?: string;
  onSave: (name: string, content: string) => void;
  mode: 'create' | 'edit';
}

function FileEditorDialog({ isOpen, onClose, initialName = '', initialContent = '', onSave, mode }: FileEditorDialogProps) {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setContent(initialContent);
    }
  }, [isOpen, initialName, initialContent]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), content);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl gap-4">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-black uppercase tracking-[0.2em]">
            {mode === 'create' ? 'New File' : 'Edit File'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              File Name
            </Label>
            <Input
              autoFocus={mode === 'create'}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="my-document.md"
              className="h-9 text-[11px] bg-muted/5 border-border/40 focus-visible:ring-primary/20 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Content
            </Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste or type content here..."
              rows={14}
              className="text-[12px] font-mono bg-muted/5 border-border/40 focus-visible:ring-primary/20 rounded-xl resize-none leading-relaxed p-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            {mode === 'create' ? 'Add File' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// SidebarFileManager
// ---------------------------------------------------------------------------
export function SidebarFileManager() {
  const { toast } = useToast();
  const { project, updateProject } = useBuilderStore();

  const [editorState, setEditorState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    index?: number;
    initialName?: string;
    initialContent?: string;
  }>({ open: false, mode: 'create' });

  const externalContext = project?.externalContext ?? [];

  // -------------------------------------------------------------------------
  // Drop zone
  // -------------------------------------------------------------------------
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const reader = new FileReader();
        reader.onerror = () =>
          toast({ title: 'Error', description: `Could not read ${file.name}`, variant: 'destructive' });
        reader.onload = () => {
          const content = reader.result as string;
          updateProject(p => p.addExternalContext({ fileName: file.name, content, type: 'context' }, uuidv4()));
          toast({ title: 'File added', description: file.name });
        };
        const isText = file.type.startsWith('text/') || file.name.endsWith('.md');
        if (isText) reader.readAsText(file);
        else reader.readAsDataURL(file);
      }
    },
    [updateProject, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  });

  // -------------------------------------------------------------------------
  // File actions
  // -------------------------------------------------------------------------
  const handleCreateFile = (name: string, content: string) => {
    const fileName = name.endsWith('.md') || name.includes('.') ? name : `${name}.md`;
    updateProject(p => p.addExternalContext({ fileName, content, type: 'context' }, uuidv4()));
    toast({ title: 'File created', description: fileName });
  };

  const handleEditFile = (name: string, content: string) => {
    if (editorState.index === undefined) return;
    const idx = editorState.index;
    updateProject(p => {
      const newContext = [...p.externalContext.map(ec => ec.toProperties())];
      const existing = newContext[idx];
      if (existing) {
        newContext[idx] = { ...existing, fileName: name, content };
      }
      return p.withProps({ externalContext: newContext });
    });
    toast({ title: 'File updated', description: name });
  };

  const openCreate = () => setEditorState({ open: true, mode: 'create' });
  const openEdit = (index: number) => {
    const item = externalContext[index];
    setEditorState({ open: true, mode: 'edit', index, initialName: item.fileName, initialContent: item.content });
  };
  const closeEditor = () => setEditorState(s => ({ ...s, open: false }));

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <FileEditorDialog
        isOpen={editorState.open}
        onClose={closeEditor}
        mode={editorState.mode}
        initialName={editorState.initialName}
        initialContent={editorState.initialContent}
        onSave={editorState.mode === 'create' ? handleCreateFile : handleEditFile}
      />

      <div className="flex flex-col gap-2">
        {/* Drop zone — compact */}
        <div
          {...getRootProps()}
          className={cn(
            'flex items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2.5 cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border/40 text-muted-foreground/50 hover:border-primary/30 hover:text-primary hover:bg-muted/5'
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-4 w-4 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
          </span>
        </div>

        {/* File list */}
        {externalContext.length > 0 && (
          <ScrollArea className="max-h-[260px]">
            <div className="flex flex-col gap-1">
              {externalContext.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="group/file flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/10 transition-colors"
                >
                  {/* Icon */}
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover/file:text-primary transition-colors" />

                  {/* Name */}
                  <span
                    className="flex-1 min-w-0 truncate text-[10px] font-bold tracking-tight text-muted-foreground/80 group-hover/file:text-foreground transition-colors cursor-pointer"
                    title={item.fileName}
                    onClick={() => openEdit(index)}
                  >
                    {item.fileName}
                  </span>

                  {/* Type selector */}
                  <Select
                    value={item.type}
                    onValueChange={(value: ExternalContextType) =>
                      updateProject(p => p.updateExternalContextType(index, value))
                    }
                  >
                    <SelectTrigger className="h-5 w-auto shrink-0 text-[8px] font-black uppercase tracking-widest border-0 bg-transparent focus:ring-0 text-primary/60 hover:text-primary p-0 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40">
                      {FILE_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="capitalize text-[11px] font-medium">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(index)}
                      className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProject(p => p.removeExternalContext(index))}
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* New file button */}
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border/40 px-3 py-1.5 text-muted-foreground/50 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.03] transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">New file</span>
        </button>
      </div>
    </>
  );
}
