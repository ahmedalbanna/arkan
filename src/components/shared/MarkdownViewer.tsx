'use client';

import { cn } from '@/infrastructure/utils/cn';
import { markdownComponents, PROSE_CLASSES } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '../ui/scroll-area';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer = ({ content, className, noScroll = false }: MarkdownViewerProps & { noScroll?: boolean }) => {
  const contentNode = (
    <div className="p-1">
      <ReactMarkdown
        className={cn(PROSE_CLASSES, className)}
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  if (noScroll) {
    return contentNode;
  }

  return (
    <ScrollArea className="h-full relative group">
      {contentNode}
      {/* Subtle bottom fade — aligned with SidebarContainer & BuilderCanvas */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </ScrollArea>
  );
};
