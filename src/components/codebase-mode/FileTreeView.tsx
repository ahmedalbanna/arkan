'use client';

import type { Codebase } from '@/ai/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Download, File, Folder, Loader2 } from 'lucide-react';
import { useState } from 'react';

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
      {Object.entries(data).map(([name, content], index) => (
        <AnimatedContainer key={name} animation="fade-in-up" delay={index * 100}>
          <div>
            {typeof content === 'string' ? (
              <div className="flex items-center gap-2 p-1 text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200 rounded-md">
                <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-soft">
                  <File className="h-4 w-4 shrink-0 text-white" />
                </div>
                <span className="font-headline">{name}</span>
              </div>
            ) : (
              <Accordion type="single" collapsible>
                <AccordionItem value={name} className="border-none bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm rounded-lg shadow-soft hover:shadow-glow transition-all duration-200">
                  <AccordionTrigger className="p-1 hover:no-underline [&[data-state=open]>svg]:rotate-90 hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                        <Folder className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold font-headline">{name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Tree data={content} level={level + 1} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </AnimatedContainer>
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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card variant="glass" className="h-full flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-emerald-500/5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl text-primary">Generated Codebase</CardTitle>
              <CardDescription>Review the generated files and download the ZIP archive.</CardDescription>
            </div>
            <Button onClick={handleDownload} disabled={isZipping} className="hover:shadow-glow transition-all duration-200" variant="gradient">
              {isZipping ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
              Download .ZIP
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-4 sm:p-6">
          <ScrollArea className="h-full border rounded-md bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft p-4">
            <Tree data={fileTree} />
          </ScrollArea>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
