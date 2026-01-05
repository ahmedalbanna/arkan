
'use client';

import { cn } from '@/lib/utils/cn';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '../ui/scroll-area';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer = ({ content, className }: MarkdownViewerProps) => {
  return (
    <ScrollArea className="h-full">
      <ReactMarkdown
        className={cn('prose dark:prose-invert max-w-none', className)}
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </ScrollArea>
  );
};
