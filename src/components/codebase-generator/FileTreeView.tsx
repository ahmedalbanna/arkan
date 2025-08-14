'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Folder, Download, FolderOpen, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Codebase } from '@/ai/schemas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface FileTreeViewProps {
  codebase: Codebase;
}

// Helper function to build a tree structure from file paths
const buildFileTree = (files: { path: string; content: string }[]) => {
  const tree: any = {};
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = file.content;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  });
  return tree;
};

// Recursive component to render the tree
const Tree = ({ data, level = 0 }: { data: any; level?: number }) => {
  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      {Object.entries(data).map(([name, content]) => (
        <div key={name}>
          {typeof content === 'string' ? (
            <div className="flex items-center gap-2 p-1 text-sm">
              <File className="h-4 w-4 shrink-0" />
              <span>{name}</span>
            </div>
          ) : (
            <Accordion type="single" collapsible>
              <AccordionItem value={name} className="border-none">
                <AccordionTrigger className="p-1 hover:no-underline [&[data-state=open]>svg]:rotate-90">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <span className="font-semibold">{name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Tree data={content} level={level + 1} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      ))}
    </div>
  );
};

export default function FileTreeView({ codebase }: FileTreeViewProps) {
  const [isZipping, setIsZipping] = useState(false);
  const { toast } = useToast();
  const fileTree = buildFileTree(codebase.files);

  const handleDownload = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      codebase.files.forEach(file => {
        zip.file(file.path, file.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'generated-codebase.zip');
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast({
        title: 'Download Failed',
        description: 'An error occurred while creating the ZIP file.',
        variant: 'destructive',
      });
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-2xl text-primary">Generated Codebase</CardTitle>
                <CardDescription>Review the generated files and download the ZIP archive.</CardDescription>
            </div>
            <Button onClick={handleDownload} disabled={isZipping}>
                {isZipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download .ZIP
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full border rounded-md p-4">
            <Tree data={fileTree} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
