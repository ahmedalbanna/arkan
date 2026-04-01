'use client';

import { cn } from '@/infrastructure/utils/cn';
import React from 'react';

/**
 * Standardized Prose Configuration
 * Centralized styles for both Editor (Tiptap) and Viewer (ReactMarkdown)
 */
export const PROSE_CLASSES = cn(
  'prose dark:prose-invert max-w-none focus:outline-none font-serif text-[16px] leading-[1.75] selection:bg-primary/20 transition-all duration-300',
  'prose-p:mb-6 prose-p:my-0',
  'prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0',
  'prose-strong:text-foreground prose-strong:font-black',
  'prose-blockquote:border-primary/40 prose-blockquote:bg-primary/[0.02] prose-blockquote:px-6 prose-blockquote:py-1 prose-blockquote:rounded-r-xl prose-blockquote:not-italic',
  'prose-a:text-primary hover:prose-a:text-primary/80 transition-colors',
  'prose-img:rounded-2xl prose-img:shadow-2xl',
  'prose-table:w-full prose-table:border-collapse prose-table:my-8',
  'prose-th:border prose-th:border-border/60 prose-th:p-3 prose-th:bg-muted/30 prose-th:text-left prose-th:font-black prose-th:text-[11px] prose-th:uppercase prose-th:tracking-widest',
  'prose-td:border prose-td:border-border/60 prose-td:p-3 prose-td:align-top'
);

/**
 * ReactMarkdown component overrides
 * Simplified to rely on PROSE_CLASSES for styling
 */
export const markdownComponents: { [key: string]: React.ElementType } = {
  h1: ({ node, ...props }) => React.createElement('h1', props),
  h2: ({ node, ...props }) => React.createElement('h2', props),
  h3: ({ node, ...props }) => React.createElement('h3', props),
  p: ({ node, ...props }) => {
    // Prevent ReactMarkdown from wrapping nested block elements in <p>
    if (node && node.children.length === 1 && ['pre', 'table', 'blockquote'].includes(node.children[0].tagName)) {
      return React.createElement(React.Fragment, props, props.children);
    }
    return React.createElement('p', props);
  },
  a: ({ node, ...props }) => React.createElement('a', props),
  ul: ({ node, ...props }) => React.createElement('ul', { className: "ml-6 list-disc space-y-2", ...props }),
  ol: ({ node, ...props }) => React.createElement('ol', { className: "ml-6 list-decimal space-y-2", ...props }),
  li: ({ node, ...props }) => React.createElement('li', { className: "pl-2", ...props }),
  blockquote: ({ node, ...props }) => React.createElement('blockquote', props),
  pre: ({ node, ...props }) => React.createElement('pre', { className: cn("overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm", (props as any).className), ...props }),
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return React.createElement(
        'code',
        { className: cn("rounded bg-muted px-1.5 py-1 font-mono text-sm text-primary/80", className), ...props },
        children
      );
    }
    return React.createElement('code', { className: cn("font-mono text-sm text-current", className), ...props }, children);
  },
  table: ({ node, ...props }) => React.createElement('div', { className: "w-full overflow-x-auto" }, React.createElement('table', props)),
  thead: ({ node, ...props }) => React.createElement('thead', props),
  tbody: ({ node, ...props }) => React.createElement('tbody', props),
  tr: ({ node, ...props }) => React.createElement('tr', { className: "border-b border-border transition-colors hover:bg-muted/50", ...props }),
  th: ({ node, ...props }) => React.createElement('th', props),
  td: ({ node, ...props }) => React.createElement('td', props),
};
