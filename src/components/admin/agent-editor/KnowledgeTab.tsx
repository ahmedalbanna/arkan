
'use client';

import { useState, useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  UploadCloud,
  FolderKanban,
  ImageIcon,
  Link as LinkIcon,
  Youtube,
  FileText,
  Loader2,
  File as FileIcon,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AgentEditorFormValues } from './AgentEditor';
import type { AgentKnowledgeSource } from '@/lib/agents';


const SourceIcon = ({ type }: { type: AgentKnowledgeSource['type'] }) => {
    switch (type) {
        case 'file': return <FileIcon className="h-4 w-4 text-muted-foreground" />;
        case 'text': return <FileText className="h-4 w-4 text-muted-foreground" />;
        case 'web': return <LinkIcon className="h-4 w-4 text-muted-foreground" />;
        default: return <FileIcon className="h-4 w-4 text-muted-foreground" />;
    }
}


export default function KnowledgeTab() {
  const { control } = useFormContext<AgentEditorFormValues>();
  const { fields, append, remove } = useFieldArray({
      control,
      name: "knowledge",
  });

  const [enableKnowledge, setEnableKnowledge] = useState(true);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textTitle, setTextTitle] = useState("");


  const onDrop = useCallback((acceptedFiles: File[]) => {
      setIsUploading(true);
      
      acceptedFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
              const dataUri = reader.result as string;
              const newSource: AgentKnowledgeSource = {
                  name: file.name,
                  type: 'file',
                  content: dataUri
              };
              append(newSource);
          };
          reader.readAsDataURL(file);
      });
      
      setIsUploading(false);
      toast({ title: `${acceptedFiles.length} file(s) added successfully.`});
  }, [append, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true, noKeyboard: true });
  
  const handleAddText = () => {
    if(!textInput.trim() || !textTitle.trim()) {
        toast({ title: 'Title and content are required.', variant: 'destructive'});
        return;
    }
    const newSource: AgentKnowledgeSource = {
        name: textTitle,
        type: 'text',
        content: textInput,
    };
    append(newSource);
    setTextInput("");
    setTextTitle("");
    toast({ title: 'Text source added.' });
  }

  return (
    <div className="space-y-6">
      <CardTitle>Knowledge</CardTitle>
      <p className="text-sm text-muted-foreground">
        Train your AI Agents with dynamic knowledge from projects, web links, documents, and more. <a href="#" className="text-primary underline">Learn more.</a>
      </p>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="knowledge-switch" className="text-base">Enable knowledge</Label>
        </div>
        <Switch
          id="knowledge-switch"
          checked={enableKnowledge}
          onCheckedChange={setEnableKnowledge}
        />
      </div>

      <div {...getRootProps()} className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">ADD SOURCES</h3>
        <label htmlFor="file-upload" className={`rounded-lg border-2 border-dashed ${isDragActive ? 'border-primary' : 'border-border'} p-8 text-center block cursor-pointer`}>
             <input {...getInputProps()} id="file-upload" />
             <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
             {isUploading ? (
                <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing files...</p>
             ): (
                <p className="mt-4 text-sm text-muted-foreground">
                    Drag multiple files here or click to upload. Supports .pdf, .docx, .txt, .md, and more.
                </p>
             )}
        </label>
        
        <div className="space-y-2 pt-2">
            <Label htmlFor="text-title">Add Text or Markdown</Label>
            <Input id="text-title" placeholder="Title for this text snippet" value={textTitle} onChange={e => setTextTitle(e.target.value)} />
            <Textarea id="text-input" placeholder="Paste your text content here..." value={textInput} onChange={e => setTextInput(e.target.value)} rows={4} />
            <div className="flex justify-end">
                <Button onClick={handleAddText}>Add Text</Button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" disabled><FolderKanban className="mr-2 h-4 w-4" /> Add Project</Button>
            <Button variant="outline" disabled><ImageIcon className="mr-2 h-4 w-4" /> Add Media</Button>
            <Button variant="outline" disabled><LinkIcon className="mr-2 h-4 w-4" /> Add Link</Button>
            <Button variant="outline" disabled><Youtube className="mr-2 h-4 w-4" /> Add Youtube</Button>
        </div>
      </div>

       <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">SOURCES ({fields.length})</h3>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>TITLE</TableHead>
                        <TableHead>TYPE</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.length > 0 ? fields.map((source, index) => (
                        <TableRow key={source.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <SourceIcon type={source.type} />
                                {source.name}
                            </TableCell>
                            <TableCell className="capitalize">{source.type}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                You have not added any sources to your knowledge base.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
       </div>

    </div>
  );
}
