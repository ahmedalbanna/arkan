
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { cn } from '@/lib/utils/cn';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer = ({ content, className }: MarkdownViewerProps) => {
  return (
    <ReactMarkdown
      className={cn('prose dark:prose-invert max-w-none', className)}
      components={markdownComponents}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
};
