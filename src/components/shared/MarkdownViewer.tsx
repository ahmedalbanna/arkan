
'use client';

import { cn } from '@/infrastructure/utils/cn';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '../ui/scroll-area';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer = ({ content, className }: MarkdownViewerProps) => {
  return (
    <ScrollArea className="h-full relative group">
      <div className="p-1">
        <ReactMarkdown
          className={cn('prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10', className)}
          components={markdownComponents}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>
      {/* Subtle bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </ScrollArea>
  );
};
