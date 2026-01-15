'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useBuilderStore } from '@/hooks';
import { PromptBuilder } from '@/lib/prompt-builder';
import type { Section } from '@/lib/models';

interface FullPromptPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
}

export function FullPromptPreviewDialog({ isOpen, onOpenChange, section }: FullPromptPreviewDialogProps) {
  const { project } = useBuilderStore();
  const [copied, setCopied] = React.useState(false);

  if (!project) return null;

  const fullPrompt = PromptBuilder.buildSectionPrompt(section, project);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Full Prompt Preview: {section.title}</DialogTitle>
          <DialogDescription>
            This is the complete prompt that will be sent to the AI, including project context, instructions, and all linked content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
        <ScrollArea className="h-[60vh] w-full rounded border bg-muted/30 p-4">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
            {fullPrompt}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
